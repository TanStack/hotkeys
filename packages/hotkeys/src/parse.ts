import {
  assertLogicalKey,
  modifierAlias,
  normalizeKeyboardEvent,
  physicalCodeOf,
  splitChordParts,
} from './_keyboard-event'
import { MODIFIER_ORDER, normalizeKeyName } from './constants'
import { detectPlatform, resolveModifier } from './platform'
import type { CanonicalModifier, Key } from './key.types'
import type {
  Hotkey,
  HotkeyChord,
  HotkeySequence,
  ParsedHotkeyChord,
  RawHotkeyChord,
  RegisterableHotkey,
  RegisterableHotkeyChord,
  RegisterableHotkeySequence,
} from './hotkey.types'

type Platform = 'mac' | 'windows' | 'linux'

/** A chord in any form: a string, a chord object, or an already-parsed chord. */
type AnyChord = RegisterableHotkeyChord | ParsedHotkeyChord | (string & {})

/** Builds a ParsedHotkeyChord, listing held modifiers in canonical order. */
function toParsedChord(
  identity: { key: string } | { code: string },
  ctrl: boolean,
  shift: boolean,
  alt: boolean,
  meta: boolean,
): ParsedHotkeyChord {
  const held = { Control: ctrl, Alt: alt, Shift: shift, Meta: meta }
  return {
    ...identity,
    ctrl,
    shift,
    alt,
    meta,
    modifiers: MODIFIER_ORDER.filter((modifier) => held[modifier]),
  }
}

/**
 * Whether a hotkey is a sequence. Use this instead of `Array.isArray`, which
 * does not narrow readonly arrays.
 */
export function isHotkeySequence<T extends RegisterableHotkey>(
  hotkey: T,
): hotkey is Extract<T, ReadonlyArray<unknown>> {
  return Array.isArray(hotkey)
}

/**
 * Collapses a one-step sequence to its chord without otherwise changing the hotkey.
 * Registration APIs treat `['Mod+S']` exactly like `'Mod+S'`.
 */
export function simplifyHotkey<T extends RegisterableHotkey>(
  hotkey: T,
): T extends HotkeySequence
  ? Hotkey
  : T extends RegisterableHotkeySequence
    ? RegisterableHotkey
    : T
export function simplifyHotkey(hotkey: RegisterableHotkey): RegisterableHotkey {
  return isHotkeySequence(hotkey) && hotkey.length === 1 ? hotkey[0]! : hotkey
}

function parseChordString(
  chord: string,
  platform: Platform,
): ParsedHotkeyChord {
  const parts = splitChordParts(chord)
  const modifiers: Set<CanonicalModifier> = new Set()
  let key = ''

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!.trim()

    if (i === parts.length - 1) {
      // Last part is always the key
      key = normalizeKeyName(part)
    } else {
      // All other parts are modifiers
      const alias = modifierAlias(part)

      if (alias) {
        const resolved = resolveModifier(alias, platform)
        modifiers.add(resolved)
      } else {
        // Unknown modifier, treat as part of the key if it's the only part
        // or ignore if there are more parts
        if (parts.length === 1) {
          key = normalizeKeyName(part)
        }
      }
    }
  }

  // If no key was found (empty string), use the last part as-is
  if (!key && parts.length > 0) {
    key = normalizeKeyName(parts[parts.length - 1]!.trim())
  }

  const code = physicalCodeOf(key)
  return toParsedChord(
    code !== undefined ? { code } : { key },
    modifiers.has('Control'),
    modifiers.has('Shift'),
    modifiers.has('Alt'),
    modifiers.has('Meta'),
  )
}

/** Resolves a chord object's modifiers. Omitted modifiers are false. */
function parseChordObject(
  chord: RawHotkeyChord,
  platform: Platform,
): ParsedHotkeyChord {
  if (chord.code === undefined) assertLogicalKey(chord.key)
  let ctrl = chord.ctrl ?? false
  const shift = chord.shift ?? false
  const alt = chord.alt ?? false
  let meta = chord.meta ?? false

  if (chord.mod) {
    const resolved = resolveModifier('Mod', platform)
    if (resolved === 'Control') {
      ctrl = true
    } else {
      meta = true
    }
  }

  return toParsedChord(
    chord.code !== undefined
      ? { code: chord.code }
      : { key: normalizeKeyName(chord.key) },
    ctrl,
    shift,
    alt,
    meta,
  )
}

