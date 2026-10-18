import { normalizeKeyName } from './constants'
import { isCodeName, normalizeKeyboardEvent } from './_keyboard-event'
import { isModifierKey, normalizeHotkey, parseKeyboardEvent } from './parse'
import type {
  RecorderKeyMode,
  RecorderOptions,
  RecorderRejection,
} from './hotkey-recorder'
import type { HotkeyChord } from './hotkey.types'

/**
 * Converts a keydown to a replayable chord, preserving physical codes by default.
 * Returns null for composition, modifier-only input, or unusable physical input.
 * Key mode retains the produced character; neither mode guesses layout letters.
 */
export function hotkeyChordFromKeydown(
  event: KeyboardEvent,
  platform: 'mac' | 'windows' | 'linux',
  recordBy: RecorderKeyMode = 'code',
): HotkeyChord | null {
  const normalized = normalizeKeyboardEvent(event, platform)
  if (
    normalized.isComposing ||
    isModifierKey(normalizeKeyName(event.key)) ||
    event.key === 'AltGraph'
  )
    return null
  if (recordBy === 'code' && (!hasUsableCode(event) || normalized.altGraph))
    return null
  const parsed = parseKeyboardEvent(event, platform)
  if (recordBy === 'code') {
    // Remove logical identity rather than placing a physical code in the key field.
    const { key: _key, code: _code, ...modifiers } = parsed
    return normalizeHotkey({ ...modifiers, code: event.code }, platform)
  }
  return parsed.key ? normalizeHotkey(parsed, platform) : null
}

/**
 * Explains why a physical chord cannot be recorded before syntax/policy checks.
 * Logical mode deliberately accepts produced characters instead of requiring a code.
 */
export function chordRejection(
  event: KeyboardEvent,
  options: RecorderOptions,
): RecorderRejection | undefined {
  if (options.recordBy === 'key') return undefined
  // AltGr is character entry, often reported as synthetic Ctrl+Alt; macOS Option is handled separately.
  if (normalizeKeyboardEvent(event, options.platform).altGraph)
    return {
      reason: 'alt-graph',
      message:
        'AltGraph character entry cannot be recorded as a physical shortcut. Use key mode for characters.',
    }
  if (!hasUsableCode(event))
    return {
      reason: 'missing-code',
      message: 'This event has no usable physical key code.',
    }
  return undefined
}

/** Whether the event reports a real physical key code to record. */
function hasUsableCode(event: KeyboardEvent): boolean {
  return isCodeName(event.code) && event.code !== 'Unidentified'
}
