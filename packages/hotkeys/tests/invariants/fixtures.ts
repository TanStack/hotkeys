import { keyEvent } from '@tanstack/hotkeys-test-utils'
import { SHARED_NAMED_KEYS } from '../../src/_named-keys'
import { ALL_KEYS } from '../../src/constants'

// Chords and keyboard events shared by the invariant suites. The events model
// what browsers report, so a failure points at the library, not the fixture.

export const PLATFORMS = ['mac', 'windows', 'linux'] as const
export type Platform = (typeof PLATFORMS)[number]

const MODIFIERS = ['Control', 'Alt', 'Shift', 'Meta'] as const
type Modifier = (typeof MODIFIERS)[number]

/** Every subset of the four modifiers, in canonical order. */
export const MODIFIER_SUBSETS: Array<Array<Modifier>> = Array.from(
  { length: 16 },
  (_, mask) => MODIFIERS.filter((_, bit) => mask & (1 << bit)),
)

/** Modifier prefixes: every literal subset, every `Mod` combination, and common aliases. */
const PREFIXES: Array<string> = [
  ...MODIFIER_SUBSETS.map((subset) => subset.map((m) => `${m}+`).join('')),
  ...[[], ['Alt'], ['Shift'], ['Alt', 'Shift']].map((rest) =>
    ['Mod', ...rest].map((m) => `${m}+`).join(''),
  ),
  // Runtime-valid spellings outside the types
  'Mod+Control+',
  'Mod+Meta+',
  'ctrl+',
  'cmd+',
  'option+shift+',
  'CommandOrControl+',
  'Win+',
]

/** Every key in the key tables: letters, digits, F-keys, navigation, editing, punctuation and named keys. */
const TABLE_KEYS: Array<string> = [...ALL_KEYS]

/** Keys outside the tables that browsers report and the recorder stores. */
const EXTRA_KEYS = ['é', 'ß', 'ф', '€', 'µ', 'ą', 'Dead']

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
const DIGITS = [...'0123456789']

export const PHYSICAL_CODES: Array<string> = [
  ...LETTERS.map((letter) => `Key${letter}`),
  ...DIGITS.map((digit) => `Digit${digit}`),
  ...DIGITS.map((digit) => `Numpad${digit}`),
  ...Array.from({ length: 24 }, (_, i) => `F${i + 1}`),
  'Enter',
  'Escape',
  'Space',
  'Tab',
  'Backspace',
  'Delete',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Backquote',
  'Backslash',
  'BracketLeft',
  'BracketRight',
  'Comma',
  'Equal',
  'IntlBackslash',
  'IntlRo',
  'IntlYen',
  'Minus',
  'Period',
  'Quote',
  'Semicolon',
  'Slash',
  'NumpadAdd',
  'NumpadSubtract',
  'NumpadMultiply',
  'NumpadDivide',
  'NumpadDecimal',
  'NumpadEnter',
  ...SHARED_NAMED_KEYS,
]

/** Key tokens: every logical key plus every physical `[Code]` token. */
export const KEY_TOKENS: Array<string> = [
  ...TABLE_KEYS,
  ...EXTRA_KEYS,
  ...PHYSICAL_CODES.map((code) => `[${code}]`),
]

/** Every prefix with every key token. */
export const CHORDS: Array<string> = PREFIXES.flatMap((prefix) =>
  KEY_TOKENS.map((key) => prefix + key),
)

// ---------------------------------------------------------------------------
// Realistic events
// ---------------------------------------------------------------------------

export interface EventCase {
  /** Short description for failure messages. */
  label: string
  init: KeyboardEventInit & { key: string; altGraph?: boolean }
}

