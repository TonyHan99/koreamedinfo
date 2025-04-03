const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const subscribers = [
  { company: 'J&J', email: 'gkstmdgus99@naver.com', name: '한승현', phone: '' },
  { company: '존슨앤존슨', email: 'copen779@gmail.com', name: '김병선', phone: '' },
  { company: '한국애보트', email: 'Hyunjeong.kim@abbott.com', name: '김현정', phone: '' },
  // ... 나머지 데이터는 동일
]

async function main() {
  console.log('구독자 데이터 복원을 시작합니다...')
  
  // 기존 데이터 삭제
  await prisma.newsSubscriber.deleteMany()
  
  // 새 데이터 입력
  await prisma.newsSubscriber.createMany({
    data: subscribers
  })
  
  const count = await prisma.newsSubscriber.count()
  console.log(`총 ${count}명의 구독자 데이터가 복원되었습니다.`)
}

main()
  .catch(e => {
    console.error('오류가 발생했습니다:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 