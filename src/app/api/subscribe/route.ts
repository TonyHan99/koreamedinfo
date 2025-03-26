import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, company, email } = body;

    // 필수 필드 검증
    if (!name || !phone || !company || !email) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          }
        }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          }
        }
      );
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          }
        }
      );
    }

    // DB에 구독자 정보 저장
    const subscriber = await prisma.newsSubscriber.create({
      data: {
        name,
        phone,
        company,
        email,
      },
    });

    return NextResponse.json(
      { message: '구독 신청이 완료되었습니다.', subscriber },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  } catch (error: any) {
    // 이메일 중복 에러 처리
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 구독 중인 이메일입니다.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          }
        }
      );
    }

    console.error('구독 신청 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '구독 신청 처리 중 오류가 발생했습니다.' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
} 