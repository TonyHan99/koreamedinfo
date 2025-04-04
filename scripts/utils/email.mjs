import axios from 'axios';
import FormData from 'form-data';

export async function sendEmail(options) {
  try {
    const formData = new FormData();
    formData.append('to', options.to);
    formData.append('user_id', 'admin');
    formData.append('subject', options.subject);
    formData.append('content', options.content);
    formData.append('save_sent_mail', options.saveSentMail ? 'Y' : 'N');

    const response = await axios({
      method: 'post',
      url: 'https://api.hiworks.com/office/v2/webmail/sendMail',
      data: formData,
      headers: {
        'Authorization': 'Bearer 388c20f143ae9a0dc7c528a57f48d3a2',
        ...formData.getHeaders()
      },
      validateStatus: null
    });

    console.log('API 응답:', response.data);

    if (response.data.code === 'SUC') {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.data.message || '이메일 발송 실패'
      };
    }
  } catch (error) {
    console.error('이메일 전송 중 상세 오류:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}
