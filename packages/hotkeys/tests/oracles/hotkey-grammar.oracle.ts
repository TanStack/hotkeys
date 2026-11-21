import { differs, oracleProperty, pass, violation } from '@tanstack/oracles'
/**
 * # How a hotkey is written, read back, and checked
 *
 * This oracle owns the grammar of hotkeys: what `parseHotkey` reads from a
 * chord string, chord object or sequence, the canonical string
 * `normalizeHotkey` stores, the spelled-out string `formatHotkey` writes, the
 * issues `validateHotkey` reports, and `normalizeKeyName`. It owns those five
 * functions in `src/parse.ts`, `src/format.ts`, `src/validate.ts` and
 * `src/constants.ts`, with the helpers in `src/_chord.ts` they call.
 *
 * ```ts
 * parseHotkey('cmd+SHIFT+s', 'mac') // → { key: 'S', shift, meta, modifiers: ['Shift', 'Meta'] }
 * parseHotkey('Ctl+K') // → { key: '' } with no modifiers: an unknown modifier empties the chord
 * normalizeHotkey('Shift+Control+a', 'windows') // → 'Mod+Shift+A'
 * formatHotkey(parseHotkey('Mod+[KeyS]', 'mac')) // → 'Meta+[KeyS]'
 * validateHotkey(['G', 'Foo+escape']) // → errors: unknown-modifier 'Foo' at step 1; warnings: unknown-key 'escape' at step 1
 * normalizeKeyName('ı') // → 'ı': uppercasing it would make it I
 * ```
 *
 * Letters are the easy case to get wrong. `S` and `s` are one binding, so
 * `normalizeKeyName` uppercases a letter, but only when its uppercase is one
 * character: `ß` stays `ß`, because `SS` would be two keys. "One character"
 * means one code point. The ADLaM letter `𞤢`, which Windows types on its
 * ADLaM layout, uppercases to the one character `𞤀`, which JavaScript
 * stores in two UTF-16 units. A length check in code units would leave it
 * lowercase and give `Mod+𞤢` and `Mod+𞤀` different canonical strings.
 *
 * Three parts carry every law. The *spelling* is how a chord is written: its
 * modifier words (canonical names, the aliases `Ctrl`, `Option`, `Command`,
 * `Cmd`, `OS`, `Win`, `CommandOrControl` and `Mod`, in any case), and its
 * key, a logical key name or a bracketed physical code. The *resolution* is
 * what the spelling means on one platform: four modifier flags, with `Mod`
 * as Command on macOS and Control elsewhere, and either a key or a code. The
 * *key name* rule turns a written key into its stored name: letters
 * uppercase as above, except Turkish `ı` and the long `ſ`, whose uppercases
 * are the ASCII `I` and `S`; the space character becomes `Space`; every
 * other name stays as written, because key names are case-sensitive.
 *
 * The laws. For every spelling on every platform, `parseHotkey` returns its
 * resolution, with the modifiers listed in Control, Alt, Shift, Meta order;
 * an unknown modifier word gives the empty chord instead. A chord object
 * reads the same way, with omitted modifiers false and `mod` as the platform's
 * primary modifier, and a sequence reads step by step. `normalizeHotkey`
 * writes `Mod` first, then `Alt`, then `Shift`, when the platform's primary
 * modifier is held without the other one of Control and Meta, and otherwise
 * the held modifiers in Control, Alt, Shift, Meta order; then the key, or
 * the code in brackets. `formatHotkey` writes the held modifiers in that
 * order, never `Mod`. `validateHotkey` reports one issue for each rule a
 * chord breaks, by the reason definitions in `src/validate.ts`.
 * `MODIFIER_ALIASES` holds each documented spelling and its lowercase, and
 * `isSingleLetterKey` is true for one letter. A key field
 * holding a bracketed token throws, because a code belongs in `code`. And
 * whatever the string, the validator agrees with the parser: a valid
 * hotkey normalizes without throwing, and its canonical and spelled-out
 * strings read back as the same chord.
 *
 * The model never reads a joined hotkey string. A history lists the words
 * and the key of each chord, and the plan joins them for production. The
 * model classifies each word and key by the documented rules, and computes
 * the resolution, the canonical string, the spelled-out string, and the
 * issues. Histories cover every modifier spelling and case, unknown words
 * (including `Object.prototype` names), letters from every script and plane,
 * typed and miswritten key names, physical and modifier codes, chord
 * objects with omitted and explicit flags, parsed chords, sequences of zero
 * to three steps, and calls without a platform, where the stubbed
 * `navigator` decides. The driver records each return value or thrown
 * message.
 *
 * Limits. No authority says what these mean, so the exact laws leave them
 * out: whitespace around a word, and a hotkey of whitespace only;
 * half-bracketed keys such as `[a`; bracketed lowercase names such as
 * `[keys]`; a string whose key is bracketed but not a code, such as
 * `Mod+[Key S]`, which parses to a key that normalizing then rejects;
 * keyless chords such as `Control+ `, whose canonical string `Control+`
 * names the + key; and a single trailing plus after a key, as in
 * `Control+S+`. The agreement law still reaches all of them through
 * arbitrary strings. Letters whose uppercase is also another letter's, such
 * as the micro sign `µ` and the final sigma `ς`, uppercase by the stated
 * rule. A ParsedHotkeyChord passed to `formatHotkey` holds a stored key name
 * and modifiers that match its flags. Messages are checked only for their
 * prefix and the words "code field".
 */
import fc from 'fast-check'
import { vi } from 'vitest'
import {
  MODIFIER_ALIASES,
  formatHotkey,
  isSingleLetterKey,
  normalizeHotkey,
  normalizeKeyName,
  parseHotkey,
  validateHotkey,
} from '../../src'
import { SHARED_NAMED_KEYS } from '../../src/_named-keys'
import { TYPED_KEYS } from '../typed-keys'
import type {
  GeneratedHistories,
  Observation,
  Verdict,
} from '@tanstack/oracles'

const APPROVAL =
  'Proposed by an agent for Kevin Van Cott (KevinVandy) on 2026-11-21, pending his approval; see .tasks/tanstack-oracles/decisions.md.'

// Invisible characters, by code: an editor or formatter cannot turn them into look-alikes.
const NO_BREAK_SPACE = String.fromCharCode(0xa0)
const IDEOGRAPHIC_SPACE = String.fromCharCode(0x3000)
const COMBINING_ACUTE = String.fromCharCode(0x301)
const LINE_SEPARATOR = String.fromCharCode(0x2028)

// =============================================================================
// The model: spellings, resolution, key names, canonical and spelled-out
// strings, and validation issues. Nothing here imports runtime code from src.
// =============================================================================

const PLATFORMS = ['mac', 'windows', 'linux'] as const
type Platform = (typeof PLATFORMS)[number]
type Modifier = 'Control' | 'Alt' | 'Shift' | 'Meta'
type ModifierWord = Modifier | 'Mod'

/** Control, Alt, Shift, Meta: `MODIFIER_ORDER`'s JSDoc and `ParsedModifiers.modifiers`. */
const ORDER: ReadonlyArray<Modifier> = ['Control', 'Alt', 'Shift', 'Meta']

/**
 * The documented spellings of each modifier: the `Modifier` type in
 * `src/key.types.ts`, the canonical names, and `isModifierKey`'s JSDoc for the
 * DOM spellings `OS` and `Win`. `MODIFIER_ALIASES`'s JSDoc: "Case-insensitive
 * lookups are supported".
 */
const SPELLINGS: Readonly<Record<ModifierWord, ReadonlyArray<string>>> = {
  Control: ['Control', 'Ctrl'],
  Alt: ['Alt', 'Option'],
  Shift: ['Shift'],
  Meta: ['Meta', 'Command', 'Cmd', 'OS', 'Win'],
  Mod: ['Mod', 'CommandOrControl'],
}
const WORDS = Object.keys(SPELLINGS) as Array<ModifierWord>

/** The modifier a word names, in any case, or undefined. */
function modifierWord(word: string): ModifierWord | undefined {
  const lower = word.toLowerCase()
  return WORDS.find((modifier) =>
    SPELLINGS[modifier].some((spelling) => spelling.toLowerCase() === lower),
  )
}

/** `Mod` is Command (Meta) on macOS and Control elsewhere (Sensible Defaults, "`Mod` follows the platform"). */
function resolveWord(word: ModifierWord, platform: Platform): Modifier {
  return word === 'Mod' ? (platform === 'mac' ? 'Meta' : 'Control') : word
}

/** The modifier codes of the UI Events code spec, which validation calls modifier-only. */
const MODIFIER_CODES = ORDER.flatMap((modifier) => [
  `${modifier}Left`,
  `${modifier}Right`,
])

/** One Unicode letter, one code point (`isSingleLetterKey`'s JSDoc). */
function oneLetter(key: string): boolean {
  return [...key].length === 1 && /\p{Letter}/u.test(key)
}

/**
 * `normalizeKeyName`'s JSDoc and the long-s changeset: a single letter
 * becomes its uppercase when that is one character, except `ı` and `ſ`; the
 * space character becomes `Space`; every other name stays as written. A
 * missing key gives ''.
 */
function keyName(key: string | undefined): string {
  if (key === undefined || key === '') return ''
  if (key === ' ') return 'Space'
  if (oneLetter(key) && key !== 'ı' && key !== 'ſ') {
    const upper = key.toUpperCase()
    return [...upper].length === 1 ? upper : key
  }
  return key
}

/** A code name in the shape of `KeyboardEvent.code`: an uppercase letter, then letters and digits. */
const codeShaped = (name: string) => /^[A-Z][A-Za-z\d]*$/.test(name)

/** A key written in brackets, such as `[KeyS]` or `[Key S]`. */
const bracketed = (key: string) =>
  key.length > 1 && key.startsWith('[') && key.endsWith(']')

/** The physical code a written key names, or undefined for a logical key. */
function codeOf(key: string): string | undefined {
  return bracketed(key) && codeShaped(key.slice(1, -1))
    ? key.slice(1, -1)
    : undefined
}

/**
 * "One character, F1-F24, or a capitalized name such as `Escape`"
 * (`isKeyNameShape`'s JSDoc); `escape`, `ARROWUP`, `arrowUp`, `f1` and `F25`
 * are not (`tests/validate.test.ts`).
 */
function writtenLikeKeyName(key: string): boolean {
  return (
    [...key].length === 1 ||
    /^F(?:[1-9]|1\d|2[0-4])$/.test(key) ||
    /^[A-Z][a-z][A-Za-z\d]*$/.test(key)
  )
}

type Flags = { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean }
type Parsed = Flags & { modifiers: Array<Modifier> } & (
    | { key: string }
    | { code: string }
  )

const FLAG: Readonly<Record<Modifier, keyof Flags>> = {
  Control: 'ctrl',
  Alt: 'alt',
  Shift: 'shift',
  Meta: 'meta',
}

/** A resolution, with its modifiers listed in canonical order. */
function resolution(
  held: ReadonlySet<Modifier>,
  identity: { key: string } | { code: string },
): Parsed {
  return {
    ...identity,
    ctrl: held.has('Control'),
    shift: held.has('Shift'),
    alt: held.has('Alt'),
    meta: held.has('Meta'),
    modifiers: ORDER.filter((modifier) => held.has(modifier)),
  }
}

