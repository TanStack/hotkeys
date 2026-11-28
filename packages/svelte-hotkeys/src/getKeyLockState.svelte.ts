import { getKeyStateTracker } from '@tanstack/hotkeys'
import { createStoreSubscriber } from './internal.svelte.js'
import type { LockKey } from '@tanstack/hotkeys'

export interface SvelteKeyLockState {
  readonly value: boolean | null
}

class KeyLockState implements SvelteKeyLockState {
  #tracker = getKeyStateTracker()
  #key: LockKey
  #subscribe = createStoreSubscriber(this.#tracker.store)

  constructor(key: LockKey) {
    this.#key = key
  }

  get value(): boolean | null {
    this.#subscribe()
    return this.#tracker.store.state.locks[this.#key]
  }
}

/**
 * Svelte function that returns reactive access to whether a lock key, such as
 * Caps Lock, is on.
 *
 * Lock keys toggle instead of being held, so this reads the lock state that
 * the browser reports on key and mouse events. Its `value` is `null` until the
 * user presses a key, clicks, or moves the mouse, after the window loses
 * focus or the page is hidden, and always for Num Lock and Scroll Lock on macOS and iOS.
 *
 * @param key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'`
 * @returns Object with a reactive `value` property: `true` when the lock is
 * on, `false` when it is off, or `null`
 *
 * @example
 * ```svelte
 * <script>
 *   import { getKeyLockState } from '@tanstack/svelte-hotkeys'
 *
 *   const capsLock = getKeyLockState('CapsLock')
 * </script>
 *
 * <label>
 *   Password
 *   <input type="password" />
 *   {#if capsLock.value}
 *     <span role="status">Caps Lock is on</span>
 *   {/if}
 * </label>
 * ```
 */
export function getKeyLockState(key: LockKey): SvelteKeyLockState {
  return new KeyLockState(key)
}
