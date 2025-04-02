async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  
  const formData = new FormData(event.currentTarget);
  const data = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    email: formData.get('email'),
  };

  try {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('구독 신청에 실패했습니다');
    }

    alert('뉴스레터 구독이 완료되었습니다!');
    // 폼 초기화 또는 다른 후속 작업
  } catch (error) {
    console.error('Error:', error);
    alert('구독 신청 중 오류가 발생했습니다');
  }
} 