function parseChord(chord: AnyChord, platform: Platform): ParsedHotkeyChord {
  return typeof chord === 'string'
    ? parseChordString(chord, platform)
    : parseChordObject(chord, platform)
}

/**
 * The canonical string for a parsed chord: `Mod` first when the platform
 * allows, then `Alt`, then `Shift`; otherwise full `Control+Alt+Shift+Meta`
 * order.
 */
function normalizeParsedChord(
  parsed: ParsedHotkeyChord,
  platform: Platform,
): HotkeyChord {
  if (parsed.code === undefined) assertLogicalKey(parsed.key)
  const canUseMod =
    platform === 'mac'
      ? parsed.meta && !parsed.ctrl
      : parsed.ctrl && !parsed.meta

  const parts: Array<string> = []

  if (canUseMod) {
    parts.push('Mod')
    if (parsed.alt) {
      parts.push('Alt')
    }
    if (parsed.shift) {
      parts.push('Shift')
    }
  } else {
    for (const modifier of MODIFIER_ORDER) {
      if (parsed.modifiers.includes(modifier)) {
        parts.push(modifier)
      }
    }
  }

  parts.push(
    parsed.code !== undefined
      ? `[${parsed.code}]`
      : normalizeKeyName(parsed.key),
  )
  return parts.join('+') as HotkeyChord
}

/**
 * Parses a hotkey, resolving `Mod` for the platform. A chord, written as a
 * string or an object, returns one parsed chord. A sequence returns one
 * parsed chord per step. Physical tokens such as `[KeyQ]` keep `code`; they
 * never become a logical Q.
 *
 * @param hotkey - A chord string such as `'Mod+S'`, a chord object, or a sequence
 * @param platform - The target platform for resolving 'Mod' (defaults to auto-detection)
 *
 * @example
 * ```ts
 * parseHotkey('Mod+S', 'mac') // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
 * parseHotkey({ key: 'S', mod: true }, 'windows') // { key: 'S', ctrl: true, ..., modifiers: ['Control'] }
 * parseHotkey(['G', 'Shift+G']) // [{ key: 'G', ... }, { key: 'G', shift: true, ... }]
 * ```
 */
export function parseHotkey(
  hotkey: AnyChord,
  platform?: Platform,
): ParsedHotkeyChord
export function parseHotkey(
  hotkey: ReadonlyArray<AnyChord>,
  platform?: Platform,
): Array<ParsedHotkeyChord>
export function parseHotkey(
  hotkey: AnyChord | ReadonlyArray<AnyChord>,
  platform?: Platform,
): ParsedHotkeyChord | Array<ParsedHotkeyChord>
export function parseHotkey(
  hotkey: AnyChord | ReadonlyArray<AnyChord>,
  platform: Platform = detectPlatform(),
): ParsedHotkeyChord | Array<ParsedHotkeyChord> {
  return Array.isArray(hotkey)
    ? hotkey.map((step: AnyChord) => parseChord(step, platform))
    : parseChord(hotkey as AnyChord, platform)
}

/**
 * Normalizes a hotkey to its canonical string form. Accepts a chord string, a
 * chord object, a parsed chord, or a sequence of any of these. Each sequence
 * step is normalized, and a one-step sequence becomes its chord.
 *
 * - When `Mod` is allowed for the platform (Command on Mac without Control;
 *   Control on Windows/Linux without Meta): emits `Mod`, then `Alt`, then `Shift`,
 *   then the key (e.g. `Mod+Shift+E`, `Mod+S`).
 * - Otherwise: literal modifiers in `Control+Alt+Shift+Meta` order, then the key.
 * - Resolves aliases and normalizes key casing (e.g. `esc` → `Escape`, `a` → `A`).
 *
 * @param hotkey - The hotkey to normalize
 * @param platform - The target platform for resolving `Mod` (defaults to auto-detection)
 *
 * @example
 * ```ts
 * normalizeHotkey('shift+meta+e', 'mac') // 'Mod+Shift+E'
 * normalizeHotkey('ctrl+a', 'windows') // 'Mod+A'
 * normalizeHotkey({ key: 's', mod: true }) // 'Mod+S'
 * normalizeHotkey(['g', 'shift+g']) // ['G', 'Shift+G']
 * normalizeHotkey(parseKeyboardEvent(event)) // The chord the event pressed
 * ```
 */