/** An unknown modifier registers nothing (changeset "reject unusable hotkeys"). */
const EMPTY_CHORD: Parsed = resolution(new Set(), { key: '' })

/** One chord as the plan gives it: written words and a key, or object fields. */
type ChordPlan =
  | {
      form: 'string'
      words: Array<string>
      key: string
      input: string
    }
  | {
      form: 'object' | 'parsed'
      raw: Partial<Flags> & { mod?: boolean }
      identity: { key: string } | { code: string }
      input: Record<string, unknown>
    }

/** What `parseHotkey` owes for one chord. */
function parsedChord(chord: ChordPlan, platform: Platform): Parsed {
  if (chord.form === 'string') {
    const words = chord.words.map(modifierWord)
    if (words.some((word) => word === undefined)) return EMPTY_CHORD
    const held = new Set(
      (words as Array<ModifierWord>).map((word) => resolveWord(word, platform)),
    )
    const code = codeOf(chord.key)
    return resolution(
      held,
      code !== undefined ? { code } : { key: keyName(chord.key) },
    )
  }
  // RawHotkeyChord's JSDoc: omitted modifiers are false, `mod` is the
  // platform's primary modifier.
  const held = new Set<Modifier>()
  for (const modifier of ORDER)
    if (chord.raw[FLAG[modifier]]) held.add(modifier)
  if (chord.raw.mod) held.add(resolveWord('Mod', platform))
  return resolution(
    held,
    'code' in chord.identity
      ? { code: chord.identity.code }
      : { key: keyName(chord.identity.key) },
  )
}

const identityText = (parsed: Parsed) =>
  'code' in parsed ? `[${parsed.code}]` : parsed.key

/** `normalizeHotkey`'s JSDoc: `Mod` first when the platform allows it, else literal modifiers in order. */
function canonical(parsed: Parsed, platform: Platform): string {
  const useMod =
    platform === 'mac'
      ? parsed.meta && !parsed.ctrl
      : parsed.ctrl && !parsed.meta
  const words = useMod
    ? [
        'Mod',
        ...(parsed.alt ? ['Alt'] : []),
        ...(parsed.shift ? ['Shift'] : []),
      ]
    : ORDER.filter((modifier) => parsed[FLAG[modifier]])
  return [...words, identityText(parsed)].join('+')
}

/** `formatHotkey`'s JSDoc: every held modifier spelled out in canonical order. */
function spelledOut(parsed: Parsed): string {
  return [
    ...ORDER.filter((modifier) => parsed[FLAG[modifier]]),
    identityText(parsed),
  ].join('+')
}

type Issue = { reason: string; part?: string; step?: number }
/** The issues of one chord string: exact lists, or for an empty part only that one error. */
type ChordIssues =
  | { exact: true; errors: Array<Issue>; warnings: Array<Issue> }
  | { exact: false; mustInclude: Issue }

/**
 * Issues by the reason definitions on `HotkeyIssueReason` and the examples in
 * `validateHotkey`'s JSDoc and `tests/validate.test.ts`.
 */
function chordIssues(parts: ReadonlyArray<string> | 'blank'): ChordIssues {
  if (parts === 'blank')
    return { exact: true, errors: [{ reason: 'empty' }], warnings: [] }
  if (parts.some((part) => part === ''))
    return { exact: false, mustInclude: { reason: 'empty-part' } }
  const words = parts.slice(0, -1)
  const key = parts.at(-1)!
  const code = codeOf(key)
  const errors: Array<Issue> = words
    .filter((word) => modifierWord(word) === undefined)
    .map((part) => ({ reason: 'unknown-modifier', part }))
  if (bracketed(key) && code === undefined)
    errors.push({ reason: 'invalid-physical-key', part: key })
  if (
    code !== undefined
      ? MODIFIER_CODES.includes(code)
      : modifierWord(key) !== undefined
  )
    errors.push({ reason: 'modifier-only', part: key })
  const warnings: Array<Issue> =
    code === undefined && !writtenLikeKeyName(key)
      ? [{ reason: 'unknown-key', part: key }]
      : []
  return { exact: true, errors, warnings }
}

// =============================================================================
// The key universe the histories draw from.
// =============================================================================

/** Letters chosen for their case behavior, then every letter of every plane. */
const CHOSEN_LETTERS = [
  ...'abcxyzABCXYZ',
  'é',
  'ü',
  'ø',
  'ñ',
  'ç',
  'ÿ',
  'ß',
  'ı',
  'İ',
  'i',
  'ſ',
  'ǅ',
  'ǰ',
  'ŉ',
  'µ',
  'ς',
  'σ',
  'ω',
  'ф',
  'ы',
  'Я',
  'ა',
  'ա',
  'ʰ',
  '字',
  'א',
  'ع',
  'ก',
  '\u{10428}', // Deseret small long i, uppercase U+10400
  '\u{10400}',
  '\u{1E922}', // ADLaM small alif, uppercase U+1E900
  '\u{1E900}',
  '\u{104D8}', // Osage small a
  '\u{10CC0}', // Old Hungarian small a
  '\u{20000}', // CJK Extension B, no case
]
const ALL_LETTERS: Array<string> = []
for (let point = 0; point <= 0x10ffff; point++) {
  if (point >= 0xd800 && point <= 0xdfff) continue
  const letter = String.fromCodePoint(point)
  if (/^\p{Letter}$/u.test(letter)) ALL_LETTERS.push(letter)
}
const ASTRAL_CASED = ALL_LETTERS.filter(
  (letter) =>
    letter.codePointAt(0)! > 0xffff &&
    letter.toUpperCase() !== letter &&
    [...letter.toUpperCase()].length === 1,
)

/** Single characters that are not letters; whitespace becomes empty in a string and is left out. */
const CHARACTERS = [
  ...TYPED_KEYS.filter((key) => [...key].length === 1 && !oneLetter(key)),
  '€',
  '§',
  '°',
  '¥',
  '½',
  COMBINING_ACUTE,
  '\u0007',
  '😀',
  '\u{1F3B9}',
]

/** Typed key names longer than one character: named, navigation, editing and function keys. */
const NAMED = TYPED_KEYS.filter((key) => [...key].length > 1)

/** Spellings that differ from a typed name only in case, and F-keys past F24. */
const MISWRITTEN = [
  ...new Set([
    ...NAMED.flatMap((name) => [
      name.toLowerCase(),
      name.toUpperCase(),
      name[0]!.toLowerCase() + name.slice(1),
    ]),
    ...Array.from({ length: 24 }, (_, i) => `f${i + 1}`),
    'F0',
    'F25',
    'F30',
    'F99',
  ]),
].filter(
  (key) =>
    !writtenLikeKeyName(key) &&
    modifierWord(key) === undefined &&
    !TYPED_KEYS.includes(key),
)

/** `PhysicalKeyCode` in `src/key.types.ts`, plus code-shaped names no table lists. */
const CODES = [
  ...[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter) => `Key${letter}`),
  ...[...'0123456789'].flatMap((digit) => [`Digit${digit}`, `Numpad${digit}`]),
  ...Array.from({ length: 24 }, (_, i) => `F${i + 1}`),
  ...SHARED_NAMED_KEYS,
  'Enter',
  'Escape',
  'Space',
  'Tab',
  'Backspace',
  'Delete',
  'ArrowUp',
  'Home',
  'PageDown',
  'Backquote',
  'BracketLeft',
  'IntlBackslash',
  'IntlYen',
  'Minus',
  'Slash',
  'Lang1',
  'NumpadAdd',
  'NumpadMemoryAdd',
  'LaunchApp1',
  // Code-shaped names that no table lists: the shape decides, not a table
  'A',
  'Q1',
  'Foo',
  'ShiftLeftX',
  'XShiftLeft',
  'OSLeft',
]

/** Bracketed keys that are not a code: empty, a space or symbol inside, a leading digit. */
const BAD_CODES = [
  '[]',
  '[Key S]',
  '[ KeyS]',
  '[KeyS ]',
  '[1Key]',
  '[Key-S]',
  '[Key_S]',
  '[Kéy]',
  '[[KeyS]]',
  '[KeyS]]',
  '[keyS ]',
]

/** Words that name no modifier in any case, including Object.prototype names. */
const UNKNOWN_WORDS = [
  'Ctl',
  'Super',
  'Hyper',
  'Fn',
  'AltGr',
  'AltGraph',
  'Shft',
  'Cmnd',
  'Command2',
  'Ctrl_',
  'Esc',
  'A',
  '1',
  'F1',
  '[ShiftLeft]',
  'toString',
  'constructor',
  '__proto__',
  'hasOwnProperty',
  'valueOf',
  'Super key',
  'İ',
]

const pick = <T>(list: ReadonlyArray<T>, index: number): T =>
  list[index % list.length]!

/** Writes a word in one of four cases: as given, lower, upper, or alternating. */
function inCase(word: string, casing: number): string {
  switch (casing % 4) {
    case 1:
      return word.toLowerCase()
    case 2:
      return word.toUpperCase()
    case 3:
      return [...word]
        .map((ch, i) => (i % 2 ? ch.toLowerCase() : ch.toUpperCase()))
        .join('')
    default:
      return word
  }
}

/** A name in the shape of a key name that no table lists, such as `Qab7`. */
function capitalizedName(seed: number): string {
  let rest = ''
  for (let n = (seed % 700) + 1; n > 0; n = Math.floor(n / 26))
    rest += String.fromCharCode(97 + (n % 26))
  return `Q${rest}${seed % 3 === 0 ? String(seed % 10) : ''}`
}

// =============================================================================
// Histories: words and a key per chord, never a joined string.
// =============================================================================

const KEY_KINDS = [
  'letter',
  'character',
  'named',
  'capitalized',
  'miswritten',
  'code',
  'modifier word',
  'modifier code',
  'space',
] as const
type KeyKind = (typeof KEY_KINDS)[number] | 'bad code'

type WordSpec =
  | { kind: 'known'; modifier: ModifierWord; spelling: number; casing: number }
  | { kind: 'unknown'; pick: number }
type KeySpec = { kind: KeyKind; pick: number; casing: number }
type ChordSpec = {
  words: Array<WordSpec>
  key: KeySpec
  form: 'string' | 'object' | 'parsed'
  /** Which unset object flags are written as false instead of omitted. */
  explicitFalse: number
  /** The order a parsed chord lists its modifiers in: a permutation index. */
  order: number
}

const wordSpec: fc.Arbitrary<WordSpec> = fc.oneof(
  {
    arbitrary: fc.record({
      kind: fc.constant('known' as const),
      modifier: fc.constantFrom(...WORDS),
      spelling: fc.nat({ max: 4 }),
      casing: fc.nat({ max: 3 }),
    }),
    weight: 6,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('unknown' as const),
      pick: fc.nat({ max: 63 }),
    }),
    weight: 1,
  },
)

const keySpec = (kinds: ReadonlyArray<KeyKind>): fc.Arbitrary<KeySpec> =>
  fc.record({
    kind: fc.constantFrom(...kinds),
    pick: fc.nat({ max: 1 << 20 }),
    casing: fc.nat({ max: 3 }),
  })

