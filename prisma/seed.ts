import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const subscribers = [
  { company: 'J&J', email: 'gkstmdgus99@naver.com', name: '한승현', phone: '' },
  { company: '존슨앤존슨', email: 'copen779@gmail.com', name: '김병선', phone: '' },
  { company: '한국애보트', email: 'Hyunjeong.kim@abbott.com', name: '김현정', phone: '' },
  { company: '메드트로닉', email: 'kate.hwang@medtronic.com', name: '황방실', phone: '' },
  { company: '한국테루모', email: 'ml-tkc-all@terumo.co.jp', name: '전직원', phone: '' },
  { company: '메드트로닉', email: 'jack.jung@medtronic.com', name: '정종원', phone: '' },
  { company: '상아', email: 'swh@sftc.co.kr', name: '석원현', phone: '' },
  { company: '메드트로닉', email: 'sang.soo.lee@medtronic.com', name: '이상수', phone: '' },
  { company: 'Artrivion', email: 'kerri.kim@artivion.com', name: '김은영', phone: '' },
  { company: '동국생명', email: 'pky@dkls.co.kr', name: '박근열', phone: '' },
  { company: '동국생명', email: 'pih@dkls.co.kr', name: '박인환', phone: '' },
  { company: '니혼고덴', email: 'jsjo@nkkorea.net', name: '조정식', phone: '' },
  { company: '니혼고덴', email: 'sjcho@nkkorea.net', name: '조성진', phone: '' },
  { company: '드레가', email: 'seonghoon.song@draeger.com', name: '송성훈', phone: '010-4156-0120' },
  { company: 'GS', email: 'kyn@gsmedi.com', name: '김용남', phone: '' },
  { company: '상아', email: 'sea3059@sftc.co.kr', name: '안해동', phone: '' },
  { company: '메디레이', email: 'medilei777@gmail.com', name: '이승준', phone: '' },
  { company: '에스와이', email: 'yjjung@symc.com', name: '정용준', phone: '' },
  { company: '마이크로벤션', email: 'suyong.lee@microvention.com', name: '이수용', phone: '' },
  { company: '메디웨일', email: 'kevin.choi@mediwhale.com', name: '최태근', phone: '' },
  { company: '로엔서지컬', email: 'leeyj@roensurgical.com', name: '이영진', phone: '' },
  { company: '미래컴퍼니', email: 'hklee@meerecompany.com', name: '이호근', phone: '' },
  { company: '메드트로닉', email: 'hyunsoo.kim@medtronic.com', name: '김현수', phone: '' },
  { company: 'GS', email: 'goodheart94@gmail.com', name: '이상선', phone: '' },
  { company: '다림티센', email: 'snpark@dalimtissen.com', name: '박시내', phone: '' },
  { company: '메드트로닉', email: 'hak.jun.kim@medtronic.com', name: '김학준', phone: '' },
  { company: '엠바이오닉', email: 'mbionic01@gmail.com', name: '김현태', phone: '' },
  { company: '하얀메디칼', email: 'hayan8878@hanmail.net', name: '진상희', phone: '' },
  { company: '한국스트라이커', email: 'jh.ji@stryker.com', name: '지정훈', phone: '' },
  { company: '동국', email: 'garuta77@naver.com', name: '김창현', phone: '' },
  { company: 'Medtronic', email: 'kate.hwang@medtronic.com', name: '황방실 / Kate Hwang', phone: '' },
  { company: '콘바텍코리아', email: 'ysmin2@hotmail.com', name: '윤성민', phone: '010-2627-2516' },
  { company: 'JBNA', email: 'jkim@jbn-associates.com', name: '김종배', phone: '1044173633' },
  { company: '바이트', email: 'dannis@vyte.io', name: '김현준', phone: '' },
  { company: 'KPMG', email: 'ychoe@kr.kpmg.com', name: '최유진', phone: '' },
  { company: '애보트메디컬', email: 'balbadac275@gmail.com', name: '김대희', phone: '010 4206 3203' },
  { company: '존슨앤드존슨메드테크코리아', email: 'zach.dkim@gmail.com', name: '김도현', phone: '1087832909' },
  { company: '루메니스코리아', email: 'soomi.noh@lumenis.com', name: '노수미', phone: '1089475075' },
  { company: 'Solventum', email: 'mkim5@solventum.com', name: '김미나', phone: '' },
  { company: '한독', email: 'HaNa.Park@handok.com', name: '박하나', phone: '' },
  { company: '메디웨일', email: 'nina.shin@mediwhale.com', name: '신나연', phone: '1028266725' },
  { company: 'Terumo', email: 'kota_yamamura@terumo.co.jp', name: 'Kota', phone: '' },
  { company: '메디웨일', email: 'michelle.oh@mediwhale.com', name: '오영주', phone: '1043881846' },
  { company: 'Medtronic', email: 'hana.kim@medtronic.com', name: '김하나', phone: '010-3025-9241' },
  { company: '서림통상', email: 'yclee@soelim.com', name: '이유찬', phone: '' },
  { company: '시지바이오', email: 'donghwan.lee@cgbio.co.kr', name: '이동환', phone: '1033678652' },
  { company: 'Johnson and Johnson MedTech', email: 'hyunjung427@gmail.com', name: '조현정', phone: '010-3367-3073' },
  { company: '메디웨일', email: 'jayden.nam@mediwhale.com', name: '남동진', phone: '1030288487' },
  { company: '동국생명과학', email: 'jhs@dkls.co.kr', name: '정희석', phone: '' },
  { company: '신동성 (신테스 정형외과대리점)', email: 'tjdpjj@hanmail.net', name: '김도연', phone: '1092635386' },
  { company: '메디웨일', email: 'g.young@mediwhale.com', name: '이근영', phone: '' },
  { company: '메디웨일', email: 'yuli.min@mediwhale.com', name: '민정임', phone: '' },
  { company: '메디웨일', email: 'jamie.oh@mediwhale.com', name: '오준호', phone: '' },
  { company: 'Mediwhale', email: 'justin.kim@mediwhale.com', name: '김수만', phone: '' },
  { company: '한길메디텍', email: 'ims73@hanmail.net', name: '임민식', phone: '1062499102' },
  { company: '장안메디칼', email: 'brooks9980@gmail.com', name: '강성민', phone: '010-3178-0910' },
  { company: '메디웨일', email: 'jinsoyeon333@gmail.com', name: '진소연', phone: '' },
  { company: '로엔서지컬', email: 'leesw@roensurgical.com', name: '이승욱', phone: '010-7289-7742' },
  { company: '휴온스메디텍', email: 'julee@huonsmeditech.com', name: '이종욱', phone: '010-2801-4851' },
  { company: '시지바이오', email: 'roro1321@cgbio.co.kr', name: '김명준', phone: '' },
  { company: '로엔서지컬', email: 'kimjh@roensurgical.com', name: '김준환', phone: '010-6311-9076' },
  { company: '지상', email: 'ericpark@jisanginc.com', name: '박현준', phone: '' }
]

async function main() {
  console.log('구독자 데이터 복원을 시작합니다...')
  
  // 기존 데이터 삭제
  await prisma.newsSubscriber.deleteMany({})
  
  // 새 데이터 입력
  for (const subscriber of subscribers) {
    try {
      await prisma.newsSubscriber.create({
        data: subscriber
      })
      console.log(`✅ 추가됨: ${subscriber.name} (${subscriber.email})`)
    } catch (error) {
      console.error(`❌ 오류 발생: ${subscriber.name} (${subscriber.email})`, error)
    }
  }
  
  const count = await prisma.newsSubscriber.count()
  console.log(`\n총 ${count}명의 구독자 데이터가 복원되었습니다.`)
}

main()
  .catch((e) => {
    console.error('오류가 발생했습니다:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 