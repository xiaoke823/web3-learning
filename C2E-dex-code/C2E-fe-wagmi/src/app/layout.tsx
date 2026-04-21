import type { Metadata, Viewport } from 'next'

import './globals.css'

import AppShell from './AppShell'

export const metadata: Metadata = {
  title: 'C2N',
  description:
    'C2N is the first exclusive launchpad for decentralized fundraising in Boba ecosystem, offering the hottest and innovative projects in a fair, secure, and efficient way.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-US">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
