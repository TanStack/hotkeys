import {
  altGraphTypedCharacter,
  codeToLogicalKey,
  isTypedText,
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
import { detectPlatform } from './platform'
import type { ParsedHotkeyChord } from './hotkey.types'
import type { KeyIdentity, NormalizedKeyboardEvent } from './key.types'
import type { HotkeyPlatform } from './platform'

/** What US Shift types on each punctuation key, and the key itself. */
export const US_SHIFTED = '~_+{}|:"<>?'
export const US_UNSHIFTED = "`-=[]\\;',./"

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
  identity?: KeyIdentity
}

/** Matches an event and reports the winning candidate and release identity. */
export function matchKeyboardEvent(
  event: KeyboardEvent,
  parsed: ParsedHotkeyChord,
  platform: HotkeyPlatform = detectPlatform(),
): KeyboardEventMatch {
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
      ? matched(3)
      : noMatch
  }

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
  // The character US Shift types there is what the press typed, as Windows
  // reports it: macOS Cmd+Shift+/ fires `Mod+?`. Not for `<` and `>`: most
  // layouts with `,` and `.` in their US position type `;` and `:` there.
  if (
    shiftTypedNothing &&
    !parsed.shift &&
    !'<>'.includes(parsed.key) &&
    US_SHIFTED[US_UNSHIFTED.indexOf(normalized.key)] === parsed.key
  ) {
    return matched(2)
  }

  if (keysEqual(normalized.key, parsed.key)) {
    // Shift that typed a symbol, such as `?`, is not a modifier of the binding.
    const implicitShift =
      isPrintableKey(normalized.key) &&
      !isSingleLetterKey(normalized.key) &&
      !parsed.shift &&
      !shiftTypedNothing
    if (shiftMatches || (implicitShift && normalized.shift)) {
      return matched(implicitShift ? 2 : 3)
    }
  }

  // Everything below stands in for the character, so Shift must match exactly.
  if (altGraph || !shiftMatches) return noMatch

  // Turkish `ı` is its own letter, so an `ı` binding never fires on the `i`
  // key. Its key is Windows' VK_I, though, so `I` also fires there, as in
  // native Windows apps. An exact `ı` binding outranks it. With Alt, the
  // position decides instead: macOS Option+Shift+B types `ı` too.
  if (normalized.key === 'ı' && parsed.key === 'I' && !normalized.alt) {
    return matched(2)
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
      (isTypedText(normalized.key) && !isAsciiLetter(normalized.key)))
      ? macKeycapLetter(event)
      : undefined

  // A symbol that US Shift types on a punctuation key stands for that key,
  // wherever the layout puts it: German Shift+- types `_` on the US `/`
  // position and fires `Shift+-`. The digit row and numpad keep their
  // positions, since Swiss Shift+2 types `"`.
  const shiftedIndex =
    normalized.shift &&
    !normalized.alt &&
    normalized.key.length === 1 &&
    !/^(Digit|Numpad)/.test(normalized.code)
      ? US_SHIFTED.indexOf(normalized.key)
      : -1
  // A letter key whose legacy keyCode names its letter stays that letter
  // (see positionStandsIn), so Greek Shift+Q typing `:` is `Shift+Q`.
  const usKey =
    shiftedIndex < 0 || namesLetter(normalized, event.keyCode)
      ? undefined
      : US_UNSHIFTED[shiftedIndex]

  if (
    optionLetter === undefined &&
    usKey === undefined &&
    !positionStandsIn(normalized, platform, event.keyCode)
  ) {
    return noMatch
  }
  // An `Unidentified` named key, such as Shift+Tab on older Firefox for
  // Linux, is named by its code: `Tab`, `ArrowUp` and `F13` are both.
  const fallbackKey =
    optionLetter ??
    usKey ??
    codeToLogicalKey(normalized.code) ??
    (normalized.key === 'Unidentified' ? normalized.code : undefined)
  return fallbackKey !== undefined && keysEqual(fallbackKey, parsed.key)
    ? matched(1)
    : noMatch

  // Preserve the triggering code so keyup can reset a shortcut even if its character changes.
  function matched(score: 1 | 2 | 3): KeyboardEventMatch {
    return {
      matched: true,
      score,
      identity: { key: normalized.key, code: normalized.code },
    }
  }
}

