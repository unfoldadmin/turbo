import { AuthProvider } from '@/providers/auth-provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { twMerge } from 'tailwind-merge'

import '@frontend/ui/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Turbo - Django & Next.js Bootstrap Template'
}

export default function RootLayout({
  children
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={twMerge(
          'bg-gray-50 text-sm text-gray-700 antialiased',
          inter.className
        )}
      >
        <AuthProvider>
          <div className="px-6">
            <div className="container mx-auto my-12 max-w-6xl">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
