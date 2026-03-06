import { NextAuthProvider } from '@/components/Providers'
import { Header } from '@/components/Header'
import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

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
      <body className={`${geistMono.variable} antialiased`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}
