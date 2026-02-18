import { createMemo } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { HeldKey } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns whether a specific key is currently being held.
 *
 * This primitive uses `useStore` from `@tanstack/solid-store` to subscribe
 * to the global KeyStateTracker and uses a selector to determine if the
 * specified key is held.
 *
 * @param key - The key to check (e.g., 'Shift', 'Control', 'A') - can be an accessor function
 * @returns Signal accessor that returns true if the key is currently held down
 *
 * @example
 * ```tsx
 * function ShiftIndicator() {
 *   const isShiftHeld = createKeyHold('Shift')
 *
 *   return (
 *     <div style={{ opacity: isShiftHeld() ? 1 : 0.5 }}>
 *       {isShiftHeld() ? 'Shift is pressed!' : 'Press Shift'}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * function ModifierIndicators() {
 *   const ctrl = createKeyHold('Control')
 *   const shift = createKeyHold('Shift')
 *   const alt = createKeyHold('Alt')
 *
 *   return (
 *     <div>
 *       <span style={{ opacity: ctrl() ? 1 : 0.3 }}>Ctrl</span>
 *       <span style={{ opacity: shift() ? 1 : 0.3 }}>Shift</span>
 *       <span style={{ opacity: alt() ? 1 : 0.3 }}>Alt</span>
 *     </div>
 *   )
 * }
 * ```
 */
export function createKeyHold(key: HeldKey | (() => HeldKey)): () => boolean {
  const tracker = getKeyStateTracker()
  const heldKeysSelector = useStore(tracker.store, (state) => state.heldKeys)

  return createMemo(() => {
    const resolvedKey = typeof key === 'function' ? key() : key
    const normalizedKey = resolvedKey.toLowerCase()
    return heldKeysSelector().some(
      (heldKey) => heldKey.toLowerCase() === normalizedKey,
    )
  })
}
