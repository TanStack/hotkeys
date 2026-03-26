import { normalizeKeyName } from './constants'
import {
  hasNonModifierKey,
  isModifierKey,
  normalizeHotkeyFromEvent,
} from './parse'
import type { Hotkey } from './hotkey'

/**
 * Parses a keydown event into a single normalized hotkey chord, or null if
 * the event should be ignored (modifier-only or invalid).
 */
export function hotkeyChordFromKeydown(
  event: KeyboardEvent,
  platform: 'mac' | 'windows' | 'linux',
): Hotkey | null {
  if (isModifierKey(normalizeKeyName(event.key))) {
    return null
  }
  const finalHotkey = normalizeHotkeyFromEvent(event, platform)
  if (!hasNonModifierKey(finalHotkey, platform)) {
    return null
  }
  return finalHotkey
}
