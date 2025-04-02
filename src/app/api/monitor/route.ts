import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 모니터링 API 엔드포인트 생성
export async function GET(request: Request) {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
      select: {
        email: true,
        status: true,
        provider: true,
        sentAt: true
      }
    });

    const total = logs.length;
    const success = logs.filter(log => log.status === 'success').length;
    const failed = logs.filter(log => log.status === 'failed').length;

    return NextResponse.json({
      total,
      success,
      failed,
      logs
    });
  } catch (error) {
    console.error('모니터링 데이터 조회 중 오류:', error);
    return NextResponse.json(
      { error: '모니터링 데이터 조회 실패' },
      { status: 500 }
    );
  }
} 