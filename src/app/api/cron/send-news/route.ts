import { NextResponse } from 'next/server';
import { PrismaClient as PrismaClientType } from '.prisma/client';
import axios from 'axios';
import { sendEmail } from '@/utils/hiworks/email';
import { notifyAdmin, logMetrics, checkApiLimits } from '@/utils/monitoring';

// PrismaClient 싱글톤 처리
declare global {
  var prisma: PrismaClientType | undefined;
}

let prisma: PrismaClientType;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClientType();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClientType();
  }
  prisma = global.prisma;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5분으로 설정

// 상수 정의
const BATCH_SIZE = 2;           // 한 번에 2명씩 (Hiworks API 제한 준수)
const EMAIL_DELAY = 2000;       // 이메일 간 2초 대기
const BATCH_DELAY = 5000;       // 배치 간 5초 대기
const MAX_EXECUTION_TIME = 45000; // 45초 (Vercel 60초 제한)
const EMAILS_PER_BATCH = 10;    // 한 배치당 10명으로 축소
const MAX_RETRIES = 3;          // 재시도 횟수 축소
const RETRY_DELAYS = [2000, 5000, 10000];  // 점진적 대기 시간 조정

// Hiworks API 설정
const HIWORKS_CONFIG = {
  API_URL: process.env.HIWORKS_API_URL || 'https://api.hiworks.com/office',
  API_TOKEN: process.env.HIWORKS_API_TOKEN,
  USER_ID: process.env.HIWORKS_USER_ID || 'admin'
};

// 검색 키워드 카테고리 확장
const SEARCH_KEYWORDS = {
  '주요 의료기기 기업': [
    '메드트로닉', 'GE헬스케어', '필립스', '지멘스헬시니어스', 
    '존슨앤존슨', '스트라이커', '올림푸스'
  ],
  '심장/혈관 분야': [
    '관상동맥', '스텐트 +혈관', '심장수술', '혈관중재시술',
    '대동맥', '심장판막', '부정맥'
  ],
  '의료정책': ['비급여', '신의료기술', '리베이트&병원', '의료수가', '건강보험'],
  '규제/인증': ['의료기기&허가', 'FDA&의료기기', 'CE&의료기기', '의료기기&인증'],
  '시장 동향': [
    '다국적&의료기기', '제약&의료기기', '의료기기&마케팅',
    '의료기기&시장', '의료기기&수출', '의료기기&특허'
  ],
  '의료 AI/로봇': [
    '"의료AI"&병원', '수술로봇', '의료&인공지능',
    '디지털치료제', '원격의료', '디지털헬스케어'
  ],
  '전문병원': [
    '척추병원', '정형외과', '흉부외과', 
    '"성형외과"&수술', '"동물병원"&수술',
    '신경외과', '심장병원'
  ],
  '수술 기술': ['최소침습', '로봇수술', '내시경수술', '중재시술'],
  '의료계 동향': ['의사파업&병원', '의료사고', '의료분쟁', '의료정책']
};

// 네이버 API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

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
  content: string;
  status: string;
  error: string | null;
  retryCount: number;
  createdAt: Date;
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

interface NaverNewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  keyword: string;
}

