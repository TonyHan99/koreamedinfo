import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/utils/hiworks/email';
import { notifyAdmin } from '@/utils/monitoring';

// PrismaClient 싱글톤 처리
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// 타입 정의
interface NewsSubscriber {
  id: string;
  email: string;
  name: string;
  phone: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
  lastSentAt?: Date;
}

interface EmailResult {
  success: boolean;
  email: string;
  error?: string;
}

// 상수 정의
const BATCH_SIZE = 100;          // 한 번에 100명씩
const BATCH_DELAY = 2000;        // 배치 간 2초 대기
const MAX_EXECUTION_TIME = 45000; // 45초 (Vercel 60초 제한)
const MAX_EMAILS_PER_RUN = 100;  // 한 번 실행에 100명
const MAX_RETRIES = 3;          // 재시도 횟수
const RETRY_DELAYS = [2000, 5000, 10000];  // 점진적 대기 시간 조정

// 유틸리티 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 뉴스 수집 함수
async function getLatestNews() {
  try {
    const response = await fetch('https://api.example.com/news', {
      headers: {
        'Authorization': `Bearer ${process.env.NEWS_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('뉴스 API 호출 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('뉴스 수집 중 오류:', error);
    return null;
  }
}

// 뉴스레터 내용 생성 함수
function generateNewsletterContent(news: any[]) {
  if (!news || news.length === 0) return '';
  
  return `
    <h1>의료기기 산업 최신 뉴스</h1>
    ${news.map(item => `
      <div>
        <h2>${item.title}</h2>
        <p>${item.content}</p>
        <a href="${item.url}">자세히 보기</a>
      </div>
    `).join('')}
  `;
}

// 이메일 재시도 함수
async function sendEmailWithRetry(to: string, subject: string, content: string, attempt = 0) {
  try {
    if (attempt >= MAX_RETRIES) {
      console.error(`이메일 발송 최대 재시도 횟수 초과: ${to}`);
      await queueFailedEmail(to, subject, content);
      return { success: false, error: '최대 재시도 횟수 초과' };
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
    console.error(`이메일 발송 중 오류 발생: ${to}`, error);
    
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

// 실패한 이메일 큐잉 함수
async function queueFailedEmail(to: string, subject: string, content: string) {
  try {
    await prisma.failedEmail.create({
      data: {
        email: to,
        subject,
        content,
        error: '이메일 발송 실패'
      }
    });
    console.log(`실패한 이메일 큐잉 완료: ${to}`);
  } catch (error) {
    console.error('실패한 이메일 큐잉 중 오류:', error);
  }
}

// 이메일 성공 로깅 함수
async function logEmailSuccess(email: string) {
  try {
    await prisma.emailLog.create({
      data: {
        email,
        status: 'success',
        provider: email.includes('@gmail.com') ? 'gmail' : 'other'
      }
    });
  } catch (error) {
    console.error('이메일 성공 로깅 중 오류:', error);
  }
}

// 메인 뉴스레터 발송 함수
async function sendNewsletterToAllSubscribers() {
  let totalProcessed = 0;
  const startTime = Date.now();

  try {
    // 오늘 아직 이메일을 받지 않은 구독자만 조회
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const subscribers = await prisma.newsSubscriber.findMany({
      where: {
        lastSentAt: {
          lt: today
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    }) as NewsSubscriber[];

    if (subscribers.length === 0) {
      console.log('오늘 발송할 구독자가 없습니다.');
      return { success: true, message: 'No subscribers to process' };
    }

    // 최신 뉴스 수집
    const news = await getLatestNews();
    if (!news || news.length === 0) {
      console.error('뉴스 수집 실패');
      return { success: false, error: 'Failed to collect news' };
    }

    // 뉴스레터 내용 생성
    const newsletterContent = generateNewsletterContent(news);

    // 구독자를 배치로 나누기
    const batches = [];
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      batches.push(subscribers.slice(i, i + BATCH_SIZE));
    }

    console.log(`총 ${subscribers.length}명의 구독자, ${batches.length}개의 배치로 처리`);

    // 각 배치 처리
    for (const batch of batches) {
      // 실행 시간 체크
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log('최대 실행 시간 도달, 다음 실행에서 계속');
        break;
      }

      // 최대 처리 수 체크
      if (totalProcessed >= MAX_EMAILS_PER_RUN) {
        console.log('최대 처리 수 도달, 다음 실행에서 계속');
        break;
      }

      try {
        // 배치 내 모든 이메일 동시 처리
        const results = await Promise.all(
          batch.map(async (subscriber: NewsSubscriber) => {
            try {
              const result = await sendEmailWithRetry(
                subscriber.email,
                '의료기기 산업 뉴스레터',
                newsletterContent
              );

              if (result.success) {
                await prisma.newsSubscriber.update({
                  where: { id: subscriber.id },
                  data: { lastSentAt: new Date() }
                });
                totalProcessed++;
                return { success: true, email: subscriber.email };
              } else {
                console.error(`이메일 발송 실패: ${subscriber.email}`, result.error);
                await queueFailedEmail(subscriber.email, '의료기기 산업 뉴스레터', newsletterContent);
                return { success: false, email: subscriber.email, error: result.error };
              }
            } catch (error) {
              console.error(`구독자 처리 중 오류: ${subscriber.email}`, error);
              await queueFailedEmail(subscriber.email, '의료기기 산업 뉴스레터', newsletterContent);
              return { success: false, email: subscriber.email, error: '처리 중 오류 발생' };
            }
          })
        );

        // 성공/실패 통계
        const successCount = results.filter((r: EmailResult) => r.success).length;
        const failureCount = results.filter((r: EmailResult) => !r.success).length;
        
        console.log(`배치 처리 결과: 성공 ${successCount}명, 실패 ${failureCount}명`);

        // 배치 간 대기
        await delay(BATCH_DELAY);

      } catch (batchError) {
        console.error('배치 처리 중 오류:', batchError);
        await notifyAdmin('배치 처리 실패');
      }
    }

    console.log(`총 ${totalProcessed}명의 구독자에게 이메일 발송 완료`);
    return { 
      success: true, 
      message: `Processed ${totalProcessed} subscribers`,
      totalProcessed
    };

  } catch (error) {
    console.error('뉴스레터 발송 중 오류:', error);
    await notifyAdmin('뉴스레터 발송 실패');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}

export async function GET(request: Request) {
  try {
    const result = await sendNewsletterToAllSubscribers();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API 처리 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류 발생' },
      { status: 500 }
    );
  }
}