/** US layout: code → [unshifted, shifted]. */
const US_PRINTABLE: Record<string, [string, string]> = {
  ...Object.fromEntries(
    LETTERS.map((l) => [`Key${l}`, [l.toLowerCase(), l]] as const),
  ),
  Digit1: ['1', '!'],
  Digit2: ['2', '@'],
  Digit3: ['3', '#'],
  Digit4: ['4', '$'],
  Digit5: ['5', '%'],
  Digit6: ['6', '^'],
  Digit7: ['7', '&'],
  Digit8: ['8', '*'],
  Digit9: ['9', '('],
  Digit0: ['0', ')'],
  Backquote: ['`', '~'],
  Minus: ['-', '_'],
  Equal: ['=', '+'],
  BracketLeft: ['[', '{'],
  BracketRight: [']', '}'],
  Backslash: ['\\', '|'],
  Semicolon: [';', ':'],
  Quote: ["'", '"'],
  Comma: [',', '<'],
  Period: ['.', '>'],
  Slash: ['/', '?'],
  Space: [' ', ' '],
}

/** macOS US layout with Option held: code → [Option, Option+Shift]. */
const MAC_OPTION: Record<string, [string, string]> = {
  KeyA: ['å', 'Å'],
  KeyB: ['∫', 'ı'],
  KeyC: ['ç', 'Ç'],
  KeyD: ['∂', 'Î'],
  KeyE: ['Dead', '´'],
  KeyF: ['ƒ', 'Ï'],
  KeyG: ['©', '˝'],
  KeyH: ['˙', 'Ó'],
  KeyI: ['Dead', 'ˆ'],
  KeyJ: ['∆', 'Ô'],
  KeyK: ['˚', ''],
  KeyL: ['¬', 'Ò'],
  KeyM: ['µ', 'Â'],
  KeyN: ['Dead', '˜'],
  KeyO: ['ø', 'Ø'],
  KeyP: ['π', '∏'],
  KeyQ: ['œ', 'Œ'],
  KeyR: ['®', '‰'],
  KeyS: ['ß', 'Í'],
  KeyT: ['†', 'ˇ'],
  KeyU: ['Dead', '¨'],
  KeyV: ['√', '◊'],
  KeyW: ['∑', '„'],
  KeyX: ['≈', '˛'],
  KeyY: ['¥', 'Á'],
  KeyZ: ['Ω', '¸'],
  Digit1: ['¡', '⁄'],
  Digit2: ['™', '€'],
  Digit3: ['£', '‹'],
  Digit4: ['¢', '›'],
  Digit5: ['∞', 'ﬁ'],
  Digit6: ['§', 'ﬂ'],
  Digit7: ['¶', '‡'],
  Digit8: ['•', '°'],
  Digit9: ['ª', '·'],
  Digit0: ['º', '‚'],
  Backquote: ['Dead', '`'],
  Minus: ['–', '—'],
  Equal: ['≠', '±'],
  BracketLeft: ['“', '”'],
  BracketRight: ['‘', '’'],
  Backslash: ['«', '»'],
  Semicolon: ['…', 'Ú'],
  Quote: ['æ', 'Æ'],
  Comma: ['≤', '¯'],
  Period: ['≥', '˘'],
  Slash: ['÷', '¿'],
  Space: [' ', ' '],
}

/** Keys whose `key` equals their `code` and that Shift doesn't change. */
const NAMED_CODES = [
  ...Array.from({ length: 24 }, (_, i) => `F${i + 1}`),
  'Enter',
  'Escape',
  'Tab',
  'Backspace',
  'Delete',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Insert',
  'ContextMenu',
  'PrintScreen',
  'ScrollLock',
  'Pause',
]

/** Numpad with NumLock on: code → key. */
const NUMPAD: Record<string, string> = {
  ...Object.fromEntries(DIGITS.map((d) => [`Numpad${d}`, d])),
  NumpadAdd: '+',
  NumpadSubtract: '-',
  NumpadMultiply: '*',
  NumpadDivide: '/',
  NumpadDecimal: '.',
  NumpadEnter: 'Enter',
}

function mods(mask: number) {
  return {
    ctrlKey: !!(mask & 1),
    altKey: !!(mask & 2),
    shiftKey: !!(mask & 4),
    metaKey: !!(mask & 8),
  }
}

