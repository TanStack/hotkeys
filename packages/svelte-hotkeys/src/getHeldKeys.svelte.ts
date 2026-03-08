import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useStore } from '@tanstack/svelte-store'

/**
 * Svelte function that returns an array of currently held keyboard keys.
 *
 * This function uses the global KeyStateTracker and updates whenever keys are pressed
 * or released.
 *
 * @returns Array of currently held key names
 *
 * @example
 * ```svelte
 * <script>
 *   import { getHeldKeys } from '@tanstack/svelte-hotkeys'
 *
 *   const heldKeys = getHeldKeys()
 * </script>
 * <div>
 *   Currently pressed: {getHeldKeys().join(' + ') || 'None'}
 * </div>
 * ```
 */
export function getHeldKeys(): Array<string> {
  const tracker = getKeyStateTracker()

  const heldKeys = useStore(tracker.store, (state) => state.heldKeys).current

  return heldKeys
}
