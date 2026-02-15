import { createEffect, createSignal, onCleanup } from 'solid-js'
import { getKeyStateTracker } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns a signal of a map from currently held key names to their physical `event.code` values.
 *
 * This is useful for debugging which physical key was pressed (e.g. distinguishing
 * left vs right Shift via "ShiftLeft" / "ShiftRight").
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
  const [heldCodes, setHeldCodes] = createSignal<Record<string, string>>({})

  createEffect(() => {
    // Subscribe to store changes
    const unsubscribe = tracker.store.subscribe(() => {
      setHeldCodes({ ...tracker.store.state.heldCodes })
    })

    // Initialize with current state
    setHeldCodes({ ...tracker.store.state.heldCodes })

    onCleanup(unsubscribe)
  })

  return heldCodes
}
