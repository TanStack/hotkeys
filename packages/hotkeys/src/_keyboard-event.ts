import { isModifierCode, modifierAlias } from './_chord'
import { isPrintableKey } from './_keys'
import { PUNCTUATION_CODE_MAP, normalizeKeyName } from './constants'
import type { NormalizedKeyboardEvent } from './key.types'

// Reads keyboard events: what was pressed, and whether a hotkey may use it.

/** Normalizes Unicode key names and modifier flags while retaining physical code and IME state. */
export function normalizeKeyboardEvent(
  event: KeyboardEvent,
  platform?: 'mac' | 'windows' | 'linux',
): NormalizedKeyboardEvent {
  let altGraph = false
  try {
    // WebKit reports AltGraph for Option on some macOS keyboard layouts. Option
    // remains a normal Alt shortcut modifier there, so only use this signal on
    // Windows/Linux, where it means AltGr is held.
    altGraph =
      platform !== 'mac' &&
      typeof event.getModifierState === 'function' &&
      event.getModifierState('AltGraph')
  } catch {
    // Synthetic events and older browsers may not implement this reliably.
  }

  const key = (event.key || '').normalize('NFC')
  const normalizedKey = normalizeKeyName(key)
  // Windows reports AltGr as Control+Alt. When AltGr+key typed no new
  // character (AltGr+Home, or AltGr+F typing `f`), treat it as that shortcut.
  const controlAlt =
    platform === 'windows' &&
    altGraph &&
    !altGraphTypedCharacter({ key: normalizedKey, altGraph })
  return {
    key: normalizedKey,
    code: event.code || '',
    ctrl: controlAlt || Boolean(event.ctrlKey),
    shift: Boolean(event.shiftKey),
    alt: controlAlt || Boolean(event.altKey),
    meta: Boolean(event.metaKey),
    altGraph: altGraph && !controlAlt,
    location: event.location,
    isComposing: isComposingEvent(event),
  }
}

/**
 * Whether a key press belongs to an input method editor, so no hotkey reads it.
 *
 * Safari sends the Enter that commits a composition after compositionend,
 * with isComposing false but keyCode 229. An `Unidentified` key counts only
 * without a usable code: Chrome on Linux Wayland sends Ctrl+Backquote as an
 * `Unidentified` key with its code. One on a modifier key, such as
 * `ControlLeft`, is ignored like a modifier press.
 */
function isComposingEvent(event: KeyboardEvent): boolean {
  return (
    Boolean(event.isComposing) ||
    event.keyCode === 229 ||
    event.key === 'Process' ||
    (event.key === 'Unidentified' &&
      (!event.code ||
        event.code === 'Unidentified' ||
        isModifierCode(event.code)))
  )
}

/**
 * Whether the event is the press or release of a modifier key itself:
 * Control, Shift, Alt, Meta, or AltGraph. The key can be missing on events
 * that autofill and browser extensions send.
 */
export function isModifierPress(event: KeyboardEvent): boolean {
  return (
    event.key === 'AltGraph' || modifierAlias(event.key || '') !== undefined
  )
}

/**
 * Whether a key event can be a step of a sequence. Auto-repeats, keys an
 * input method editor reads, and modifier presses are not steps: they neither
 * advance a sequence nor reset it.
 */
export function isSequenceStep(event: KeyboardEvent): boolean {
  return (
    !(event.type === 'keydown' && event.repeat) &&
    !isComposingEvent(event) &&
    !isModifierPress(event)
  )
}

/**
 * Maps familiar positions to compatibility fallback keys for the logical matcher.
 * This assumes conventional positions, not the active layout; never use it to
 * turn recorded physical bindings into logical bindings or display labels.
 */
export function codeToLogicalKey(code: string): string | undefined {
  if (/^Key[A-Z]$/i.test(code)) return code.slice(3).toUpperCase()
  if (/^Digit[0-9]$/i.test(code)) return code.slice(5)
  if (/^Numpad[0-9]$/i.test(code)) return code.slice(6)

  // Own properties only, so codes such as `toString` never read Object.prototype
  if (Object.hasOwn(PUNCTUATION_CODE_MAP, code))
    return PUNCTUATION_CODE_MAP[code]

  const named: Record<string, string> = {
    NumpadAdd: '+',
    NumpadSubtract: '-',
    NumpadMultiply: '*',
    NumpadDivide: '/',
    NumpadDecimal: '.',
    NumpadEnter: 'Enter',
    Space: 'Space',
  }
  return Object.hasOwn(named, code) ? named[code] : undefined
}

/**
 * Whether AltGr changed what a key typed, as in AltGr+Q typing `@`. False when
 * AltGr is not held, or when the key typed its plain value: a named key such
 * as Home, or an ASCII letter or digit (AltGr+F typing `f` on layouts with
 * nothing on that key).
 */
export function altGraphTypedCharacter(
  event: Pick<NormalizedKeyboardEvent, 'key' | 'altGraph'>,
): boolean {
  if (!event.altGraph) return false
  // A dead key starts a composed character such as `ẽ`.
  if (event.key === 'Dead') return true
  return isPrintableKey(event.key) && !/^[A-Za-z0-9]$/.test(event.key)
}
