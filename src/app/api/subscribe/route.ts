import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// 간단한 Rate Limiting (메모리 기반)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분
const RATE_LIMIT_MAX = 3; // 1분에 최대 3회

// 스팸 패턴 감지
function isSpam(data: { name?: string; email?: string; company?: string; phone?: string; website?: string }): boolean {
  // Honeypot 필드 체크 (봇이 채우면 스팸)
  if (data.website && data.website.trim() !== '') {
    console.log('스팸 감지: Honeypot 필드 채워짐');
    return true;
  }

  // 이름이 이상한 문자열인지 체크 (랜덤 문자열 패턴)
  if (data.name) {
    const name = data.name.trim();
    // 15자 이상의 랜덤 문자열 패턴 감지
    if (name.length > 15 && /^[A-Za-z0-9]{15,}$/.test(name)) {
      console.log('스팸 감지: 이상한 이름 패턴');
      return true;
    }
    // 한글이 전혀 없는 긴 이름도 의심
    if (name.length > 20 && !/[\u3131-\u3163\uac00-\ud7a3]/.test(name)) {
      console.log('스팸 감지: 한글 없는 긴 이름');
      return true;
    }
  }

  // 회사명이 이상한 패턴
  if (data.company) {
    const company = data.company.trim();
    if (company.length > 20 && /^[A-Za-z0-9]{20,}$/.test(company)) {
      console.log('스팸 감지: 이상한 회사명 패턴');
      return true;
    }
  }

  return false;
}

// Rate Limiting 체크
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    console.log(`Rate limit 초과: IP ${ip}`);
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // IP 주소 가져오기
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Rate Limiting 체크
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log('[DEBUG] 받은 데이터:', body);

    const { name, phone, company, email } = body;

    // 스팸 체크
    if (isSpam(body)) {
      console.log('스팸 구독 요청 차단됨:', { ip, body });
      // 스팸인 경우에도 성공 응답을 보내서 봇이 차단되었음을 모르게 함
      return NextResponse.json(
        { message: '구독 신청이 완료되었습니다.' },
        { status: 201 }
      );
    }

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