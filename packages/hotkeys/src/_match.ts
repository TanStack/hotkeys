import {
  altGraphTypedCharacter,
  codeToLogicalKey,
  isAsciiLetter,
  isLatinLetter,
  isPrintableKey,
  keysEqual,
  normalizeKeyboardEvent,
} from './_keyboard-event'
import { parseHotkey } from './parse'
import { detectPlatform } from './platform'
import type { HotkeyChord, ParsedHotkeyChord } from './hotkey.types'
import type { KeyboardEventMatch } from './match'

/** Matches an event and reports the winning candidate and release identity. */
export function matchKeyboardEvent(
  event: KeyboardEvent,
  hotkey: HotkeyChord | ParsedHotkeyChord,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): KeyboardEventMatch {
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, platform) : hotkey
  const normalized = normalizeKeyboardEvent(event, platform)
  const noMatch: KeyboardEventMatch = { matched: false, score: 0 }

  // Keys pressed while composing belong to the input method editor.
  if (normalized.isComposing) return noMatch
  if (normalized.altGraph && (parsed.ctrl || parsed.alt)) return noMatch
  // Outside Windows, AltGr is not Control+Alt. When it typed no new character
  // (AltGr+Home), it is a modifier no binding includes, so AltGr+F never fires F.
  if (normalized.altGraph && !altGraphTypedCharacter(normalized)) return noMatch

  if (parsed.code !== undefined) {
    // A held AltGraph means the physical key is not a plain shortcut press.
    // This matches the recorder, which rejects AltGraph physical recordings.
    if (normalized.altGraph) return noMatch
    if (!modifiersMatch(normalized, parsed, false)) return noMatch
    return normalized.code === parsed.code ? matched('code', 3) : noMatch
  }

  // With Command held, macOS reports the unshifted character for many keys:
  // Cmd+Shift+/ arrives as `/`. Shift was then a modifier of its own, not how
  // the character was typed, so `Mod+/` stays quiet. The position's US
  // character is the only evidence, so other layouts keep the implicit Shift.
  // So do the digit row and the numpad: French types digits with Shift, and
  // sends the event a US keyboard sends for Cmd+Shift+1.
  const shiftTypedNothing =
    platform === 'mac' &&
    normalized.meta &&
    normalized.shift &&
    !normalized.alt &&
    !/^(Digit|Numpad)/.test(normalized.code) &&
    codeToLogicalKey(normalized.code) === normalized.key

  const direct = keysEqual(normalized.key, parsed.key)
  const implicitShift =
    direct &&
    isPrintableKey(normalized.key) &&
    !/^\p{Letter}$/u.test(normalized.key) &&
    !parsed.shift &&
    !shiftTypedNothing

  if (direct && modifiersMatch(normalized, parsed, implicitShift)) {
    return matched('key', implicitShift ? 2 : 3)
  }

  // Turkish `ı` is its own letter, so an `ı` binding never fires on the `i`
  // key. Its key is Windows' VK_I, though, so `I` also fires there, as in
  // native Windows apps. An exact `ı` binding outranks it. With Alt, the
  // position decides instead: macOS Option+Shift+B types `ı` too.
  if (
    normalized.key === 'ı' &&
    parsed.key === 'I' &&
    !normalized.alt &&
    !normalized.altGraph &&
    modifiersMatch(normalized, parsed, false)
  ) {
    return matched('key', 2)
  }

  // macOS Option changes what a key types: French Option+A types `æ` on the
  // US Q position, so neither `key` nor `code` names the A keycap. The legacy
  // `keyCode` does, because browsers derive it from the letter the key types
  // without Option. It is read only here, after `key` failed to match.
  const optionLetter =
    platform === 'mac' &&
    normalized.alt &&
    !isAsciiLetter(normalized.key) &&
    event.keyCode > 64 &&
    event.keyCode < 91
      ? String.fromCharCode(event.keyCode)
      : undefined

  if (optionLetter === undefined && !positionStandsIn(normalized, platform)) {
    return noMatch
  }

  // With AltGraph held, only a direct key match counts. Never fall back to
  // the physical key, which would turn AltGr+M (`µ`) into `M`.
  if (normalized.altGraph) return noMatch
  if (!modifiersMatch(normalized, parsed, false)) return noMatch
  const fallbackKey = optionLetter ?? codeToLogicalKey(normalized.code)
  return fallbackKey !== undefined && keysEqual(fallbackKey, parsed.key)
    ? matched('fallback', 1)
    : noMatch

  // Preserve the triggering code so keyup can reset a shortcut even if its character changes.
  function matched(
    source: 'key' | 'code' | 'fallback',
    score: 1 | 2 | 3,
  ): KeyboardEventMatch {
    return {
      matched: true,
      score,
      source,
      identity: { key: normalized.key, code: normalized.code },
    }
  }
}

