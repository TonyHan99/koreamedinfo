import axios from 'axios';
import FormData from 'form-data';

/**
 * 하이웍스 API를 사용하여 이메일을 전송합니다.
 * @param {Object} options 이메일 전송 옵션
 * @returns {Promise<Object>} 전송 결과
 */
export async function sendEmail(options) {
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
    const formData = new FormData();
    formData.append('to', options.to);
    formData.append('user_id', userId || 'admin');
    formData.append('subject', options.subject);
    formData.append('content', options.content);
    formData.append('save_sent_mail', options.saveSentMail ? 'Y' : 'N');

    const response = await axios.post(
      apiUrl,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders()
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
  } catch (error) {
    console.error('이메일 전송 중 오류:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * 테스트 이메일을 전송합니다.
 * @returns {Promise<Object>} 전송 결과
 */
export async function sendTestEmail() {
  return sendEmail({
    to: 'gkstmdgus99@gmail.com',
    subject: 'Hiworks API 테스트',
    content: 'Hiworks API를 사용하여 메일을 발송합니다.'
  });
} 