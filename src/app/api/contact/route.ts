import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('받은 데이터:', data);

    // FormData 생성
    const formData = new FormData();
    formData.append('to', 'gkstmdgus99@gmail.com');
    formData.append('user_id', 'admin'); // 고정값
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
      user_id: 'admin',
      subject: `[문의] ${data.name}님의 문의사항`,
      save_sent_mail: 'N'
    });

    // Hiworks Office API로 이메일 전송
    const hiworksResponse = await axios({
      method: 'post',
      url: 'https://api.hiworks.com/office/v2/webmail/sendMail',
      data: formData,
      headers: {
        'Authorization': 'Bearer 388c20f143ae9a0dc7c528a57f48d3a2',
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
