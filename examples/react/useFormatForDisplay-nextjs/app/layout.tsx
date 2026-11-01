import { headers } from 'next/headers'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../src/styles.css'

export const metadata: Metadata = {
  title: 'Shortcut cheat sheet',
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // Reading the request headers renders the layout on each request
  const userAgent = (await headers()).get('user-agent')

  return (
    <html lang="en">
      <body>
        {/* A client component: Next sends the platform to the browser with the page */}
        <HotkeysProvider
          defaultOptions={{ platform: detectPlatform(userAgent) }}
        >
          {children}
        </HotkeysProvider>
      </body>
    </html>
  )
}
