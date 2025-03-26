import axios from 'axios';

interface SendEmailOptions {
  to: string;
  subject: string;
  content: string;
  saveSentMail?: boolean;
}

interface SendEmailResponse {
  success: boolean;
  error?: string;
}

/**
 * 하이웍스 API를 사용하여 이메일을 전송합니다.
 * @param options 이메일 전송 옵션
 * @returns 전송 결과
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResponse> {
  const apiUrl = process.env.HIWORKS_API_URL;
  const token = process.env.HIWORKS_API_TOKEN;
  const userId = process.env.HIWORKS_USER_ID;

  if (!apiUrl || !token) {
    console.error('이메일 전송 중 오류: Hiworks API URL 또는 토큰이 설정되지 않았습니다.');
    return {
      success: false,
      error: 'Hiworks API URL 또는 토큰이 설정되지 않았습니다.'
    };
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        to: options.to,
        user_id: userId,
        subject: options.subject,
        content: options.content,
        save_sent_mail: options.saveSentMail ? 'Y' : 'N'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.code === 'SUC') {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.data.message || '이메일 발송 실패'
      };
    }
  } catch (error: any) {
    console.error('이메일 전송 중 오류:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * 테스트 이메일을 전송합니다.
 * @returns 전송 결과
 */
export async function sendTestEmail(): Promise<SendEmailResponse> {
  return sendEmail({
    to: 'gkstmdgus99@gmail.com',
    subject: 'Hiworks API 테스트',
    content: 'Hiworks API를 사용하여 메일을 발송합니다.'
  });
} 