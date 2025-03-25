'use client';

import { FormEvent, useRef } from 'react';

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      console.log('전송 시도:', data);  // 전송 데이터 로깅

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('응답 상태:', response.status);  // 응답 상태 로깅

      const result = await response.json();
      console.log('응답 데이터:', result);  // 응답 데이터 로깅

      if (response.ok) {
        alert(result.message || '메시지가 성공적으로 전송되었습니다.');
        formRef.current?.reset();
      } else {
        throw new Error(result.error || '메시지 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('에러 상세:', error);  // 에러 상세 로깅
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-base font-semibold text-gray-900 mb-2">
            이름
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-base font-semibold text-gray-900 mb-2">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-base font-semibold text-gray-900 mb-2">
            메시지
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          보내기
        </button>
      </form>
    </div>
  );
} 