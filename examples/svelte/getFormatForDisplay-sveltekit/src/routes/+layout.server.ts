import { detectPlatform } from '@tanstack/svelte-hotkeys'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ request }) => {
  const userAgent = request.headers.get('user-agent')
  // Prerendered pages have no request header, so the browser detects it
  return { platform: userAgent ? detectPlatform(userAgent) : undefined }
}
