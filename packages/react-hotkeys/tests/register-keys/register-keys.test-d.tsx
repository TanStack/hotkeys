// Type check only. `pnpm test:types` runs `tsc -p tests/register-keys`, and
// Vitest does not run it.
// Registers through the adapter package, as apps do.
import {
  defineAppHotkeys,
  formatForDisplay,
  useHotkey,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/react-hotkeys'
import type {
  CustomHotkeys,
  HotkeyChord,
  RussianKeys,
  UsKeys,
} from '@tanstack/react-hotkeys'

declare module '@tanstack/react-hotkeys' {
  interface Register {
    keys: UsKeys | RussianKeys
  }
}

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+Ж', meta: { name: 'Save' } },
  'go.home': { hotkey: ['G', 'Ф'], options: { timeout: 500 } },
})

export function RegisterKeys() {
  useHotkey('Mod+Ф', (_event, context) => {
    // The callback context still narrows from the literal
    const kind: 'chord' = context.kind
    void kind
  })
  useHotkey(['G', 'Й'], () => {}, { timeout: 300 })
  // @ts-expect-error timeout is a sequence option, still rejected on a chord
  useHotkey('Mod+№', () => {}, { timeout: 300 })
  // UsKeys is listed, so US punctuation stays
  useHotkey('Mod+[', () => {})
  useHotkeys([{ hotkey: 'Shift+Ё', callback: () => {} }])
  useHotkey(appHotkeys['doc.save'], () => {})
  // @ts-expect-error Ö belongs to a layout that isn't registered
  useHotkey('Mod+Ö', () => {})
  const recorder = useHotkeyRecorder({ onRecord: (hotkey) => void hotkey })
  void recorder
  const saved: CustomHotkeys<typeof appHotkeys> = { 'doc.save': 'Mod+Я' }
  const chord: HotkeyChord = 'Alt+Ю'
  void [saved, chord]
  return formatForDisplay('Mod+Ш')
}
