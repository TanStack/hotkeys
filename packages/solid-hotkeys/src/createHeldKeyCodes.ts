import { useStore } from '@tanstack/solid-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns a signal of a map from currently held key names to their physical `event.code` values.
 *
 * This is useful for debugging which physical key was pressed (e.g. distinguishing
 * left vs right Shift via "ShiftLeft" / "ShiftRight").
 *
 * This primitive uses `useStore` from `@tanstack/solid-store` to subscribe
 * to the global KeyStateTracker.
 *
 * @returns Signal accessor for record mapping normalized key names to their `event.code` values
 *
 * @example
 * ```tsx
 * function KeyDebugDisplay() {
 *   const heldKeys = createHeldKeys()
 *   const heldCodes = createHeldKeyCodes()
 *
 *   return (
 *     <div>
 *       <For each={heldKeys()}>
 *         {(key) => (
 *           <kbd>
 *             {key} <small>{heldCodes()[key]}</small>
 *           </kbd>
 *         )}
 *       </For>
 *     </div>
 *   )
 * }
 * ```
 */
export function createHeldKeyCodes(): () => Record<string, string> {
  const tracker = getKeyStateTracker()
  return useStore(tracker.store, (state) => state.heldCodes)
}
