import { flushSync } from 'svelte'
import { createHotkey } from '../src/createHotkey.svelte'
import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
import { createHotkeys } from '../src/createHotkeys.svelte'
import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

/** Shared state in a `.svelte.ts` module, outside any component. */
export function createSharedHotkeys(onK: () => void, onJ: () => void) {
  let recorder!: SvelteHotkeyRecorder
  const destroy = $effect.root(() => {
    createHotkey('K', onK)
    createHotkeys([{ hotkey: 'J', callback: onJ }])
    recorder = createHotkeyRecorder({ onRecord: () => {} })
  })
  flushSync()
  return { destroy, recorder }
}
