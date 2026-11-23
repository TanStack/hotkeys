import { createHotkeysScope, hotkeysPlugin } from '@tanstack/alpine-hotkeys'
import Alpine from 'alpinejs'
import type { GermanKeys, Hotkey, UsKeys } from '@tanstack/alpine-hotkeys'
import './index.css'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it. Hotkeys written in HTML
// attributes aren't type-checked, so this applies to TypeScript code only.
declare module '@tanstack/alpine-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

// Gives every hotkeys scope the app's Alpine instance.
Alpine.plugin(hotkeysPlugin)

interface Shortcut {
  hotkey: Hotkey
  name: string
}

// These type-check because German keys are registered above.
const germanShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+Ö', name: 'Toggle comment' },
  { hotkey: 'Mod+Shift+Ä', name: 'Add annotation' },
  { hotkey: 'ß', name: 'Toggle sidebar' },
  { hotkey: '§', name: 'Show sections' },
]

// A to Z, 0 to 9, named keys, and physical codes type-check under every
// registration, and fire on every layout.
const everyLayoutShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+K', name: 'Open command palette' },
  { hotkey: 'Alt+[Digit1]', name: 'Go to the first tab' },
  { hotkey: 'Escape', name: 'Clear' },
]

const usage = `import type { GermanKeys, UsKeys } from '@tanstack/alpine-hotkeys'

declare module '@tanstack/alpine-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

hotkeys.createHotkey('Mod+Ö', toggleComment) // OK
hotkeys.createHotkey('Mod+[', outdent) // OK, because UsKeys is listed
hotkeys.createHotkey('Mod+Ñ', x) // Type error: Spanish isn't registered`

class App {
  private hotkeysScope = createHotkeysScope()
  private formatForDisplay = this.hotkeysScope.createFormatForDisplay()

  germanShortcuts = germanShortcuts
  everyLayoutShortcuts = everyLayoutShortcuts
  usage = usage
  lastFired: Hotkey | null = null
  counts: Record<string, number> = Object.fromEntries(
    [...germanShortcuts, ...everyLayoutShortcuts].map((s) => [s.name, 0]),
  )

  init() {
    this.hotkeysScope.createHotkeys(
      [...germanShortcuts, ...everyLayoutShortcuts].map((shortcut) => ({
        hotkey: shortcut.hotkey,
        callback: () => {
          this.counts[shortcut.name] = (this.counts[shortcut.name] ?? 0) + 1
          this.lastFired = shortcut.hotkey
        },
      })),
    )
  }

  label(hotkey: Hotkey) {
    return this.formatForDisplay(hotkey)
  }

  destroy() {
    this.hotkeysScope.destroy()
  }
}

Alpine.data('app', () => new App())
Alpine.start()