/**
 * Whether a key's conventional position may stand in for what it typed. Only
 * output that can't name a shortcut falls back:
 * - non-Latin letters and symbols, such as Russian `ы` or macOS Option's `–`
 * - dead keys
 * - `Unidentified` keys, except on letter positions, which layouts such as
 *   AZERTY rearrange, and numpad positions, whose output depends on NumLock.
 *   Chrome on Linux Wayland reports Ctrl+` this way, and Firefox reports
 *   numpad 5 with NumLock off this way.
 * - anything on the digit row, where AZERTY types `&` and `é` for 1 and 2
 * - ASCII symbols typed with Shift, such as `!` for Shift+1
 * - ASCII symbols typed with macOS Option on a letter position, such as `~`
 *   for US Cmd+Option+N, where Command cancels the dead key
 * - Latin letters typed with Alt, such as macOS Option+A typing `å`
 * - Latin letters on punctuation keys with Control or Command, so German
 *   Cmd+ü still fires `Mod+[` (German types `[` with Option)
 *
 * A named key (`End` from a NumLock-off numpad), any other ASCII character,
 * or a Latin letter typed on its own is the key the user meant, wherever it
 * sits. AZERTY's `+` on the US `/` position is `+`, not `/`. So is a Latin
 * letter typed with Control+Alt on a Windows letter key: Windows treats
 * Control+Alt as AltGr, so Polish Control+Alt+A types `ą`.
 */
function positionStandsIn(
  {
    key,
    code,
    ctrl,
    meta,
    shift,
    alt,
  }: ReturnType<typeof normalizeKeyboardEvent>,
  platform: 'mac' | 'windows' | 'linux',
): boolean {
  if (key === 'Unidentified') return !/^(Key|Numpad)/.test(code)
  if (key !== 'Dead' && !isPrintableKey(key)) return false
  if (code.startsWith('Digit')) return true
  if (isAsciiLetter(key)) return false
  const letterKey = code.startsWith('Key')
  if (/^[!-~]$/.test(key)) {
    return shift || (alt && platform === 'mac' && letterKey)
  }
  if (!isLatinLetter(key)) return true
  if (alt && !(letterKey && ctrl && platform === 'windows')) return true
  return (ctrl || meta) && !letterKey
}

/** Compares modifiers, excluding synthetic AltGr flags and optionally allowing Shift used to type a glyph. */
function modifiersMatch(
  event: ReturnType<typeof normalizeKeyboardEvent>,
  parsed: ParsedHotkeyChord,
  allowImplicitShift: boolean,
): boolean {
  const ctrl = event.altGraph ? false : event.ctrl
  const alt = event.altGraph ? false : event.alt
  if (
    ctrl !== parsed.ctrl ||
    alt !== parsed.alt ||
    event.meta !== parsed.meta
  ) {
    return false
  }
  return event.shift === parsed.shift || (allowImplicitShift && event.shift)
}

/**
 * Whether two parsed chords have the same identity: equal modifiers, and the
 * same physical code or (case-insensitively) the same logical key. A code and
 * a key never match, even when one keyboard event could produce both.
 */
export function parsedChordsEqual(
  a: ParsedHotkeyChord,
  b: ParsedHotkeyChord,
): boolean {
  return (
    a.ctrl === b.ctrl &&
    a.alt === b.alt &&
    a.shift === b.shift &&
    a.meta === b.meta &&
    (a.code !== undefined || b.code !== undefined
      ? a.code === b.code
      : keysEqual(a.key, b.key))
  )
}