const chordSpec = (kinds: ReadonlyArray<KeyKind>): fc.Arbitrary<ChordSpec> =>
  fc.record({
    words: fc.array(wordSpec, { maxLength: 4 }),
    key: keySpec(kinds),
    form: fc.constantFrom(
      'string' as const,
      'object' as const,
      'parsed' as const,
    ),
    explicitFalse: fc.nat({ max: 31 }),
    order: fc.nat({ max: 23 }),
  })

function wordText(word: WordSpec): string {
  return word.kind === 'known'
    ? inCase(pick(SPELLINGS[word.modifier], word.spelling), word.casing)
    : word.pick < 48
      ? pick(UNKNOWN_WORDS, word.pick)
      : capitalizedName(word.pick)
}

/** The key as written in a chord string. */
function keyText(key: KeySpec): string {
  switch (key.kind) {
    case 'letter':
      return key.pick % 3 === 0
        ? pick(ALL_LETTERS, key.pick)
        : pick(CHOSEN_LETTERS, key.pick)
    case 'character':
      return pick(CHARACTERS, key.pick)
    case 'named':
      return pick(NAMED, key.pick)
    case 'capitalized':
      return capitalizedName(key.pick)
    case 'miswritten':
      return pick(MISWRITTEN, key.pick)
    case 'code':
      return `[${pick(CODES, key.pick)}]`
    case 'modifier word':
      return inCase(
        pick(SPELLINGS[pick(WORDS, key.pick)], key.pick >> 3),
        key.casing,
      )
    case 'modifier code':
      return `[${pick(MODIFIER_CODES, key.pick)}]`
    case 'space':
      return 'Space'
    case 'bad code':
      return pick(BAD_CODES, key.pick)
  }
}

/** The `index`-th ordering of a list: the type allows a parsed chord to list its modifiers in any order. */
function permuted<T>(list: ReadonlyArray<T>, index: number): Array<T> {
  const rest = [...list]
  const out: Array<T> = []
  for (let n = index; rest.length > 0; n = Math.floor(n / (rest.length + 1)))
    out.push(rest.splice(n % rest.length, 1)[0]!)
  return out
}

const OBJECT_FLAGS = ['ctrl', 'shift', 'alt', 'meta', 'mod'] as const

/** Builds the chord the history describes, as a string, a chord object, or a parsed chord. */
function chordPlan(spec: ChordSpec, platform: Platform): ChordPlan {
  const written = keyText(spec.key)
  if (spec.form === 'string') {
    const words = spec.words.map(wordText)
    return {
      form: 'string',
      words,
      key: written,
      input: [...words, written].join('+'),
    }
  }
  // Objects have no unknown words; a parsed chord holds resolved modifiers.
  const known = spec.words.flatMap((word) =>
    word.kind === 'known' ? [word.modifier] : [],
  )
  const raw: Partial<Flags> & { mod?: boolean } = {}
  for (const word of known) {
    const modifier = spec.form === 'parsed' ? resolveWord(word, platform) : word
    if (modifier === 'Mod') raw.mod = true
    else raw[FLAG[modifier]] = true
  }
  const identity: { key: string } | { code: string } =
    spec.key.kind === 'space'
      ? { key: ' ' }
      : codeOf(written) !== undefined
        ? { code: codeOf(written)! }
        : { key: written }
  if (spec.form === 'parsed') {
    const flags: Flags = {
      ctrl: !!raw.ctrl,
      shift: !!raw.shift,
      alt: !!raw.alt,
      meta: !!raw.meta,
    }
    return {
      form: 'parsed',
      raw: flags,
      identity,
      input: {
        ...identity,
        ...flags,
        modifiers: permuted(
          ORDER.filter((modifier) => flags[FLAG[modifier]]),
          spec.order,
        ),
      },
    }
  }
  OBJECT_FLAGS.forEach((flag, bit) => {
    if (!raw[flag] && spec.explicitFalse & (1 << bit)) raw[flag] = false
  })
  return { form: 'object', raw, identity, input: { ...identity, ...raw } }
}

type Shape = 'chord' | 'sequence' | 'empty'
const shape: fc.Arbitrary<Shape> = fc.oneof(
  { arbitrary: fc.constant('chord' as const), weight: 6 },
  { arbitrary: fc.constant('sequence' as const), weight: 3 },
  { arbitrary: fc.constant('empty' as const), weight: 1 },
)

type GrammarHistory = {
  platform: Platform
  /** The platform the stubbed `navigator` reports. */
  agent: Platform
  passPlatform: boolean
  shape: Shape
  steps: Array<ChordSpec>
}

const grammarHistory = (
  kinds: ReadonlyArray<KeyKind>,
): fc.Arbitrary<GrammarHistory> =>
  fc.record({
    platform: fc.constantFrom(...PLATFORMS),
    agent: fc.constantFrom(...PLATFORMS),
    passPlatform: fc.boolean(),
    shape,
    steps: fc.array(chordSpec(kinds), { minLength: 1, maxLength: 3 }),
  })

type GrammarPlan = {
  /** The platform production resolves for: the one passed, or the one `navigator` reports. */
  platform: Platform
  agent: Platform
  passPlatform: boolean
  shape: Shape
  chords: Array<ChordPlan>
  /** The chords as the history wrote them, when `chords` holds their resolutions. */
  written?: Array<ChordPlan>
  /** Each chosen step's modifier order, for parsed chords built from it. */
  orders: Array<number>
}

function grammarPlan(history: GrammarHistory): GrammarPlan {
  const platform = history.passPlatform ? history.platform : history.agent
  const steps =
    history.shape === 'empty'
      ? []
      : history.shape === 'chord'
        ? history.steps.slice(0, 1)
        : history.steps
  return {
    platform,
    agent: history.agent,
    passPlatform: history.passPlatform,
    shape: history.shape,
    chords: steps.map((step) => chordPlan(step, platform)),
    orders: steps.map((step) => step.order),
  }
}

const hotkeyInput = (plan: GrammarPlan): unknown =>
  plan.shape === 'chord'
    ? plan.chords[0]!.input
    : plan.chords.map((chord) => chord.input)

// =============================================================================
// The driver: a stubbed navigator, then one call, recorded as data.
// =============================================================================

const USER_AGENTS: Readonly<
  Record<Platform, { userAgent: string; platform: string }>
> = {
  mac: {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    platform: 'MacIntel',
  },
  windows: {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    platform: 'Win32',
  },
  linux: {
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    platform: 'Linux x86_64',
  },
}

/** A return value, or a thrown value: an Error's message, or another thrown value as text. */
type Outcome = { value: unknown } | { error: string; thrown: 'Error' | 'other' }

function attempt(run: () => unknown): Outcome {
  try {
    return { value: run() }
  } catch (error) {
    return error instanceof Error
      ? { error: error.message, thrown: 'Error' }
      : { error: String(error), thrown: 'other' }
  }
}

/** Runs a call with `navigator` reporting the history's agent platform. */
function onAgent<T>(agent: Platform, run: () => T): T {
  vi.stubGlobal('navigator', { ...USER_AGENTS[agent] })
  try {
    return run()
  } finally {
    vi.unstubAllGlobals()
  }
}

type GrammarCall = (input: never, platform?: Platform) => unknown
function driveGrammar(call: GrammarCall) {
  return (
    plan: GrammarPlan,
    observe: (checkpoint: string, value: unknown) => void,
  ) => {
    const input = hotkeyInput(plan) as never
    observe(
      'result',
      onAgent(plan.agent, () =>
        attempt(() =>
          plan.passPlatform ? call(input, plan.platform) : call(input),
        ),
      ),
    )
  }
}

const resultOf = (trace: ReadonlyArray<Observation>) =>
  trace.find((observation) => observation.checkpoint === 'result')?.value

function checkResult(law: string) {
  return (
    _plan: unknown,
    trace: ReadonlyArray<Observation>,
    expected: Outcome,
  ): Verdict => differs('result', law, resultOf(trace), expected) ?? pass
}

/** Replaces the recorded result with a wrong one, for calibrations. */
function replaceResult(wrong: (value: unknown) => unknown) {
  return (trace: ReadonlyArray<Observation>) =>
    trace.map((observation) =>
      observation.checkpoint === 'result' &&
      'value' in (observation.value as object)
        ? {
            ...observation,
            value: {
              value: wrong((observation.value as { value: unknown }).value),
            },
          }
        : observation,
    )
}

// =============================================================================
// Reach: the states the laws need, read from the plan.
// =============================================================================

function grammarReach(plan: GrammarPlan): Array<string> {
  const states = new Set<string>()
  if (!plan.passPlatform) states.add('platform from navigator')
  if (plan.shape === 'empty') states.add('empty sequence')
  if (plan.shape === 'sequence')
    states.add(plan.chords.length === 1 ? 'one-step sequence' : 'sequence')
  for (const chord of plan.chords)
    if (
      chord.form === 'parsed' &&
      JSON.stringify(chord.input.modifiers) !==
        JSON.stringify(
          ORDER.filter((modifier) =>
            (chord.input.modifiers as Array<Modifier>).includes(modifier),
          ),
        )
    )
      states.add('modifiers listed out of order')
  for (const chord of plan.written ?? plan.chords) {
    states.add(`${chord.form} form`)
    if (chord.form === 'string') {
      const words = chord.words.map(modifierWord)
      if (words.some((word) => word === undefined)) {
        states.add('unknown modifier')
        continue
      }
      if (words.includes('Mod'))
        states.add(
          plan.platform === 'mac' ? 'Mod as Command' : 'Mod as Control',
        )
      const resolved = (words as Array<ModifierWord>).map((word) =>
        resolveWord(word, plan.platform),
      )
      if (new Set(resolved).size < resolved.length)
        states.add('a modifier written twice')
      if (chord.words.some((word) => word !== modifierWord(word)))
        states.add('alias or case variant')
      if (chord.key === '+') states.add('plus key')
    }
    const key =
      chord.form === 'string'
        ? codeOf(chord.key) === undefined
          ? chord.key
          : undefined
        : 'key' in chord.identity
          ? chord.identity.key
          : undefined
    if (key === undefined) states.add('physical code')
    else if (oneLetter(key)) {
      if (keyName(key) !== key) states.add('letter uppercased')
      else if (key.toUpperCase() !== key) states.add('letter kept lowercase')
      if (ASTRAL_CASED.includes(key)) states.add('astral letter')
    } else if (key === ' ') states.add('space character')
  }
  return [...states]
}

const GRAMMAR_STATES = [
  'platform from navigator',
  'empty sequence',
  'one-step sequence',
  'sequence',
  'string form',
  'object form',
  'parsed form',
  'unknown modifier',
  'Mod as Command',
  'Mod as Control',
  'a modifier written twice',
  'alias or case variant',
  'plus key',
  'physical code',
  'letter uppercased',
  'letter kept lowercase',
  'astral letter',
  'space character',
  'modifiers listed out of order',
]

