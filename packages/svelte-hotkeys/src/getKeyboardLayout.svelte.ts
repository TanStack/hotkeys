import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import { createSubscriber } from 'svelte/reactivity'
import { getHotkeysContext } from './HotkeysCtx.js'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'

export interface SvelteKeyboardLayout {
  readonly layout: KeyboardLayoutMap | null
}

class KeyboardLayoutState implements SvelteKeyboardLayout {
  #context = getHotkeysContext()
  #store = getKeyboardLayoutStore()
  // Loads the layout while an effect or markup reads it. Calls are counted,
  // so every reader can load it.
  #subscribe = createSubscriber((update) => {
    const stop = loadKeyboardLayout()
    const { unsubscribe } = this.#store.subscribe(update)
    return () => {
      unsubscribe()
      stop()
    }
  })
  // Server HTML never has a layout, so a component that hydrates starts
  // without one, even when the layout has already loaded.
  #mounted = $state(false)

  constructor() {
    try {
      // Effects run after the component mounts, and never on a server.
      $effect(() => {
        this.#mounted = true
      })
      // Loads the layout even when nothing else reads it reactively.
      $effect(() => {
        void this.layout
      })
    } catch {
      // Outside a component there is no hydration to wait for.
      this.#mounted = true
    }
  }

  get layout(): KeyboardLayoutMap | null {
    if (!this.#mounted) return null
    if (this.#context?.defaultOptions.keyboardLayout === false) return null
    this.#subscribe()
    return this.#store.state
  }
}

/**
 * Svelte function that returns reactive access to the browser's keyboard
 * layout. `layout` is `null` until the layout loads and in browsers that
 * don't report one. The layout maps each physical code to the character it
 * types, such as `KeyQ` to `a` on a French AZERTY keyboard. Only Chromium
 * browsers report one.
 *
 * The layout loads after the first component that uses this function mounts,
 * so server-rendered output hydrates unchanged. `getFormatForDisplay` uses
 * this function, so you only need it for labels you draw yourself.
 *
 * To never ask the browser for the layout, set `keyboardLayout: false` in
 * `HotkeysProvider`'s `defaultOptions`. `layout` then stays `null`.
 *
 * @returns Object with a reactive `layout` property
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { getKeyboardLayout } from '@tanstack/svelte-hotkeys'
 *
 *   const keyboard = getKeyboardLayout()
 *   const label = (code: string) =>
 *     (keyboard.layout?.get(code) ?? code).toUpperCase()
 * </script>
 *
 * <kbd>{label('KeyW')}</kbd>
 * ```
 */
export function getKeyboardLayout(): SvelteKeyboardLayout {
  return new KeyboardLayoutState()
}
