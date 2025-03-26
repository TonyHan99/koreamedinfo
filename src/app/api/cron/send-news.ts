import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// 네이버 API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// Hiworks API 설정
const HIWORKS_API_URL = process.env.HIWORKS_API_URL;
const HIWORKS_TOKEN = process.env.HIWORKS_TOKEN;
const HIWORKS_USER_ID = process.env.HIWORKS_USER_ID;

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
    .replace(/(<([^>]+)>)/gi, '') // HTML 태그 제거
    .replace(/[^가-힣\s]/g, ' ') // 한글과 공백만 남기고 제거
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim();
}

// 두 제목의 유사도 검사
function areTitlesSimilar(title1: string, title2: string): boolean {
  const words1 = new Set(
    cleanText(title1)
      .split(' ')
      .filter(word => word.length >= 2) // 2글자 이상의 단어만 포함
  );
  const words2 = new Set(
    cleanText(title2)
      .split(' ')
      .filter(word => word.length >= 2)
  );

  // 공통 단어 찾기
  const commonWords = Array.from(words1).filter(word => words2.has(word));
  
  // 2개 이상의 공통 단어가 있으면 유사한 제목으로 판단
  return commonWords.length >= 2;
}

async function getNewsForKeyword(keyword: string) {
  try {
    const response = await axios.get(
      'https://openapi.naver.com/v1/search/news.json',
      {
        params: {
          query: keyword,
          display: 5, // 각 키워드당 최대 5개 기사
          sort: 'date',
        },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
      }
    );

    // 24시간 이내 뉴스만 필터링
    const recentNews = response.data.items
      .filter((item: any) => isWithin24Hours(item.pubDate))
      .map((item: any) => ({
        ...item,
        keyword,
        pubDate: new Date(item.pubDate)
      }));

    return recentNews;
  } catch (error) {
    console.error(`키워드 "${keyword}" 뉴스 가져오기 실패:`, error);
    return [];
  }
}

async function getAllNewsArticles() {
  const allArticles: any[] = [];
  const seenUrls = new Set(); // URL 기반 중복 제거용
  const processedArticles: any[] = []; // 제목 유사도 검사를 위한 배열

  for (const [category, keywords] of Object.entries(SEARCH_KEYWORDS)) {
    const categoryArticles: any[] = [];
    
    for (const keyword of keywords) {
      const articles = await getNewsForKeyword(keyword);
      
      // 각 기사에 대해 중복 검사
      for (const article of articles) {
        // URL 중복 검사
        if (seenUrls.has(article.link)) {
          continue;
        }

        // 제목 유사도 검사
        let isDuplicate = false;
        for (const processedArticle of processedArticles) {
          if (areTitlesSimilar(article.title, processedArticle.title)) {
            // 더 최신 기사인 경우 기존 기사 대체
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
      // 발행일 기준 정렬
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
  const subscribers = await prisma.newsSubscriber.findMany();
  
  if (subscribers.length === 0) {
    console.log('구독자가 없습니다.');
    return;
  }

  const htmlContent = `
    <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">오늘의 의료기기 산업 뉴스</h1>
      <p style="color: #666;">안녕하세요,</p>
      <p style="color: #666;">오늘의 주요 의료기기 산업 뉴스를 분야별로 전달해드립니다.</p>
      
      <div style="margin: 20px 0;">
        ${newsCategories.map(category => `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1a365d; font-size: 22px; border-left: 4px solid #4299e1; padding-left: 10px;">
              ${category.category}
            </h2>
            ${category.articles.map((article: any, index: number) => `
              <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                <h3 style="margin: 0; font-size: 18px; color: #2c5282;">
                  ${article.title.replace(/(<([^>]+)>)/gi, '')}
                </h3>
                <p style="color: #666; margin: 10px 0; font-size: 14px;">
                  ${article.description.replace(/(<([^>]+)>)/gi, '')}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <a href="${article.link}" style="color: #4299e1; text-decoration: none; font-size: 14px;">
                    자세히 보기 →
                  </a>
                  <span style="color: #888; font-size: 12px;">검색어: ${article.keyword}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666;">
        <p>더 많은 의료기기 산업 소식은 <a href="https://www.koreamedinfo.com" style="color: #4299e1; text-decoration: none;">코리아메드인포</a>에서 확인하실 수 있습니다.</p>
        <p style="font-size: 12px; color: #999;">본 뉴스레터는 구독신청을 하신 분들께만 발송됩니다.</p>
      </div>
    </div>
  `;

  try {
    // Hiworks API를 통한 이메일 발송
    const response = await axios.post(
      HIWORKS_API_URL!,
      {
        user_id: HIWORKS_USER_ID,
        subject: '한국 의료기기 산업 뉴스',
        content: htmlContent,
        bcc: subscribers.map((sub: { email: string }) => sub.email),
        html_body: true
      },
      {
        headers: {
          'Authorization': `Bearer ${HIWORKS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      console.log(`뉴스레터가 ${subscribers.length}명의 구독자에게 발송되었습니다.`);
    } else {
      throw new Error('이메일 발송 실패');
    }
  } catch (error) {
    console.error('뉴스레터 발송 실패:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  // API 키 검증
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 모든 카테고리의 뉴스 기사 가져오기
    const newsCategories = await getAllNewsArticles();

    if (newsCategories.length === 0) {
      throw new Error('뉴스를 가져올 수 없습니다.');
    }

    // 모든 구독자에게 뉴스레터 발송
    await sendNewsletterToAllSubscribers(newsCategories);

    return new Response('뉴스레터 발송 완료', { status: 200 });
  } catch (error) {
    console.error('뉴스레터 발송 실패:', error);
    return new Response('뉴스레터 발송 실패', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 