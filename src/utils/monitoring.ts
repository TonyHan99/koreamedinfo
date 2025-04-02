import prisma from '@/lib/prisma';
import { sendEmail } from './hiworks/email';

export interface NewsletterMetrics {
  batchNumber?: number;
  totalSubscribers: number;
  processedEmails: number;
  successCount: number;
  failureCount: number;
  executionTime: number;
}

export async function notifyAdmin(message: string) {
  if (!process.env.ADMIN_EMAIL) return;
  
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: '[의료기기 뉴스레터] 시스템 알림',
      content: `
        ${message}
        
        시간: ${new Date().toLocaleString('ko-KR')}
      `
    });
    
    console.log('관리자 알림 발송 완료:', message);
  } catch (error) {
    console.error('관리자 알림 발송 실패:', error);
  }
}

export async function logMetrics(metrics: NewsletterMetrics) {
  try {
    await prisma.newsletterMetrics.create({
      data: {
        batchNumber: metrics.batchNumber,
        totalSubscribers: metrics.totalSubscribers,
        processedEmails: metrics.processedEmails,
        successCount: metrics.successCount,
        failureCount: metrics.failureCount,
        executionTime: metrics.executionTime
      }
    });
    
    // 성공률이 80% 미만이면 관리자에게 알림
    if (metrics.processedEmails > 0) {  // 0으로 나누기 방지
      const successRate = (metrics.successCount / metrics.processedEmails) * 100;
      if (successRate < 80) {
        await notifyAdmin(`
          뉴스레터 발송 성공률 저조
          - 총 발송: ${metrics.processedEmails}
          - 성공: ${metrics.successCount}
          - 실패: ${metrics.failureCount}
          - 성공률: ${successRate.toFixed(1)}%
        `);
      }
    }
  } catch (error) {
    console.error('메트릭 로깅 실패:', error);
    if (error instanceof Error) {
      await notifyAdmin(`메트릭 로깅 실패: ${error.message}`);
    } else {
      await notifyAdmin('메트릭 로깅 중 알 수 없는 오류가 발생했습니다.');
    }
  }
}

export async function checkApiLimits() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const metrics = await prisma.newsletterMetrics.findMany({
      where: {
        timestamp: {
          gte: today
        }
      }
    });
    
    const totalApiCalls = metrics.reduce((sum, m) => sum + m.processedEmails, 0);
    const API_DAILY_LIMIT = 25000;
    
    if (totalApiCalls >= API_DAILY_LIMIT * 0.8) {  // 80% 도달 시 알림
      await notifyAdmin(`
        API 호출 한도 경고
        - 오늘 총 호출: ${totalApiCalls}
        - 한도: ${API_DAILY_LIMIT}
        - 사용률: ${((totalApiCalls / API_DAILY_LIMIT) * 100).toFixed(1)}%
      `);
      
      if (totalApiCalls >= API_DAILY_LIMIT) {
        console.error('API 일일 한도 초과');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('API 한도 확인 실패:', error);
    if (error instanceof Error) {
      await notifyAdmin(`API 한도 확인 실패: ${error.message}`);
    } else {
      await notifyAdmin('API 한도 확인 중 알 수 없는 오류가 발생했습니다.');
    }
    return false;
  }
} 