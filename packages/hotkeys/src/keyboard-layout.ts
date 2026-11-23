import { createStore } from './_store'
import type { Store } from './_store'

/**
 * A keyboard layout: each physical code mapped to the character it types
 * without modifiers, such as `KeyY` to `z` on a German layout.
 */
export type KeyboardLayoutMap = ReadonlyMap<string, string>

let store: Store<KeyboardLayoutMap | null> | undefined
let users = 0
/** Counts reads, so the newest one that succeeds wins. */
let started = 0
let stored = 0

/**
 * The store that holds the browser's keyboard layout once `loadKeyboardLayout`
 * has loaded it. Framework adapters read it to label physical bindings, so
 * `[KeyQ]` shows as `A` on a French AZERTY keyboard, and devtools show it.
 * Matching and recording never read it.
 *
 * The state is `null` until the layout loads, and stays `null` where the
 * browser has no layout API: Firefox, Safari, servers, and cross-origin frames
 * without the `keyboard-map` permission. Pass the state to `formatForDisplay`
 * as `layoutMap` when you format labels yourself.
 */
export function getKeyboardLayoutStore(): Store<KeyboardLayoutMap | null> {
  // Created on first use, so code that never asks for a layout doesn't bundle it.
  return (store ??= createStore<KeyboardLayoutMap | null>(null))
}

function refresh(): void {
  const read = ++started
  let pending: Promise<Iterable<[string, string]>>
  try {
    // Chromium only. Other browsers have no `navigator.keyboard`.
    pending = Promise.resolve(
      (
        navigator as unknown as {
          keyboard: { getLayoutMap: () => Promise<Iterable<[string, string]>> }
        }
      ).keyboard.getLayoutMap(),
    )
  } catch {
    return
  }
  pending
    .then((entries) => {
      // A newer read that already succeeded has the fresher layout.
      if (read < stored) return
      stored = read
      const next = new Map(entries)
      const layoutStore = getKeyboardLayoutStore()
      const last = layoutStore.state
      // An unchanged layout keeps its identity, so labels don't render again.
      if (
        last?.size === next.size &&
        [...next].every(([code, key]) => last.get(code) === key)
      ) {
        return
      }
      layoutStore.setState(() => next)
    })
    // The browser refused, as a permissions policy does in a cross-origin
    // frame, or reported something that isn't a layout.
    .catch(() => {})
}

/**
 * Loads the browser's keyboard layout into `getKeyboardLayoutStore()`, with
 * `navigator.keyboard.getLayoutMap()`. Only Chromium browsers have it, so the
 * layout stays `null` elsewhere and labels keep their conventional form.
 *
 * Framework adapters call this for you when a label or layout primitive
 * mounts. Call it yourself only without an adapter, in the browser, after
 * your page has rendered.
 *
 * The first caller reads the layout. Browsers send no event when the user
 * switches layouts, so while any caller is active, the layout is read again
 * each time the window regains focus.
 *
 * @returns A function that ends this caller's interest. When the last caller
 * stops, refreshing stops. The loaded layout stays in the store, so the next
 * label has it at once.
 *
 * @example
 * ```ts
 * const stop = loadKeyboardLayout()
 * getKeyboardLayoutStore().subscribe((layoutMap) => {
 *   label.textContent = formatForDisplay('[KeyW]', {
 *     layoutMap: layoutMap ?? undefined,
 *   })
 * })
 * ```
 */
export function loadKeyboardLayout(): () => void {
  // Some server DOM shims define a `window` that can't listen.
  if (
    typeof window === 'undefined' ||
    typeof window.addEventListener !== 'function'
  ) {
    return () => {}
  }
  if (!users++) {
    window.addEventListener('focus', refresh)
    refresh()
  }
  let active = true
  return () => {
    if (!active) return
    active = false
    if (!--users) window.removeEventListener('focus', refresh)
  }
}
