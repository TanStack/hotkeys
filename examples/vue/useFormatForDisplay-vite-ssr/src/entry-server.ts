import { detectPlatform } from '@tanstack/vue-hotkeys'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'

/** Renders the app for the request's User-Agent header. */
export function render(userAgent: string | undefined) {
  return renderToString(createApp(detectPlatform(userAgent)))
}
