import { PrismaClient } from '@prisma/client';
import { sendEmail } from './utils/email.mjs';

const prisma = new PrismaClient();

const PROMO_LINK = 'https://www.hiramedical.com';
const BANNER_IMAGE_URL = 'https://www.koreamedinfo.com/images/ads/banner.jpg';
const SUBJECT = `[Hira Medical] 심평원 데이터 분석, 10초 만에 끝내세요`;
const TEST_RECIPIENT = 'gkstmdgus99@gmail.com';
const ADDITIONAL_IMAGE_URLS = [
  'https://www.koreamedinfo.com/images/ads/hira-promo-01.png',
  'https://www.koreamedinfo.com/images/ads/hira-promo-02.png',
  'https://www.koreamedinfo.com/images/ads/hira-promo-03.png',
  'https://www.koreamedinfo.com/images/ads/hira-promo-04.png',
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function generatePromoHTML() {
  const additionalImageBlocks = ADDITIONAL_IMAGE_URLS.map(
    (imageUrl, index) => `
      <tr>
        <td style="padding:${index === 0 ? '10px 28px 0' : '14px 28px 0'};">
          <a href="${PROMO_LINK}" target="_blank" rel="noopener noreferrer">
            <img src="${imageUrl}" alt="Hira Medical 소개 이미지 ${index + 1}" width="744"
              style="display:block; width:100%; max-width:744px; height:auto; border:0; border-radius:10px;" />
          </a>
        </td>
      </tr>
    `
  ).join('');

  return `
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @media only screen and (max-width: 640px) {
        .container {
          width: 100% !important;
          border-radius: 0 !important;
        }
        .content {
          padding: 18px !important;
        }
        .title {
          font-size: 22px !important;
          line-height: 1.4 !important;
        }
        .body-text {
          font-size: 15px !important;
          line-height: 1.7 !important;
        }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#f3f5f7; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f5f7; padding:20px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" class="container" width="800" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:800px; background:#ffffff; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:0;">
                <a href="${PROMO_LINK}" target="_blank" rel="noopener noreferrer">
                  <img src="${BANNER_IMAGE_URL}" alt="Hira Medical 배너" width="800" style="display:block; width:100%; max-width:800px; height:auto; border:0;" />
                </a>
              </td>
            </tr>
            <tr>
              <td class="content" style="padding:28px;">
                <h1 class="title" style="margin:0 0 14px; color:#111827; font-size:26px; line-height:1.35; font-weight:700;">
                  심평원 데이터 가공, 이제 10초 만에 끝내세요
                </h1>
                <p class="body-text" style="margin:0; color:#374151; font-size:16px; line-height:1.8;">
                  노가다 끝: 중분류 코드 입력 즉시 6개월 추이 시각화<br />
                  보고서 완성: 분석 데이터 그대로 엑셀 다운로드
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                  <tr>
                    <td style="border-radius:8px; background:#2563eb;">
                      <a href="${PROMO_LINK}" target="_blank" rel="noopener noreferrer"
                        style="display:inline-block; padding:12px 20px; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none;">
                        www.hiramedical.com 바로가기
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${additionalImageBlocks}
            <tr>
              <td style="padding:18px 28px; background:#f9fafb; border-top:1px solid #e5e7eb;">
                <p style="margin:0; color:#6b7280; font-size:12px; line-height:1.6;">
                  본 메일은 의료기기 업계 정보 안내를 위해 발송되었습니다.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

async function sendEmailsInBatches(subscribers, htmlContent, batchSize = 50) {
  let successCount = 0;
  let failCount = 0;
  const failedEmails = [];

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    console.log(`배치 ${i / batchSize + 1} 처리 중 (${batch.length}명)`);

    for (const subscriber of batch) {
      try {
        const result = await sendEmail({
          to: subscriber.email,
          subject: SUBJECT,
          content: htmlContent,
          saveSentMail: true,
        });

        if (!result.success) {
          throw new Error(result.error || '메일 발송 실패');
        }

        successCount++;
        await delay(1200);
      } catch (error) {
        failCount++;
        failedEmails.push(subscriber.email);
        console.error(`구독자 ${subscriber.email} 발송 실패:`, error.message || error);
        await delay(3000);
      }
    }

    if (i + batchSize < subscribers.length) {
      console.log('다음 배치 전 5초 대기...');
      await delay(5000);
    }
  }

  return { successCount, failCount, failedEmails };
}

async function main() {
  try {
    const subscribers = [{ email: TEST_RECIPIENT }];
    console.log('테스트 발송 모드 수신자:', TEST_RECIPIENT);

    const htmlContent = generatePromoHTML();
    const { successCount, failCount, failedEmails } = await sendEmailsInBatches(subscribers, htmlContent);

    console.log(`총 ${subscribers.length}명 중 ${successCount}명 성공, ${failCount}명 실패`);
    if (failedEmails.length > 0) {
      console.log('실패 이메일:', failedEmails);
    }
  } catch (error) {
    console.error('홍보 메일 발송 중 오류:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
