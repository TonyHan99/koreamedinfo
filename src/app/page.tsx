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
            src="https://images.unsplash.com/photo-1583912267550-d6c2ac4b0154"
            alt="의료기기 배경"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        </div>
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div className="animate-fadeIn">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8">
              <span className="bg-blue-600 px-6 py-2 rounded-lg inline-block mb-4">KoreaMedInfo</span><br />
              <span className="text-[60%] mt-6 inline-block font-light">의료기기 GTM 컨설팅</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-12 text-gray-200">
              아시아 지역 폭넓은 네트워크를 바탕으로 해외진출 및 유통망 구축 서비스를 제공합니다
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
              20년 이상의 의료기기 인허가 경험과 폭넓은 네트워크를 바탕으로 최고의 서비스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-gray-800 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiAward className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">20년+ 경력</h3>
              <p className="text-gray-300 text-center">
                의료기기 인허가 분야에서 20년 이상의 전문 경력을 보유하고 있습니다
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">전문 컨설팅</h3>
              <p className="text-gray-300 text-center">
                식약처 의료기기 심사위원 경력의 전문가가 직접 컨설팅을 진행합니다
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiGlobe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white text-center">글로벌 네트워크</h3>
              <p className="text-gray-300 text-center">
                아시아 10개국 이상의 유통 대리점 네트워크를 보유하고 있습니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image
            src="https://images.unsplash.com/photo-1579154204601-01588f351e67"
            alt="의료기기 패턴"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">주요 서비스</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              의료기기 인허가부터 시장 진출까지 토탈 솔루션을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <Image
                src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8"
                alt="의료기기 인허가"
                width={400}
                height={300}
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-2xl font-bold mb-4">의료기기 인허가</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  의료기기 허가 및 신고
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  GMP 심사 대행
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  임상시험 계획 수립
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  기술문서 작성
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <Image
                src="https://images.unsplash.com/photo-1581093458791-9d42cc030552"
                alt="해외 인증"
                width={400}
                height={300}
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-2xl font-bold mb-4">해외 인증</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  CE MDR 인증
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  FDA 510(k)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  PMDA 등록
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  해외 GMP 인증
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <Image
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
                alt="시장 진출 전략"
                width={400}
                height={300}
                className="rounded-xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-2xl font-bold mb-4">시장 진출 전략</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  시장 조사 및 분석
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  진출 전략 수립
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  파트너십 구축
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  마케팅 전략 수립
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
