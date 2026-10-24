import { useSelector } from '@tanstack/solid-store'
import { getHotkeyManager } from '@tanstack/hotkeys'
import type { HotkeyScopesState } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns a signal of the hotkey manager's scope state:
 * the active scopes, the exclusive scope that owns the keyboard, and the
 * scopes it allows or suspends. Updates when scopes activate or release.
 *
 * @returns Signal accessor for the current scope state
 *
 * @example
 * ```tsx
 * function KeyboardOwner() {
 *   const scopes = createHotkeyScopesState()
 *
 *   return (
 *     <Show when={scopes().exclusive}>
 *       {(exclusive) => <p>Shortcuts belong to {exclusive()}</p>}
 *     </Show>
 *   )
 * }
 * ```
 */
export function createHotkeyScopesState(): () => HotkeyScopesState {
  return useSelector(getHotkeyManager().scopes, (state) => state)
}