/**
 * Whether a key's conventional position may stand in for what it typed. Only
 * output that can't name a shortcut falls back:
 * - non-Latin letters and symbols, such as Russian `ы` or macOS Option's `–`,
 *   including text of several code points, such as macOS Hebrew `שׁ`
 * - dead keys on a letter key, on Quote or Backquote (US International's
 *   ' and `), or with Control, Alt or Command
 * - `Unidentified` keys, except on letter positions, which layouts such as
 *   AZERTY rearrange, and numpad positions, whose output depends on NumLock.
 *   Chrome on Linux Wayland reports Ctrl+` this way, and Firefox reports
 *   numpad 5 with NumLock off this way.
 * - anything on the digit row, where AZERTY types `&` and `é` for 1 and 2
 *   and macOS Spanish Option+Shift+6 types a space,
 *   except `-`, `+` or `=` typed with only the platform's zoom modifier,
 *   Control or macOS Command: AZERTY Ctrl+- on the 6 key is zoom out
 * - ASCII symbols typed with Shift on a punctuation key, such as UK `@` on
 *   the US ' key. One that US Shift types, such as `?`, names its US key
 *   instead (`/`), in matchKeyboardEvent
 * - ASCII symbols on a letter key whose legacy keyCode names that letter:
 *   Greek `;` on the Q key reports VK_Q on Windows
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
  keyCode: number,
): boolean {
  if (key === 'Unidentified') return !/^(Key|Numpad)/.test(code)
  if (code.startsWith('Digit')) {
    // Persian types the zero-width non-joiner with Ctrl+Shift+2. An invisible
    // format character is text, not the digit.
    if (/\p{Cf}/u.test(key)) return false
    // AZERTY types `-` on the 6 key, so Ctrl+- is zoom out, not Ctrl+6
    const zoom =
      !shift && !alt && (platform === 'mac' ? meta && !ctrl : ctrl && !meta)
    return !zoom || !/^[-+=]$/.test(key)
  }
  // A dead key pressed alone stands in on a letter key, as other non-Latin
  // output does (Greek Shift+W), and where US International puts its accent
  // on the US key, ' and `. Swiss ^ on the US = key is not =. With a modifier
  // the press is a shortcut, so the position stays.
  if (key === 'Dead') {
    return ctrl || meta || alt || /^(Quote|Backquote|Key)/.test(code)
  }
  if (!isTypedText(key)) return false
  if (isAsciiLetter(key)) return false
  const letterKey = code.startsWith('Key')
  if (/^[!-~]$/.test(key)) {
    // Greek types `;` and Hebrew `/` on the Q key, where the legacy keyCode
    // still names Q (Windows VK_Q). Otherwise a letter key that types a
    // symbol is another key on this layout: AZERTY Shift+M types `?`, and
    // its `,` reports VK_OEM_COMMA.
    if (letterKey) {
      return (
        namesLetter({ code, shift, alt }, keyCode) ||
        (alt && platform === 'mac')
      )
    }
    return shift
  }
  // A letter with marks keeps its base letter's script
  if (!isLatinLetter(Array.from(key)[0]!)) return true
  if (alt && !(letterKey && ctrl && platform === 'windows')) return true
  return (ctrl || meta) && !letterKey
}

/**
 * Whether a key's legacy keyCode names the letter of its position. Alt
 * without Shift types a character of its own, so then it doesn't; Greek
 * Alt+Shift+Q typing `:` is still Q. AltGr presses, such as German `@` on
 * VK_Q, never get here: matchKeyboardEvent returns before any fallback.
 */
function namesLetter(
  { code, shift, alt }: Pick<NormalizedKeyboardEvent, 'code' | 'shift' | 'alt'>,
  keyCode: number,
): boolean {
  return (
    (!alt || shift) && /^Key[A-Z]$/.test(code) && keyCode === code.charCodeAt(3)
  )
}
