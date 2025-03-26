import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { sendTestEmail } from '@/utils/hiworks/email';
import axios from 'axios';
import { sendEmail } from '@/utils/hiworks/email';

const prisma = new PrismaClient();

// 네이버 API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// API 인증 검사
function isAuthorized(request: Request): boolean {
  const headersList = headers();
  const authHeader = headersList.get('authorization');
  const apiKey = authHeader?.split(' ')[1];
  return apiKey === process.env.API_SECRET_KEY;
}

// 검색 키워드 카테고리
const SEARCH_KEYWORDS = {
  '주요 의료기기 기업': ['메드트로닉'],
  '심장/혈관 분야': ['관상동맥', '스텐트 +혈관'],
  '의료정책': ['비급여', '신의료기술', '리베이트&병원'],
  '규제/인증': ['의료기기&허가'],
  '시장 동향': ['다국적&의료기기', '제약&의료기기', '의료기기&마케팅'],
  '의료 AI/로봇': ['"의료AI"&병원', '수술로봇'],
  '전문병원': ['척추병원', '정형외과', '흉부외과', '"성형외과"&수술', '"동물병원"&수술'],
  '수술 기술': ['최소침습'],
  '의료계 동향': ['의사파업&병원']
};

// 24시간 이내 뉴스인지 확인
function isWithin24Hours(pubDate: string): boolean {
  const newsDate = new Date(pubDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
}

// HTML 태그 및 특수문자 제거
function cleanText(text: string): string {
  return text
    .replace(/(<([^>]+)>)/gi, '')
    .replace(/[^가-힣\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 두 제목의 유사도 검사
function areTitlesSimilar(title1: string, title2: string): boolean {
  const words1 = new Set(
    cleanText(title1)
      .split(' ')
      .filter(word => word.length >= 2)
  );
  const words2 = new Set(
    cleanText(title2)
      .split(' ')
      .filter(word => word.length >= 2)
  );

  const commonWords = Array.from(words1).filter(word => words2.has(word));
  return commonWords.length >= 2;
}

// API 호출 사이의 딜레이 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getNewsForKeyword(keyword: string) {
  try {
    // API 호출 전 2초 대기 (1초에서 2초로 증가)
    await delay(2000);

    const response = await axios.get(
      'https://openapi.naver.com/v1/search/news.json',
      {
        params: {
          query: keyword,
          display: 5,
          sort: 'date',
        },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
      }
    );

    const recentNews = response.data.items
      .filter((item: any) => isWithin24Hours(item.pubDate))
      .map((item: any) => ({
        ...item,
        keyword,
        pubDate: new Date(item.pubDate)
      }));

    return recentNews;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.log(`키워드 "${keyword}" 검색 중 API 제한 도달. 10초 후 재시도...`);
      await delay(10000); // 5초에서 10초로 증가
      return getNewsForKeyword(keyword);
    }
    
    // 다른 에러 처리 추가
    const errorMessage = error.response?.data?.errorMessage || error.message;
    console.error(`키워드 "${keyword}" 뉴스 가져오기 실패:`, errorMessage);
    
    // 네트워크 오류나 일시적인 문제인 경우 재시도
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.log(`네트워크 오류 발생. 5초 후 재시도...`);
      await delay(5000);
      return getNewsForKeyword(keyword);
    }
    
    return [];
  }
}

async function getAllNewsArticles() {
  const allArticles: any[] = [];
  const seenUrls = new Set();
  const processedArticles: any[] = [];

  for (const [category, keywords] of Object.entries(SEARCH_KEYWORDS)) {
    const categoryArticles: any[] = [];
    
    for (const keyword of keywords) {
      const articles = await getNewsForKeyword(keyword);
      
      for (const article of articles) {
        if (seenUrls.has(article.link)) {
          continue;
        }

        let isDuplicate = false;
        for (const processedArticle of processedArticles) {
          if (areTitlesSimilar(article.title, processedArticle.title)) {
            if (article.pubDate > processedArticle.pubDate) {
              const index = processedArticles.indexOf(processedArticle);
              processedArticles.splice(index, 1);
              seenUrls.delete(processedArticle.link);
              break;
            } else {
              isDuplicate = true;
              break;
            }
          }
        }

        if (!isDuplicate) {
          seenUrls.add(article.link);
          processedArticles.push(article);
          categoryArticles.push(article);
        }
      }
    }

    if (categoryArticles.length > 0) {
      categoryArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
      
      allArticles.push({
        category,
        articles: categoryArticles
      });
    }
  }

  return allArticles;
}

async function sendNewsletterToAllSubscribers(newsCategories: any[]) {
  try {
    // 구독자 목록 가져오기
    const subscribers = await prisma.newsSubscriber.findMany();
    console.log('구독자 수:', subscribers.length);

    if (subscribers.length === 0) {
      console.log('구독자가 없습니다.');
      return { success: false, message: '구독자가 없습니다.' };
    }

    // 실제 뉴스가 있는 카테고리만 필터링
    const categoriesWithNews = newsCategories.filter(category => 
      category.articles && category.articles.length > 0
    );

    if (categoriesWithNews.length === 0) {
      console.log('최근 24시간 동안의 새로운 뉴스가 없습니다.');
      return { success: false, message: '최근 24시간 동안의 새로운 뉴스가 없습니다.' };
    }

    console.log('뉴스가 있는 카테고리:', categoriesWithNews.map(c => c.category));

    // HTML 뉴스레터 내용 생성
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">의료기기 뉴스레터</h1>
        <p style="color: #666; text-align: center;">최근 24시간 동안의 주요 의료기기 뉴스입니다.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://koreamedinfo.com/industry-news" 
             style="display: inline-block; 
                    background-color: #4F46E5; 
                    color: white; 
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 14px;">
            ✉️ 뉴스레터 구독 신청하기
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 10px;">
            의료기기 업계 뉴스를 매일 아침 이메일로 받아보세요.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    `;

    // 각 카테고리별 뉴스 추가
    for (const categoryNews of categoriesWithNews) {
      htmlContent += `
        <div style="margin: 20px 0;">
          <h2 style="color: #2c5282; border-bottom: 2px solid #2c5282; padding-bottom: 5px;">
            ${categoryNews.category}
          </h2>
          <ul style="list-style-type: none; padding: 0;">
      `;

      for (const article of categoryNews.articles) {
        const cleanTitle = article.title
          .replace(/(<([^>]+)>)/gi, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&');

        htmlContent += `
          <li style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <a href="${article.link}" style="color: #1a365d; text-decoration: none; font-weight: bold;">
              ${cleanTitle}
            </a>
            <p style="color: #4a5568; margin: 5px 0; font-size: 0.9em;">
              ${article.description.replace(/(<([^>]+)>)/gi, '')}
            </p>
            <small style="color: #718096;">
              ${article.pubDate.toLocaleString('ko-KR')} | ${article.keyword}
            </small>
          </li>
        `;
      }

      htmlContent += `
          </ul>
        </div>
      `;
    }

    htmlContent += `
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa;">
          <p style="color: #666;">
            본 뉴스레터는 자동으로 생성되었습니다.<br>
            구독 해지를 원하시면 관리자에게 문의해주세요.
          </p>
          <div style="margin-top: 20px;">
            <a href="https://koreamedinfo.com" 
               style="color: #4F46E5; 
                      text-decoration: none; 
                      font-size: 14px;">
              코리아메드인포 방문하기
            </a>
            <span style="color: #666; margin: 0 10px;">|</span>
            <a href="https://koreamedinfo.com/industry-news" 
               style="color: #4F46E5; 
                      text-decoration: none; 
                      font-size: 14px;">
              뉴스레터 구독하기
            </a>
          </div>
        </div>
      </div>
    `;

    console.log('뉴스레터 HTML 생성 완료');

    // 각 구독자에게 이메일 발송
    let successCount = 0;
    let failCount = 0;
    for (const subscriber of subscribers) {
      try {
        console.log(`${subscriber.email}에게 이메일 발송 시도...`);
        const emailResult = await sendEmail({
          to: subscriber.email,
          subject: `[의료기기 뉴스레터] ${new Date().toLocaleDateString('ko-KR')} 뉴스 모음`,
          content: htmlContent,
          saveSentMail: true
        });
        console.log('이메일 발송 결과:', emailResult);
        successCount++;
        console.log(`${subscriber.email}에게 발송 성공`);
      } catch (error) {
        failCount++;
        console.error(`구독자 ${subscriber.email}에게 발송 실패:`, error);
      }
    }

    const resultMessage = `총 ${subscribers.length}명 중 ${successCount}명 발송 성공, ${failCount}명 실패`;
    console.log(resultMessage);
    return { success: true, message: resultMessage };
  } catch (error) {
    console.error('뉴스레터 발송 중 오류 발생:', error);
    throw error;
  }
}

async function testNaverNewsAPI() {
  try {
    const response = await axios.get(
      'https://openapi.naver.com/v1/search/news.json',
      {
        params: {
          query: '의료기기',  // 테스트용 키워드
          display: 5,
          sort: 'date',
        },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
      }
    );
    console.log('네이버 API 응답:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('네이버 API 테스트 실패:', error.response?.data || error.message);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // API 키 검증
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key !== process.env.NEWSLETTER_CRON_KEY) {
      console.log('API 키 불일치:', key);
      return NextResponse.json(
        { error: '유효하지 않은 API 키입니다.' },
        { status: 401 }
      );
    }

    console.log('뉴스 수집 시작...');
    // 뉴스 수집
    const newsCategories = await getAllNewsArticles();
    console.log('수집된 뉴스 카테고리:', newsCategories.map(c => ({ 
      category: c.category, 
      articleCount: c.articles.length 
    })));
    
    if (!newsCategories || newsCategories.length === 0) {
      console.log('수집된 뉴스가 없습니다.');
      return NextResponse.json(
        { message: '최근 24시간 동안의 새로운 뉴스가 없습니다.' },
        { status: 200 }
      );
    }

    // 뉴스레터 발송
    const result = await sendNewsletterToAllSubscribers(newsCategories);

    return NextResponse.json(result);
  } catch (error) {
    console.error('뉴스레터 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '뉴스레터 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 