import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('받은 데이터:', data);

    // 환경 변수 로깅
    console.log('API URL:', process.env.HIWORKS_API_URL);
    console.log('User ID:', process.env.HIWORKS_USER_ID);
    console.log('Token 존재 여부:', !!process.env.HIWORKS_TOKEN);

    // FormData 생성
    const formData = new FormData();
    formData.append('to', 'gkstmdgus99@gmail.com');
    formData.append('user_id', process.env.HIWORKS_USER_ID || 'admin');
    formData.append('cc', '');
    formData.append('bcc', '');
    formData.append('subject', `[문의] ${data.name}님의 문의사항`);
    formData.append('content', `
이름: ${data.name}
이메일: ${data.email}
메시지: ${data.message}
    `);
    formData.append('save_sent_mail', 'N');

    console.log('요청 데이터:', {
      to: 'gkstmdgus99@gmail.com',
      user_id: process.env.HIWORKS_USER_ID,
      subject: `[문의] ${data.name}님의 문의사항`,
      save_sent_mail: 'N'
    });

    // Hiworks API로 이메일 전송
    const hiworksResponse = await axios({
      method: 'post',
      url: process.env.HIWORKS_API_URL,
      data: formData,
      headers: {
        'Authorization': `Bearer ${process.env.HIWORKS_TOKEN}`,
        ...formData.getHeaders()
      },
      validateStatus: null // 모든 상태 코드를 허용
    });

    console.log('API 응답:', {
      status: hiworksResponse.status,
      data: hiworksResponse.data
    });

    if (hiworksResponse.status === 200) {
      return NextResponse.json({ 
        success: true,
        message: '메시지가 성공적으로 전송되었습니다.',
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
        error: error.response?.data?.message || error.message || '메시지 전송 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
} 