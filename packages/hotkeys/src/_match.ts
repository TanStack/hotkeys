import { detectPlatform } from './platform'
import {
  codeToLogicalKey,
  isAsciiLetter,
  isLatinLetter,
  isPrintableKey,
  keysEqual,
  normalizeKeyboardEvent,
} from './_keyboard-event'
import { parseHotkey } from './parse'
import type { KeyboardEventMatch } from './match'
import type { Hotkey, ParsedHotkey } from './hotkey.types'

/** Matches an event and reports the winning candidate and release identity. */
export function matchKeyboardEvent(
  event: KeyboardEvent,
  hotkey: Hotkey | ParsedHotkey,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): KeyboardEventMatch {
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, platform) : hotkey
  const normalized = normalizeKeyboardEvent(event, platform)
  const noMatch: KeyboardEventMatch = { matched: false, score: 0 }

  if (
    normalized.isComposing &&
    (parsed.code !== undefined || isPrintableKey(parsed.key))
  )
    return noMatch
  if (normalized.altGraph && (parsed.ctrl || parsed.alt)) return noMatch

  if (parsed.code !== undefined) {
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

  // ASCII alphabetic output is authoritative for Dvorak/Colemak/AZERTY.
  // Native Latin letters are also authoritative on Key* positions; Alt is the
  // exception because macOS Option commonly transforms a shortcut's glyph.
  if (
    isAsciiLetter(normalized.key) ||
    (isLatinLetter(normalized.key) &&
      normalized.code.startsWith('Key') &&
      !normalized.alt)
  ) {
    return noMatch
  }

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

/** Compares modifiers, excluding synthetic AltGr flags and optionally allowing Shift used to type a glyph. */
function modifiersMatch(
  event: ReturnType<typeof normalizeKeyboardEvent>,
  parsed: ParsedHotkey,
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
