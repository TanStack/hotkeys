import { detectPlatform } from './platform'
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
import type { KeyboardEventMatch } from './match'
import type { HotkeyChord, ParsedHotkeyChord } from './hotkey.types'

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

  const direct = keysEqual(normalized.key, parsed.key)
  const implicitShift =
    direct &&
    isPrintableKey(normalized.key) &&
    !/^\p{Letter}$/u.test(normalized.key) &&
    !parsed.shift

  if (direct && modifiersMatch(normalized, parsed, implicitShift)) {
    return matched('key', implicitShift ? 2 : 3)
  }

  if (!positionStandsIn(normalized)) return noMatch

  // With AltGraph held, only a direct key match counts. Never fall back to
  // the physical key, which would turn AltGr+M (`µ`) into `M`.
  if (normalized.altGraph) return noMatch
  if (!modifiersMatch(normalized, parsed, false)) return noMatch
  const fallbackKey = codeToLogicalKey(normalized.code)
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
 * - anything on the digit row, where AZERTY types `&` and `é` for 1 and 2
 * - ASCII symbols typed with Shift, such as `!` for Shift+1
 * - Latin letters on punctuation keys with Control or Command, so German
 *   Cmd+ü still fires `Mod+[` (German types `[` with Option)
 *
 * A named key (`End` from a NumLock-off numpad), any other ASCII character,
 * or a Latin letter typed on its own is the key the user meant, wherever it
 * sits. AZERTY's `+` on the US `/` position is `+`, not `/`.
 */
function positionStandsIn({
  key,
  code,
  ctrl,
  meta,
  shift,
  alt,
}: ReturnType<typeof normalizeKeyboardEvent>): boolean {
  if (key !== 'Dead' && !isPrintableKey(key)) return false
  if (code.startsWith('Digit')) return true
  if (isAsciiLetter(key)) return false
  if (/^[!-~]$/.test(key)) return shift
  if (!isLatinLetter(key) || alt) return true
  return (ctrl || meta) && !code.startsWith('Key')
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
