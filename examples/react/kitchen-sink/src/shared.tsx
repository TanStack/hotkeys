import { createContext, useContext } from 'react'
import {
  formatForDisplay,
  useAppHotkeys,
  useHotkeyHint,
} from '@tanstack/react-hotkeys'
import type { AppHotkeyId, Hotkey } from '@tanstack/react-hotkeys'

export const ActivityContext = createContext<(message: string) => void>(
  () => {},
)

export function useActivity() {
  return useContext(ActivityContext)
}

/** Formats a chord or sequence, or reports that none is assigned. */
export function formatHotkey(hotkey: Hotkey | null): string {
  return hotkey
    ? formatForDisplay(hotkey, { sequenceSeparator: ' → ' })
    : 'Unassigned'
}

/**
 * Shows an app hotkey's current hotkey while its modifiers are held.
 * The provider resolves custom hotkeys, so hints stay correct after rebinding.
 */
export function Hint({
  id,
  enabled = true,
}: {
  id: AppHotkeyId
  enabled?: boolean
}) {
  const appHotkey = useAppHotkeys()[id]
  const visible = useHotkeyHint(appHotkey)
  return visible && enabled && appHotkey.hotkey ? (
    <kbd>{formatHotkey(appHotkey.hotkey)}</kbd>
  ) : null
}
