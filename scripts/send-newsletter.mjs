import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { sendEmail } from './utils/email.mjs';

const prisma = new PrismaClient();

// 네이버 API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 검색 키워드 카테고리
const SEARCH_KEYWORDS = {
  '주요 의료기기 기업': ['메드트로닉 +병원', '애보트 +병원', '보스톤사이언티픽 +병원', '인튜이티브 +로봇 +병원'],
  '심장/혈관 분야': ['관상동맥 +스텐트', '스텐트 +혈관'],
  '의료정책': ['비급여 +병원', '신의료기술', '리베이트&병원'],
  '규제/인증': ['의료기기&허가'],
  '시장 동향': ['다국적&의료기기', '제약&의료기기', '의료기기&마케팅', '의료기기 +수출', "의료기기 +유럽"],
  '의료 AI/로봇': ['"의료AI"&병원', '수술로봇'],
  '전문병원': ['척추병원', '정형외과 +통증', '흉부외과','관절수술','관절염&콜라겐주사','카티프로&관절'],
  '수술 기술': ['최소침습', '복강경'],
  '미용 의료기기기': ['필러 +수출', '스킨부스터 +수출', '피부과 +런칭', '성형외과 +런칭', '"콜라겐주사" +피부부']
};

// 필터링할 키워드들 (이 키워드가 포함된 기사는 제외)
const EXCLUDE_KEYWORDS = [
  // 연예인 관련
  '연예인', '배우', '가수', '아이돌', '스타', '유명인', '셀럽', '인스타그램', 'SNS',
  // 보험사 관련
  '보험', '보험사', '생명보험', '손해보험', '보험상품', '보험료', '보험금',
  // 일반 광고/마케팅
  '광고', '홍보', '마케팅', '브랜드', '이벤트', '프로모션', '할인', '쿠폰',
  // 스포츠/게임
  '축구', '야구', '농구', '골프', '테니스', '게임', 'e스포츠', '리그', '경기',
  // 정치/사회 일반
  '정치', '국회', '의원', '대통령', '정부', '법안', '투표', '선거',
  // 부동산/금융
  '부동산', '아파트', '집값', '주식', '투자', '펀드', '은행', '대출',
  // 기타 불필요한 키워드
  '사기', '사칭', '허위', '과장', '기만', '속임수'
];

// 의료기기 관련 필수 키워드 (이 중 하나라도 포함되어야 함)
const MEDICAL_DEVICE_KEYWORDS = [
  '의료기기', '의료장비', '의료용품', '진단기기', '치료기기', '수술기기',
  '스텐트', '카테터', '심박조율기', '인슐린펌프', '산소포화도계', '혈압계',
  'MRI', 'CT', '초음파', '엑스레이', '내시경', '복강경', '로봇수술',
  '인공심장', '인공관절', '보형물', '임플란트', '스텐트', '바이패스',
  '심장판막', '심장이식', '장기이식', '조직공학', '재생의학',
  '의료AI', '의료로봇', '원격의료', '텔레메디슨', '디지털헬스',
  '메드트로닉', '애보트', '보스톤사이언티픽', '인튜이티브', '존슨앤존슨',
  '필립스', '지멘스', 'GE헬스케어', '로슈', '노바티스'
];

