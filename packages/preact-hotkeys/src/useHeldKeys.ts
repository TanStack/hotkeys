import { useSelector } from '@tanstack/preact-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'

/**
 * Preact hook that returns an array of currently held keyboard keys.
 *
 * This hook uses `useSelector` from `@tanstack/preact-store` to subscribe
 * to the global KeyStateTracker and updates whenever keys are pressed
 * or released.
 *
 * @returns Array of currently held key names
 *
 * @example
 * ```tsx
 * function KeyDisplay() {
 *   const heldKeys = useHeldKeys()
 *
 *   return (
 *     <div>
 *       Currently pressed: {heldKeys.join(' + ') || 'None'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useHeldKeys(): Array<string> {
  const tracker = getKeyStateTracker()
  return useSelector(tracker.store, (state) => state.heldKeys)
}
