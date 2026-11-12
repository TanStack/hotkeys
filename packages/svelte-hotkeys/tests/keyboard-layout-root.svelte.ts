import { flushSync } from 'svelte'
import { getKeyboardLayout } from '../src/getKeyboardLayout.svelte'
import type { SvelteKeyboardLayout } from '../src/getKeyboardLayout.svelte'

/** Creates the layout in a `.svelte.ts` module, outside any component. */
export function createSharedKeyboardLayout() {
  let keyboard!: SvelteKeyboardLayout
  const destroy = $effect.root(() => {
    keyboard = getKeyboardLayout()
  })
  flushSync()
  return { destroy, keyboard }
}