function describeMods(init: KeyboardEventInit): string {
  return [
    init.ctrlKey && 'ctrl',
    init.altKey && 'alt',
    init.shiftKey && 'shift',
    init.metaKey && 'meta',
  ]
    .filter(Boolean)
    .join('+')
}

function eventCase(init: EventCase['init'], note = ''): EventCase {
  const modText = describeMods(init)
  return {
    label: `${JSON.stringify(init.key)} on ${init.code || '(no code)'}${
      modText ? ` with ${modText}` : ''
    }${init.altGraph ? ' +AltGraph' : ''}${note ? ` (${note})` : ''}`,
    init,
  }
}

/**
 * Keydown events a user on a US layout produces on `platform`, with every
 * modifier combination. macOS Option composes characters, as it does there.
 */
function usLayoutEvents(platform: Platform): Array<EventCase> {
  const cases: Array<EventCase> = []
  for (let mask = 0; mask < 16; mask++) {
    const flags = mods(mask)
    for (const [code, [plain, shifted]] of Object.entries(US_PRINTABLE)) {
      let key = flags.shiftKey ? shifted : plain
      if (platform === 'mac' && flags.altKey) {
        const option = MAC_OPTION[code]
        if (option) key = flags.shiftKey ? option[1] : option[0]
      }
      // macOS Option+Shift+K types the Apple logo, a private-use character
      if (key === '') key = ''
      cases.push(eventCase({ key, code, ...flags }))
    }
    for (const code of NAMED_CODES) {
      cases.push(eventCase({ key: code, code, ...flags }))
    }
    for (const [code, key] of Object.entries(NUMPAD)) {
      cases.push(eventCase({ key, code, ...flags }))
    }
  }
  return cases
}

/** Characters AltGr types on common European layouts: [key, code, layout]. */
const ALT_GRAPH_CHARACTERS: Array<[string, string, string]> = [
  ['@', 'KeyQ', 'German'],
  ['€', 'KeyE', 'German'],
  ['µ', 'KeyM', 'German'],
  ['{', 'Digit7', 'German'],
  ['[', 'Digit8', 'German'],
  [']', 'Digit9', 'German'],
  ['}', 'Digit0', 'German'],
  ['\\', 'Minus', 'German'],
  ['~', 'BracketRight', 'German'],
  ['|', 'IntlBackslash', 'German'],
  ['ą', 'KeyA', 'Polish'],
  ['ł', 'KeyL', 'Polish'],
  ['ę', 'KeyE', 'Polish'],
  ['Dead', 'Equal', 'Polish'],
  // Keys that type nothing new with AltGr
  ['f', 'KeyF', 'German'],
  ['5', 'Digit5', 'German'],
  ['Home', 'Home', 'any'],
  ['F5', 'F5', 'any'],
  ['Enter', 'Enter', 'any'],
]

/**
 * AltGr key presses. Windows browsers report AltGr as Control+Alt plus the
 * AltGraph state, or (current Chrome and Firefox) as AltGraph alone. Linux
 * reports AltGraph alone.
 */
function altGraphEvents(platform: Platform): Array<EventCase> {
  if (platform === 'mac') return []
  const shapes: Array<KeyboardEventInit> =
    platform === 'windows' ? [{ ctrlKey: true, altKey: true }, {}] : [{}]
  return shapes.flatMap((shape) =>
    ALT_GRAPH_CHARACTERS.flatMap(([key, code, layout]) =>
      [false, true].map((shiftKey) =>
        eventCase(
          { key, code, ...shape, shiftKey, altGraph: true },
          `${layout} AltGr`,
        ),
      ),
    ),
  )
}

/**
 * Other layouts: Russian (non-Latin letters), German QWERTZ (Latin letters on
 * punctuation keys), AZERTY (symbols on the digit row), and the AltGraph state
 * WebKit reports for Option on some macOS layouts.
 */
