import { createSSRApp } from 'vue'
import App from './App.vue'
import type { HotkeyPlatform } from '@tanstack/vue-hotkeys'

export function createApp(platform: HotkeyPlatform) {
  return createSSRApp(App, { platform })
}
