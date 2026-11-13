import {
  altGraphTypedCharacter,
  codeToLogicalKey,
  macKeycapLetter,
  normalizeKeyboardEvent,
} from './_keyboard-event'
import {
  isAsciiLetter,
  isLatinLetter,
  isPrintableKey,
  keysEqual,
} from './_keys'
import { isSingleLetterKey } from './constants'
import { parseHotkey } from './parse'
import { detectPlatform } from './platform'
import type { HotkeyChord, ParsedHotkeyChord } from './hotkey.types'
import type { KeyIdentity, NormalizedKeyboardEvent } from './key.types'
import type { HotkeyPlatform } from './platform'

/**
 * How a key event matched a chord. The score ranks matches of one key press:
 * - 3: the exact code, or the exact key with Shift as the binding names it
 * - 2: a character that is not a letter, matched by a binding without Shift,
 *   because Shift may have typed it. Turkish `ı` matched as `I` also scores 2.
 * - 1: a position, or macOS's keycap letter, standing in for the key
 *
 * `identity` is the pressed key, kept so its release can be recognized.
 */
export interface KeyboardEventMatch {
  matched: boolean
  score: 0 | 1 | 2 | 3
  source?: 'key' | 'code' | 'fallback'
  identity?: KeyIdentity
}

/** Matches an event and reports the winning candidate and release identity. */
export function matchKeyboardEvent(
  event: KeyboardEvent,
  hotkey: HotkeyChord | ParsedHotkeyChord,
  platform: HotkeyPlatform = detectPlatform(),
): KeyboardEventMatch {
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, platform) : hotkey
  const normalized = normalizeKeyboardEvent(event, platform)
  const noMatch: KeyboardEventMatch = { matched: false, score: 0 }

  // Keys pressed while composing belong to the input method editor.
  if (normalized.isComposing) return noMatch

  // Control, Alt and Meta always match exactly. AltGr's synthetic Control+Alt
  // flags are not modifiers.
  const { altGraph } = normalized
  if (
    (altGraph ? false : normalized.ctrl) !== parsed.ctrl ||
    (altGraph ? false : normalized.alt) !== parsed.alt ||
    normalized.meta !== parsed.meta
  ) {
    return noMatch
  }
  const shiftMatches = normalized.shift === parsed.shift

  // AltGr matches only the character it typed, never a position. Outside
  // Windows, AltGr that typed nothing new is a modifier no binding includes.
  if (altGraph && !altGraphTypedCharacter(normalized)) return noMatch

  if (parsed.code !== undefined) {
    return !altGraph && shiftMatches && normalized.code === parsed.code
      ? matched('code', 3)
      : noMatch
  }

  if (keysEqual(normalized.key, parsed.key)) {
    // With Command held, macOS reports the unshifted character for many keys:
    // Cmd+Shift+/ arrives as `/`. Shift was then a modifier of its own, not
    // how the character was typed, so `Mod+/` stays quiet. The position's US
    // character is the only evidence, so other layouts keep the implicit
    // Shift. So do the digit row and the numpad: French types digits with
    // Shift, and sends the event a US keyboard sends for Cmd+Shift+1. With
    // Option held too, the character comes from the Option layer instead.
    const shiftTypedNothing =
      platform === 'mac' &&
      normalized.meta &&
      normalized.shift &&
      !normalized.alt &&
      !/^(Digit|Numpad)/.test(normalized.code) &&
      codeToLogicalKey(normalized.code) === normalized.key
    // Shift that typed a symbol, such as `?`, is not a modifier of the binding.
    const implicitShift =
      isPrintableKey(normalized.key) &&
      !isSingleLetterKey(normalized.key) &&
      !parsed.shift &&
      !shiftTypedNothing
    if (shiftMatches || (implicitShift && normalized.shift)) {
      return matched('key', implicitShift ? 2 : 3)
    }
  }

  // Everything below stands in for the character, so Shift must match exactly.
  if (altGraph || !shiftMatches) return noMatch

  // Turkish `ı` is its own letter, so an `ı` binding never fires on the `i`
  // key. Its key is Windows' VK_I, though, so `I` also fires there, as in
  // native Windows apps. An exact `ı` binding outranks it. With Alt, the
  // position decides instead: macOS Option+Shift+B types `ı` too.
  if (normalized.key === 'ı' && parsed.key === 'I' && !normalized.alt) {
    return matched('key', 2)
  }

  // macOS Option changes what a key types: French Option+A types `æ` on the
  // US Q position, so neither `key` nor `code` names the A keycap. The legacy
  // `keyCode` does: browsers derive it from the letter the key types without
  // Option, unless Option typed a character that has a key code of its own.
  // It is read only here, after `key` failed to match, and only in place of a
  // character. Named keys and `Unidentified` keep their own rules.
  const optionLetter =
    platform === 'mac' &&
    normalized.alt &&
    (normalized.key === 'Dead' ||
      (isPrintableKey(normalized.key) && !isAsciiLetter(normalized.key)))
      ? macKeycapLetter(event)
      : undefined

  if (optionLetter === undefined && !positionStandsIn(normalized, platform)) {
    return noMatch
  }
  const fallbackKey = optionLetter ?? codeToLogicalKey(normalized.code)
  return fallbackKey !== undefined && keysEqual(fallbackKey, parsed.key)
    ? matched('fallback', 1)
    : noMatch

  // Preserve the triggering code so keyup can reset a shortcut even if its character changes.
  function matched(
    source: NonNullable<KeyboardEventMatch['source']>,
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
  { key, code, ctrl, meta, shift, alt }: NormalizedKeyboardEvent,
  platform: HotkeyPlatform,
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
