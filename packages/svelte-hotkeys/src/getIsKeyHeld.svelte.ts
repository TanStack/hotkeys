import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useStore } from '@tanstack/svelte-store'
import type { HeldKey } from '@tanstack/hotkeys'

/**
 * Svelte function that returns whether a specific key is currently being held.
 *
 * This function uses the global KeyStateTracker and updates whenever keys are pressed
 * or released.
 *
 * @param key - The key to check (e.g., 'Shift', 'Control', 'A')
 * @returns True if the key is currently held down
 *
 * @example
 * ```svelte
 * <script>
 *   import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'
 *
 *   const isShiftHeld = getIsKeyHeld('Shift')
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
 *   const isCtrlHeld = getIsKeyHeld('Control')
 *   const isShiftHeld = getIsKeyHeld('Shift')
 *   const isAltHeld = getIsKeyHeld('Alt')
 * </script>
 *
 * <div>
 *   <span style={{ opacity: isCtrlHeld ? 1 : 0.3 }}>Ctrl</span>
 *   <span style={{ opacity: isShiftHeld ? 1 : 0.3 }}>Shift</span>
 *   <span style={{ opacity: isAltHeld ? 1 : 0.3 }}>Alt</span>
 * </div>
 * ```
 */

export function getIsKeyHeld(key: HeldKey): boolean {
  const tracker = getKeyStateTracker()
  const normalizedKey = key.toLowerCase()

  const isKeyHeld = useStore(tracker.store, (state) =>
    state.heldKeys.some((heldKey) => heldKey.toLowerCase() === normalizedKey),
  ).current

  return isKeyHeld
}
