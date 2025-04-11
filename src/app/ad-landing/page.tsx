"use client";

import { useState } from 'react';

export default function AdLanding() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    adDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/ad-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit application');
      
      setSubmitStatus('success');
      setFormData({ company: '', name: '', phone: '', email: '', adDetails: '' });
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ 
      display: 'flex', 
      flexDirection: 'row',
      minHeight: '100vh', 
      fontFamily: 'Helvetica, Arial, sans-serif', 
      backgroundColor: '#fff',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>

      <style jsx>{`
        @media (max-width: 768px) {
          .container {
            flex-direction: column;
            padding: 10px;
            background-color: #fff; /* PC에서 흰색 배경 */
          }
          .image-section {
            width: 100%;
            height: auto; /* 이미지 높이 자동 조정 */
            margin-bottom: 20px;
          }
          .form-section {
            width: 100%;
            padding: 15px;
          }
          h1 {
            font-size: 24px;
          }
          .product-info {
            padding: 12px;
          }
          form {
            padding: 12px;
          }
          input, textarea {
            font-size: 16px;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .container {
            padding: 15px;
            background-color: #fff; /* PC에서 흰색 배경 */
          }
          .image-section {
            height: 45vh;
          }
        }
      `}</style>

      <div className="image-section" style={{ 
        flex: 1, 
        backgroundImage: 'url(/images/ad-product/interblock.jpg)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '50vh',
        borderRadius: '8px',
        marginRight: '20px'
      }}>
        {/* 제품 이미지 */}
      </div>
      <div className="form-section" style={{ 
        flex: 1, 
        padding: '20px', 
        color: '#1d1d1f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '15px' }}>비급여 유착방지제 인터블락 유통 문의</h1>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>제품 특징</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
            히알루론산 기반의 비급여 척추유착방지제입니다.
          </p>
          <h2 style={{ fontSize: '18px', marginBottom: '8px', marginTop: '15px', fontWeight: 'bold' }}>용량</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
            1ml / 3ml / 5ml 
          </p>
          <h2 style={{ fontSize: '18px', marginBottom: '8px', marginTop: '15px', fontWeight: 'bold' }}>특장점</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
            히알루론산(HA)제조 특허기술인 MDM tech가 적용된 생처적합성이 뛰어난 유착방지제로서 높은 점탄성을 자랑합니다.
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="company" style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              회사명
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="회사명을 입력해주세요"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="name" style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              이름
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="홍길동"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="phone" style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              전화번호
            </label>
            <input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="010-0000-0000"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="example@email.com"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="adDetails" style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              유통을 희망하는 병원 및 기타 문의
            </label>
            <textarea
              id="adDetails"
              value={formData.adDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, adDetails: e.target.value }))}
              required
              rows={4}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="유통을 희망하는 병원명(지역)을 포함하여 세부 문의사항을 입력해주세요."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#0071e3', color: '#fff', fontSize: '14px', border: 'none', cursor: 'pointer' }}
          >
            {isSubmitting ? '전송 중...' : '신청하기'}
          </button>
          {submitStatus === 'success' && (
            <div style={{ color: 'green', fontSize: '12px', marginTop: '10px' }}>
              신청이 성공적으로 전송되었습니다.
            </div>
          )}
          {submitStatus === 'error' && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '10px' }}>
              신청 전송에 실패했습니다. 다시 시도해주세요.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
