/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'
import stylesUrl from '../styles.css?url'
import type { ReactNode } from 'react'

// The request's User-Agent on the server, the browser's navigator in the browser
const getPlatform = createIsomorphicFn()
  .server(() => detectPlatform(getRequestHeader('user-agent')))
  .client(() => detectPlatform())

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Shortcut cheat sheet' },
    ],
    links: [{ rel: 'stylesheet', href: stylesUrl }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  return (
    <HotkeysProvider defaultOptions={{ platform: getPlatform() }}>
      <Outlet />
    </HotkeysProvider>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
