import prisma from '@/lib/prisma';

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('Supabase 데이터베이스 연결 성공!')
    
    // 간단한 쿼리 테스트
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('쿼리 테스트 성공:', result)
    
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection() 