import { useSelector } from '@tanstack/preact-store'
import { getHotkeyManager } from '@tanstack/hotkeys'
import type { HotkeyScopesState } from '@tanstack/hotkeys'

/**
 * Preact hook that returns the hotkey manager's scope state: the active
 * scopes, the exclusive scope that owns the keyboard, and the scopes it
 * allows or suspends. Re-renders when scopes activate or release.
 *
 * @returns The current scope state
 *
 * @example
 * ```tsx
 * function KeyboardOwner() {
 *   const { exclusive } = useHotkeyScopesState()
 *
 *   return exclusive ? <p>Shortcuts belong to {exclusive}</p> : null
 * }
 * ```
 */
export function useHotkeyScopesState(): HotkeyScopesState {
  return useSelector(getHotkeyManager().scopes, (state) => state)
}
