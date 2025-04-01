import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { sendEmail } from '@/utils/hiworks/email';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// 네이버 API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

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
    .replace(/<\/?[^>]+(>|$)/g, '') // 모든 HTML 태그 제거
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
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

interface ApiError extends Error {
  response?: {
    status?: number;
    data?: {
      errorMessage?: string;
    };
  };
  code?: string;
  message: string;
}

interface PendingEmail {
  id: string;
  email: string;
  status: string;
  scheduledFor: Date;
}

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  keyword: string;
}

interface NewsCategory {
  category: string;
  articles: NewsArticle[];
}

async function getNewsForKeyword(keyword: string): Promise<any[]> {
  try {
    // API 호출 전 대기 시간 감소
    await delay(500);

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
  } catch (error) {
    const apiError = error as ApiError;

    if (apiError.response?.status === 429) {
      console.log(`키워드 "${keyword}" 검색 중 API 제한 도달. 2초 후 재시도...`);
      await delay(2000);
      return getNewsForKeyword(keyword);
    }

    const errorMessage = apiError.response?.data?.errorMessage || apiError.message;
    console.error(`키워드 "${keyword}" 뉴스 가져오기 실패:`, errorMessage);

    if (apiError.code === 'ECONNRESET' || apiError.code === 'ETIMEDOUT') {
      console.log(`네트워크 오류 발생. 2초 후 재시도...`);
      await delay(2000);
      return getNewsForKeyword(keyword);
    }

    return [];
  }
}

async function getAllNewsArticles() {
  const allArticles: any[] = [];
  const seenUrls = new Set();
  const processedArticles: any[] = [];

  // 병렬로 모든 키워드에 대한 뉴스를 가져옴
  const categoryPromises = Object.entries(SEARCH_KEYWORDS).map(async ([category, keywords]) => {
    const keywordPromises = keywords.map(keyword => getNewsForKeyword(keyword));
    const keywordResults = await Promise.all(keywordPromises);
    
    const categoryArticles: any[] = [];
    
    for (const articles of keywordResults) {
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
      return {
        category,
        articles: categoryArticles
      };
    }
    return null;
  });

  const results = await Promise.all(categoryPromises);
  return results.filter(result => result !== null);
}

// 상수 정의
const BATCH_SIZE = 3;  // 한 번에 3명씩
const EMAIL_DELAY = 1000;  // 이메일 간 1초 대기
const BATCH_DELAY = 3000;  // 배치 간 3초 대기
const MAX_EXECUTION_TIME = 45000; // 45초 (Vercel 60초 제한)
const MAX_EMAILS_PER_RUN = 50;    // 한 번 실행당 최대 50명으로 증가

async function sendNewsletterToAllSubscribers(newsCategories: any[]) {
  try {
    // 전체 구독자 수 먼저 확인
    const totalSubscriberCount = await prisma.newsSubscriber.count();
    
    // 처리되지 않은 이전 큐 항목 확인
    const pendingEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'pending',
        scheduledFor: {
          lte: new Date()
        }
      }
    });

    // 새로운 구독자 목록 가져오기
    const subscribers = await prisma.newsSubscriber.findMany({
      where: {
        email: {
          notIn: pendingEmails.map((pe: PendingEmail) => pe.email)
        }
      }
    });

    console.log(`
      전체 구독자 수: ${totalSubscriberCount}
      이번 실행에서 처리할 구독자 수: ${subscribers.length}
      대기 중인 이메일: ${pendingEmails.length}
      배치 크기: ${BATCH_SIZE}
      예상 배치 수: ${Math.ceil(subscribers.length / BATCH_SIZE)}
    `);

    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();

    // HTML 컨텐츠 생성
    const htmlContent = generateNewsletterContent(newsCategories);

    // 이전 실패한 이메일 먼저 처리
    for (const pending of pendingEmails) {
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log('최대 실행 시간 초과, 나머지는 다음 배치로 연기');
        break;
      }

      const result = await sendEmailWithRetry(pending.email, htmlContent);
      
      if (result.success) {
        await prisma.emailQueue.delete({ where: { id: pending.id } });
        await logEmailSuccess(pending.email);
        successCount++;
        await delay(EMAIL_DELAY);
      } else {
        await updateFailedEmailQueue(pending.id, result.error || '알 수 없는 오류');
        failCount++;
      }
    }

    // 새로운 구독자들에게 이메일 발송
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        // 남은 구독자들은 큐에 추가
        const remainingSubscribers = subscribers.slice(i);
        await queueRemainingEmails(remainingSubscribers, htmlContent);
        console.log(`${remainingSubscribers.length}명의 구독자를 다음 배치로 연기`);
        break;
      }

      const batch = subscribers.slice(i, i + BATCH_SIZE);
      console.log(`배치 ${Math.floor(i / BATCH_SIZE) + 1} 처리 중: ${batch.length}명`);

      for (const subscriber of batch) {
        const result = await sendEmailWithRetry(subscriber.email, htmlContent);
        
        if (result.success) {
          await logEmailSuccess(subscriber.email);
          successCount++;
          await delay(EMAIL_DELAY);
        } else {
          await queueFailedEmail(subscriber.email, htmlContent, result.error || '알 수 없는 오류');
          failCount++;
        }
      }

      // 배치 간 대기
      if (i + BATCH_SIZE < subscribers.length) {
        await delay(BATCH_DELAY);
      }
    }

    return { successCount, failCount };
  } catch (error) {
    console.error('뉴스레터 발송 중 오류 발생:', error);
    throw error;
  }
}

