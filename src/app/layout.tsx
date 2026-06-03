import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FinanceFlow - Personal Finance Management',
  description: 'Manage your finances with ease. Track income, expenses, budgets, and more.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/wallet-light.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/wallet-dark.svg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white">
        <SessionProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
