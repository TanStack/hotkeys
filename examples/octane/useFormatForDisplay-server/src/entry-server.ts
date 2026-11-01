import { renderToString } from 'octane/server'
import { detectPlatform } from '@tanstack/octane-hotkeys'
import { App } from './App.tsrx'

/** Renders the page for a request's `User-Agent` header. */
export function render(userAgent: string | undefined) {
  return renderToString(App, { platform: detectPlatform(userAgent) }) // { html, css }
}