async function getNewsForKeyword(keyword: string, retryCount = 0): Promise<NaverNewsItem[]> {
  try {
    // API 호출 전 대기 시간을 키워드별로 분산
    const baseDelay = 1000; // 기본 1초
    const randomDelay = Math.floor(Math.random() * 1000); // 0-1초 추가
    await delay(baseDelay + randomDelay);

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
      .filter((item: NaverNewsItem) => isWithin24Hours(item.pubDate))
      .map((item: NaverNewsItem) => ({
        ...item,
        keyword,
        pubDate: new Date(item.pubDate)
      }));

    return recentNews;
  } catch (error) {
    const apiError = error as ApiError;
    const maxRetries = 3;

    if (apiError.response?.status === 429) {
      if (retryCount >= maxRetries) {
        console.log(`키워드 "${keyword}" 검색 최대 재시도 횟수 초과`);
        return [];
      }
      const retryDelay = Math.pow(2, retryCount + 1) * 1000; // 지수 백오프: 2초, 4초, 8초
      console.log(`키워드 "${keyword}" 검색 중 API 제한 도달. ${retryDelay/1000}초 후 재시도... (${retryCount + 1}/${maxRetries})`);
      await delay(retryDelay);
      return getNewsForKeyword(keyword, retryCount + 1);
    }

    const errorMessage = apiError.response?.data?.errorMessage || apiError.message;
    console.error(`키워드 "${keyword}" 뉴스 가져오기 실패:`, errorMessage);

    if (apiError.code === 'ECONNRESET' || apiError.code === 'ETIMEDOUT') {
      if (retryCount >= maxRetries) {
        console.log(`키워드 "${keyword}" 네트워크 오류 최대 재시도 횟수 초과`);
        return [];
      }
      const retryDelay = Math.pow(2, retryCount + 1) * 1000;
      console.log(`네트워크 오류 발생. ${retryDelay/1000}초 후 재시도... (${retryCount + 1}/${maxRetries})`);
      await delay(retryDelay);
      return getNewsForKeyword(keyword, retryCount + 1);
    }

    return [];
  }
}

