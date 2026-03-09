import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useStore } from '@tanstack/svelte-store'

/**
 * Svelte function that returns a reactive reference to currently held keyboard keys.
 *
 * This function uses the global KeyStateTracker and updates whenever keys are pressed
 * or released. Use `$derived(getHeldKeys().current)` for reactive access in templates.
 *
 * @returns Object with `current` property containing the array of held key names
 *
 * @example
 * ```svelte
 * <script>
 *   import { getHeldKeys } from '@tanstack/svelte-hotkeys'
 *
 *   const heldKeysRef = getHeldKeys()
 *   const heldKeys = $derived(heldKeysRef.current)
 * </script>
 * <div>
 *   Currently pressed: {heldKeys.join(' + ') || 'None'}
 * </div>
 * ```
 */
export function getHeldKeys(): { readonly current: Array<string> } {
  const tracker = getKeyStateTracker()
  return useStore(tracker.store, (state) => state.heldKeys)
}
