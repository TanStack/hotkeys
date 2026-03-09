import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useStore } from '@tanstack/svelte-store'

/**
 * Svelte function that returns a reactive reference to the map of currently held key names
 * to their physical `event.code` values.
 *
 * This is useful for debugging which physical key was pressed (e.g. distinguishing
 * left vs right Shift via "ShiftLeft" / "ShiftRight").
 * Use `$derived(getHeldKeyCodesMap().current)` for reactive access in templates.
 *
 * @returns Object with `current` property containing the held key codes map
 *
 * ```svelte
 * <script>
 *   import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'
 *   const heldKeyCodesMapRef = getHeldKeyCodesMap()
 *   const heldKeyCodesMap = $derived(heldKeyCodesMapRef.current)
 * </script>
 *
 * <div>
 *   {Object.entries(heldKeyCodesMap).map(([key, code]) => (
 *      <kbd key={key}>
 *          {key} <small>{code}</small>
 *      </kbd>
 *    ))}
 *  </div>
 * ```
 */
export function getHeldKeyCodesMap(): {
  readonly current: Record<string, string>
} {
  const tracker = getKeyStateTracker()
  return useStore(tracker.store, (state) => state.heldCodes)
}
