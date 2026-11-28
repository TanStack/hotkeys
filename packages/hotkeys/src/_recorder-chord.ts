import { isCodeName, isKeyNameShape, isModifierCode } from './_chord'
import { US_SHIFTED, US_UNSHIFTED } from './_constants'
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
  const key = recordBy === 'auto' ? keyName(event, platform) : undefined
  if (key !== undefined) {
    const { ctrl, shift, alt, meta } = parsed
    // A character Shift typed, such as `?`, is written without Shift. The
    // digit row with Control, Command or Alt keeps it, since `Mod+1` stands
    // for the key and also fires with Shift.
    const digitRow = /^Digit/.test(event.code) && (ctrl || meta || alt)
    // With Command, macOS may report the unshifted character, as Dvorak
    // Cmd+Shift+/ reports `/`, so Shift stays unless the key was read at its
    // US position: Cmd+Shift+/ on the US `/` key is `Mod+?`.
    const keepShift =
      digitRow || (platform === 'mac' && meta && !alt && key === normalized.key)
    // A name is only kept when it fires for the press that recorded it.
    for (const withShift of [keepShift && shift, shift]) {
      const chord = { ...modifiers, shift: withShift, key }
      if (matchKeyboardEvent(event, chord, platform).matched) {
        return normalizeHotkey(
          { ctrl, shift: withShift, alt, meta, key },
          platform,
        )
      }
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
  // recorded only when asked for by key. AltGr that typed nothing, such as
  // AltGr+Home on Linux, fires no hotkey, so it records nothing.
  return parsed.key &&
    !(normalized.altGraph && !altGraphTypedCharacter(normalized)) &&
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
 * - A named key such as Enter, a letter and any other character are recorded
 *   as typed, including a character AltGr typed, such as German `@`.
 * - With Control, Command or Alt, a digit-row key is recorded as its digit,
 *   as the matcher reads it: AZERTY Ctrl+& is `Mod+1`, and macOS Cmd+Shift+1,
 *   which reports `1` where Windows reports `!`, is `Mod+Shift+1`.
 * - macOS reports `/` for Cmd+Shift+/ on the US `/` key, where Windows reports
 *   `?`, so it is recorded as `?`, as the matcher reads it.
 * - A non-Latin letter is named by its position, as the matcher names it:
 *   Russian `ы` is `S`.
 * - macOS Option types another character or starts an accent, so the keycap
 *   letter is read from `keyCode`, as the matcher reads it. Option with any
 *   other key keeps its position.
 * - On the numpad, Enter and the four operators without Shift are recorded as
 *   typed: Numpad Enter is `Enter`. The digits and decimal key keep their
 *   position, since what they type depends on NumLock and the layout.
 * - Dead keys, whitespace characters, `Unidentified` keys and modifier
 *   positions keep their position.
 */
function keyName(
  event: KeyboardEvent,
  platform: HotkeyPlatform,
): string | undefined {
  const { key, code, ctrl, meta, alt, shift, altGraph } =
    normalizeKeyboardEvent(event, platform)
  if (
    !key ||
    key === 'Unidentified' ||
    // Shift+- would also fire on Shift+Minus, which types `_`
    (/^Numpad/.test(code) &&
      code !== 'NumpadEnter' &&
      (shift || !/^Numpad(Add|Subtract|Multiply|Divide)$/.test(code))) ||
    isModifierCode(code)
  ) {
    return undefined
  }
  const typed = key !== 'Dead' && isPrintableKey(key)
  if (altGraph) return typed && key.trim() ? key : undefined
  // A synthetic event can report anything as its key, such as `[KeyX]`.
  if (key !== 'Dead' && !typed) return isKeyNameShape(key) ? key : undefined
  // Control or Command alone with `-`, `+` or `=` is zoom, and keeps its key
  if (
    /^Digit\d$/.test(code) &&
    (alt || ((ctrl || meta) && (shift || !/^[-+=]$/.test(key))))
  ) {
    return code.slice(5)
  }
  if (platform === 'mac' && alt) {
    return isAsciiLetter(key) ? key : macKeycapLetter(event)
  }
  if (!typed || !key.trim()) return undefined
  // A Latin-script symbol such as Spanish `·` is a symbol, not a letter
  if (isSingleLetterKey(key)) {
    return isLatinLetter(key) ? key : codeToLogicalKey(code)
  }
  // Most layouts with `,` and `.` in their US position type something other
  // than `<` and `>` with Shift there, so those two keep Shift
  return platform === 'mac' &&
    meta &&
    shift &&
    !',.'.includes(key) &&
    codeToLogicalKey(code) === key
    ? (US_SHIFTED[US_UNSHIFTED.indexOf(key)] ?? key)
    : key
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
  // AltGr is character entry, often reported as synthetic Ctrl+Alt; macOS
  // Option is handled separately. `'auto'` records the character it typed.
  const unrecorded =
    recordBy === 'code' ||
    hotkeyChordFromKeydown(event, platform, recordBy) === null
  if (normalized.altGraph && unrecorded) return { reason: 'alt-graph' }
  // Without a code, a press can still be recorded by its name.
  if (!hasUsableCode(event) && unrecorded) return { reason: 'missing-code' }
  return undefined
}

/**
 * Whether the event reports a real physical key code to record. Autofill
 * sends a plain `Event` named keydown, without `code`.
 */
function hasUsableCode(event: KeyboardEvent): boolean {
  return isCodeName(event.code || '') && event.code !== 'Unidentified'
}
