import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
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

    // 환경 변수 체크
    if (!process.env.HIWORKS_API_URL || !process.env.HIWORKS_API_TOKEN || !process.env.HIWORKS_USER_ID) {
      console.error('필수 환경 변수 누락:', {
        hasApiUrl: !!process.env.HIWORKS_API_URL,
        hasToken: !!process.env.HIWORKS_API_TOKEN,
        hasUserId: !!process.env.HIWORKS_USER_ID
      });
      throw new Error('이메일 서버 설정이 올바르지 않습니다.');
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('to', 'gkstmdgus99@gmail.com');
    formData.append('user_id', process.env.HIWORKS_USER_ID);
    formData.append('cc', '');
    formData.append('bcc', '');
    formData.append('subject', `[문의] ${data.name}님의 문의사항`);
    formData.append('content', `
이름: ${data.name}
이메일: ${data.email}
메시지: ${data.message}

---
koreamedinfo.com 문의하기 폼에서 전송됨
    `);
    formData.append('save_sent_mail', 'Y');

    // Hiworks API로 이메일 전송
    const hiworksResponse = await axios({
      method: 'post',
      url: process.env.HIWORKS_API_URL,
      data: formData,
      headers: {
        'Authorization': `Bearer ${process.env.HIWORKS_API_TOKEN}`,
        ...formData.getHeaders()
      }
    });

    if (hiworksResponse.status === 200) {
      return NextResponse.json({ 
        success: true,
        message: '메시지가 성공적으로 전송되었습니다.'
      });
    }

    console.error('Hiworks API 응답:', hiworksResponse.status, hiworksResponse.data);
    throw new Error('이메일 전송에 실패했습니다.');

  } catch (error) {
    console.error('문의하기 에러:', error);
    
    if (error instanceof AxiosError) {
      console.error('API 에러 상세:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '메시지 전송 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
} 