import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function POST(req: Request) {
  try {
    const data = await req.json() as ContactFormData;
    console.log('받은 데이터:', data);

    if (!process.env.HIWORKS_API_URL || !process.env.HIWORKS_API_TOKEN || !process.env.HIWORKS_USER_ID || !process.env.ADMIN_EMAIL) {
      throw new Error('필수 환경 변수가 설정되지 않았습니다.');
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('to', process.env.ADMIN_EMAIL);
    formData.append('user_id', process.env.HIWORKS_USER_ID || 'admin');
    formData.append('subject', `[문의] ${data.name}님의 문의사항`);
    formData.append('content', `
이름: ${data.name}
이메일: ${data.email}
메시지: ${data.message}
    `);
    formData.append('save_sent_mail', 'N');

    const apiEndpoint = `${process.env.HIWORKS_API_URL}/office/v2/webmail/sendMail`;
    console.log('API 엔드포인트:', apiEndpoint);
    console.log('요청 데이터:', {
      to: process.env.ADMIN_EMAIL,
      user_id: process.env.HIWORKS_USER_ID,
      subject: `[문의] ${data.name}님의 문의사항`,
      save_sent_mail: 'N'
    });

    // Hiworks API로 이메일 전송
    const response = await axios.post(
      apiEndpoint,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': process.env.HIWORKS_API_TOKEN,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      }
    );

    console.log('API 응답:', {
      status: response.status,
      data: response.data
    });

    if (response.status === 200) {
      return NextResponse.json({ 
        success: true,
        message: '메시지가 성공적으로 전송되었습니다.'
      });
    } else {
      throw new Error(`이메일 전송 실패 - 상태 코드: ${response.status}`);
    }

  } catch (error: any) {
    console.error('이메일 전송 중 오류:', error.response?.data || error);
    console.error('문의하기 에러:', error);
    
    let errorMessage = '메시지 전송 중 오류가 발생했습니다.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 