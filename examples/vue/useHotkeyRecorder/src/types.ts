import type { Hotkey } from '@tanstack/vue-hotkeys'

export interface Shortcut {
  id: string
  name: string
  description: string
  hotkey: Hotkey | ''
}
