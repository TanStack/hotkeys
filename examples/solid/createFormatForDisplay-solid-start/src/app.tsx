import { Suspense } from 'solid-js'
import { getRequestEvent } from 'solid-js/web'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { HotkeysProvider, detectPlatform } from '@tanstack/solid-hotkeys'
import './styles.css'

export default function App() {
  // The request's User-Agent on the server, undefined in the browser, where
  // detectPlatform reads the browser's navigator instead
  const userAgent = getRequestEvent()?.request.headers.get('user-agent')

  return (
    <HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
      <Router root={(props) => <Suspense>{props.children}</Suspense>}>
        <FileRoutes />
      </Router>
    </HotkeysProvider>
  )
}
