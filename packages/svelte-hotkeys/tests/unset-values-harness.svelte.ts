import { flushSync } from 'svelte'
import { createHotkey } from '../src/createHotkey.svelte'
import { createHotkeys } from '../src/createHotkeys.svelte'
import { getHotkeyHint } from '../src/getHotkeyHint.svelte'
import type { Hotkey } from '@tanstack/hotkeys'
import type { SvelteHotkeyHint } from '../src/getHotkeyHint.svelte'

/** A hotkey in `$state` that tests can set to a value, undefined, or null. */
export function createOptionalHotkey(onRun: () => void) {
  let shortcut = $state<Hotkey | null | undefined>('K')
  let hint!: SvelteHotkeyHint
  const destroy = $effect.root(() => {
    createHotkey(() => shortcut, onRun)
    hint = getHotkeyHint(() => shortcut)
  })
  flushSync()
  return {
    destroy,
    hint,
    set(value: Hotkey | null | undefined) {
      shortcut = value
      flushSync()
    },
  }
}

/** Registers a list in which one definition has no hotkey. */
export function createListWithNullish(shortcuts: Array<Hotkey | undefined>) {
  const destroy = $effect.root(() => {
    createHotkeys(shortcuts.map((hotkey) => ({ hotkey, callback: () => {} })))
  })
  flushSync()
  return destroy
}
