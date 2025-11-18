import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

// 간단한 Rate Limiting (메모리 기반)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분
const RATE_LIMIT_MAX = 3; // 1분에 최대 3회

// 스팸 패턴 감지
function isSpam(data: { name?: string; email?: string; company?: string; adDetails?: string; website?: string }): boolean {
  // Honeypot 필드 체크 (봇이 채우면 스팸)
  if (data.website && data.website.trim() !== '') {
    console.log('스팸 감지: Honeypot 필드 채워짐');
    return true;
  }

  // 이름이 이상한 문자열인지 체크
  if (data.name) {
    const name = data.name.trim();
    if (name.length > 15 && /^[A-Za-z0-9]{15,}$/.test(name)) {
      console.log('스팸 감지: 이상한 이름 패턴');
      return true;
    }
    if (name.length > 20 && !/[\u3131-\u3163\uac00-\ud7a3]/.test(name)) {
      console.log('스팸 감지: 한글 없는 긴 이름');
      return true;
    }
  }

  // 메시지가 너무 짧거나 이상한 패턴
  if (data.adDetails) {
    const message = data.adDetails.trim();
    if (message.length < 5) {
      console.log('스팸 감지: 메시지가 너무 짧음');
      return true;
    }
    if (message.length > 10 && /^[A-Za-z0-9]{10,}$/.test(message)) {
      console.log('스팸 감지: 이상한 메시지 패턴');
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

export async function POST(req: Request) {
  try {
    // IP 주소 가져오기
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';

    // Rate Limiting 체크
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false,
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        },
        { status: 429 }
      );
    }

    const data = await req.json();
    console.log('받은 데이터:', data);

    // 스팸 체크
    if (isSpam(data)) {
      console.log('스팸 요청 차단됨:', { ip, data });
      return NextResponse.json({ 
        success: true,
        message: '신청이 성공적으로 전송되었습니다.',
      });
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('to', 'gkstmdgus99@gmail.com'); // 수신자 이메일 주소
    formData.append('user_id', 'admin'); // 고정값
    formData.append('cc', '');
    formData.append('bcc', '');
    formData.append('subject', `[광고 신청] ${data.name}님의 신청`);
    formData.append('content', `
회사명: ${data.company}
이름: ${data.name}
전화번호: ${data.phone}
이메일: ${data.email}
세부사항: ${data.adDetails}
    `);
    formData.append('save_sent_mail', 'N');

    console.log('요청 데이터:', {
      to: 'gkstmdgus99@gmail.com',
      user_id: 'admin',
      subject: `[광고 신청] ${data.name}님의 신청`,
      save_sent_mail: 'N'
    });

    // Hiworks Office API로 이메일 전송
    const hiworksResponse = await axios({
      method: 'post',
      url: 'https://api.hiworks.com/office/v2/webmail/sendMail',
      data: formData,
      headers: {
        'Authorization': 'Bearer 388c20f143ae9a0dc7c528a57f48d3a2', // 적절한 토큰으로 교체
        ...formData.getHeaders()
      },
      validateStatus: null
    });

    console.log('API 응답:', {
      status: hiworksResponse.status,
      data: hiworksResponse.data
    });

    if (hiworksResponse.status === 200) {
      return NextResponse.json({ 
        success: true,
        message: '신청이 성공적으로 전송되었습니다.',
      });
    } else {
      throw new Error(`이메일 전송 실패 - 상태 코드: ${hiworksResponse.status}, 응답: ${JSON.stringify(hiworksResponse.data)}`);
    }

  } catch (error: any) {
    console.error('에러 상세 정보:', {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: error.response?.data?.message || error.message || '신청 전송 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
