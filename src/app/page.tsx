import Image from 'next/image';
import ContactForm from './components/ContactForm';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

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
        <div className="relative z-20 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-blue-600 px-4 py-[4px]">KoreaMedInfo</span><br />
            <span className="text-[70%] mt-4 inline-block">의료기기 GTM 컨설팅</span>
          </h1>
          <p className="text-xl mb-8">비즈니스 성장을 위한 첫 걸음을 시작하세요.</p>
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
