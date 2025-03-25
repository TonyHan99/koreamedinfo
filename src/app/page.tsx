import Image from "next/image";
import { motion } from 'framer-motion'
import { FiArrowRight, FiTrendingUp, FiUsers, FiShield, FiTarget, FiAward, FiClock, FiGlobe, FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi'
import ContactForm from './components/ContactForm';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
            alt="Healthcare Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold mb-8">
                <span className="bg-blue-600 px-4 py-[2px] inline-block mb-4">KoreaMedInfo</span><br />
                <span className="text-[70%] mt-4 inline-block">의료기기 GTM 컨설팅</span>
              </h1>
              <p className="text-xl mb-10 text-gray-100">
                당신의 비즈니스를 다음 단계로 이끌어주는 최고의 파트너가 되어드립니다.
              </p>
              <div className="flex justify-center">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  시작하기 <FiArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">주요 서비스</h2>
            <p className="text-xl text-gray-600">고객의 비즈니스 성장을 위한 맞춤형 솔루션을 제공합니다.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 비즈니스 성장 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">비즈니스 성장</h3>
              <p className="text-gray-600">Asia시장 내 전략적 성장 솔루션을 제공합니다.</p>
            </div>

            {/* 고객 관리 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">유통 채널</h3>
              <p className="text-gray-600">유통 채널 구축 및 관리서비스를 제공합니다.</p>
            </div>

            {/* 보안 솔루션 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">RA라이센스 보호</h3>
              <p className="text-gray-600">해당 국가 제품허가권에 대한 권리를 보호합니다.</p>
            </div>

            {/* 전략 컨설팅 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">전략 컨설팅</h3>
              <p className="text-gray-600">전문가의 통찰력 있는 제품 마케팅 전략을 제시합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                alt="Our Team"
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/60 rounded-lg" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-white">회사 소개</h2>
              <p className="text-lg text-white mb-8 leading-relaxed">
                코리아메드인포(KMI)는 의료기기 유통 혁신을 선도하는 기업입니다. 
                고객의 해외 시장 진출을 위한 All-in-one 컨설팅 서비스를 제공합니다.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <FiAward className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">3+</h3>
                    <p className="text-gray-600">해외 런칭 제품</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <FiClock className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">20+년</h3>
                    <p className="text-gray-600">헬스케어 업계 경험</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">3+</h3>
                    <p className="text-gray-600">의료기기 제조 고객사</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <FiGlobe className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">10+</h3>
                    <p className="text-gray-600">아시아 시장 내 유통 대리점</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">문의하기</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              비즈니스 성장을 위한 첫 걸음을 시작하세요.
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
                  <h3 className="text-2xl font-semibold mb-3 text-white">컨설팅 가능 국가</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    대한민국, 싱가폴, 말레이시아<br />
                    태국, 베트남
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 p-4 rounded-full">
                  <FiPhone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">전화</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    010-4156-0120
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
