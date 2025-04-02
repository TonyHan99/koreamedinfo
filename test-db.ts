import prisma from '@/lib/prisma';

async function test() {
  try {
    const testSubscriber = await prisma.newsSubscriber.create({
      data: {
        name: "테스트",
        phone: "010-1234-5678",
        company: "테스트회사",
        email: "test@example.com"
      }
    })
    console.log('테스트 데이터 생성 성공:', testSubscriber)
  } catch (error) {
    console.error('에러:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test() 