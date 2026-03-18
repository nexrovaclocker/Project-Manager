import { NextAuthProvider } from '@/components/Providers'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { AnimatePresence } from 'framer-motion'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Nexrova Project Manager',
  description: 'Operational Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} antialiased text-[var(--color-text-primary)] bg-[var(--color-bg-base)] min-h-screen relative`}>
        {/* Dark Ambient Background Glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden overscroll-none -z-10">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#f97316]/5 blur-[150px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#f97316]/3 blur-[150px]"></div>
        </div>
        
        <div className="relative z-0 min-h-screen w-full flex flex-col">
          <NextAuthProvider>
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </NextAuthProvider>
        </div>
      </body>
    </html>
  )
}
