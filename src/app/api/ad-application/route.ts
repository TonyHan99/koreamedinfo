import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('받은 데이터:', data);

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
