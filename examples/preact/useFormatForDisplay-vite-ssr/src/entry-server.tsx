import { detectPlatform } from '@tanstack/preact-hotkeys'
import { renderToString } from 'preact-render-to-string'
import { App } from './App'

/** Renders the page for a request's `User-Agent` header. */
export function render(userAgent: string | undefined) {
  return renderToString(<App platform={detectPlatform(userAgent)} />)
}
