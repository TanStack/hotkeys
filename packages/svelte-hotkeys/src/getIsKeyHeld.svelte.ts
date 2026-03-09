import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useStore } from '@tanstack/svelte-store'
import type { HeldKey } from '@tanstack/hotkeys'

/**
 * Svelte function that returns a reactive reference to whether a specific key is currently being held.
 *
 * This function uses the global KeyStateTracker and updates whenever keys are pressed
 * or released. Use `$derived(getIsKeyHeld('Shift').current)` for reactive access in templates.
 *
 * @param key - The key to check (e.g., 'Shift', 'Control', 'A')
 * @returns Object with `current` property - true if the key is currently held down
 *
 * @example
 * ```svelte
 * <script>
 *   import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'
 *
 *   const isShiftHeldRef = getIsKeyHeld('Shift')
 *   const isShiftHeld = $derived(isShiftHeldRef.current)
 * </script>
 *
 * <div>
 *   {isShiftHeld ? 'Shift is pressed!' : 'Press Shift'}
 * </div>
 * ```
 *
 * @example
 * ```svelte
 * <script>
 *   import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'
 *
 *   const isCtrlHeld = $derived(getIsKeyHeld('Control').current)
 *   const isShiftHeld = $derived(getIsKeyHeld('Shift').current)
 *   const isAltHeld = $derived(getIsKeyHeld('Alt').current)
 * </script>
 *
 * <div>
 *   <span style={{ opacity: isCtrlHeld ? 1 : 0.3 }}>Ctrl</span>
 *   <span style={{ opacity: isShiftHeld ? 1 : 0.3 }}>Shift</span>
 *   <span style={{ opacity: isAltHeld ? 1 : 0.3 }}>Alt</span>
 * </div>
 * ```
 */

export function getIsKeyHeld(key: HeldKey): { readonly current: boolean } {
  const tracker = getKeyStateTracker()
  const normalizedKey = key.toLowerCase()

  return useStore(tracker.store, (state) =>
    state.heldKeys.some((heldKey) => heldKey.toLowerCase() === normalizedKey),
  )
}
