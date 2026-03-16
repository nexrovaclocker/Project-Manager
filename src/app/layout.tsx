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
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${geistMono.variable} font-sans antialiased text-[#FFFFFF] bg-[#030303]`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}