// 24시간 이내 뉴스인지 확인
function isWithin24Hours(pubDate) {
  const newsDate = new Date(pubDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
}

// HTML 태그 및 특수문자 제거
function cleanText(text) {
  return text
    .replace(/<\/?[^>]+(>|$)/g, '') // 모든 HTML 태그 제거
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 두 제목의 유사도 검사
function areTitlesSimilar(title1, title2) {
  const words1 = new Set(
    cleanText(title1)
      .split(' ')
      .filter(word => word.length >= 2)
  );
  const words2 = new Set(
    cleanText(title2)
      .split(' ')
      .filter(word => word.length >= 2)
  );

  const commonWords = Array.from(words1).filter(word => words2.has(word));
  return commonWords.length >= 2;
}

// API 호출 사이의 딜레이 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Naver API 호출 최적화
async function getNewsForKeyword(keyword, retryCount = 0) {
  try {
    // API 호출 간 딜레이 (Hiworks 이메일 API와 Naver API 제한을 고려)
    await delay(1000 + Math.random() * 1000); // 1~2초 사이 랜덤 딜레이

    const response = await axios.get(
      'https://openapi.naver.com/v1/search/news.json',
      {
        params: {
          query: keyword,
          display: 5,
          sort: 'date',
        },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
        timeout: 5000, // 5초 타임아웃 설정
      }
    );

    const recentNews = response.data.items
      .filter(item => isWithin24Hours(item.pubDate))
      .filter(item => filterArticle(item))
      .map(item => ({
        ...item,
        keyword,
        pubDate: new Date(item.pubDate)
      }));

    return recentNews;
  } catch (error) {
    if (retryCount >= 3) {
      console.error(`키워드 "${keyword}" 최대 재시도 횟수(3회) 초과`);
      return [];
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.log(`키워드 "${keyword}" API 제한 도달. ${retryAfter}초 후 재시도...`);
      await delay(retryAfter * 1000);
      return getNewsForKeyword(keyword, retryCount + 1);
    }
    
    const errorMessage = error.response?.data?.errorMessage || error.message;
    console.error(`키워드 "${keyword}" 뉴스 가져오기 실패:`, errorMessage);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.log(`네트워크 오류 발생. 2초 후 재시도...`);
      await delay(2000);
      return getNewsForKeyword(keyword, retryCount + 1);
    }
    
    return [];
  }
}

// 기사 필터링 함수
function filterArticle(article) {
  const title = cleanText(article.title).toLowerCase();
  const description = cleanText(article.description).toLowerCase();
  const content = title + ' ' + description;

  // 제외 키워드 체크
  for (const excludeKeyword of EXCLUDE_KEYWORDS) {
    if (content.includes(excludeKeyword.toLowerCase())) {
      console.log(`제외됨 (${excludeKeyword}): ${article.title}`);
      return false;
    }
  }

  // 의료기기 관련 필수 키워드 체크 (최소 1개 이상 포함되어야 함)
  const hasMedicalKeyword = MEDICAL_DEVICE_KEYWORDS.some(keyword => 
    content.includes(keyword.toLowerCase())
  );

  if (!hasMedicalKeyword) {
    console.log(`제외됨 (의료기기 키워드 없음): ${article.title}`);
    return false;
  }

  // 제목이 너무 짧거나 긴 경우 제외
  if (title.length < 10 || title.length > 100) {
    console.log(`제외됨 (제목 길이): ${article.title}`);
    return false;
  }

  // 중복된 단어가 너무 많은 경우 제외 (스팸성 기사)
  const words = title.split(' ').filter(word => word.length > 1);
  const uniqueWords = new Set(words);
  if (words.length > 0 && uniqueWords.size / words.length < 0.6) {
    console.log(`제외됨 (중복 단어 많음): ${article.title}`);
    return false;
  }

  return true;
}

// 뉴스 수집 함수 (변경 없음)
async function getAllNewsArticles() {
  const allArticles = [];
  const seenUrls = new Set();
  const processedArticles = [];

  // 병렬로 모든 키워드에 대한 뉴스를 가져옴
  const categoryPromises = Object.entries(SEARCH_KEYWORDS).map(async ([category, keywords]) => {
    const keywordPromises = keywords.map(keyword => getNewsForKeyword(keyword));
    const keywordResults = await Promise.all(keywordPromises);
    
    const categoryArticles = [];
    
    for (const articles of keywordResults) {
      for (const article of articles) {
        if (seenUrls.has(article.link)) {
          continue;
        }

        let isDuplicate = false;
        for (const processedArticle of processedArticles) {
          if (areTitlesSimilar(article.title, processedArticle.title)) {
            if (article.pubDate > processedArticle.pubDate) {
              const index = processedArticles.indexOf(processedArticle);
              processedArticles.splice(index, 1);
              seenUrls.delete(processedArticle.link);
              break;
            } else {
              isDuplicate = true;
              break;
            }
          }
        }

        if (!isDuplicate) {
          seenUrls.add(article.link);
          processedArticles.push(article);
          categoryArticles.push(article);
        }
      }
    }

    if (categoryArticles.length > 0) {
      categoryArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
      return {
        category,
        articles: categoryArticles
      };
    }
    return null;
  });

  const results = await Promise.all(categoryPromises);
  return results.filter(result => result !== null);
}

// 이메일 발송을 분할 처리하는 함수
async function sendEmailsInBatches(subscribers, htmlContent, batchSize = 50) {
  let successCount = 0;
  let failCount = 0;
  const failedEmails = [];
  
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    console.log(`배치 ${i / batchSize + 1} 처리 중 (${batch.length}명)`);
    
    for (const subscriber of batch) {
      try {
        console.log(`${subscriber.email}에게 이메일 발송 시도...`);
        const emailResult = await sendEmail({
          to: subscriber.email,
          subject: `[의료기기 뉴스레터] ${new Date().toLocaleDateString('ko-KR')} 뉴스 모음`,
          content: htmlContent,
          saveSentMail: true
        });
        console.log('이메일 발송 결과:', emailResult);
        successCount++;
        
        // Hiworks API 제한을 고려한 딜레이 (초당 1회 미만으로 제한)
        await delay(1200); // 1.2초 딜레이
      } catch (error) {
        failCount++;
        failedEmails.push(subscriber.email);
        console.error(`구독자 ${subscriber.email}에게 발송 실패:`, error);
        
        // 오류 발생 시 잠시 대기
        await delay(3000);
      }
    }
    
    // 배치 간 딜레이 추가
    if (i + batchSize < subscribers.length) {
      console.log(`다음 배치를 위해 5초 대기...`);
      await delay(5000);
    }
  }
  
  return { successCount, failCount, failedEmails };
}

