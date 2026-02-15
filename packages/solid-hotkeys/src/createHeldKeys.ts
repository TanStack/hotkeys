import { createEffect, createSignal, onCleanup } from 'solid-js'
import { getKeyStateTracker } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns a signal of currently held keyboard keys.
 *
 * This primitive subscribes to the global KeyStateTracker and updates
 * whenever keys are pressed or released.
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
  const [heldKeys, setHeldKeys] = createSignal<Array<string>>([])

  createEffect(() => {
    // Subscribe to store changes
    const unsubscribe = tracker.store.subscribe(() => {
      setHeldKeys([...tracker.store.state.heldKeys])
    })

    // Initialize with current state
    setHeldKeys([...tracker.store.state.heldKeys])

    onCleanup(unsubscribe)
  })

  return heldKeys
}