/** Constructed histories that enter each grammar state, built from a generated one. */
type Build = (g: GrammarHistory) => GrammarHistory
const firstStep = (
  g: GrammarHistory,
  patch: Partial<ChordSpec>,
): GrammarHistory => ({
  ...g,
  shape: 'chord',
  steps: [{ ...g.steps[0]!, ...patch }],
})
const known = (modifier: ModifierWord, spelling = 0, casing = 0): WordSpec => ({
  kind: 'known',
  modifier,
  spelling,
  casing,
})
/** A pick that `keyText` maps to the letter at `index` of its list. */
function letterPick(list: ReadonlyArray<string>, index: number): number {
  const fromAll = list === ALL_LETTERS
  for (let p = index; p < 1 << 20; p += list.length)
    if ((p % 3 === 0) === fromAll) return p
  throw new Error(`no pick reaches letter ${index}`)
}
const letterKey = (letter: string): KeySpec => ({
  kind: 'letter',
  pick: letterPick(CHOSEN_LETTERS, CHOSEN_LETTERS.indexOf(letter)),
  casing: 0,
})
const astralLetterKey = (g: GrammarHistory): KeySpec => ({
  kind: 'letter',
  pick: letterPick(
    ALL_LETTERS,
    ALL_LETTERS.indexOf(pick(ASTRAL_CASED, g.steps[0]!.key.pick)),
  ),
  casing: 0,
})

const GRAMMAR_CONSTRUCTED: ReadonlyArray<{
  name: string
  enters: Array<string>
  build: Build
}> = [
  {
    name: 'a chord resolved for the navigator platform',
    enters: ['platform from navigator', 'string form'],
    build: (g) => ({
      ...firstStep(g, { form: 'string' }),
      passPlatform: false,
    }),
  },
  {
    name: 'an empty sequence',
    enters: ['empty sequence'],
    build: (g) => ({ ...g, shape: 'empty' }),
  },
  {
    name: 'a one-step sequence',
    enters: ['one-step sequence'],
    build: (g) => ({ ...g, shape: 'sequence', steps: g.steps.slice(0, 1) }),
  },
  {
    name: 'a three-step sequence of every form',
    enters: ['sequence', 'string form', 'object form', 'parsed form'],
    build: (g) => {
      const step = g.steps[0]!
      return {
        ...g,
        shape: 'sequence',
        steps: [
          { ...step, form: 'string' },
          { ...step, form: 'object' },
          { ...step, form: 'parsed' },
        ],
      }
    },
  },
  {
    name: 'an unknown modifier word',
    enters: ['unknown modifier', 'string form'],
    build: (g) =>
      firstStep(g, {
        form: 'string',
        words: [
          ...g.steps[0]!.words.slice(0, 3),
          { kind: 'unknown', pick: g.steps[0]!.key.pick % 64 },
        ],
      }),
  },
  {
    name: 'Mod on macOS',
    enters: ['Mod as Command', 'string form'],
    build: (g) => ({
      ...firstStep(g, {
        form: 'string',
        words: [known('Mod', g.steps[0]!.key.pick % 5)],
      }),
      platform: 'mac',
      passPlatform: true,
    }),
  },
  {
    name: 'Mod on Windows',
    enters: ['Mod as Control', 'string form'],
    build: (g) => ({
      ...firstStep(g, {
        form: 'string',
        words: [known('Mod'), known('Shift')],
      }),
      platform: 'windows',
      passPlatform: true,
    }),
  },
  {
    name: 'Mod written beside Control on Linux',
    enters: ['a modifier written twice', 'Mod as Control', 'string form'],
    build: (g) => ({
      ...firstStep(g, {
        form: 'string',
        words: [known('Mod'), known('Control', 1, 1)],
      }),
      platform: 'linux',
      passPlatform: true,
    }),
  },
  {
    name: 'every spelling in alternating case',
    enters: ['alias or case variant', 'string form'],
    build: (g) =>
      firstStep(g, {
        form: 'string',
        words: [
          known('Control', 1, 3),
          known('Alt', 1, 2),
          known('Meta', 4, 1),
        ],
      }),
  },
  {
    name: 'the plus key',
    enters: ['plus key', 'string form'],
    build: (g) =>
      firstStep(g, {
        form: 'string',
        words: [known('Control')],
        key: { kind: 'character', pick: CHARACTERS.indexOf('+'), casing: 0 },
      }),
  },
  {
    name: 'a physical code',
    enters: ['physical code'],
    build: (g) =>
      firstStep(g, {
        words: g.steps[0]!.words.filter((word) => word.kind === 'known'),
        key: { kind: 'code', pick: g.steps[0]!.key.pick, casing: 0 },
      }),
  },
  {
    name: 'a lowercase letter in an object',
    enters: ['letter uppercased', 'object form'],
    build: (g) => firstStep(g, { form: 'object', key: letterKey('a') }),
  },
  {
    name: 'dotless i in a parsed chord',
    enters: ['letter kept lowercase', 'parsed form'],
    build: (g) => firstStep(g, { form: 'parsed', key: letterKey('ı') }),
  },
  {
    name: 'an astral lowercase letter',
    enters: ['astral letter', 'letter uppercased', 'string form'],
    build: (g) =>
      firstStep(g, {
        form: 'string',
        words: g.steps[0]!.words.filter((word) => word.kind === 'known'),
        key: astralLetterKey(g),
      }),
  },
  {
    name: 'a parsed chord listing its modifiers out of order',
    enters: ['modifiers listed out of order', 'parsed form'],
    build: (g) => ({
      ...firstStep(g, {
        form: 'parsed',
        words: [known('Shift'), known('Alt'), known('Control')],
        order: 5,
      }),
      platform: 'mac',
    }),
  },
  {
    name: 'the space character in an object',
    enters: ['space character', 'object form'],
    build: (g) =>
      firstStep(g, {
        form: 'object',
        key: { kind: 'space', pick: 0, casing: 0 },
      }),
  },
]

const PARSE_KINDS: ReadonlyArray<KeyKind> = KEY_KINDS

// =============================================================================
// Law: parseHotkey
// =============================================================================

function expectedParse(plan: GrammarPlan): Outcome {
  const parsed = plan.chords.map((chord) => parsedChord(chord, plan.platform))
  return { value: plan.shape === 'chord' ? parsed[0] : parsed }
}

oracleProperty({
  id: 'hotkey-grammar.parse',
  law: {
    statement:
      'For every chord written as modifier words and a key, as a chord object, or as a parsed chord, and every sequence of them, on every platform, parseHotkey returns the resolution: ctrl, shift, alt and meta true exactly for the modifiers written (Mod as Meta on macOS and Control elsewhere; omitted object flags false), modifiers listing them in Control, Alt, Shift, Meta order, and code for a bracketed code or key for the stored key name; an unknown modifier word gives { key: "" } with no modifiers; a sequence gives one resolution per step; without a platform, the platform navigator reports.',
    authority: `parseHotkey JSDoc (src/parse.ts:179-194); RawHotkeyChord JSDoc "Omitted modifiers default to false" (src/hotkey.types.ts:182-200); ParsedModifiers "Required modifiers in canonical order" (src/hotkey.types.ts:149); Sensible Defaults, "Mod follows the platform" (docs/guides/sensible-defaults.md:32) and "every physical code goes in brackets" (:79); the Hotkeys guide, "{ key: 'S', mod: true, shift: true } // Same as 'Mod+Shift+S'" (docs/framework/react/guides/hotkeys.md:94); tests/parse.test.ts "case insensitivity" and "should maintain canonical modifier order"; changeset reject-unusable-hotkeys (779b8a4a): "parseHotkey now returns an empty key for it". ${APPROVAL}`,
    limits:
      'Words with surrounding whitespace, half-bracketed keys, bracketed lowercase or malformed names, and empty parts are not generated: no authority says what they parse to.',
  },
  owns: ['src/parse.ts#parseHotkey'],
  histories: {
    arbitrary: grammarHistory(PARSE_KINDS),
    runs: 100,
    fixedSeeds: [20261121],
    states: GRAMMAR_STATES,
    constructed: GRAMMAR_CONSTRUCTED,
  },
  resolve: grammarPlan,
  model: expectedParse,
  reached: grammarReach,
  driver: driveGrammar(parseHotkey as GrammarCall),
  check: checkResult('parse result'),
  calibrations: [
    {
      name: 'modifiers in written order',
      law: 'parse result',
      history: { constructed: 'every spelling in alternating case' },
      corrupt: replaceResult((value) => ({
        ...(value as Parsed),
        modifiers: [...(value as Parsed).modifiers].reverse(),
      })),
    },
    {
      name: 'Mod as Control on macOS',
      law: 'parse result',
      history: { constructed: 'Mod on macOS' },
      corrupt: replaceResult((value) => ({
        ...(value as Parsed),
        ctrl: true,
        meta: false,
      })),
    },
  ],
})

// =============================================================================
// Law: normalizeHotkey
// =============================================================================

function expectedNormalize(plan: GrammarPlan): Outcome {
  const strings = plan.chords.map((chord) =>
    canonical(parsedChord(chord, plan.platform), plan.platform),
  )
  return {
    value:
      plan.shape === 'chord' || strings.length === 1 ? strings[0] : strings,
  }
}

oracleProperty({
  id: 'hotkey-grammar.normalize',
  law: {
    statement:
      'For every chord written as modifier words and a key, as a chord object, or as a parsed chord, on every platform, normalizeHotkey returns Mod, then Alt, then Shift, then the key when the platform\'s primary modifier (Meta on macOS, Control elsewhere) is held without the other one of Control and Meta, and otherwise the held modifiers in Control, Alt, Shift, Meta order, then the key; the key is the stored key name, or the code in brackets; an unknown modifier word gives ""; a sequence gives one string per step, and a one-step sequence its chord\'s string.',
    authority: `normalizeHotkey JSDoc (src/parse.ts:216-239); Sensible Defaults, "On Windows and Linux, Control+S and ctrl+s are stored as Mod+S. On macOS, Control+S remains Control+S" (docs/guides/sensible-defaults.md:34); the Formatting guide, "normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'" (docs/framework/react/guides/formatting-display.md:379); tests/parse.test.ts "normalizeHotkey"; changeset reject-unusable-hotkeys (779b8a4a): "so normalizeHotkey and formatForDisplay return an empty string". ${APPROVAL}`,
    limits:
      'The same spellings as the parse law are left out. A keyless chord with modifiers, such as Control+ , is not generated: its canonical string would name the + key.',
  },
  owns: ['src/parse.ts#normalizeHotkey'],
  histories: {
    arbitrary: grammarHistory(PARSE_KINDS),
    runs: 100,
    fixedSeeds: [20261121],
    states: GRAMMAR_STATES,
    constructed: GRAMMAR_CONSTRUCTED,
  },
  resolve: grammarPlan,
  model: expectedNormalize,
  reached: grammarReach,
  driver: driveGrammar(normalizeHotkey as GrammarCall),
  check: checkResult('canonical string'),
  calibrations: [
    {
      name: 'Control kept on Windows',
      law: 'canonical string',
      history: { constructed: 'Mod on Windows' },
      corrupt: replaceResult((value) =>
        String(value).replace('Mod', 'Control'),
      ),
    },
    {
      name: 'a one-step sequence kept as an array',
      law: 'canonical string',
      history: { constructed: 'a one-step sequence' },
      corrupt: replaceResult((value) => [value]),
    },
  ],
})

// =============================================================================
// Law: formatHotkey
// =============================================================================

