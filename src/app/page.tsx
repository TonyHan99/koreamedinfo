import Image from 'next/image';
import ContactForm from './components/ContactForm';
import { FiMapPin, FiPhone, FiMail, FiAward, FiUsers, FiGlobe, FiTrendingUp, FiTarget, FiShield } from 'react-icons/fi';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
            alt="Medical background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-blue-600 px-4 py-[4px]">KoreaMedInfo</span><br />
            <span className="text-[70%] mt-4 inline-block">의료기기 GTM 컨설팅</span>
          </h1>
          <p className="text-xl mb-8">20년+ 헬스케어분야 전문성으로 귀사의 성공을 지원합니다</p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">전문성과 경험</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              아시아 지역 폭넓은 네트워크를 바탕으로 해외진출 및 유통망 구축 서비스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">20년+ 경력</h3>
              <p className="text-gray-600">
                의료기기 신사업, 유통채널 구축, 해외시장 진출 전문 경력을 보유하고 있습니다
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">전문 컨설팅</h3>
              <p className="text-gray-600">
                정형외과, 일반외과, 인터벤션, 영상의학과, 신경외과, 병의원 소모품 등 다양한 제품에 대한 폭 넓은 이해도도
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">글로벌 네트워크</h3>
              <p className="text-gray-600">
                아시아 5개국 내 유통 대리점 네트워크를 보유하고 있습니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">사업 실적</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              다양한 기업들과 의료기기 해외 진출 관련 성공적인 프로젝트를 수행했습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">고객사</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 국내 의료기기 제조사사</li>
                <li>• 글로벌 의료기기 기업</li>
                <li>• 혁신적인 의료기기 스타트업</li>
                <li>• 국내 제약사</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FiTarget className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">유통 채널</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 아시아 10개국 이상 진출</li>
                <li>• 현지 대형 유통사와 협력</li>
                <li>• 전문 의료기기 유통망</li>
                <li>• 병원 직접 납품 채널</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FiShield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">인증 실적</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 3+ 해외 런칭 제품 수</li>
                <li>• 10+ 국내외 네트워크 채널</li>
                <li>• 3+ 컨설팅 계약 건</li>
                <li>• 5+ 진료과별 전문성성</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">주요 서비스</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              의료기기 인허가부터 시장 진출까지 토탈 솔루션을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4">의료기기 인허가</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 의료기기 허가 및 신고</li>
                <li>• GMP 심사 대행</li>
                <li>• 임상시험 계획 수립</li>
                <li>• 기술문서 작성</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4">해외 인증</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• CE MDR 인증</li>
                <li>• FDA 510(k)</li>
                <li>• PMDA 등록</li>
                <li>• 해외 GMP 인증</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4">시장 진출 전략</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 시장 조사 및 분석</li>
                <li>• 진출 전략 수립</li>
                <li>• 파트너십 구축</li>
                <li>• 마케팅 전략 수립</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">문의하기</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              전문가와 상담하여 최적의 솔루션을 찾아보세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 p-4 rounded-full">
                  <FiMapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">주소</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    서울특로 서초구 07694
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 p-4 rounded-full">
                  <FiPhone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">연락처</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    +82 1041560120
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 p-4 rounded-full">
                  <FiMail className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">이메일</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    admin@koreamedinfo.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
