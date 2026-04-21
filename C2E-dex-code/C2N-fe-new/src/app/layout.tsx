import type { Metadata } from 'next'

import './globals.css'

import AppShell from './AppShell'

export const metadata: Metadata = {
  title: 'C2N',
  description:
    'C2N is the first exclusive launchpad for decentralized fundraising in Boba ecosystem, offering the hottest and innovative projects in a fair, secure, and efficient way.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0',
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
