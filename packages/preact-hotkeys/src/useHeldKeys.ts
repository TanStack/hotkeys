import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useStoreState } from './useStoreState'

/**
 * Preact hook that returns an array of currently held keyboard keys.
 *
 * This hook uses `useStore` from `@tanstack/preact-store` to subscribe
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
  return useStoreState(tracker.store, (state) => state.heldKeys)
}
