'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface SubscriptionFormData {
  name: string;
  phone: string;
  company: string;
  email: string;
}

export default function IndustryNewsPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubscriptionFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('구독 신청 중 오류가 발생했습니다.');
      }

      toast.success('뉴스레터 구독이 완료되었습니다!');
      reset();
    } catch (error) {
      toast.error('구독 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1f2e] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-white text-4xl font-bold mb-4">의료기기 업계 뉴스</h1>
        <p className="text-gray-400 mb-8">매일 아침 9시 엄선된 의료기기 업계 뉴스를 이메일로 받아보세요</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-gray-400 text-sm">이름</label>
            <input
              type="text"
              id="name"
              {...register('name', { required: '이름을 입력해주세요.' })}
              className="w-full mt-1 px-4 py-3 bg-[#2a2f3e] text-white border-0 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
              placeholder="홍길동"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="text-gray-400 text-sm">전화번호</label>
            <input
              type="tel"
              id="phone"
              {...register('phone', { 
                required: '전화번호를 입력해주세요.',
                pattern: {
                  value: /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/,
                  message: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'
                }
              })}
              className="w-full mt-1 px-4 py-3 bg-[#2a2f3e] text-white border-0 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
              placeholder="010-1234-5678"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="company" className="text-gray-400 text-sm">회사명</label>
            <input
              type="text"
              id="company"
              {...register('company', { required: '회사명을 입력해주세요.' })}
              className="w-full mt-1 px-4 py-3 bg-[#2a2f3e] text-white border-0 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
              placeholder="회사명을 입력해주세요"
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-500">{errors.company.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-gray-400 text-sm">이메일</label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: '이메일을 입력해주세요.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '올바른 이메일 형식이 아닙니다.'
                }
              })}
              className="w-full mt-1 px-4 py-3 bg-[#2a2f3e] text-white border-0 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-[#4263eb] text-white rounded-md hover:bg-[#3b5bdb] transition-colors duration-200 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '구독 신청중...' : '뉴스레터 구독하기'}
          </button>
        </form>
      </div>
    </main>
  );
} 