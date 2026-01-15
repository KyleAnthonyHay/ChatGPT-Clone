import type { Metadata } from 'next'
import { ChatProvider } from '@/context/ChatContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A ChatGPT clone built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  )
}
