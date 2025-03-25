import Image from 'next/image';
import ContactForm from './components/ContactForm';
import { FiMapPin, FiPhone } from 'react-icons/fi';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
          alt="Medical background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="relative z-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-blue-600 px-4 py-[4px]">KoreaMedInfo</span><br />
            <span className="text-[70%]">의료기기 GTM 컨설팅</span>
          </h1>
          <p className="text-xl mb-8">비즈니스 성장을 위한 첫 걸음을 시작하세요.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">문의하기</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">주소</h3>
                <p>서울특로 서초구 07694</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPhone className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">연락처</h3>
                <p>+82 1041560120</p>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
