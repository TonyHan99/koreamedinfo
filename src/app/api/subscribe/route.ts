import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[DEBUG] 받은 데이터:', body);

    const { name, phone, company, email } = body;

    // 필수 필드 검증
    if (!name || !phone || !company || !email) {
      console.log('[DEBUG] 필수 필드 누락:', { name, phone, company, email });
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // DB에 구독자 정보 저장 (전화번호 형식 변환 없이 그대로 저장)
    const subscriber = await prisma.newsSubscriber.create({
      data: {
        name,
        phone,  // 하이픈이 포함된 원래 형식 그대로 저장
        company,
        email,
      },
    });

    console.log('[DEBUG] 저장된 구독자 정보:', subscriber);

    return NextResponse.json(
      { message: '구독 신청이 완료되었습니다.', subscriber },
      { status: 201 }
    );

  } catch (error) {
    console.error('[DEBUG] 에러 발생:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: '이미 구독 중인 이메일입니다.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: '구독 신청 처리 중 오류가 발생했습니다(이미 구독 중인 이메일 일 수 있습니다).' },
      { status: 500 }
    );
  }
} 