// 뉴스레터 HTML 생성 함수
async function generateNewsletterHTML(newsCategories) {
  const categoriesWithNews = newsCategories.filter(category => 
    category.articles && category.articles.length > 0
  );

  if (categoriesWithNews.length === 0) {
    return null;
  }

  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">의료기기 뉴스레터</h1>
      <p style="color: #666; text-align: center;">최근 24시간 동안의 주요 의료기기 뉴스입니다.</p>
      
      <!-- 광고 배너 -->
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://koreamedinfo.com/ad-landing" target="_blank">
          <img src="https://www.koreamedinfo.com/images/ads/banner.jpg" alt="광고 배너" style="max-width: 100%; height: auto; border: none;" />
        </a>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="https://koreamedinfo.com/industry-news" 
           style="display: inline-block; 
                  background-color: #4F46E5; 
                  color: white; 
                  text-decoration: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  font-size: 14px;">
          ✉️ 뉴스레터 구독 신청하기
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 10px;">
          의료기기 업계 뉴스를 매일 아침 이메일로 받아보세요.<br>
          이 뉴스레터가 유용하다고 생각하시면 동료분들에게도 구독을 추천해주세요!
        </p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  `;

  for (const categoryNews of categoriesWithNews) {
    htmlContent += `
      <div style="margin: 20px 0;">
        <h2 style="color: #2c5282; border-bottom: 2px solid #2c5282; padding-bottom: 5px;">
          ${categoryNews.category} (${categoryNews.articles.length}건)
        </h2>
        <ul style="list-style-type: none; padding: 0;">
    `;

    for (const article of categoryNews.articles) {
      const cleanTitle = cleanText(article.title);
      const cleanDescription = cleanText(article.description);

      htmlContent += `
        <li style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; border: 1px solid #e2e8f0;">
          <a href="${article.link}" 
             style="color: #2c5282; 
                    text-decoration: none; 
                    font-weight: bold;
                    font-size: 16px;
                    display: block;
                    margin-bottom: 8px;">
            ${cleanTitle}
          </a>
          <p style="color: #4a5568; 
                    margin: 8px 0; 
                    font-size: 14px;
                    line-height: 1.5;">
            ${cleanDescription}
          </p>
          <div style="display: flex; 
                      justify-content: space-between; 
                      align-items: center;
                      margin-top: 10px;
                      font-size: 12px;
                      color: #718096;">
            <span>${new Date(article.pubDate).toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
            <span style="background: #EDF2F7;
                       padding: 2px 8px;
                       border-radius: 12px;
                       font-size: 11px;">
              ${article.keyword}
            </span>
          </div>
        </li>
      `;
    }

    htmlContent += `
        </ul>
      </div>
    `;
  }

  htmlContent += `
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa;">
        <p style="color: #666;">
          본 뉴스레터는 자동으로 생성되었습니다.<br>
          구독 해지를 원하시면 관리자에게 문의해주세요.
        </p>
        <div style="margin-top: 20px;">
          <a href="https://koreamedinfo.com" 
             style="color: #4F46E5; 
                    text-decoration: none; 
                    font-size: 14px;">
            코리아메드인포 방문하기
          </a>
          <span style="color: #666; margin: 0 10px;">|</span>
          <a href="https://koreamedinfo.com/industry-news" 
             style="color: #4F46E5; 
                    text-decoration: none; 
                    font-size: 14px;">
            뉴스레터 구독하기
          </a>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 15px;">
          💡 이 뉴스레터를 받고 싶은 분이 계시다면<br>
          위의 '뉴스레터 구독하기' 링크를 공유해주세요!
        </p>
      </div>
    </div>
  `;

  return htmlContent;
}

// 뉴스레터 발송 함수
async function sendNewsletterToAllSubscribers(newsCategories) {
  try {
    const subscribers = await prisma.newsSubscriber.findMany();
    console.log('구독자 수:', subscribers.length);

    if (subscribers.length === 0) {
      console.log('구독자가 없습니다.');
      return { success: false, message: '구독자가 없습니다.' };
    }

    const htmlContent = await generateNewsletterHTML(newsCategories);
    if (!htmlContent) {
      console.log('최근 24시간 동안의 새로운 뉴스가 없습니다.');
      return { success: false, message: '최근 24시간 동안의 새로운 뉴스가 없습니다.' };
    }

    console.log('뉴스레터 HTML 생성 완료');

    // 이메일을 배치로 나누어 발송
    const { successCount, failCount, failedEmails } = await sendEmailsInBatches(subscribers, htmlContent);

    const resultMessage = `총 ${subscribers.length}명 중 ${successCount}명 발송 성공, ${failCount}명 실패`;
    console.log(resultMessage);
    
    if (failedEmails.length > 0) {
      console.log('실패한 이메일 목록:', failedEmails);
    }

    return { 
      success: true, 
      message: resultMessage,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined
    };
  } catch (error) {
    console.error('뉴스레터 발송 중 오류 발생:', error);
    throw error;
  }
}

// 메인 함수
async function main() {
  try {
    console.log('뉴스 수집 시작...');
    const newsCategories = await getAllNewsArticles();
    console.log('수집된 뉴스 카테고리:', newsCategories.map(c => ({ 
      category: c.category, 
      articleCount: c.articles.length 
    })));
    
    if (!newsCategories || newsCategories.length === 0) {
      console.log('수집된 뉴스가 없습니다.');
      return;
    }

    const result = await sendNewsletterToAllSubscribers(newsCategories);
    console.log('최종 결과:', result);
  } catch (error) {
    console.error('뉴스레터 처리 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
main();