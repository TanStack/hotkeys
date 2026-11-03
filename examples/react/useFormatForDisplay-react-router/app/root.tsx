import { Links, Meta, Outlet, Scripts } from 'react-router'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'
import stylesUrl from './styles.css?url'
import type { ReactNode } from 'react'
import type { Route } from './+types/root'

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
]

// React Router sends loader data to the browser with the page
export function loader({ request }: Route.LoaderArgs) {
  return {
    platform: detectPlatform(request.headers.get('user-agent')),
  }
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <HotkeysProvider defaultOptions={{ platform: loaderData.platform }}>
      <Outlet />
    </HotkeysProvider>
  )
}