function formatPlan(history: GrammarHistory): GrammarPlan {
  // formatHotkey takes parsed chords: the resolution of each step.
  const plan = grammarPlan(history)
  return {
    ...plan,
    written: plan.chords,
    chords: plan.chords.map((chord, index): ChordPlan => {
      const parsed = parsedChord(chord, plan.platform)
      const identity =
        'code' in parsed ? { code: parsed.code } : { key: parsed.key }
      return {
        form: 'parsed',
        raw: {
          ctrl: parsed.ctrl,
          shift: parsed.shift,
          alt: parsed.alt,
          meta: parsed.meta,
        },
        identity,
        input: {
          ...parsed,
          modifiers: permuted(parsed.modifiers, plan.orders[index]!),
        },
      }
    }),
  }
}

function expectedFormat(plan: GrammarPlan): Outcome {
  const strings = plan.chords.map((chord) =>
    spelledOut(parsedChord(chord, plan.platform)),
  )
  return { value: plan.shape === 'chord' ? strings[0] : strings }
}

oracleProperty({
  id: 'hotkey-grammar.format',
  law: {
    statement:
      'For every parsed chord, formatHotkey returns its held modifiers spelled out in Control, Alt, Shift, Meta order, never Mod, then its key, or its code in brackets, joined by +; the empty chord gives ""; a parsed sequence gives one string per step, as an array even for one step.',
    authority: `formatHotkey JSDoc, "with each platform modifier spelled out, such as Control+Shift+S ... a parsed sequence returns one string per step" (src/format.ts:25-38); MODIFIER_ORDER JSDoc, "the standard order in which modifiers should appear when formatting hotkeys" (src/constants.ts:3-16); tests/format.test.ts "formatHotkey". ${APPROVAL}`,
    limits:
      'Parsed chords hold a stored key name and modifiers that match their flags, as parseHotkey returns them.',
  },
  owns: ['src/format.ts#formatHotkey'],
  histories: {
    arbitrary: grammarHistory(PARSE_KINDS),
    runs: 100,
    fixedSeeds: [20261121],
    states: GRAMMAR_STATES,
    constructed: GRAMMAR_CONSTRUCTED,
  },
  resolve: formatPlan,
  model: expectedFormat,
  // Reach reads the chords as the history wrote them, before resolution.
  reached: grammarReach,
  driver: driveGrammar(formatHotkey as GrammarCall),
  check: checkResult('spelled-out string'),
  calibrations: [
    {
      name: 'Mod written back',
      law: 'spelled-out string',
      history: { constructed: 'Mod on macOS' },
      corrupt: replaceResult((value) => String(value).replace('Meta', 'Mod')),
    },
  ],
})

// =============================================================================
// Law: validateHotkey
// =============================================================================

type ValidateStep = {
  blank: boolean
  words: Array<WordSpec>
  key: KeySpec
  /** Where an empty part goes among the words, or none when negative. */
  emptyAt: number
}
type ValidateHistory = { shape: Shape; steps: Array<ValidateStep> }
type ValidatePlan = {
  shape: Shape
  steps: Array<{ parts: Array<string> | 'blank'; input: string }>
}

const validateHistory: fc.Arbitrary<ValidateHistory> = fc.record({
  shape,
  steps: fc.array(
    fc.record({
      blank: fc.oneof(
        { arbitrary: fc.constant(false), weight: 12 },
        { arbitrary: fc.constant(true), weight: 1 },
      ),
      words: fc.array(wordSpec, { maxLength: 4 }),
      key: keySpec([...KEY_KINDS, 'bad code']),
      emptyAt: fc.integer({ min: -8, max: 4 }),
    }),
    { minLength: 1, maxLength: 3 },
  ),
})

function validatePlan(history: ValidateHistory): ValidatePlan {
  const steps =
    history.shape === 'empty'
      ? []
      : history.shape === 'chord'
        ? history.steps.slice(0, 1)
        : history.steps
  return {
    shape: history.shape,
    steps: steps.map((step) => {
      if (step.blank) return { parts: 'blank', input: '' }
      const parts = [...step.words.map(wordText), keyText(step.key)]
      // An empty part goes before the key: a trailing + is the plus key.
      if (step.emptyAt >= 0)
        parts.splice(Math.min(step.emptyAt, step.words.length), 0, '')
      return { parts, input: parts.join('+') }
    }),
  }
}

type ExpectedValidation = {
  valid: boolean
  /** Issues per step; `step` is the index a sequence of two or more gives them. */
  steps: Array<{ step: number | undefined; issues: ChordIssues }>
}

/**
 * `validateHotkey`'s JSDoc: "Issues in a sequence carry the index of their
 * step", and the `'empty'` reason: "the hotkey or sequence is empty". A
 * one-step sequence is its chord (`HotkeySequence`'s JSDoc).
 */
function expectedValidation(plan: ValidatePlan): ExpectedValidation {
  if (plan.shape === 'empty')
    return {
      valid: false,
      steps: [
        {
          step: undefined,
          issues: { exact: true, errors: [{ reason: 'empty' }], warnings: [] },
        },
      ],
    }
  const numbered = plan.shape === 'sequence' && plan.steps.length > 1
  const steps = plan.steps.map((step, index) => ({
    step: numbered ? index : undefined,
    issues: chordIssues(step.parts),
  }))
  return {
    valid: steps.every(
      ({ issues }) => issues.exact && issues.errors.length === 0,
    ),
    steps,
  }
}

const issueOrder = (issues: ReadonlyArray<Issue>) =>
  issues.map((issue) => JSON.stringify(issue)).sort()

type ValidationResult = {
  valid: boolean
  errors: Array<Issue>
  warnings: Array<Issue>
}

/** A ValidationResult: `valid`, and arrays of issue objects. Anything else breaks the law that reads it. */
function asValidation(outcome: unknown): ValidationResult | undefined {
  const value = (outcome as { value?: unknown } | undefined)?.value as
    | Partial<ValidationResult>
    | null
    | undefined
  const issues = (list: unknown) =>
    Array.isArray(list) &&
    list.every((issue) => typeof issue === 'object' && issue !== null)
  return typeof value === 'object' &&
    value !== null &&
    typeof value.valid === 'boolean' &&
    issues(value.errors) &&
    issues(value.warnings)
    ? (value as ValidationResult)
    : undefined
}

function checkValidation(
  _plan: ValidatePlan,
  trace: ReadonlyArray<Observation>,
  expected: ExpectedValidation,
): Verdict {
  const result = resultOf(trace)
  const seen = asValidation(result)
  if (!seen)
    return violation('result', 'not a validation result', 'issues', {
      actual: result,
      expected: 'a validation result',
    })
  const verdict = differs(
    'result',
    'issues',
    seen.valid,
    expected.valid,
    'valid',
  )
  if (verdict) return verdict
  const steps = new Set(expected.steps.map(({ step }) => step))
  for (const issue of [...seen.errors, ...seen.warnings])
    if (!steps.has(issue.step))
      return violation('result', `an issue for step ${issue.step}`, 'issues', {
        actual: issue,
        expected: [...steps],
      })
  for (const { step, issues } of expected.steps) {
    const errors = seen.errors.filter((issue) => issue.step === step)
    const warnings = seen.warnings.filter((issue) => issue.step === step)
    const withStep = (list: Array<Issue>) =>
      list.map((issue) => (step === undefined ? issue : { ...issue, step }))
    if (issues.exact) {
      const verdict =
        differs(
          'result',
          'issues',
          issueOrder(errors),
          issueOrder(withStep(issues.errors)),
          `errors of step ${step}`,
        ) ??
        differs(
          'result',
          'issues',
          issueOrder(warnings),
          issueOrder(withStep(issues.warnings)),
          `warnings of step ${step}`,
        )
      if (verdict) return verdict
    } else if (
      !errors.some((issue) => issue.reason === issues.mustInclude.reason)
    )
      return violation(
        'result',
        `no ${issues.mustInclude.reason} error for step ${step}`,
        'issues',
        {
          actual: errors,
          expected: issues.mustInclude,
        },
      )
  }
  return pass
}

function validateReach(plan: ValidatePlan): Array<string> {
  const states = new Set<string>()
  if (plan.shape === 'empty') states.add('empty sequence')
  if (plan.shape === 'sequence' && plan.steps.length > 1)
    states.add('numbered steps')
  if (plan.shape === 'sequence' && plan.steps.length === 1)
    states.add('one-step sequence')
  for (const { parts } of plan.steps) {
    const issues = chordIssues(parts)
    if (!issues.exact) {
      states.add('empty part')
      continue
    }
    if (parts === 'blank') states.add('empty string')
    else {
      const key = parts.at(-1)!
      if (['[', ']'].includes(key)) states.add('lone bracket')
      if (/^F\d+$/.test(key) && Number(key.slice(1)) > 24)
        states.add('F-key past F24')
      if (/^[A-Z][a-z][A-Za-z]*\d/.test(key)) states.add('digit in a name')
      const code = codeOf(key)
      if (
        code !== undefined &&
        !MODIFIER_CODES.includes(code) &&
        MODIFIER_CODES.some((m) => code.includes(m))
      )
        states.add('code containing a modifier code')
    }
    for (const issue of [...issues.errors, ...issues.warnings])
      states.add(issue.reason)
    if (issues.errors.length + issues.warnings.length === 0)
      states.add('no issues')
    if (issues.errors.length > 1) states.add('several errors')
  }
  return [...states]
}

