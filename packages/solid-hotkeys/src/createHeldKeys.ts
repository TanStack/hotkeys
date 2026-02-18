import { useStore } from '@tanstack/solid-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns a signal of currently held keyboard keys.
 *
 * This primitive uses `useStore` from `@tanstack/solid-store` to subscribe
 * to the global KeyStateTracker and updates whenever keys are pressed
 * or released.
 *
 * @returns Signal accessor for array of currently held key names
 *
 * @example
 * ```tsx
 * function KeyDisplay() {
 *   const heldKeys = createHeldKeys()
 *
 *   return (
 *     <div>
 *       Currently pressed: {heldKeys().join(' + ') || 'None'}
 *     </div>
 *   )
 * }
 * ```
 */
export function createHeldKeys(): () => Array<string> {
  const tracker = getKeyStateTracker()
  return useStore(tracker.store, (state) => state.heldKeys)
}