function otherLayoutEvents(platform: Platform): Array<EventCase> {
  const presses: Array<[string, string, string]> = [
    ['ф', 'KeyA', 'Russian'],
    ['ы', 'KeyS', 'Russian'],
    ['ё', 'Backquote', 'Russian'],
    ['ü', 'BracketLeft', 'German'],
    ['ö', 'Semicolon', 'German'],
    ['ß', 'Minus', 'German'],
    ['z', 'KeyY', 'German'],
    ['&', 'Digit1', 'AZERTY'],
    ['é', 'Digit2', 'AZERTY'],
    ['a', 'KeyQ', 'AZERTY'],
    [';', 'Comma', 'AZERTY'],
    ['Unidentified', 'Backquote', 'Wayland'],
    // The left Control position after swapping Control and CapsLock
    ['CapsLock', 'ControlLeft', 'Ctrl/CapsLock swap'],
  ]
  const cases: Array<EventCase> = []
  for (const mask of [0, 1, 2, 4, 5, 8, 9]) {
    const flags = mods(mask)
    for (const [key, code, layout] of presses) {
      // Shift types the uppercase letter on these layouts
      const shifted =
        flags.shiftKey && /^\p{Ll}$/u.test(key) && key !== 'ß'
          ? key.toUpperCase()
          : key
      cases.push(eventCase({ key: shifted, code, ...flags }, layout))
    }
  }
  if (platform === 'mac') {
    for (const [code, [option]] of Object.entries(MAC_OPTION).slice(0, 12)) {
      cases.push(
        eventCase(
          { key: option, code, altKey: true, altGraph: true },
          'WebKit Option',
        ),
      )
    }
  }
  return cases
}

/** Every realistic keydown for `platform`. */
export function realisticEvents(platform: Platform): Array<EventCase> {
  return [
    ...usLayoutEvents(platform),
    ...altGraphEvents(platform),
    ...otherLayoutEvents(platform),
  ]
}

/** A fresh event, so one dispatch can't change what the next sees. */
export function makeEvent(
  type: 'keydown' | 'keyup',
  init: EventCase['init'],
  extra: KeyboardEventInit = {},
): KeyboardEvent {
  return keyEvent(type, { ...init, ...extra })
}

/** Collects failures and reports the first few, so a broken invariant prints a readable list. */
export function failureLog() {
  const failures: Array<string> = []
  return {
    add(message: string) {
      failures.push(message)
    },
    /** The first `limit` failures plus a count, for `expect(...).toEqual([])`. */
    report(limit = 25): Array<string> {
      if (failures.length <= limit) return failures
      return [
        ...failures.slice(0, limit),
        `...and ${failures.length - limit} more`,
      ]
    },
    get count() {
      return failures.length
    },
  }
}

// ---------------------------------------------------------------------------
// Known bugs, excluded from the broad loops and covered by skipped tests
// ---------------------------------------------------------------------------

/** Whether AltGr typed a new character, as the docs describe it. */
export function altGraphTypedCharacter(key: string): boolean {
  const typed = key.normalize('NFC')
  if (typed === 'Dead') return true
  // A space is the key's plain value
  if (typed === ' ') return false
  return [...typed].length === 1 && !/^[A-Za-z0-9]$/.test(typed)
}

/**
 * BUG-085: on Linux, AltGr on a key that types nothing new records the bare
 * key in key mode, which that press never fires.
 */
export function isBug085(
  init: EventCase['init'],
  platform: Platform,
  recordBy: 'code' | 'key',
): boolean {
  return (
    recordBy === 'key' &&
    platform === 'linux' &&
    !!init.altGraph &&
    !altGraphTypedCharacter(init.key)
  )
}

/**
 * BUG-087: a non-modifier key on a modifier position, such as `CapsLock` on
 * `ControlLeft` with Control and CapsLock swapped, records a modifier code in
 * code mode, which registers nothing.
 */
export function isBug087(
  init: EventCase['init'],
  recordBy: 'code' | 'key',
): boolean {
  return (
    recordBy === 'code' &&
    /^(Control|Shift|Alt|Meta)(Left|Right)$/.test(init.code ?? '')
  )
}
