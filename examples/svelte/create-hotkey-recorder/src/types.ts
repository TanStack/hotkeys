import type { Hotkey } from '@tanstack/svelte-hotkeys'

export interface Shortcut {
  id: string
  name: string
  description: string
  hotkey: Hotkey | ''
}
