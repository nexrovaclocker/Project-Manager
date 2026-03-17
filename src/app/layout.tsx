import { NextAuthProvider } from '@/components/Providers'
import type { Metadata } from 'next'
import { Outfit, Geist_Mono } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
    <html lang="en">
      <body className={`${outfit.variable} ${geistMono.variable} font-sans antialiased text-[var(--color-text-primary)] bg-[var(--color-bg-dark)] min-h-screen relative`}>
        {/* Subtle Warm Ambient Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden overscroll-none -z-10">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[var(--color-brand-accent)]/5 blur-[120px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[var(--color-brand-accent)]/3 blur-[120px]"></div>
        </div>
        
        <div className="relative z-0 h-screen w-full flex flex-col">
          <NextAuthProvider>{children}</NextAuthProvider>
        </div>
      </body>
    </html>
  )
}
