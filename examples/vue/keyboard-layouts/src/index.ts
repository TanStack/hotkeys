import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import { createApp, h } from 'vue'
import App from './App.vue'
import type { GermanKeys, UsKeys } from '@tanstack/vue-hotkeys'
import './index.css'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it. A .ts file is the place
// for it, because tsc doesn't read .vue files.
declare module '@tanstack/vue-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

createApp({
  render: () => h(HotkeysProvider, null, () => h(App)),
}).mount('#app')
