import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useSelector } from './_useSelector'

/**
 * SolidJS primitive that returns a signal of currently held keyboard keys.
 *
 * This primitive subscribes to the global KeyStateTracker and updates whenever keys are pressed
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
  return useSelector(tracker.store, (state) => state.heldKeys)
}
