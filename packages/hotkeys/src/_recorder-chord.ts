import {
  altGraphTypedCharacter,
  isCodeName,
  isModifierCode,
  normalizeKeyboardEvent,
} from './_keyboard-event'
import { normalizeKeyName } from './constants'
import { isModifierKey, normalizeHotkey, parseKeyboardEvent } from './parse'
import type {
  RecorderKeyMode,
  RecorderOptions,
  RecorderRejection,
} from './hotkey-recorder'
import type { HotkeyChord } from './hotkey.types'

/**
 * Converts a keydown to a replayable chord, preserving physical codes by default.
 * Returns null for composition, modifier-only input, a modifier position or
 * unusable physical input in code mode, or an `Unidentified` key in key mode.
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
  // A key on a modifier position, such as CapsLock on ControlLeft with the two
  // swapped, is ignored like a modifier press: a modifier code can't be a
  // hotkey's key.
  if (
    recordBy === 'code' &&
    (!hasUsableCode(event) || isModifierCode(event.code) || normalized.altGraph)
  )
    return null
  const parsed = parseKeyboardEvent(event, platform)
  if (recordBy === 'code') {
    // Remove logical identity rather than placing a physical code in the key field.
    const { key: _key, code: _code, ...modifiers } = parsed
    return normalizeHotkey({ ...modifiers, code: event.code }, platform)
  }
  // An `Unidentified` key has no name to record. Code mode records its position.
  return parsed.key && parsed.key !== 'Unidentified'
    ? normalizeHotkey(parsed, platform)
    : null
}

/**
 * Explains why a physical chord cannot be recorded before syntax/policy checks.
 * Logical mode deliberately accepts produced characters instead of requiring a
 * code, but rejects AltGr that typed nothing new, which no hotkey matches.
 */
export function chordRejection(
  event: KeyboardEvent,
  options: RecorderOptions,
): RecorderRejection | undefined {
  const normalized = normalizeKeyboardEvent(event, options.platform)
  if (options.recordBy === 'key') {
    // AltGr that typed nothing new, such as AltGr+Home outside Windows, fires
    // no hotkey, so recording the bare key would store one this press misses.
    return normalized.altGraph && !altGraphTypedCharacter(normalized)
      ? { reason: 'alt-graph' }
      : undefined
  }
  // AltGr is character entry, often reported as synthetic Ctrl+Alt; macOS Option is handled separately.
  if (normalized.altGraph) return { reason: 'alt-graph' }
  if (!hasUsableCode(event)) return { reason: 'missing-code' }
  return undefined
}

/** Whether the event reports a real physical key code to record. */
function hasUsableCode(event: KeyboardEvent): boolean {
  return isCodeName(event.code) && event.code !== 'Unidentified'
}
