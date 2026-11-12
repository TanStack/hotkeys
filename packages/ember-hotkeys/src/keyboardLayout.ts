import { trackedObject } from '@ember/reactive/collections'
import { schedule, scheduleOnce } from '@ember/runloop'
import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import { scopeDefaults } from './utils'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'
import type { EmberHotkeysScope } from './createHotkeysScope'

/** Whether a scope's defaults let labels follow the keyboard layout. */
export function layoutEnabled(scope: EmberHotkeysScope | undefined): boolean {
  return !scope || scopeDefaults.get(scope)!().keyboardLayout !== false
}

/**
 * Loads the layout and returns a function that ends the caller's interest.
 * FastBoot defines a `window` that has no events, so this checks `document`.
 */
export function startLayout(): () => void {
  return typeof document === 'undefined' ? () => {} : loadKeyboardLayout()
}

function readLayout(): void {
  // Stay interested until the run loop ends, so an owner that starts loading
  // in the same render doesn't read the layout a second time.
  schedule('destroy', startLayout())
}

/**
 * Reads the layout once after the current render, unless a caller with an
 * owner already keeps it loaded. Many requests in one render read it once.
 */
export function requestLayout(): void {
  scheduleOnce('afterRender', readLayout)
}

let changes: { version: number } | undefined

/**
 * Reads the layout store and tracks its changes. One subscription serves every
 * reader for as long as the store lives, so readers need no owner.
 */
export function trackedLayout(): KeyboardLayoutMap | null {
  const store = getKeyboardLayoutStore()
  if (!changes) {
    const state = (changes = trackedObject({ version: 0 }))
    store.subscribe(() => {
      state.version++
    })
  }
  void changes.version
  return store.state
}

/**
 * Wraps a tracked layout getter so it returns `null` until the current render
 * has finished. Server HTML never has a layout, so a rehydrating app must
 * first render without one, even when the layout has already loaded.
 */
export function untilRendered(
  read: () => KeyboardLayoutMap | null,
  onRendered?: () => void,
): () => KeyboardLayoutMap | null {
  let rendered = false
  const state = trackedObject({ version: 0 })
  schedule('afterRender', () => {
    rendered = true
    onRendered?.()
    // Readers render again only when a layout has already loaded.
    if (getKeyboardLayoutStore().state) state.version++
  })
  return () => {
    void state.version
    // Always read, so the first render tracks the store too.
    const layoutMap = read()
    return rendered ? layoutMap : null
  }
}