export function normalizeHotkey(
  hotkey: AnyChord,
  platform?: Platform,
): HotkeyChord
export function normalizeHotkey(
  hotkey: AnyChord | ReadonlyArray<AnyChord>,
  platform?: Platform,
): Hotkey
export function normalizeHotkey(
  hotkey: AnyChord | ReadonlyArray<AnyChord>,
  platform: Platform = detectPlatform(),
): Hotkey {
  if (Array.isArray(hotkey)) {
    const steps = hotkey.map((step: AnyChord) =>
      normalizeParsedChord(parseChord(step, platform), platform),
    )
    return steps.length === 1 ? steps[0]! : steps
  }
  return normalizeParsedChord(
    parseChord(hotkey as AnyChord, platform),
    platform,
  )
}

/**
 * Checks if a string is a recognized modifier token (including aliases).
 *
 * For a `KeyboardEvent`, use `isModifier(normalizeKeyName(event.key))` so DOM
 * spellings like `OS` / `Win` match the same alias table.
 *
 * @param key - Key name or alias (e.g. from a hotkey string or `event.key`)
 * @returns True if the string is a recognized modifier
 */
export function isModifierKey(key: Key | (string & {})): boolean {
  return modifierAlias(key) !== undefined
}

/**
 * Parses a KeyboardEvent into the chord it pressed, in the same format as
 * `parseHotkey()`. Pass the result to `normalizeHotkey` for its canonical string.
 *
 * @param event - The KeyboardEvent to parse
 * @param platform - The target platform for resolving modifiers (defaults to auto-detection)
 * @returns The parsed chord for the keyboard event
 *
 * @example
 * ```ts
 * document.addEventListener('keydown', (event) => {
 *   const parsed = parseKeyboardEvent(event)
 *   console.log(parsed) // { key: 'S', ctrl: true, shift: false, ... }
 * })
 * ```
 */
export function parseKeyboardEvent(
  event: KeyboardEvent,
  platform?: Platform,
): ParsedHotkeyChord {
  const normalized = normalizeKeyboardEvent(event, platform)
  // AltGraph is a character-production modifier, not an ordinary Control+Alt
  // shortcut. Record the produced glyph instead of a synthetic Ctrl+Alt chord.
  const ctrl = normalized.altGraph ? false : normalized.ctrl
  const alt = normalized.altGraph ? false : normalized.alt
  // Shift is a real modifier even during AltGraph input; preserve it for replay.
  const shift = normalized.shift

  return toParsedChord(
    { key: normalized.key },
    ctrl,
    shift,
    alt,
    normalized.meta,
  )
}

/**
 * Checks if a chord contains at least one non-modifier key.
 *
 * This is useful for validating that a recorded chord is complete and not
 * just a combination of modifiers without an action key.
 *
 * @param chord - The chord string or parsed chord to check
 * @param platform - The target platform for parsing (defaults to auto-detection)
 * @returns True if the chord contains at least one non-modifier key
 *
 * @example
 * ```ts
 * hasNonModifierKey('Control+Shift+S') // true
 * hasNonModifierKey('Control+Shift') // false (no action key)
 * hasNonModifierKey(parseHotkey('Mod+A')) // true
 * ```
 */
export function hasNonModifierKey(
  chord: HotkeyChord | ParsedHotkeyChord | (string & {}),
  platform: Platform = detectPlatform(),
): boolean {
  const parsed =
    typeof chord === 'string' ? parseChordString(chord, platform) : chord

  if (parsed.code !== undefined) {
    // Physical modifier codes identify a side, but still are not action keys.
    return (
      parsed.code.length > 0 &&
      !/^(Control|Shift|Alt|Meta)(Left|Right)$/.test(parsed.code)
    )
  }

  // Check if the key part is actually a modifier
  const keyIsModifier = isModifierKey(parsed.key)

  // A valid hotkey must have a non-modifier key
  return !keyIsModifier && parsed.key.length > 0
}