type ValidateBuild = (g: ValidateHistory) => ValidateHistory
const oneStep = (
  g: ValidateHistory,
  patch: Partial<ValidateStep>,
): ValidateHistory => ({
  shape: 'chord',
  steps: [{ ...g.steps[0]!, blank: false, emptyAt: -1, ...patch }],
})
const VALIDATE_CONSTRUCTED: ReadonlyArray<{
  name: string
  enters: Array<string>
  build: ValidateBuild
}> = [
  {
    name: 'an empty sequence',
    enters: ['empty sequence'],
    build: (g) => ({ ...g, shape: 'empty' }),
  },
  {
    name: 'an empty string',
    enters: ['empty string'],
    build: (g) => oneStep(g, { blank: true }),
  },
  {
    name: 'a one-step sequence with an unknown modifier',
    enters: ['one-step sequence', 'unknown-modifier'],
    build: (g) => ({
      shape: 'sequence',
      steps: [
        {
          ...g.steps[0]!,
          blank: false,
          emptyAt: -1,
          words: [{ kind: 'unknown', pick: 0 }],
        },
      ],
    }),
  },
  {
    name: 'two steps, the second miswritten',
    enters: ['numbered steps', 'unknown-key', 'no issues'],
    build: (g) => ({
      shape: 'sequence',
      steps: [
        {
          ...g.steps[0]!,
          blank: false,
          emptyAt: -1,
          words: [],
          key: { kind: 'named', pick: 0, casing: 0 },
        },
        {
          ...g.steps[0]!,
          blank: false,
          emptyAt: -1,
          key: { kind: 'miswritten', pick: g.steps[0]!.key.pick, casing: 0 },
        },
      ],
    }),
  },
  {
    name: 'an empty part',
    enters: ['empty part'],
    build: (g) => oneStep(g, { emptyAt: g.steps[0]!.key.pick % 5 }),
  },
  {
    name: 'a bracketed key that is not a code',
    enters: ['invalid-physical-key'],
    build: (g) => oneStep(g, { key: { ...g.steps[0]!.key, kind: 'bad code' } }),
  },
  {
    name: 'a modifier code as the key, after an unknown word',
    enters: ['modifier-only', 'unknown-modifier', 'several errors'],
    build: (g) =>
      oneStep(g, {
        words: [{ kind: 'unknown', pick: g.steps[0]!.key.pick % 48 }],
        key: { ...g.steps[0]!.key, kind: 'modifier code' },
      }),
  },
  {
    name: 'a modifier word as the key',
    enters: ['modifier-only'],
    build: (g) =>
      oneStep(g, { key: { ...g.steps[0]!.key, kind: 'modifier word' } }),
  },
  {
    name: 'a lone bracket key',
    enters: ['lone bracket', 'no issues'],
    build: (g) =>
      oneStep(g, {
        words: [known('Control')],
        key: {
          kind: 'character',
          pick: CHARACTERS.indexOf(g.steps[0]!.key.pick % 2 ? '[' : ']'),
          casing: 0,
        },
      }),
  },
  {
    name: 'F25',
    enters: ['F-key past F24'],
    build: (g) =>
      oneStep(g, {
        key: { kind: 'miswritten', pick: MISWRITTEN.indexOf('F25'), casing: 0 },
      }),
  },
  {
    name: 'a named key with a digit',
    enters: ['digit in a name'],
    build: (g) =>
      oneStep(g, {
        key: {
          kind: 'named',
          pick: NAMED.indexOf('LaunchApplication1'),
          casing: 0,
        },
      }),
  },
  {
    name: 'a capitalized name with a digit',
    enters: ['digit in a name'],
    build: (g) =>
      oneStep(g, {
        key: {
          kind: 'capitalized',
          pick: 3 * (g.steps[0]!.key.pick % 200),
          casing: 0,
        },
      }),
  },
  {
    name: 'a code that starts with a modifier code',
    enters: ['code containing a modifier code'],
    build: (g) =>
      oneStep(g, {
        key: { kind: 'code', pick: CODES.indexOf('ShiftLeftX'), casing: 0 },
      }),
  },
  {
    name: 'a code that ends with a modifier code',
    enters: ['code containing a modifier code'],
    build: (g) =>
      oneStep(g, {
        key: { kind: 'code', pick: CODES.indexOf('XShiftLeft'), casing: 0 },
      }),
  },
  {
    name: 'a capitalized name no table lists',
    enters: ['no issues'],
    build: (g) =>
      oneStep(g, {
        words: [known('Mod')],
        key: { ...g.steps[0]!.key, kind: 'capitalized' },
      }),
  },
]

oracleProperty({
  id: 'hotkey-grammar.validate',
  law: {
    statement:
      'For every hotkey string written as modifier words and a key, and every sequence of them, validateHotkey reports one unknown-modifier error per word that names no modifier, an invalid-physical-key error for a bracketed key that is not a code, a modifier-only error for a key that is a modifier or a modifier code, and an unknown-key warning for a logical key not written like a key name (one character, F1-F24, or a capitalized name); an empty part gives an empty-part error; "" and [] give exactly { reason: "empty" }; valid is true exactly when there are no errors; in a sequence of two or more steps, each issue carries its step.',
    authority: `validateHotkey JSDoc and examples (src/validate.ts:14-39); HotkeyIssueReason definitions (src/validate.ts:185-195); isKeyNameShape JSDoc, "one character, F1-F24, or a capitalized name such as Escape" (src/_chord.ts:57-61); HotkeySequence JSDoc, "A one-step sequence is treated as its single chord" (src/hotkey.types.ts:213); tests/validate.test.ts (exact error lists for '', 'Unknown+A', modifier-only hotkeys, sequence steps, 'Control+escape', and the shape examples); changesets reason-codes and reject-unusable-hotkeys (779b8a4a), case-sensitive-key-names (8b93ed50). ${APPROVAL}`,
    limits:
      'The order of issues is not checked. For a chord with an empty part only the empty-part error is checked. Words with surrounding whitespace, whitespace-only hotkeys, half-bracketed keys such as [a, and bracketed lowercase names such as [keys] are not generated: no authority decides their issues.',
  },
  owns: ['src/validate.ts#validateHotkey'],
  histories: {
    arbitrary: validateHistory,
    runs: 100,
    fixedSeeds: [20261121],
    states: [
      'empty sequence',
      'empty string',
      'one-step sequence',
      'numbered steps',
      'empty part',
      'unknown-modifier',
      'invalid-physical-key',
      'modifier-only',
      'unknown-key',
      'no issues',
      'several errors',
      'lone bracket',
      'F-key past F24',
      'digit in a name',
      'code containing a modifier code',
    ],
    measured: ['empty'],
    constructed: VALIDATE_CONSTRUCTED,
  },
  resolve: validatePlan,
  model: expectedValidation,
  reached: validateReach,
  driver: (plan, observe) => {
    const input =
      plan.shape === 'chord'
        ? plan.steps[0]!.input
        : plan.steps.map((step) => step.input)
    observe(
      'result',
      attempt(() => validateHotkey(input)),
    )
  },
  check: checkValidation,
  calibrations: [
    {
      name: 'a warning without its step',
      law: 'issues',
      history: { constructed: 'two steps, the second miswritten' },
      corrupt: replaceResult((value) => {
        const result = value as { warnings: Array<Issue> }
        return {
          ...result,
          warnings: result.warnings.map(({ step: _step, ...issue }) => issue),
        }
      }),
    },
    {
      name: 'an unknown modifier dropped',
      law: 'issues',
      history: {
        constructed: 'a modifier code as the key, after an unknown word',
      },
      corrupt: replaceResult((value) => {
        const result = value as { errors: Array<Issue> }
        return {
          ...result,
          errors: result.errors.filter(
            ({ reason }) => reason !== 'unknown-modifier',
          ),
        }
      }),
    },
  ],
})

// =============================================================================
// Law: a key field never holds a bracketed token
// =============================================================================

const PADS = ['', ' ', '  ', '\t', '\n', NO_BREAK_SPACE, IDEOGRAPHIC_SPACE]
type BracketHistory = {
  inner: string
  left: number
  right: number
  form: 'object' | 'parsed'
  call: 'parse' | 'normalize' | 'format'
  inSequence: boolean
  flags: number
  platform: Platform
}
type BracketPlan = BracketHistory & { key: string; input: unknown }

const bracketHistory: fc.Arbitrary<BracketHistory> = fc.record({
  inner: fc.string({ unit: 'binary', maxLength: 6 }),
  left: fc.nat({ max: PADS.length - 1 }),
  right: fc.nat({ max: PADS.length - 1 }),
  form: fc.constantFrom('object' as const, 'parsed' as const),
  call: fc.constantFrom(
    'parse' as const,
    'normalize' as const,
    'format' as const,
  ),
  inSequence: fc.boolean(),
  flags: fc.nat({ max: 31 }),
  platform: fc.constantFrom(...PLATFORMS),
})

function bracketPlan(history: BracketHistory): BracketPlan {
  const key = `${PADS[history.left]}[${history.inner}]${PADS[history.right]}`
  // formatHotkey takes parsed chords only.
  const form = history.call === 'format' ? 'parsed' : history.form
  const flag = (bit: number) => !!(history.flags & (1 << bit))
  const chord = (k: string) =>
    form === 'parsed'
      ? {
          key: k,
          ctrl: flag(0),
          shift: flag(1),
          alt: flag(2),
          meta: flag(3),
          modifiers: ORDER.filter((_, i) => flag([0, 2, 1, 3][i]!)),
        }
      : {
          key: k,
          ctrl: flag(0),
          shift: flag(1),
          alt: flag(2),
          meta: flag(3),
          mod: flag(4),
        }
  return {
    ...history,
    form,
    key,
    input: history.inSequence ? [chord('G'), chord(key)] : chord(key),
  }
}

const CALLS: Readonly<Record<BracketHistory['call'], GrammarCall>> = {
  parse: parseHotkey,
  normalize: normalizeHotkey,
  format: formatHotkey,
}

oracleProperty({
  id: 'hotkey-grammar.bracketed-key',
  law: {
    statement:
      'For every key field that, without its surrounding whitespace, starts with [ and ends with ], in a chord object or a parsed chord, alone or as a sequence step, parseHotkey and normalizeHotkey throw, and so does formatHotkey for a parsed chord: an Error whose message starts with [hotkeys] and says the key belongs in the code field.',
    authority: `Sensible Defaults, "In objects, use the code field for a physical binding and key for a logical one ... key never takes brackets" (docs/guides/sensible-defaults.md:80); tests/parse.test.ts "rejects physical tokens in raw and parsed logical fields" (keys '[KeyS]', ' [Enter] ', '[UnknownCode]'); changeset reason-codes (779b8a4a): "thrown errors are now one short line that starts with [hotkeys]". ${APPROVAL}`,
    limits: 'The rest of the message is not checked.',
  },
  owns: [
    'src/parse.ts#parseHotkey',
    'src/parse.ts#normalizeHotkey',
    'src/format.ts#formatHotkey',
  ],
  histories: {
    arbitrary: bracketHistory,
    runs: 100,
    fixedSeeds: [20261121],
    states: [
      'padded key',
      'line break inside',
      'sequence step',
      'parsed chord',
      'formatted',
    ],
    constructed: [
      {
        name: 'a key padded with a no-break space',
        enters: ['padded key'],
        build: (g) => ({
          ...g,
          left: PADS.indexOf(NO_BREAK_SPACE),
          right: PADS.indexOf('\t'),
        }),
      },
      {
        name: 'a line break inside the brackets',
        enters: ['line break inside'],
        build: (g) => ({
          ...g,
          inner: [...`K\n${g.inner}`].slice(0, 6).join(''),
        }),
      },
      {
        name: 'the second step of a sequence',
        enters: ['sequence step'],
        build: (g) => ({
          ...g,
          inSequence: true,
          call: 'parse',
          form: 'object',
        }),
      },
      {
        name: 'a parsed chord normalized',
        enters: ['parsed chord'],
        build: (g) => ({ ...g, form: 'parsed', call: 'normalize' }),
      },
      {
        name: 'a parsed chord formatted',
        enters: ['parsed chord', 'formatted'],
        build: (g) => ({ ...g, call: 'format' }),
      },
    ],
  } satisfies GeneratedHistories<BracketHistory>,
  resolve: bracketPlan,
  model: () => ({ thrown: 'Error' as const }),
  reached: (plan) => [
    ...(plan.key !== plan.key.trim() ? ['padded key'] : []),
    ...(/[\n\r]/.test(plan.inner) || plan.inner.includes(LINE_SEPARATOR)
      ? ['line break inside']
      : []),
    ...(plan.inSequence ? ['sequence step'] : []),
    ...(plan.form === 'parsed' ? ['parsed chord'] : []),
    ...(plan.call === 'format' ? ['formatted'] : []),
  ],
  driver: (plan, observe) => {
    observe(
      'result',
      attempt(() => CALLS[plan.call](plan.input as never, plan.platform)),
    )
  },
  check: (_plan, trace, expected) => {
    const result = resultOf(trace) as Outcome
    if ('value' in result)
      return violation('result', 'returned instead of throwing', 'code field', {
        actual: result.value,
        expected,
      })
    return (
      differs(
        'result',
        'code field',
        result.thrown,
        expected.thrown,
        'not an Error',
      ) ??
      (result.error.startsWith('[hotkeys]') &&
      result.error.includes('code field')
        ? pass
        : violation(
            'result',
            'the message does not name the code field',
            'code field',
            {
              actual: result.error,
              expected: '[hotkeys] ... code field ...',
            },
          ))
    )
  },
  calibrations: [
    {
      name: 'a padded key accepted',
      law: 'code field',
      history: { constructed: 'a key padded with a no-break space' },
      corrupt: (trace) =>
        trace.map((observation) =>
          observation.checkpoint === 'result'
            ? { ...observation, value: { value: 'Mod+[KeyS]' } }
            : observation,
        ),
    },
  ],
})

