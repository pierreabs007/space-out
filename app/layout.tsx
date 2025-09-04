import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas-neue'
})

export const metadata: Metadata = {
  title: 'Solar System Viewer',
  description: 'Interactive 3D solar system simulation built with Next.js and React Three Fiber',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="preload" 
          href="/fonts/Oups_Clean.otf" 
          as="font" 
          type="font/otf" 
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} ${bebasNeue.variable}`}>{children}</body>
    </html>
  )
}
