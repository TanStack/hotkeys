import { defineAppHotkeys } from '@tanstack/hotkeys'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import {
  useHeldKeyCodes,
  useHeldKeys,
  useHotkey,
  useHotkeyScopesState,
  useKeyHold,
} from '../src'
import type { Hotkey } from '@tanstack/hotkeys'

const appHotkeys = defineAppHotkeys({
  save: { hotkey: 'Mod+S' },
  home: { hotkey: ['G', 'H'] },
  palette: { hotkey: null },
})

// The type check of each function body is the test. The functions are never
// called, because composables need a component or an effect scope.
describe('composable types', () => {
  it('accepts a hotkey from a getter or a ref', () => {
    const check = (
      open: boolean,
      props: { hotkey: Hotkey | undefined },
      callback: () => void,
    ) => {
      useHotkey(() => 'Mod+S', callback)
      useHotkey(ref('Mod+S'), callback)
      useHotkey(() => 'Mod+S' as const, callback)
      useHotkey(ref<Hotkey>('Mod+S'), callback)
      useHotkey(() => (open ? 'Escape' : null), callback)
      useHotkey(() => props.hotkey, callback)
      useHotkey(() => ['G', 'G'] as const, callback, { timeout: 500 })
      // @ts-expect-error not a hotkey
      useHotkey(() => 'Mod+NotAKey', callback)
      // @ts-expect-error not a hotkey
      useHotkey(ref('Mod+NotAKey'), callback)
    }
    expect(check).toBeTypeOf('function')
  })

  it('types options and the callback context by the kind of hotkey', () => {
    const check = (callback: () => void) => {
      useHotkey('Mod+S', (_event, context) => context.parsedChord)
      useHotkey(['G', 'G'], callback, { timeout: 500 })
      // @ts-expect-error timeout applies only to sequences
      useHotkey('Mod+S', callback, { timeout: 500 })
      // @ts-expect-error requireReset applies only to chords
      useHotkey(['G', 'G'], callback, { requireReset: true })
    }
    expect(check).toBeTypeOf('function')
  })

  it('types the options of an app hotkey by its declared kind', () => {
    const check = (callback: () => void) => {
      useHotkey(appHotkeys.save, callback, { requireReset: true })
      useHotkey(appHotkeys.home, callback, { timeout: 500 })
      useHotkey(() => appHotkeys.save, callback)
      useHotkey(ref(appHotkeys.palette), callback)
      // @ts-expect-error timeout applies only to sequences
      useHotkey(appHotkeys.save, callback, { timeout: 500 })
      // @ts-expect-error requireReset applies only to chords
      useHotkey(appHotkeys.home, callback, { requireReset: true })
    }
    expect(check).toBeTypeOf('function')
  })

  it('returns read-only refs from the state composables', () => {
    const check = () => {
      // @ts-expect-error read-only
      useHeldKeys().value = []
      // @ts-expect-error read-only
      useHeldKeyCodes().value = {}
      // @ts-expect-error read-only
      useKeyHold('Shift').value = true
      // @ts-expect-error read-only
      useHotkeyScopesState().value = useHotkeyScopesState().value
    }
    expect(check).toBeTypeOf('function')
  })
})