// =============================================================================
// Law: normalizeKeyName
// =============================================================================

type KeyNameHistory =
  | { kind: 'code point'; point: number }
  | { kind: 'letter'; pick: number }
  | { kind: 'text'; text: string }
  | { kind: 'missing' }
type KeyNamePlan = { key: string | undefined }

const keyNameHistory: fc.Arbitrary<KeyNameHistory> = fc.oneof(
  fc.record({
    kind: fc.constant('code point' as const),
    point: fc.integer({ min: 0, max: 0x10ffff }),
  }),
  fc.record({
    kind: fc.constant('letter' as const),
    pick: fc.nat({ max: 1 << 20 }),
  }),
  fc.record({
    kind: fc.constant('text' as const),
    text: fc.string({ unit: 'binary', maxLength: 4 }),
  }),
  fc.record({ kind: fc.constant('missing' as const) }),
)

function keyNamePlan(history: KeyNameHistory): KeyNamePlan {
  switch (history.kind) {
    case 'code point':
      // A lone surrogate is one UTF-16 unit; fromCodePoint accepts it.
      return { key: String.fromCodePoint(history.point) }
    case 'letter':
      return {
        key:
          history.pick % 2
            ? pick(CHOSEN_LETTERS, history.pick)
            : pick(ALL_LETTERS, history.pick),
      }
    case 'text':
      return { key: history.text }
    case 'missing':
      return { key: undefined }
  }
}

function keyNameReach({ key }: KeyNamePlan): Array<string> {
  if (key === undefined) return ['missing key']
  if (key === '') return ['empty']
  if (key === ' ') return ['space character']
  if (/^[\uD800-\uDFFF]$/.test(key)) return ['lone surrogate']
  if (!oneLetter(key)) return ['other name']
  if (key === 'ı' || key === 'ſ') return ['dotless i or long s']
  if (ASTRAL_CASED.includes(key)) return ['astral letter']
  if (keyName(key) !== key) return ['letter uppercased']
  return key.toUpperCase() === key
    ? ['letter without case']
    : ['no one-character uppercase']
}

const letterHistory = (letter: string): KeyNameHistory => ({
  kind: 'letter',
  pick: (() => {
    const index = CHOSEN_LETTERS.indexOf(letter)
    for (let p = index; ; p += CHOSEN_LETTERS.length) if (p % 2) return p
  })(),
})

oracleProperty({
  id: 'hotkey-grammar.key-name',
  law: {
    statement:
      'For every string, normalizeKeyName returns the uppercase of a single letter (one code point) when that uppercase is one code point, except Turkish ı and the long ſ, which stay; Space for the space character; "" for an empty or missing key; and every other string as written. isSingleLetterKey is true exactly for a single letter.',
    authority: `normalizeKeyName JSDoc, "single letters become uppercase, and the space character becomes Space. Other names are returned as written" and its source comment on ß (src/constants.ts:118-153); isSingleLetterKey JSDoc (src/constants.ts:113); Sensible Defaults, "Letters match without regard to case: S and s are the same binding" (docs/guides/sensible-defaults.md:62); changeset long-s-key.md; changeset case-sensitive-key-names (8b93ed50); tests/parse.test.ts "normalizeKeyName" (including undefined) and "keeps the Turkish dotless ı and the dotted İ apart from I". ${APPROVAL}`,
    limits:
      'Letters whose uppercase is also the uppercase of another letter, such as µ (micro sign) and ς (final sigma), follow the stated rule and uppercase; whether they should stay as written, like ı and ſ, is an open question.',
  },
  owns: ['src/constants.ts#normalizeKeyName'],
  histories: {
    arbitrary: keyNameHistory,
    runs: 200,
    fixedSeeds: [20261121],
    states: [
      'missing key',
      'empty',
      'space character',
      'lone surrogate',
      'dotless i or long s',
      'astral letter',
      'letter uppercased',
      'no one-character uppercase',
    ],
    measured: ['letter without case', 'other name'],
    constructed: [
      {
        name: 'a missing key',
        enters: ['missing key'],
        build: () => ({ kind: 'missing' }),
      },
      {
        name: 'the empty string',
        enters: ['empty'],
        build: () => ({ kind: 'text', text: '' }),
      },
      {
        name: 'the space character',
        enters: ['space character'],
        build: () => ({ kind: 'text', text: ' ' }),
      },
      {
        name: 'a lone surrogate',
        enters: ['lone surrogate'],
        build: (g) => ({
          kind: 'code point',
          point: 0xd800 + ((g.kind === 'letter' ? g.pick : 7) % 0x800),
        }),
      },
      {
        name: 'dotless i',
        enters: ['dotless i or long s'],
        build: () => letterHistory('ı'),
      },
      {
        name: 'long s',
        enters: ['dotless i or long s'],
        build: () => letterHistory('ſ'),
      },
      {
        name: 'an astral lowercase letter',
        enters: ['astral letter'],
        build: (g) => ({
          kind: 'code point',
          point: pick(
            ASTRAL_CASED,
            g.kind === 'letter' ? g.pick : 0,
          ).codePointAt(0)!,
        }),
      },
      {
        name: 'a lowercase letter',
        enters: ['letter uppercased'],
        build: () => letterHistory('é'),
      },
      {
        name: 'sharp s',
        enters: ['no one-character uppercase'],
        build: () => letterHistory('ß'),
      },
    ],
  } satisfies GeneratedHistories<KeyNameHistory>,
  resolve: keyNamePlan,
  model: ({ key }) => ({
    name: { value: keyName(key) },
    ...(key === undefined ? {} : { letter: { value: oneLetter(key) } }),
  }),
  reached: keyNameReach,
  driver: ({ key }, observe) => {
    observe(
      'name',
      attempt(() => normalizeKeyName(key as string)),
    )
    if (key !== undefined)
      observe(
        'letter',
        attempt(() => isSingleLetterKey(key)),
      )
  },
  check: (_plan, trace, expected) => {
    const seen = (checkpoint: string) =>
      trace.find((observation) => observation.checkpoint === checkpoint)?.value
    return (
      differs('name', 'key name', seen('name'), expected.name) ??
      ('letter' in expected
        ? differs('letter', 'key name', seen('letter'), expected.letter)
        : undefined) ??
      pass
    )
  },
  calibrations: [
    {
      name: 'dotless i uppercased',
      law: 'key name',
      history: { constructed: 'dotless i' },
      corrupt: (trace) =>
        trace.map((observation) =>
          observation.checkpoint === 'name'
            ? { ...observation, value: { value: 'I' } }
            : observation,
        ),
    },
  ],
})

// =============================================================================
// Law: MODIFIER_ALIASES
// =============================================================================

oracleProperty({
  id: 'hotkey-grammar.modifier-aliases',
  law: {
    statement:
      'For every documented modifier spelling (Control, Ctrl, Shift, Alt, Option, Meta, Command, Cmd, OS, Win, Mod, CommandOrControl), as written and in lowercase, MODIFIER_ALIASES has an own entry naming its modifier, with Mod and CommandOrControl naming Mod.',
    authority: `MODIFIER_ALIASES JSDoc, "MODIFIER_ALIASES['Ctrl'] // 'Control' ... MODIFIER_ALIASES['Mod'] // 'Mod'" and "Case-insensitive lookups are supported via lowercase variants" (src/constants.ts:33-51); the Modifier type (src/key.types.ts:13-22); isModifierKey JSDoc, "DOM spellings like OS and Win are in the same alias table" (src/parse.ts:267-269). ${APPROVAL}`,
    limits:
      'Other spellings, such as CTRL, are not table entries; parseHotkey reads them case-insensitively.',
  },
  owns: ['src/constants.ts#MODIFIER_ALIASES'],
  histories: [{ table: 'every documented spelling' }],
  label: ({ table }) => table,
  model: () =>
    Object.fromEntries(
      WORDS.flatMap((modifier) =>
        SPELLINGS[modifier].flatMap((spelling) => [
          [spelling, modifier],
          [spelling.toLowerCase(), modifier],
        ]),
      ),
    ),
  driver: (_plan, observe) => {
    for (const modifier of WORDS)
      for (const spelling of SPELLINGS[modifier])
        for (const entry of [spelling, spelling.toLowerCase()])
          observe('entry', [
            entry,
            Object.hasOwn(MODIFIER_ALIASES, entry)
              ? MODIFIER_ALIASES[entry]
              : null,
          ])
  },
  check: (_plan, trace, expected) =>
    differs(
      'entry',
      'alias table',
      Object.fromEntries(
        trace
          .filter((observation) => observation.checkpoint === 'entry')
          .map((observation) => observation.value as [string, unknown]),
      ),
      expected,
    ) ?? pass,
  calibrations: [
    {
      name: 'Cmd names Control',
      law: 'alias table',
      history: { enumerated: 0 },
      corrupt: (trace) =>
        trace.map((observation) =>
          (observation.value as [string, unknown])[0] === 'Cmd'
            ? { ...observation, value: ['Cmd', 'Control'] }
            : observation,
        ),
    },
  ],
})

// =============================================================================
// Law: the validator agrees with the parser, for any string
// =============================================================================

/** Tokens from tests/invariants/parse-fuzz.test.ts, plus the spellings no exact law decides. */
const FUZZ_TOKENS = [
  '',
  ' ',
  NO_BREAK_SPACE,
  '\t',
  '+',
  '[',
  ']',
  '[]',
  '[Key',
  'KeyA]',
  '[a',
  'a]',
  '[keys]',
  '[ShiftLeft]',
  '[toString]',
  '[__proto__]',
  'constructor',
  'Unidentified',
  'Process',
  'ß',
  'İ',
  'ǅ',
  '😀',
  'é',
  `e${COMBINING_ACUTE}`,
  'Control',
  'mod',
  'CMD',
  'Ctl',
]

type FreeText =
  | {
      kind: 'spelled'
      words: Array<WordSpec>
      key: KeySpec
      pads: Array<number>
    }
  | { kind: 'tokens'; tokens: Array<string> }
  | { kind: 'binary'; text: string }
  | { kind: 'grapheme'; text: string }

