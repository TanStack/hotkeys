// Type check only. `pnpm test:types` runs `tsc -p tests/register-keys`, and
// Vitest does not run it.
import { defineAppHotkeys, formatForDisplay, getHotkeyManager } from '../../src'
import type {
  CustomHotkeys,
  FrenchKeys,
  GermanKeys,
  HotkeyChord,
  Key,
  LayoutKey,
  RawHotkeyChord,
} from '../../src'

declare module '../../src' {
  interface Register {
    keys: GermanKeys | FrenchKeys
  }
}

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
const layoutKeysAreRegistered: Equal<LayoutKey, GermanKeys | FrenchKeys> = true

const manager = getHotkeyManager()
const noop = () => {}

// Keys of the registered layouts
manager.register('Mod+Ö', noop)
manager.register('ß', noop)
manager.register('Mod+Shift+Ü', noop)
manager.register('Mod+É', noop)
manager.register('§', noop)
manager.register(['G', 'Ä'], noop)
manager.register({ key: 'Ö', mod: true }, noop)

// Always accepted: A-Z, 0-9, named keys and physical codes
manager.register('Mod+S', noop)
manager.register('Mod+1', noop)
manager.register('Escape', noop)
manager.register('Shift+ArrowUp', noop)
manager.register('Mod+[KeyS]', noop)
manager.register('Mod+[BracketLeft]', noop)

// US keys that neither layout types without AltGr are replaced
// @ts-expect-error `[` is not a German or French key
manager.register('Mod+[', noop)
// @ts-expect-error `` ` `` is not a German or French key
manager.register('`', noop)
// @ts-expect-error `Ñ` belongs to another layout
manager.register('Mod+Ñ', noop)
// @ts-expect-error letters are written uppercase, as A-Z are
manager.register('Mod+ö', noop)

const chord: HotkeyChord = 'Control+Alt+Ö'
const key: Key = 'Ä'
const raw: RawHotkeyChord = { key: 'Ü', shift: true }

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+Ö', meta: { name: 'Save' } },
  'go.home': { hotkey: ['G', 'Ü'], options: { timeout: 500 } },
})
const saved: CustomHotkeys<typeof appHotkeys> = { 'doc.save': 'Mod+Ä' }
// @ts-expect-error saved hotkeys follow the registered keys too
const unsaved: CustomHotkeys<typeof appHotkeys> = { 'doc.save': 'Mod+[' }

formatForDisplay('Mod+Ö')

export { appHotkeys, chord, key, layoutKeysAreRegistered, raw, saved, unsaved }