async function sendEmailWithRetry(email: string, content: string, maxRetries = 3) {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const result = await sendEmail({
        to: email,
        subject: `[의료기기 뉴스레터] ${new Date().toLocaleDateString('ko-KR')} 뉴스 모음`,
        content: content,
        saveSentMail: true
      });

      if (result.success) {
        return { success: true };
      }

      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount)));
    } catch (error: unknown) {
      if (retryCount === maxRetries - 1) {
        if (error instanceof Error) {
          return { success: false, error: error.message };
        } else {
          return { success: false, error: 'Unknown error occurred' };
        }
      }
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount)));
    }
  }

  return { success: false, error: '최대 재시도 횟수 초과' };
}

async function queueRemainingEmails(subscribers: any[], content: string) {
  const queueData = subscribers.map(sub => ({
    email: sub.email,
    content: content,
    status: 'pending',
    retryCount: 0,
    scheduledFor: new Date(Date.now() + 300000) // 5분 후
  }));

  await prisma.emailQueue.createMany({ data: queueData });
}

async function logEmailSuccess(email: string) {
  try {
    await prisma.emailLog.create({
      data: {
        email,
        status: 'success',
        provider: email.includes('@gmail.com') ? 'gmail' : 'other'
      }
    });

    const logs = await prisma.emailLog.findMany({
      where: {
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const successRate = (logs.filter(log => log.status === 'success').length / logs.length) * 100;
    
    if (successRate < 80 && process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: '뉴스레터 발송 성공률 저조',
        content: `최근 24시간 성공률: ${successRate.toFixed(1)}%`
      });
    }
  } catch (error) {
    console.error('Failed to log email success:', error);
  }
}

async function queueFailedEmail(email: string, content: string, error: string) {
  try {
    await Promise.all([
      prisma.emailQueue.create({
        data: {
          email,
          content,
          status: 'failed',
          error,
          retryCount: 0,
          scheduledFor: new Date(Date.now() + 900000) // 15분 후
        }
      }),
      prisma.emailLog.create({
        data: {
          email,
          status: 'failed',
          error,
          provider: email.includes('@gmail.com') ? 'gmail' : 'other'
        }
      })
    ]);
  } catch (error) {
    console.error(`Failed to queue email for ${email}:`, error);
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: '뉴스레터 발송 큐잉 실패',
        content: `이메일: ${email}\n에러: ${error}`
      });
    }
  }
}

async function updateFailedEmailQueue(id: string, error: string) {
  await prisma.emailQueue.update({
    where: { id },
    data: {
      retryCount: { increment: 1 },
      error,
      scheduledFor: new Date(Date.now() + 900000) // 15분 후
    }
  });
}

function generateNewsletterContent(newsCategories: NewsCategory[]): string {
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
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  `;

  for (const categoryNews of newsCategories) {
    if (categoryNews.articles && categoryNews.articles.length > 0) {
      htmlContent += `
        <div style="margin: 20px 0;">
          <h2 style="color: #2c5282; border-bottom: 2px solid #2c5282; padding-bottom: 5px;">
            ${categoryNews.category} (${categoryNews.articles.length}건)
          </h2>
          <ul style="list-style-type: none; padding: 0;">
      `;

      for (const article of categoryNews.articles) {
        const cleanTitle = cleanText(article.title);
        const cleanDescription = cleanText(article.description);

        htmlContent += `
          <li style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <a href="${article.link}" 
               style="color: #2c5282; 
                      text-decoration: none; 
                      font-weight: bold;
                      font-size: 16px;">
              ${cleanTitle}
            </a>
            <p style="color: #4a5568; margin: 8px 0; font-size: 14px;">
              ${cleanDescription}
            </p>
            <div style="color: #718096; font-size: 12px;">
              ${new Date(article.pubDate).toLocaleString('ko-KR')}
            </div>
          </li>
        `;
      }

      htmlContent += `
          </ul>
        </div>
      `;
    }
  }

  htmlContent += `
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <div style="text-align: center; color: #666; font-size: 12px;">
        <p>본 뉴스레터는 자동으로 생성되었습니다.</p>
        <p>구독 해지를 원하시면 관리자에게 문의해주세요.</p>
      </div>
    </div>
  `;

  return htmlContent;
}

// Vercel API Route handler
export async function GET(request: Request) {
  try {
    const newsCategories = await getAllNewsArticles();
    const result = await sendNewsletterToAllSubscribers(newsCategories);
    
    return NextResponse.json(
      { 
        message: `처리 완료: 성공 ${result.successCount}, 실패 ${result.failCount}`,
        success: true,
        result 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('뉴스레터 발송 실패:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
} 