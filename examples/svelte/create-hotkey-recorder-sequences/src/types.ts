import type { Hotkey } from '@tanstack/svelte-hotkeys'

export interface Shortcut {
  id: string
  name: string
  description: string
  /** A chord or a sequence; null when unassigned */
  hotkey: Hotkey | null
}
