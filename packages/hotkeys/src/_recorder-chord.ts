import { isCodeName, isKeyNameShape, isModifierCode } from './_chord'
import {
  altGraphTypedCharacter,
  codeToLogicalKey,
  isModifierPress,
  macKeycapLetter,
  normalizeKeyboardEvent,
} from './_keyboard-event'
import { isAsciiLetter, isLatinLetter, isPrintableKey } from './_keys'
import { matchKeyboardEvent } from './_match'
import { isSingleLetterKey } from './constants'
import { normalizeHotkey, parseKeyboardEvent } from './parse'
import type { RecorderKeyMode, RecorderRejection } from './hotkey-recorder'
import type { HotkeyChord } from './hotkey.types'
import type { HotkeyPlatform } from './platform'

/**
 * Converts a keydown to a chord that fires for the same key press.
 *
 * - `'auto'` records the key by name when the press has one, and its physical
 *   code otherwise.
 * - `'code'` always records the physical code.
 * - `'key'` always records the character or key name the press produced.
 *
 * Returns null for composition, modifier-only input, and a press the mode
 * can't record: a modifier position or unusable physical input by code, or an
 * `Unidentified` key by key.
 */
export function hotkeyChordFromKeydown(
  event: KeyboardEvent,
  platform: HotkeyPlatform,
  recordBy: RecorderKeyMode = 'auto',
): HotkeyChord | null {
  const normalized = normalizeKeyboardEvent(event, platform)
  if (normalized.isComposing || isModifierPress(event)) return null
  const parsed = parseKeyboardEvent(event, platform)
  const { key: _key, code: _code, ...modifiers } = parsed
  if (recordBy === 'auto') {
    const key = keyName(event, platform)
    // A name is only kept when it fires for the press that recorded it.
    if (
      key !== undefined &&
      matchKeyboardEvent(event, { ...modifiers, key }, platform).matched
    ) {
      return normalizeHotkey({ ...modifiers, key }, platform)
    }
  }
  // Without a code, `'auto'` has only what the press typed to record.
  if (recordBy === 'code' || (recordBy === 'auto' && hasUsableCode(event))) {
    // A key on a modifier position, such as CapsLock on ControlLeft with the
    // two swapped, is ignored like a modifier press: a modifier code can't be
    // a hotkey's key.
    return hasUsableCode(event) &&
      !isModifierCode(event.code) &&
      !normalized.altGraph
      ? // Remove logical identity rather than placing a physical code in the key field.
        normalizeHotkey({ ...modifiers, code: event.code }, platform)
      : null
  }
  // An `Unidentified` key has no name to record. Code mode records its
  // position. A dead key, or a key that isn't written like a key name, is
  // recorded only when asked for by key.
  return parsed.key &&
    parsed.key !== 'Unidentified' &&
    (recordBy === 'key' ||
      (parsed.key !== 'Dead' && isKeyNameShape(parsed.key)))
    ? normalizeHotkey(parsed, platform)
    : null
}

/**
 * The name `'auto'` records a press by, or undefined when its physical code
 * says more than anything it typed:
 *
 * - A named key such as Enter and a letter are recorded as typed.
 * - Any other character is recorded as typed without Shift. With Shift, the
 *   position is recorded: macOS reports `/` for Cmd+Shift+/ where Windows
 *   reports `?`, and `1` for Cmd+Shift+1 where Windows reports `!`, so the
 *   typed character would not name the same press on both.
 * - A non-Latin letter is named by its position, as the matcher names it:
 *   Russian `ы` is `S`.
 * - macOS Option types another character or starts an accent, so the keycap
 *   letter is read from `keyCode`, as the matcher reads it. Option with any
 *   other key keeps its position.
 * - Dead keys, whitespace characters, `Unidentified` keys, the numpad (what
 *   it types depends on NumLock), modifier positions and AltGr presses keep
 *   their position.
 */
function keyName(
  event: KeyboardEvent,
  platform: HotkeyPlatform,
): string | undefined {
  const { key, alt, shift, altGraph } = normalizeKeyboardEvent(event, platform)
  if (
    !key ||
    altGraph ||
    key === 'Unidentified' ||
    /^Numpad/.test(event.code) ||
    isModifierCode(event.code)
  ) {
    return undefined
  }
  const typed = key !== 'Dead' && isPrintableKey(key)
  // A synthetic event can report anything as its key, such as `[KeyX]`.
  if (key !== 'Dead' && !typed) return isKeyNameShape(key) ? key : undefined
  if (platform === 'mac' && alt) {
    return isAsciiLetter(key) ? key : macKeycapLetter(event)
  }
  if (!typed || !key.trim()) return undefined
  if (isLatinLetter(key)) return key
  if (isSingleLetterKey(key)) return codeToLogicalKey(event.code)
  return shift ? undefined : key
}

/**
 * Explains why a key press cannot be recorded before syntax/policy checks.
 * Recording by key accepts produced characters instead of requiring a code,
 * but rejects AltGr that typed nothing new, which no hotkey matches.
 */
export function chordRejection(
  event: KeyboardEvent,
  platform: HotkeyPlatform,
  recordBy: RecorderKeyMode = 'auto',
): RecorderRejection | undefined {
  const normalized = normalizeKeyboardEvent(event, platform)
  if (recordBy === 'key') {
    // AltGr that typed nothing new, such as AltGr+Home outside Windows, fires
    // no hotkey, so recording the bare key would store one this press misses.
    return normalized.altGraph && !altGraphTypedCharacter(normalized)
      ? { reason: 'alt-graph' }
      : undefined
  }
  // AltGr is character entry, often reported as synthetic Ctrl+Alt; macOS Option is handled separately.
  if (normalized.altGraph) return { reason: 'alt-graph' }
  // Without a code, a press can still be recorded by its name.
  if (
    !hasUsableCode(event) &&
    (recordBy === 'code' ||
      hotkeyChordFromKeydown(event, platform, recordBy) === null)
  ) {
    return { reason: 'missing-code' }
  }
  return undefined
}

/** Whether the event reports a real physical key code to record. */
function hasUsableCode(event: KeyboardEvent): boolean {
  return isCodeName(event.code) && event.code !== 'Unidentified'
}