async function getAllNewsArticles() {
  const allArticles: any[] = [];
  const seenUrls = new Set();
  const processedArticles: any[] = [];

  // 카테고리별로 순차 처리로 변경
  for (const [category, keywords] of Object.entries(SEARCH_KEYWORDS)) {
    console.log(`카테고리 '${category}' 처리 중...`);
    const categoryArticles: any[] = [];
    
    // 키워드별 순차 처리
    for (const keyword of keywords) {
      const articles = await getNewsForKeyword(keyword);
      
      for (const article of articles) {
        if (seenUrls.has(article.link)) continue;

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

  return allArticles.filter(category => category !== null);
}

// 뉴스레터 HTML 생성 함수
function generateNewsletterContent(newsCategories: NewsCategory[]): string {
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">의료기기 뉴스레터</h1>
      <p style="color: #666;">${new Date().toLocaleDateString('ko-KR')} 뉴스 모음</p>
  `;

  for (const category of newsCategories) {
    if (category.articles.length > 0) {
      html += `
        <div style="margin-top: 30px;">
          <h2 style="color: #444; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            ${category.category}
          </h2>
          <ul style="list-style-type: none; padding: 0;">
      `;

      for (const article of category.articles) {
        const pubDate = new Date(article.pubDate).toLocaleDateString('ko-KR');
        html += `
          <li style="margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 5px;">
            <a href="${article.link}" style="color: #2b7bb9; text-decoration: none; font-weight: bold;">
              ${article.title}
            </a>
            <p style="color: #666; margin: 5px 0;">${article.description}</p>
            <small style="color: #999;">발행일: ${pubDate}</small>
          </li>
        `;
      }

      html += `
          </ul>
        </div>
      `;
    }
  }

  html += `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999;">
        <p>본 뉴스레터는 자동으로 수집된 정보를 제공합니다.</p>
        <p>구독 해지를 원하시면 회신 부탁드립니다.</p>
      </div>
    </div>
  `;

  return html;
}

async function queueFailedEmail(email: string, subject: string, content: string) {
  try {
    await prisma.emailQueue.create({
      data: {
        email,
        content,
        status: 'pending',
        retryCount: 0,
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60), // 1시간 후 재시도
        error: '이메일 전송 실패'
      }
    });
  } catch (error) {
    console.error('Failed to queue email:', error);
  }
}

async function sendEmailWithRetry(to: string, subject: string, content: string, attempt = 0) {
  try {
    if (attempt >= MAX_RETRIES) {
      console.error(`이메일 발송 최대 재시도 횟수 초과: ${to}`);
      await queueFailedEmail(to, subject, content);
      return { success: false, error: '최대 재시도 횟수 초과' };
    }

    // API 제한 체크
    const canProceed = await checkApiLimits();
    if (!canProceed) {
      console.error('API 제한 도달, 이메일 큐잉: ${to}');
      await queueFailedEmail(to, subject, content);
      return { success: false, error: 'API 제한 도달' };
    }

    const result = await sendEmail({
      to,
      subject,
      content,
      saveSentMail: true
    });
    
    if (result.success) {
      console.log(`이메일 발송 성공: ${to}`);
      await logEmailSuccess(to);
      return { success: true };
    }
    
    console.warn(`이메일 발송 실패 (${attempt + 1}/${MAX_RETRIES}): ${to}`);
    await delay(RETRY_DELAYS[attempt]);
    return sendEmailWithRetry(to, subject, content, attempt + 1);
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error(`이메일 발송 중 오류 발생: ${to}`, error);

    if (apiError.response?.status === 401) {
      console.error('Hiworks API 인증 오류');
      await notifyAdmin('Hiworks API 인증 오류');
      return { success: false, error: 'API 인증 오류' };
    }
    
    if (apiError.response?.status === 429) {
      console.error('Hiworks API 호출 한도 도달');
      await notifyAdmin('Hiworks API 호출 한도 도달');
      return { success: false, error: 'API 호출 한도 초과' };
    }

    if (attempt < MAX_RETRIES - 1) {
      await delay(RETRY_DELAYS[attempt]);
      return sendEmailWithRetry(to, subject, content, attempt + 1);
    }
    
    await queueFailedEmail(to, subject, content);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}

interface EmailLog {
  id: string;
  email: string;
  status: string;
  provider: string;
  sentAt: Date;
  createdAt: Date;
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

    const successRate = (logs.filter((log: EmailLog) => log.status === 'success').length / logs.length) * 100;
    
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

// Hiworks API 설정 확인 함수 추가
function checkHiworksConfig(): boolean {
  if (!HIWORKS_CONFIG.API_URL || !HIWORKS_CONFIG.API_TOKEN || !HIWORKS_CONFIG.USER_ID) {
    console.error('Hiworks API 설정이 누락되었습니다.');
    return false;
  }
  return true;
}

async function createSubscriberGroups(newsCategories: any[]) {
  const emailContent = generateNewsletterContent(newsCategories);
  const emailSubject = `[의료기기 뉴스레터] ${new Date().toLocaleDateString('ko-KR')} 뉴스 모음`;
  
  const totalSubscribers = await prisma.newsSubscriber.count();
  const totalGroups = Math.ceil(totalSubscribers / EMAILS_PER_BATCH);
  
  // 이전 배치 정리
  await prisma.emailBatch.deleteMany({
    where: {
      status: {
        in: ['pending', 'processing']
      }
    }
  });
  
  // 새 배치 생성
  for (let i = 0; i < totalGroups; i++) {
    await prisma.emailBatch.create({
      data: {
        batchNumber: i + 1,
        totalBatches: totalGroups,
        status: 'pending',
        scheduledFor: new Date(Date.now() + i * 5 * 60 * 1000) // 5분 간격
      }
    });
  }

  return {
    totalGroups,
    totalSubscribers,
    emailContent,
    emailSubject
  };
}

async function processBatchGroup(batchNumber: number, emailContent: string, emailSubject: string) {
  const batch = await prisma.emailBatch.findFirst({
    where: { 
      batchNumber,
      status: 'pending'
    }
  });

  if (!batch) {
    throw new Error(`배치 ${batchNumber}를 찾을 수 없거나 이미 처리되었습니다.`);
  }

  try {
    // 배치 상태 업데이트
    await prisma.emailBatch.update({
      where: { id: batch.id },
      data: { 
        status: 'processing',
        startedAt: new Date()
      }
    });

    // 구독자 가져오기
    const subscribers = await prisma.newsSubscriber.findMany({
      skip: (batchNumber - 1) * EMAILS_PER_BATCH,
      take: EMAILS_PER_BATCH
    });

    let successCount = 0;
    let failureCount = 0;

    // 이메일 발송
    for (const subscriber of subscribers) {
      const result = await sendEmailWithRetry(subscriber.email, emailSubject, emailContent);
      
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        await queueFailedEmail(subscriber.email, emailSubject, emailContent);
      }

      await delay(EMAIL_DELAY);
    }

    // 배치 완료 상태 업데이트
    await prisma.emailBatch.update({
      where: { id: batch.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        successCount,
        failureCount
      }
    });

    return { successCount, failureCount };
  } catch (error) {
    // 오류 발생 시 배치 상태 업데이트
    await prisma.emailBatch.update({
      where: { id: batch.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    });

    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // API 한도 체크
    const canProceed = await checkApiLimits();
    if (!canProceed) {
      return NextResponse.json({ error: 'API 일일 한도 초과' }, { status: 429 });
    }

    const startTime = Date.now();

    // 오늘 이메일을 받지 않은 구독자 조회
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedEmails = await prisma.emailLog.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      select: {
        email: true
      }
    });

    const processedEmailSet = new Set(processedEmails.map(log => log.email));

    const subscribers = await prisma.newsSubscriber.findMany({
      where: {
        email: {
          notIn: Array.from(processedEmailSet)
        }
      }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '오늘 모든 구독자에게 이메일이 발송되었습니다.',
        totalProcessed: processedEmailSet.size
      });
    }

    // 뉴스 수집
    const newsCategories = await getAllNewsArticles();
    const emailContent = generateNewsletterContent(newsCategories);
    const emailSubject = `[의료기기 뉴스레터] ${new Date().toLocaleDateString('ko-KR')} 뉴스 모음`;
    
    // 전체 구독자를 15명씩 배치로 나누기
    const batches = [];
    for (let i = 0; i < subscribers.length; i += EMAILS_PER_BATCH) {
      batches.push(subscribers.slice(i, i + EMAILS_PER_BATCH));
    }

    let totalProcessed = 0;
    let successCount = 0;
    let failureCount = 0;

    // 각 배치 처리
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batchSubscribers = batches[batchIndex];
      
      // 배치 정보 생성
      const batch = await prisma.emailBatch.create({
        data: {
          batchNumber: batchIndex + 1,
          totalBatches: batches.length,
          status: 'processing',
          scheduledFor: new Date(),
          startedAt: new Date()
        }
      });

      // 배치 내 구독자들을 3명씩 그룹으로 처리
      for (let i = 0; i < batchSubscribers.length; i += BATCH_SIZE) {
        const group = batchSubscribers.slice(i, i + BATCH_SIZE);
        
        // 각 그룹의 이메일 발송
        for (const subscriber of group) {
          try {
            await sendEmail({
              to: subscriber.email,
              subject: emailSubject,
              content: emailContent
            });
            
            await prisma.emailLog.create({
              data: {
                email: subscriber.email,
                status: 'success',
                provider: subscriber.email.includes('@gmail.com') ? 'gmail' : 'other'
              }
            });
            
            successCount++;
          } catch (error) {
            console.error(`이메일 발송 실패 (${subscriber.email}):`, error);
            failureCount++;
            
            await prisma.emailLog.create({
              data: {
                email: subscriber.email,
                status: 'failed',
                provider: subscriber.email.includes('@gmail.com') ? 'gmail' : 'other'
              }
            });

            // 실패한 이메일은 큐에 추가
            await queueFailedEmail(subscriber.email, emailSubject, emailContent);
          }
          
          totalProcessed++;
          await delay(EMAIL_DELAY);
        }
        
        // 그룹 간 대기
        await delay(BATCH_DELAY);
      }

      // 배치 완료 처리
      await prisma.emailBatch.update({
        where: { id: batch.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          successCount,
          failureCount
        }
      });

      // 실행 시간 체크 및 필요시 중단
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log(`최대 실행 시간 도달, 다음 실행에서 ${subscribers.length - totalProcessed}명 처리 예정`);
        break;
      }
    }

    // 메트릭 기록
    await logMetrics({
      totalSubscribers: subscribers.length + processedEmailSet.size,
      processedEmails: totalProcessed,
      successCount,
      failureCount,
      executionTime: Date.now() - startTime
    });

    const remainingCount = subscribers.length - totalProcessed;
    
    return NextResponse.json({
      success: true,
      totalProcessed,
      successCount,
      failureCount,
      remainingCount,
      totalSubscribers: subscribers.length + processedEmailSet.size
    });
  } catch (error) {
    console.error('뉴스레터 발송 중 오류:', error);
    return NextResponse.json(
      { error: '뉴스레터 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 