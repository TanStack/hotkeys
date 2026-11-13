import { keysEqual, ownValue } from './_keys'
import { MODIFIER_ALIASES } from './constants'
import type {
  ParsedHotkeyChord,
  RegisterableHotkey,
  RegisterableHotkeyChord,
} from './hotkey.types'
import type { ResolvableModifier } from './key.types'

// How a hotkey is written, and what a parsed chord means. Nothing here reads
// a keyboard event.

/**
 * Resolves a modifier token or alias case-insensitively: `ctrl` → `Control`,
 * `cmd` → `Meta`, `mod` → `Mod`. Returns undefined for anything else.
 */
export function modifierAlias(token: string): ResolvableModifier | undefined {
  // Every alias has a lowercase entry.
  return ownValue(MODIFIER_ALIASES, token.toLowerCase())
}

/** Splits modifier tokens while retaining a trailing literal plus: `Control++` → `['Control', '+']`. */
export function splitChordParts(hotkey: string): Array<string> {
  if (!hotkey.endsWith('+')) return hotkey.split('+')
  const parts = hotkey.slice(0, -1).split('+')
  if (parts.at(-1) === '') parts.pop()
  parts.push('+')
  return parts
}

/** The code inside a physical token: `[KeyS]` → `KeyS`. Undefined for anything else. */
export function physicalCodeOf(token: string): string | undefined {
  return token.startsWith('[') &&
    token.endsWith(']') &&
    isCodeName(token.slice(1, -1))
    ? token.slice(1, -1)
    : undefined
}

/** Whether a string has the shape of a `KeyboardEvent.code`, such as `KeyS`. */
export function isCodeName(code: string): boolean {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(code)
}

/** Whether a `KeyboardEvent.code` is a modifier key, such as `ShiftLeft`. */
export function isModifierCode(code: string): boolean {
  return /^(Control|Shift|Alt|Meta)(Left|Right)$/.test(code)
}

/** Rejects reserved physical-token syntax in logical object fields while allowing Unicode characters. */
export function assertLogicalKey(key: string): void {
  if (/^\[.*\]$/s.test(key.trim())) {
    throw new Error(`[hotkeys] Put '${key}' in the code field, not key`)
  }
}

/**
 * Whether a key is written like a key the library knows: one character,
 * F1-F24, or a capitalized name such as `Escape`. Key names are
 * case-sensitive, so `escape` and `f1` don't qualify.
 */
export function isKeyNameShape(key: string): boolean {
  return /^(?:.|F(?:[1-9]|1\d|2[0-4])|[A-Z][a-z][A-Za-z\d]*)$/su.test(key)
}

/**
 * Whether a parsed chord has a key that isn't a modifier. A chord without one
 * registers nothing: an empty key would match key-less events, and a
 * modifier-only chord isn't supported.
 */
export function chordHasKey(chord: ParsedHotkeyChord): boolean {
  return chord.code !== undefined
    ? !!chord.code && !isModifierCode(chord.code)
    : !!chord.key && !modifierAlias(chord.key)
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

/** Whether two parsed step lists have the same length and equal chords. */
export function parsedStepsEqual(
  a: ReadonlyArray<ParsedHotkeyChord>,
  b: ReadonlyArray<ParsedHotkeyChord>,
): boolean {
  return (
    a.length === b.length &&
    a.every((step, index) => parsedChordsEqual(step, b[index]!))
  )
}

/** The steps of a hotkey: a sequence's chords, or a chord as one step. */
export function hotkeySteps(
  hotkey: RegisterableHotkey,
): ReadonlyArray<RegisterableHotkeyChord> {
  return Array.isArray(hotkey) ? hotkey : [hotkey as RegisterableHotkeyChord]
}
