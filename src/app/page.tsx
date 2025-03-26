import Image from 'next/image';
import ContactForm from './components/ContactForm';
import { FiMapPin, FiPhone, FiMail, FiAward, FiUsers, FiGlobe, FiTrendingUp, FiTarget, FiShield } from 'react-icons/fi';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[800px] flex items-center justify-center text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/OR.jpg"
            alt="의료기기 배경"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        </div>
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div className="animate-fadeIn">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8">
              <span className="bg-blue-600 px-6 py-2 rounded-lg inline-block mb-4">KoreaMedInfo</span><br />
              <span className="text-[60%] mt-6 inline-block font-light">의료기기 해외진출 컨설팅</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-12 text-gray-200">
              대한민국 의료기기 제조사의 성공적인 해외 시장 진출을 위한 토탈 솔루션을 제공합니다
            </p>
            <a href="#contact" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
              문의하기
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
      </section>

      {/* About Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">전문성과 경험</h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              정형외과, 신경외과, 심혈관내과, 일반외과 및 병원소모품에 대한 깊은 이해를 바탕으로 맞춤형 해외 진출 전략을 제시합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-gray-800 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiAward className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">의료분야 전문성</h3>
              <p className="text-gray-300 text-center">
                의료기기 제품 및 시술에 대한 깊은 이해를 바탕으로 전문적인 컨설팅을 제공합니다
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">현지 네트워크</h3>
              <p className="text-gray-300 text-center">
                해외 현지 유통사, 판매사와의 강력한 네트워크를 보유하고 있습니다
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiGlobe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">맞춤형 전략</h3>
              <p className="text-gray-300 text-center">
                시장조사부터 유통망 구축까지 고객 맞춤형 진출 전략을 수립합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/images/OR.jpg"
            alt="의료기기 패턴"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">주요 서비스</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              해외 시장 진출을 위한 전략 수립부터 현지 파트너십 구축까지 원스톱 솔루션을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <Image
                src="/images/market.jpeg"
                alt="시장 조사 및 분석"
                width={400}
                height={300}
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-2xl font-bold mb-4">시장 조사 및 분석</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  현지 시장 규모 분석
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  경쟁사 제품 조사
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  의료기관 수요 분석
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  가격 전략 수립
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <Image
                src="/images/network.png"
                alt="현지 파트너십"
                width={400}
                height={300}
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-2xl font-bold mb-4">현지 파트너십</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  유통사 발굴 및 계약
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  판매사 네트워크 구축
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  현지 의료진 네트워킹
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  파트너사 실사 지원
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <Image
                src="/images/strategy.jpg"
                alt="판매 전략"
                width={400}
                height={300}
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-2xl font-bold mb-4">판매 전략</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  제품 포지셔닝
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  마케팅 전략 수립
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  영업 전략 개발
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  성과 관리 체계 구축
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">문의하기</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              전문가와 상담하여 최적의 솔루션을 찾아보세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="flex items-start gap-8">
                <div className="bg-blue-600 p-5 rounded-2xl">
                  <FiMapPin className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">주소</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    서울특로 서초구 07694
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-8">
                <div className="bg-blue-600 p-5 rounded-2xl">
                  <FiPhone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">연락처</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    +82 1041560120
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-8">
                <div className="bg-blue-600 p-5 rounded-2xl">
                  <FiMail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">이메일</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    admin@koreamedinfo.com
                  </p>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
