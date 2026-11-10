import { createHotkey } from '@tanstack/svelte-hotkeys'
import { flushSync } from 'svelte'

/** Registers Mod+S through the adapter; call the result to dispose it. */
export function registerSave() {
  const destroy = $effect.root(() => {
    createHotkey('Mod+S', () => {}, {
      platform: 'windows',
      eventType: 'keyup',
      meta: { name: 'Save file' },
    })
  })
  flushSync()
  return destroy
}