const freeText: fc.Arbitrary<FreeText> = fc.oneof(
  fc.record({
    kind: fc.constant('spelled' as const),
    words: fc.array(wordSpec, { maxLength: 3 }),
    key: keySpec([...KEY_KINDS, 'bad code']),
    pads: fc.array(fc.nat({ max: PADS.length - 1 }), { maxLength: 8 }),
  }),
  fc.record({
    kind: fc.constant('tokens' as const),
    tokens: fc.array(
      fc.oneof(fc.constantFrom(...FUZZ_TOKENS), fc.string({ maxLength: 3 })),
      { minLength: 1, maxLength: 5 },
    ),
  }),
  fc.record({
    kind: fc.constant('binary' as const),
    text: fc.string({ unit: 'binary', maxLength: 12 }),
  }),
  fc.record({
    kind: fc.constant('grapheme' as const),
    text: fc.string({ unit: 'grapheme', maxLength: 12 }),
  }),
)

function freeString(text: FreeText): string {
  switch (text.kind) {
    case 'spelled': {
      const parts = [...text.words.map(wordText), keyText(text.key)]
      // Whitespace around each part: before part i is pads[2i], after it pads[2i+1].
      return parts
        .map(
          (part, i) =>
            `${PADS[text.pads[2 * i] ?? 0]}${part}${PADS[text.pads[2 * i + 1] ?? 0]}`,
        )
        .join('+')
    }
    case 'tokens':
      return text.tokens.join('+')
    default:
      return text.text
  }
}

type AgreementHistory = {
  first: FreeText
  second: FreeText
  platform: Platform
}
type AgreementPlan = {
  text: string
  other: string
  platform: Platform
  padded: boolean
  badCode: boolean
}

function agreementPlan(history: AgreementHistory): AgreementPlan {
  return {
    text: freeString(history.first),
    other: freeString(history.second),
    platform: history.platform,
    padded:
      history.first.kind === 'spelled' &&
      history.first.pads.some((pad) => PADS[pad] !== ''),
    badCode:
      history.first.kind === 'spelled' && history.first.key.kind === 'bad code',
  }
}

type Seen = Readonly<Record<string, Outcome | undefined>>
const valueOf = (outcome: Outcome | undefined) =>
  outcome && 'value' in outcome ? outcome.value : undefined

/** Whether a parsed chord has a key that is not a modifier (tests/invariants/parse-fuzz.test.ts). */
function hasKey(parsed: Parsed): boolean {
  return 'code' in parsed
    ? parsed.code !== '' && !MODIFIER_CODES.includes(parsed.code)
    : parsed.key !== '' && modifierWord(parsed.key) === undefined
}

function checkAgreement(
  _plan: AgreementPlan,
  trace: ReadonlyArray<Observation>,
): Verdict {
  const seen: Seen = Object.fromEntries(
    trace.map((observation) => [
      observation.checkpoint,
      observation.value as Outcome,
    ]),
  )
  for (const checkpoint of [
    'parse',
    'validate',
    'validate other',
    'validate pair',
    'identities',
  ])
    if (!(seen[checkpoint] && 'value' in seen[checkpoint]))
      return violation(checkpoint, `${checkpoint} threw`, 'never throws', {
        actual: seen[checkpoint],
        expected: 'a return value',
      })
  const validation = asValidation(seen.validate)
  const otherValidation = asValidation(seen['validate other'])
  const pair = asValidation(seen['validate pair'])
  if (!validation || !otherValidation || !pair)
    return violation('validate', 'not a validation result', 'never throws', {
      actual: [seen.validate, seen['validate other'], seen['validate pair']],
      expected: 'validation results',
    })
  const valid = validation.valid
  const normalized = seen.normalize!
  if ('error' in normalized) {
    if (valid)
      return violation(
        'normalize',
        'a valid hotkey threw',
        'throws only when invalid',
        {
          actual: normalized,
          expected: 'a canonical string',
        },
      )
    if (
      normalized.thrown !== 'Error' ||
      !normalized.error.startsWith('[hotkeys]')
    )
      return violation(
        'normalize',
        'not a library error',
        'throws only when invalid',
        {
          actual: normalized,
          expected: '[hotkeys] ...',
        },
      )
  }
  const parsed = valueOf(seen.parse) as Parsed | null | undefined
  if (valid) {
    const verdict =
      differs(
        'reparse',
        'round trip',
        seen.reparse,
        { value: parsed },
        'the canonical string reads as another chord',
      ) ??
      differs(
        'renormalize',
        'round trip',
        seen.renormalize,
        normalized,
        'normalizing twice changes the string',
      ) ??
      differs(
        'validate normal',
        'round trip',
        asValidation(seen['validate normal'])?.valid,
        true,
        'the canonical string is invalid',
      ) ??
      differs(
        'reparse format',
        'round trip',
        seen['reparse format'],
        { value: parsed },
        'the spelled-out string reads as another chord',
      ) ??
      differs(
        'parse',
        'round trip',
        !!parsed && hasKey(parsed),
        true,
        'a valid hotkey has no key',
      )
    if (verdict) return verdict
  }
  const identities = valueOf(seen.identities) as Array<unknown>
  const verdict =
    differs(
      'identities',
      'same identity on every platform',
      identities[1],
      identities[0],
    ) ??
    differs(
      'identities',
      'same identity on every platform',
      identities[2],
      identities[0],
    )
  if (verdict) return verdict
  return (
    differs(
      'validate pair',
      'sequence verdict',
      pair.valid,
      valid && otherValidation.valid,
    ) ??
    differs(
      'validate pair',
      'sequence verdict',
      [...pair.errors, ...pair.warnings].every(
        (issue) => issue.step === 0 || issue.step === 1,
      ),
      true,
      'an issue without a step of the pair',
    ) ??
    pass
  )
}

oracleProperty({
  id: 'hotkey-grammar.agreement',
  law: {
    statement:
      'For every string and platform, parseHotkey and validateHotkey return without throwing; normalizeHotkey throws only for an invalid hotkey, and only an Error starting with [hotkeys]; for a valid hotkey, the canonical string and the spelled-out string read back as the same chord, normalizing twice changes nothing, the canonical string is valid, and the chord has a key that is not a modifier; the key or code is the same on every platform; and a two-step sequence is valid exactly when both steps are, with every issue carrying step 0 or 1.',
    authority: `tests/invariants/parse-fuzz.test.ts ("parseHotkey, validateHotkey and hasNonModifierKey never throw", "normalizeHotkey throws only for invalid hotkeys, and only with a library error", "a valid hotkey round-trips through normalize and format", "validation agrees with parsing", "parsing gives the same key or code on every platform", "a sequence is valid exactly when each step is"); tests/invariants/round-trip.test.ts; Sensible Defaults, "Hotkeys are stored in a canonical form, so equivalent spellings are the same binding" (docs/guides/sensible-defaults.md:34). ${APPROVAL}`,
    limits:
      'Invalid hotkeys owe no round trip. Relations only: what an invalid or oddly spaced string parses to is not predicted.',
  },
  owns: [
    'src/parse.ts#parseHotkey',
    'src/parse.ts#normalizeHotkey',
    'src/format.ts#formatHotkey',
    'src/validate.ts#validateHotkey',
  ],
  histories: {
    arbitrary: fc.record({
      first: freeText,
      second: freeText,
      platform: fc.constantFrom(...PLATFORMS),
    }),
    runs: 150,
    fixedSeeds: [20261121],
    states: [
      'valid hotkey',
      'invalid hotkey',
      'padded words',
      'bracketed key that is not a code',
    ],
    measured: ['normalize threw'],
    constructed: [
      {
        name: 'a padded valid chord',
        enters: ['valid hotkey', 'padded words'],
        build: (g) => ({
          ...g,
          first: {
            kind: 'spelled',
            words: [known('Shift')],
            key: letterKey('a'),
            pads: [1, 1, 3, 0],
          },
        }),
      },
      {
        name: 'an unknown word',
        enters: ['invalid hotkey'],
        build: (g) => ({
          ...g,
          first: { kind: 'tokens', tokens: ['Ctl', 'K'] },
        }),
      },
      {
        name: 'a bracketed key that is not a code',
        enters: ['invalid hotkey', 'bracketed key that is not a code'],
        build: (g) => ({
          ...g,
          first: {
            kind: 'spelled',
            words: [],
            key: { kind: 'bad code', pick: 1, casing: 0 },
            pads: [],
          },
        }),
      },
    ],
  } satisfies GeneratedHistories<AgreementHistory>,
  resolve: agreementPlan,
  model: () => null,
  reached: (plan, trace) => {
    const seen = Object.fromEntries(
      trace.map((observation) => [
        observation.checkpoint,
        observation.value as Outcome,
      ]),
    )
    const valid = asValidation(seen.validate)?.valid
    return [
      valid ? 'valid hotkey' : 'invalid hotkey',
      ...(seen.normalize && 'error' in seen.normalize
        ? ['normalize threw']
        : []),
      ...(plan.padded ? ['padded words'] : []),
      ...(plan.badCode ? ['bracketed key that is not a code'] : []),
    ]
  },
  driver: ({ text, other, platform }, observe) => {
    const parsed = attempt(() => parseHotkey(text, platform))
    observe('parse', parsed)
    observe(
      'validate',
      attempt(() => validateHotkey(text)),
    )
    observe(
      'validate other',
      attempt(() => validateHotkey(other)),
    )
    observe(
      'validate pair',
      attempt(() => validateHotkey([text, other])),
    )
    const normalized = attempt(() => normalizeHotkey(text, platform))
    observe('normalize', normalized)
    if ('value' in normalized) {
      const canonicalString = normalized.value as string
      observe(
        'reparse',
        attempt(() => parseHotkey(canonicalString, platform)),
      )
      observe(
        'renormalize',
        attempt(() => normalizeHotkey(canonicalString, platform)),
      )
      observe(
        'validate normal',
        attempt(() => validateHotkey(canonicalString)),
      )
    }
    if ('value' in parsed) {
      const formatted = attempt(() => formatHotkey(parsed.value as never))
      observe('format', formatted)
      if ('value' in formatted)
        observe(
          'reparse format',
          attempt(() => parseHotkey(formatted.value as string, platform)),
        )
    }
    observe(
      'identities',
      attempt(() =>
        PLATFORMS.map((p) => {
          const chord = parseHotkey(text, p) as { key?: string; code?: string }
          return { key: chord.key, code: chord.code }
        }),
      ),
    )
  },
  check: checkAgreement,
  calibrations: [
    {
      name: 'the canonical string reads as another chord',
      law: 'round trip',
      history: { constructed: 'a padded valid chord' },
      corrupt: (trace) =>
        trace.map((observation) =>
          observation.checkpoint === 'reparse'
            ? {
                ...observation,
                value: {
                  value: {
                    ...(valueOf(observation.value as Outcome) as object),
                    shift: false,
                  },
                },
              }
            : observation,
        ),
    },
    {
      name: 'a valid chord whose normalization threw',
      law: 'throws only when invalid',
      history: { constructed: 'a padded valid chord' },
      corrupt: (trace) =>
        trace.map((observation) =>
          observation.checkpoint === 'normalize'
            ? {
                ...observation,
                value: { error: '[hotkeys] no', thrown: 'Error' },
              }
            : observation,
        ),
    },
  ],
})
