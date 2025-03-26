import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KoreaMedInfo - 의료기기 해외진출 컨설팅',
  description: '의료기기 해외진출을 위한 인허가, 시장조사, 파트너십 컨설팅',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Navigation />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
