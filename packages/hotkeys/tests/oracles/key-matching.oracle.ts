/**
 * This oracle owns the promise that `matchesKeyboardEvent(event, chord,
 * platform)` fires a hotkey for the key the user meant, on every platform and
 * real keyboard layout, checked on the boolean it returns and on which of two
 * registrations `HotkeyManager` runs. It owns `src/_match.ts#matchKeyboardEvent`.
 *
 * ```ts
 * matchesKeyboardEvent(keydown({ key: 'ы', code: 'KeyS', ctrlKey: true }), 'Mod+S', 'linux') // → true: a Russian key stands in for its US position
 * matchesKeyboardEvent(keydown({ key: 'a', code: 'KeyQ', ctrlKey: true }), 'Mod+Q', 'linux') // → false: AZERTY's `a` is the A key
 * matchesKeyboardEvent(keydown({ key: '?', code: 'Slash', shiftKey: true }), '?', 'linux') // → true: Shift typed the symbol
 * matchesKeyboardEvent(keydown({ key: '-', code: 'Digit6', ctrlKey: true }), 'Mod+6', 'linux') // → false: Ctrl+- zooms out
 * matchesKeyboardEvent(keydown({ key: '@', code: 'KeyQ', altGraph: true }), 'Control+Alt+Q', 'linux') // → false: AltGr typed `@`
 * ```
 *
 * The easy mistake is to compare `event.key` and stop. Russian Ctrl+S
 * reports `ы`, and a hotkey that only reads `key` never fires there. The
 * opposite mistake is to compare `event.code`: AZERTY's A key sits in the
 * US Q position, and `Mod+Q` must not quit when the user pressed Ctrl+A.
 *
 * Three parts decide every answer. The press's **modifiers** are the
 * Control, Alt, Shift and Meta it reports, except that a character AltGr
 * typed carries no Control or Alt, and Windows AltGr that typed nothing new
 * is Control+Alt. The press's **names** are what a binding can call it: its
 * code, the character it typed, and, when that character can't name a
 * shortcut, a **stand-in** (its US position, or the macOS Option keycap
 * letter). Each name has a **strength**: the exact code or character is 3,
 * a symbol matched without the Shift that may have typed it, or `ı` read as
 * `I`, is 2, a stand-in is 1.
 *
 * The laws, from the Sensible Defaults guide and the `matchesKeyboardEvent`
 * JSDoc. Modifiers: a chord's Control, Alt and Meta, with `Mod` read as
 * Command on macOS and Control elsewhere, must be the press's ("Mod follows
 * the platform", "Modifiers must match exactly"). Physical: `[Code]` matches
 * the press's code with exactly its Shift, never under AltGr. Character: a
 * logical key matches the typed character, letters without case, with Shift
 * exact for letters and named keys and optional for symbols, except a macOS
 * Command+Shift press that reports its unshifted US character. Stand-in:
 * the US position or the Option keycap letter matches, with Shift exact, only
 * for output that can't name a shortcut: non-Latin text, dead keys, the digit
 * row (but not `-`, `+`, `=` with the zoom modifier alone), `Unidentified`
 * outside letter and numpad keys, ASCII symbols typed with Shift or with
 * macOS Option on a letter key, Latin letters with Alt, or with Control or
 * Command on a punctuation key. AltGr: a character it typed matches only
 * itself; AltGr that typed nothing new matches nothing outside Windows.
 * Dotless i: `I` fires on the key that types `ı`, unless Alt is held.
 * Composition: nothing matches while an input method composes. Strength:
 * of two registrations that both match, only the stronger fires. No throw:
 * events with a missing key or code, prototype-named values, or a broken
 * `getModifierState` return a boolean.
 *
 * The model computes the press's modifiers and names from the event alone,
 * with its own tables (the US character of each position, the classes of
 * typed output) and no production helper, and a chord's strength is the
 * strongest name it accepts. Histories draw a press from every real layout
 * in `layout-table.json`, from a list of edge events, or from a free pool
 * of keys, codes, modifiers and keyCodes, so combinations no layout types
 * are tried too. The chord comes from that press (its typed key, its
 * position, its keycap, its code, or a pool key), with any of its modifiers
 * flipped. Constructed histories enter each class of typed output, each
 * numpad position, each zoom-modifier combination and the keyCode edges.
 * The driver builds a real `KeyboardEvent` and records
 * `matchesKeyboardEvent`, or which of two `HotkeyManager` registrations ran.
 *
 * Limits. Letters that differ by more than case but that the library
 * compares as one key (`º` and `O`, `ª` and `A`, `ℓ` and `L`, Greek symbol
 * variants, Hebrew final forms) are left out of the histories: `keysEqual`
 * in `src/_keys.ts` merges them. Linux AltGr with a real Control or Alt held
 * is not generated. Latin-script characters that are not letters (`·`, `˙`)
 * appear only with Option or AltGr, where they stand in either way. A
 * multi-code-point symbol (not a letter) is not generated. Greek, Bulgarian
 * and Hebrew type ASCII punctuation on the Q and W keys, so `Q` and `W` don't
 * fire there; Thai and Programmer Dvorak type a zoom key and no digit on some
 * digit keys; AltGr typing an ASCII letter or digit counts as typing nothing
 * new. These follow the laws above. The `identity` a match returns, which
 * ends a keyup press, and the `score: 0` of a miss, which sequence dispatch
 * compares, belong to the keyup and sequence oracles.
 */
import { keyEvent } from '@tanstack/hotkeys-test-utils'
import { differs, oracleProperty, pass } from '@tanstack/oracles'
import fc from 'fast-check'
import { HotkeyManager, matchesKeyboardEvent } from '../../src'
import { allLayoutPresses } from '../fixtures/layout-events'
import type { Observation } from '@tanstack/oracles'
import type { HotkeyPlatform } from '../../src'

// Every law's approval: Proposed by an agent for Kevin Van Cott (KevinVandy)
// on 2026-11-21, pending his approval; see .tasks/tanstack-oracles/decisions.md
const APPROVAL =
  'Proposed by an agent for Kevin Van Cott (KevinVandy) on 2026-11-21, pending his approval; see .tasks/tanstack-oracles/decisions.md'
const SEED = 20261121

type Platform = HotkeyPlatform
const PLATFORMS: ReadonlyArray<Platform> = ['mac', 'windows', 'linux']

// ---------------------------------------------------------------------------
// Presses: real layouts, plus edge events no layout table holds
// ---------------------------------------------------------------------------

interface PressInit {
  key: string
  code: string
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
  altGraph?: boolean
  keyCode?: number
  isComposing?: boolean
  /** A synthetic event whose getModifierState throws or is missing. */
  modifierState?: 'throws' | 'missing'
}
interface Press {
  label: string
  init: PressInit
}

/**
 * Letters the library compares as one key with a letter that is not their
 * other case. They are left out (see the limits), so that no history pairs
 * them with their look-alike.
 */
const LOOK_ALIKE_LETTERS = new Set(['ª', 'º', 'ℓ', 'ϲ', 'Ϲ', 'ϒ', 'ϴ'])
const LOOK_ALIKE_KEYS = /[א-ת]/u

function edge(
  label: string,
  init: Partial<PressInit> & { key: string; code: string },
): Press {
  return {
    label: `edge ${label}`,
    init: {
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      ...init,
    },
  }
}

/** Events browsers send that no layout table holds, from the guide's examples. */
function edgePresses(platform: Platform): Array<Press> {
  const common = [
    edge('Ctrl+` as Unidentified', {
      key: 'Unidentified',
      code: 'Backquote',
      ctrlKey: true,
    }),
    edge('Unidentified numpad 5', { key: 'Unidentified', code: 'Numpad5' }),
    edge('Unidentified letter key', {
      key: 'Unidentified',
      code: 'KeyA',
      ctrlKey: true,
    }),
    edge('Unidentified digit key', {
      key: 'Unidentified',
      code: 'Digit1',
      shiftKey: true,
    }),
    edge('NumLock-off numpad 1', { key: 'End', code: 'Numpad1' }),
    edge('NumLock-off numpad 7 with Control', {
      key: 'Home',
      code: 'Numpad7',
      ctrlKey: true,
    }),
    edge('numpad 1', { key: '1', code: 'Numpad1' }),
    edge('numpad + with Control', {
      key: '+',
      code: 'NumpadAdd',
      ctrlKey: true,
    }),
    edge('numpad Enter', { key: 'Enter', code: 'NumpadEnter' }),
    edge('numpad decimal comma', { key: ',', code: 'NumpadDecimal' }),
    edge('Enter', { key: 'Enter', code: 'Enter' }),
    edge('Shift+Enter', { key: 'Enter', code: 'Enter', shiftKey: true }),
    edge('Escape', { key: 'Escape', code: 'Escape' }),
    edge('Shift+Tab', { key: 'Tab', code: 'Tab', shiftKey: true }),
    edge('F5 with Control', { key: 'F5', code: 'F5', ctrlKey: true }),
    edge('ArrowUp with Alt', { key: 'ArrowUp', code: 'ArrowUp', altKey: true }),
    edge('Space', { key: ' ', code: 'Space' }),
    edge('Shift+Space', { key: ' ', code: 'Space', shiftKey: true }),
    edge('dead key on Quote', { key: 'Dead', code: 'Quote' }),
    edge('dead key with Shift', {
      key: 'Dead',
      code: 'BracketLeft',
      shiftKey: true,
    }),
    edge('Turkish ı key', { key: 'ı', code: 'KeyI' }),
    edge('Turkish ı key with Control', {
      key: 'ı',
      code: 'KeyI',
      ctrlKey: true,
    }),
    edge('Turkish İ', { key: 'İ', code: 'Quote', shiftKey: true }),
    edge('long s on S', { key: 'ſ', code: 'KeyS' }),
    edge('< on IntlBackslash', {
      key: '<',
      code: 'IntlBackslash',
      shiftKey: true,
    }),
    edge('Russian letter on IntlBackslash', {
      key: 'ы',
      code: 'IntlBackslash',
    }),
    edge('decomposed é on Digit2', { key: 'é', code: 'Digit2' }),
    edge('Latin letter with Alt', { key: 'å', code: 'KeyA', altKey: true }),
    edge('Latin letter with Control on a punctuation key', {
      key: 'ü',
      code: 'BracketLeft',
      ctrlKey: true,
    }),
    edge('Latin letter with Control+Alt on a letter key', {
      key: 'ą',
      code: 'KeyA',
      ctrlKey: true,
      altKey: true,
    }),
    edge('Latin letter with Control+Alt on a punctuation key', {
      key: 'ü',
      code: 'BracketLeft',
      ctrlKey: true,
      altKey: true,
    }),
    edge('ASCII symbol with Alt on a letter key', {
      key: '@',
      code: 'KeyL',
      altKey: true,
    }),
    edge('ASCII symbol with Shift on a letter key', {
      key: ':',
      code: 'KeyM',
      shiftKey: true,
    }),
    edge('zoom key with Control on the digit row', {
      key: '-',
      code: 'Digit6',
      ctrlKey: true,
    }),
    edge('zoom key with Command on the digit row', {
      key: '=',
      code: 'Digit0',
      metaKey: true,
    }),
    edge('zoom key with Control+Command on the digit row', {
      key: '+',
      code: 'Digit1',
      ctrlKey: true,
      metaKey: true,
    }),
    edge('zoom key with Control+Shift on the digit row', {
      key: '-',
      code: 'Digit6',
      ctrlKey: true,
      shiftKey: true,
    }),
    edge('zoom key with Control+Alt on the digit row', {
      key: '=',
      code: 'Digit0',
      ctrlKey: true,
      altKey: true,
    }),
    edge('zoom key with Command+Shift on the digit row', {
      key: '+',
      code: 'Digit1',
      metaKey: true,
      shiftKey: true,
    }),
    edge('zoom key with Command+Alt on the digit row', {
      key: '-',
      code: 'Digit6',
      metaKey: true,
      altKey: true,
    }),
    edge('zoom key on its own on the digit row', { key: '-', code: 'Digit6' }),
    edge('Process key', { key: 'Process', code: 'KeyA' }),
    edge('Unidentified without a code', { key: 'Unidentified', code: '' }),
    edge('Unidentified modifier', {
      key: 'Unidentified',
      code: 'ShiftLeft',
      shiftKey: true,
    }),
  ]
  if (platform === 'mac') {
    return [
      ...common,
      edge('Option+Space types a no-break space', {
        key: ' ',
        code: 'Space',
        altKey: true,
      }),
      edge('Option+Shift+B types ı', {
        key: 'ı',
        code: 'KeyB',
        altKey: true,
        shiftKey: true,
      }),
      edge('Option+E dead key with its keycap', {
        key: 'Dead',
        code: 'KeyE',
        altKey: true,
        keyCode: 69,
      }),
      edge('Option dead key without a keycap', {
        key: 'Dead',
        code: 'Backquote',
        altKey: true,
      }),
      edge('Option named key with a keycap', {
        key: 'Enter',
        code: 'KeyA',
        altKey: true,
        keyCode: 65,
      }),
      edge('Option Unidentified key with a keycap', {
        key: 'Unidentified',
        code: 'Minus',
        altKey: true,
        keyCode: 65,
      }),
    ]
  }
  const altGr = [
    edge('AltGr+F typing nothing new', {
      key: 'f',
      code: 'KeyF',
      altGraph: true,
    }),
    edge('AltGr+Shift+F typing nothing new', {
      key: 'F',
      code: 'KeyF',
      shiftKey: true,
      altGraph: true,
    }),
    edge('AltGr+Home', { key: 'Home', code: 'Home', altGraph: true }),
    edge('AltGr+1 typing 1', { key: '1', code: 'Digit1', altGraph: true }),
    edge('AltGr+Space', { key: ' ', code: 'Space', altGraph: true }),
    edge('AltGr dead key', {
      key: 'Dead',
      code: 'BracketRight',
      altGraph: true,
    }),
    edge('AltGr+E types € with Meta', {
      key: '€',
      code: 'KeyE',
      metaKey: true,
      altGraph: true,
    }),
  ]
  if (platform === 'linux') return [...common, ...altGr]
  return [
    ...common,
    ...altGr,
    edge('AltGr+Q types @, reported with Control+Alt', {
      key: '@',
      code: 'KeyQ',
      ctrlKey: true,
      altKey: true,
      altGraph: true,
    }),
    edge('AltGr+F types f, reported with Control+Alt', {
      key: 'f',
      code: 'KeyF',
      ctrlKey: true,
      altKey: true,
      altGraph: true,
    }),
  ]
}

function layoutPresses(platform: Platform): Array<Press> {
  return allLayoutPresses(platform)
    .filter((press) => !LOOK_ALIKE_LETTERS.has(press.init.key.normalize('NFC')))
    .map((press) => ({
      label: press.label,
      init: {
        key: press.init.key,
        code: press.init.code ?? '',
        ctrlKey: Boolean(press.init.ctrlKey),
        altKey: Boolean(press.init.altKey),
        shiftKey: Boolean(press.init.shiftKey),
        metaKey: Boolean(press.init.metaKey),
        ...(press.init.altGraph ? { altGraph: true } : {}),
        ...(press.init.keyCode ? { keyCode: press.init.keyCode } : {}),
      },
    }))
}

type Source = 'table' | 'edge' | 'free'

const LISTS = new Map<string, ReadonlyArray<Press>>()
/** The table or edge presses of a platform, or only those with AltGr held. */
function pressList(
  platform: Platform,
  source: 'table' | 'edge',
  altGrOnly: boolean,
): ReadonlyArray<Press> {
  const id = `${platform} ${source} ${altGrOnly}`
  let list = LISTS.get(id)
  if (!list) {
    const all =
      source === 'table' ? layoutPresses(platform) : edgePresses(platform)
    // macOS has no AltGr: its AltGr histories are Option presses that
    // report AltGraph (the `mac-altgraph` variant)
    list = altGrOnly
      ? all.filter((press) =>
          platform === 'mac' ? press.init.altKey : press.init.altGraph,
        )
      : all
    LISTS.set(id, list)
  }
  return list
}

/**
 * Free presses: any key from a pool on any code, with any modifiers, so the
 * combinations no layout types are tried too. Look-alike letters and
 * Latin-script symbols are not in the pool (see the limits).
 */
const FREE_KEYS = [
  ...['a', 'S', 'q', 'I', 'i', 'z', '1', '6', '0'],
  ...['-', '+', '=', '/', '?', '!', '&', '@', '[', ';', "'", '`', '<', ' '],
  ...['é', 'ü', 'å', 'ą', 'ø', 'Ü', 'ß', 'ı', 'İ', 'ſ'],
  ...[
    'q\u0303',
    'ы',
    'ф',
    'ש',
    'שׁ',
    'α',
    'ς',
    'ก',
    '中',
    '€',
    '–',
    '§',
    '\u00a0',
  ],
  ...['Dead', 'Unidentified', 'Enter', 'End', 'Home', 'F5', 'Escape'],
  ...['Process', ''],
]
const FREE_CODES = [
  ...['KeyA', 'KeyS', 'KeyQ', 'KeyI', 'KeyZ', 'Digit1', 'Digit6', 'Digit0'],
  ...['Numpad1', 'Numpad5', 'NumpadAdd', 'NumpadSubtract', 'NumpadMultiply'],
  ...['NumpadDivide', 'NumpadDecimal', 'NumpadEnter', 'Minus', 'Equal'],
  ...['Slash', 'BracketLeft', 'Backquote', 'Quote', 'Space', 'IntlBackslash'],
  ...['Enter', 'Home', 'F5', 'Unidentified', 'ShiftLeft', ''],
]
/** keyCode values, with the edges of the A to Z range. */
const FREE_KEY_CODES = [0, 64, 65, 69, 81, 90, 91, 48]

interface FreePress {
  key: number
  code: number
  /** 1 Control, 2 Alt, 4 Shift, 8 Meta, 16 AltGr. */
  flags: number
  keyCode: number
}

function freePress(
  platform: Platform,
  free: FreePress,
  altGrOnly: boolean,
): Press {
  const flags = altGrOnly && platform !== 'mac' ? free.flags | 16 : free.flags
  const altGraph = (flags & 16) !== 0
  // A real Control or Alt beside AltGr is generated only on Windows, where
  // the browser reports AltGr as Control+Alt (see the limits)
  const lone = altGraph && platform !== 'windows'
  const keyCode = FREE_KEY_CODES[free.keyCode % FREE_KEY_CODES.length]!
  const init: PressInit = {
    key: FREE_KEYS[free.key % FREE_KEYS.length]!,
    code: FREE_CODES[free.code % FREE_CODES.length]!,
    ctrlKey: (flags & 1) !== 0 && !lone,
    altKey: ((flags & 2) !== 0 && !lone) || (altGrOnly && platform === 'mac'),
    shiftKey: (flags & 4) !== 0,
    metaKey: (flags & 8) !== 0,
    ...(altGraph ? { altGraph: true } : {}),
    ...(keyCode ? { keyCode } : {}),
  }
  return {
    label: `free ${platform} ${JSON.stringify(init)}`,
    init,
  }
}

function pressOf(history: History): Press {
  if (history.source === 'free')
    return freePress(history.platform, history.free, history.altGrOnly)
  const list = pressList(history.platform, history.source, history.altGrOnly)
  return list[history.press % list.length]!
}

// ---------------------------------------------------------------------------
// The model: a press's modifiers, names and strengths
// ---------------------------------------------------------------------------

/**
 * The character a US QWERTY keyboard types on each position without
 * modifiers: the "conventional position" the guide falls back to. Keys with
 * no US ANSI position (`IntlBackslash`, `IntlRo`) have none.
 */
const US_POSITION: Readonly<Record<string, string>> = {
  ...Object.fromEntries(
    [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter) => [`Key${letter}`, letter]),
  ),
  ...Object.fromEntries(
    [...'0123456789'].flatMap((digit) => [
      [`Digit${digit}`, digit],
      [`Numpad${digit}`, digit],
    ]),
  ),
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  NumpadAdd: '+',
  NumpadSubtract: '-',
  NumpadMultiply: '*',
  NumpadDivide: '/',
  NumpadDecimal: '.',
  NumpadEnter: 'Enter',
  Space: 'Space',
}
const usPosition = (code: string): string | undefined =>
  Object.hasOwn(US_POSITION, code) ? US_POSITION[code] : undefined

/** The keycap letter macOS browsers report in `keyCode`, A to Z. */
const keycapLetter = (keyCode: number | undefined): string | undefined =>
  keyCode !== undefined && keyCode >= 65 && keyCode <= 90
    ? String.fromCharCode(keyCode)
    : undefined

/** The key's name as a binding writes it: NFC, and the space bar is `Space`. */
const keyName = (key: string): string => {
  const nfc = key.normalize('NFC')
  return nfc === ' ' ? 'Space' : nfc
}

/** UI Events named key values, such as `End`, `F5`, `Dead`, `Unidentified`. */
const isNamedKey = (key: string): boolean => /^[A-Z][A-Za-z0-9]+$/.test(key)
/** Text a key typed: anything that is not a named key value. */
const isCharacter = (key: string): boolean => key !== '' && !isNamedKey(key)
/** A letter: text whose first code point is a Unicode letter. */
const isLetter = (key: string): boolean =>
  isCharacter(key) && /^\p{L}/u.test(key)
const isSingleLetter = (key: string): boolean => /^\p{L}$/u.test(key)
const isAsciiLetter = (key: string): boolean => /^[A-Za-z]$/.test(key)
const isAsciiSymbol = (key: string): boolean =>
  /^[!-~]$/.test(key) && !isAsciiLetter(key)
const isLatinLetter = (key: string): boolean =>
  isLetter(key) && /^\p{Script=Latin}/u.test(key)

/**
 * Two key names are one key when they are equal, or when they are single
 * letters that differ only in case. Turkish `ı` and the long s `ſ` are
 * letters of their own: their uppercase forms belong to `i` and `s`.
 */
function sameKey(a: string, b: string): boolean {
  if (a === b) return true
  if (!isSingleLetter(a) || !isSingleLetter(b)) return false
  if (['ı', 'ſ'].includes(a) || ['ı', 'ſ'].includes(b)) return false
  return (
    a.toUpperCase() === b.toUpperCase() || a.toLowerCase() === b.toLowerCase()
  )
}

/** Keys an input method editor reads (guide, "IME composition"). */
function composing(init: PressInit): boolean {
  return (
    Boolean(init.isComposing) ||
    init.keyCode === 229 ||
    init.key === 'Process' ||
    (init.key === 'Unidentified' &&
      (init.code === '' ||
        init.code === 'Unidentified' ||
        /^(Control|Shift|Alt|Meta)(Left|Right)$/.test(init.code)))
  )
}

interface Modifiers {
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
}

interface PressView {
  /** Why the press has no names at all, if it has none. */
  silent?: 'composing' | 'altgr-nothing-new'
  modifiers: Modifiers
  names: Array<PressName>
  tags: Array<string>
}
interface PressName {
  key?: string
  code?: string
  shift: boolean
  strength: 1 | 2 | 3
}

/**
 * Whether the press's position may stand in for what it typed, and which
 * class of output decides it (guide, "Keys match the character the user
 * types", and the `positionStandsIn` comment).
 */
function standIn(
  platform: Platform,
  key: string,
  code: string,
  { ctrl, alt, shift, meta }: Modifiers,
): { standsIn: boolean; why: string } {
  const letterPosition = /^Key[A-Z]$/.test(code)
  if (key === 'Unidentified')
    return /^(Key|Numpad)/.test(code)
      ? { standsIn: false, why: 'unidentified-letter-or-numpad' }
      : { standsIn: true, why: 'unidentified' }
  if (code.startsWith('Digit')) {
    const zoomModifierAlone =
      !shift && !alt && (platform === 'mac' ? meta && !ctrl : ctrl && !meta)
    return zoomModifierAlone && /^[-+=]$/.test(key)
      ? { standsIn: false, why: 'zoom-guard' }
      : { standsIn: true, why: 'digit-row' }
  }
  if (key === 'Dead') return { standsIn: true, why: 'dead' }
  if (!isCharacter(key)) return { standsIn: false, why: 'named' }
  if (isAsciiLetter(key)) return { standsIn: false, why: 'ascii-letter' }
  if (isAsciiSymbol(key)) {
    if (shift) return { standsIn: true, why: 'ascii-symbol-with-shift' }
    if (platform === 'mac' && alt && letterPosition)
      return { standsIn: true, why: 'option-symbol-on-letter-key' }
    return { standsIn: false, why: 'ascii-symbol' }
  }
  if (!isLatinLetter(key))
    return {
      standsIn: true,
      why: [...key].length > 1 ? 'non-latin-text' : 'non-latin',
    }
  if (alt && !(platform === 'windows' && ctrl && letterPosition))
    return { standsIn: true, why: 'latin-with-alt' }
  if ((ctrl || meta) && !letterPosition)
    return { standsIn: true, why: 'latin-with-control-on-punctuation' }
  return {
    standsIn: false,
    why: alt ? 'windows-control-alt-latin-letter' : 'latin',
  }
}

/** The press's modifiers and the names a binding can call it by. */
function viewPress(platform: Platform, init: PressInit): PressView {
  const key = keyName(init.key)
  const { code } = init
  const tags: Array<string> = []
  const reported: Modifiers = {
    ctrl: init.ctrlKey,
    alt: init.altKey,
    shift: init.shiftKey,
    meta: init.metaKey,
  }
  if (composing(init))
    return {
      silent: 'composing',
      modifiers: reported,
      names: [],
      tags: ['composing'],
    }

  // macOS has no AltGr: the AltGraph state WebKit reports for Option is Alt.
  // A synthetic event that can't report AltGraph holds no AltGr
  // (src/_keyboard-event.ts:34).
  const altGraphHeld =
    platform !== 'mac' && Boolean(init.altGraph) && !init.modifierState
  if (platform === 'mac' && init.altGraph) tags.push('mac-altgraph-ignored')
  if (init.altGraph && init.modifierState) tags.push('altgraph-unreadable')
  // AltGr typed something new unless it typed a named key, or an ASCII
  // letter or digit (guide, "Modifiers must match exactly", AltGr).
  const typedNew =
    altGraphHeld &&
    (key === 'Dead' || (isCharacter(key) && !/^[A-Za-z0-9]$/.test(key)))
  if (altGraphHeld && !typedNew && platform !== 'windows')
    return {
      silent: 'altgr-nothing-new',
      modifiers: reported,
      names: [],
      tags: ['altgr-nothing-new'],
    }
  const windowsControlAlt = platform === 'windows' && altGraphHeld && !typedNew
  const altGrCharacter = altGraphHeld && typedNew
  if (windowsControlAlt) tags.push('windows-altgr-as-control-alt')
  if (altGrCharacter) tags.push('altgr-character')
  const modifiers: Modifiers = {
    ctrl: !altGrCharacter && (init.ctrlKey || windowsControlAlt),
    alt: !altGrCharacter && (init.altKey || windowsControlAlt),
    shift: init.shiftKey,
    meta: init.metaKey,
  }
  const names: Array<PressName> = []

  // The code, with exactly its Shift. AltGr matches only its character.
  if (!altGrCharacter && code !== '')
    names.push({ code, shift: modifiers.shift, strength: 3 })

  // The character typed. Shift that typed a symbol needn't be written,
  // except when macOS Command+Shift reports the unshifted US character.
  if (key !== '') {
    if (isCharacter(key) && !isLetter(key)) {
      const unshiftedReport =
        platform === 'mac' &&
        modifiers.meta &&
        modifiers.shift &&
        !modifiers.alt &&
        !/^(Digit|Numpad)/.test(code) &&
        usPosition(code) === key
      if (unshiftedReport) {
        tags.push('command-shift-unshifted')
        names.push({ key, shift: true, strength: 3 })
      } else {
        tags.push(modifiers.shift ? 'symbol-with-shift' : 'symbol')
        names.push({ key, shift: false, strength: 2 })
        if (modifiers.shift) names.push({ key, shift: true, strength: 3 })
      }
    } else {
      names.push({ key, shift: modifiers.shift, strength: 3 })
    }
  }
  if (altGrCharacter) return { modifiers, names, tags }

  // Turkish ı is the I key of Windows' VK_I, unless Alt picks the position.
  if (key === 'ı' && !modifiers.alt) {
    tags.push('dotless-i')
    names.push({ key: 'I', shift: modifiers.shift, strength: 2 })
  }

  // macOS Option: the keycap letter, from keyCode, stands in for a character.
  const optionCharacter =
    platform === 'mac' &&
    modifiers.alt &&
    (key === 'Dead' || (isCharacter(key) && !isAsciiLetter(key)))
  const keycap = optionCharacter ? keycapLetter(init.keyCode) : undefined
  if (keycap !== undefined) {
    tags.push('stand-in:keycap')
    names.push({ key: keycap, shift: modifiers.shift, strength: 1 })
    return { modifiers, names, tags }
  }
  const { standsIn, why } = standIn(platform, key, code, modifiers)
  const position = usPosition(code)
  tags.push(`${standsIn ? 'stand-in' : 'no-stand-in'}:${why}`)
  if (standsIn && position !== undefined)
    names.push({ key: position, shift: modifiers.shift, strength: 1 })
  return { modifiers, names, tags }
}

interface PlanChord {
  text: string
  control: boolean
  alt: boolean
  shift: boolean
  meta: boolean
  /** `Mod` written in place of the platform's primary modifier. */
  mod: boolean
  key?: string
  code?: string
}

/** How strongly the press matches the chord: 0 when it does not match. */
function strength(
  platform: Platform,
  init: PressInit,
  chord: PlanChord,
): number {
  const { modifiers, names } = viewPress(platform, init)
  // Mod is Command on macOS, Control on Windows and Linux.
  const ctrl = chord.control || (chord.mod && platform !== 'mac')
  const meta = chord.meta || (chord.mod && platform === 'mac')
  if (
    ctrl !== modifiers.ctrl ||
    chord.alt !== modifiers.alt ||
    meta !== modifiers.meta
  )
    return 0
  let best = 0
  for (const name of names) {
    if (name.shift !== chord.shift) continue
    const same =
      chord.code !== undefined
        ? name.code === chord.code
        : name.key !== undefined && sameKey(name.key, chord.key!)
    if (same) best = Math.max(best, name.strength)
  }
  return best
}

// ---------------------------------------------------------------------------
// Histories
// ---------------------------------------------------------------------------

type KeyPick =
  | 'typed'
  | 'position'
  | 'keycap'
  | 'dotless-i'
  | 'physical'
  | 'other-code'
  | 'other-key'
type Variant =
  | 'none'
  | 'mac-altgraph'
  | 'is-composing'
  | 'key-code-229'
  | 'process'
  | 'unidentified-no-code'
  | 'unidentified-code'
  | 'unidentified-modifier'
  | 'modifier-state-throws'
  | 'modifier-state-missing'
type Odd =
  | 'key-undefined'
  | 'code-undefined'
  | 'key-empty'
  | 'code-proto'
  | 'key-proto'
  | 'modifier-state-throws'
  | 'modifier-state-missing'

interface ChordPick {
  key: KeyPick
  /** Index into the key or code pool, for `other-key` and `other-code`. */
  pool: number
  /** Modifiers flipped from the press's: 1 Control, 2 Alt, 4 Shift, 8 Meta. */
  flips: number
  /** Write the platform's primary modifier as `Mod`. */
  mod: boolean
}
interface History {
  platform: Platform
  source: Source
  press: number
  free: FreePress
  /** Only presses with AltGr held (Option reporting AltGraph on macOS). */
  altGrOnly: boolean
  variant: Variant
  odd: Odd
  chords: Array<ChordPick>
}
interface Plan {
  platform: Platform
  label: string
  init: PressInit
  odd: Odd
  chords: Array<PlanChord>
}

/** Keys a binding may name that no particular press decides. */
const KEY_POOL = [
  ...'ASZQW1269',
  ..."-=+/?![]\\;',.`@#",
  ...['é', 'É', 'ß', 'ẞ', 'ü', 'Ü', 'ы', 'Ы', 'ö', 'ø', 'æ', 'ą', 'ç'],
  ...['ı', 'İ', 'i', 'ſ', 'ς', 'Σ', 'σ', 'µ', 'Μ', '€', '–', '§', '¿'],
  ...['Dead', 'Unidentified', 'Enter', 'Escape', 'Space', 'Tab', 'End'],
  ...['Home', 'ArrowUp', 'F5', 'Backspace'],
]
const CODE_POOL = [
  ...['KeyA', 'KeyS', 'KeyQ', 'KeyI', 'Digit1', 'Digit6', 'Minus', 'Equal'],
  ...['Slash', 'Backquote', 'Quote', 'BracketLeft', 'Numpad1', 'NumpadEnter'],
  ...['Enter', 'Space', 'IntlBackslash', 'F5', 'ArrowUp', 'Home'],
]

/** What the chord names: a key or a code, built from the press. */
function chordTarget(
  init: PressInit,
  pick: ChordPick,
): { key: string } | { code: string } {
  const typed = keyName(init.key)
  const position = usPosition(init.code)
  switch (pick.key) {
    case 'typed':
      // A binding string can't name whitespace
      if (typed.trim() !== '') return { key: typed }
      break
    case 'position':
      if (position !== undefined) return { key: position }
      break
    case 'keycap': {
      const letter = keycapLetter(init.keyCode) ?? position
      if (letter !== undefined) return { key: letter }
      break
    }
    case 'dotless-i':
      return { key: 'I' }
    case 'other-code':
      return { code: CODE_POOL[pick.pool % CODE_POOL.length]! }
    case 'other-key': {
      const key = KEY_POOL[pick.pool % KEY_POOL.length]!
      // Never a letter's look-alike (see the limits)
      if (!(LOOK_ALIKE_KEYS.test(typed) && LOOK_ALIKE_KEYS.test(key)))
        return { key }
      break
    }
    case 'physical':
      break
  }
  return init.code !== '' ? { code: init.code } : { key: 'Enter' }
}

function chordFor(
  platform: Platform,
  init: PressInit,
  pick: ChordPick,
): PlanChord {
  const flipped = (bit: number) => (pick.flips & bit) !== 0
  const control = init.ctrlKey !== flipped(1)
  const alt = init.altKey !== flipped(2)
  const shift = init.shiftKey !== flipped(4)
  const meta = init.metaKey !== flipped(8)
  const mod = pick.mod && (platform === 'mac' ? meta : control)
  const target = chordTarget(init, pick)
  const name = 'code' in target ? `[${target.code}]` : target.key
  const parts = [
    mod && 'Mod',
    control && !(mod && platform !== 'mac') && 'Control',
    alt && 'Alt',
    shift && 'Shift',
    meta && !(mod && platform === 'mac') && 'Meta',
    name,
  ].filter((part): part is string => typeof part === 'string')
  return {
    text: parts.join('+'),
    control: control && !(mod && platform !== 'mac'),
    alt,
    shift,
    meta: meta && !(mod && platform === 'mac'),
    mod,
    ...target,
  }
}

function applyVariant(
  platform: Platform,
  init: PressInit,
  variant: Variant,
): PressInit {
  switch (variant) {
    case 'none':
      return init
    case 'mac-altgraph':
      return platform === 'mac' ? { ...init, altGraph: true } : init
    case 'is-composing':
      return { ...init, isComposing: true }
    case 'key-code-229':
      return { ...init, keyCode: 229 }
    case 'process':
      return { ...init, key: 'Process' }
    case 'unidentified-code':
      return { ...init, key: 'Unidentified', code: 'Unidentified' }
    case 'unidentified-no-code':
      return { ...init, key: 'Unidentified', code: '' }
    case 'modifier-state-throws':
      return { ...init, modifierState: 'throws' }
    case 'modifier-state-missing':
      return { ...init, modifierState: 'missing' }
    case 'unidentified-modifier':
      return {
        ...init,
        key: 'Unidentified',
        code: 'ControlLeft',
        ctrlKey: true,
      }
  }
}

function resolve(history: History): Plan {
  const press = pressOf(history)
  const variant =
    history.altGrOnly && history.platform === 'mac'
      ? 'mac-altgraph'
      : history.variant
  const init = applyVariant(history.platform, press.init, variant)
  return {
    platform: history.platform,
    label: `${press.label}${variant === 'none' ? '' : ` ${variant}`}`,
    // Chords come from the event as sent, so a composing key's chord is
    // the one it would fire without the input method
    chords: history.chords.map((pick) =>
      chordFor(history.platform, init, pick),
    ),
    init,
    odd: history.odd,
  }
}

function chordArb(
  picks: ReadonlyArray<KeyPick>,
  flips: fc.Arbitrary<number>,
): fc.Arbitrary<ChordPick> {
  return fc.record({
    key: fc.constantFrom(...picks),
    pool: fc.nat({ max: 999 }),
    flips,
    mod: fc.boolean(),
  })
}
/** Mostly the press's own modifiers, sometimes a flipped Shift, rarely any. */
const MOSTLY_EXACT = fc.oneof(
  { weight: 6, arbitrary: fc.constant(0) },
  { weight: 2, arbitrary: fc.constant(4) },
  { weight: 1, arbitrary: fc.nat({ max: 15 }) },
)

function historyArb(options: {
  picks: ReadonlyArray<KeyPick>
  flips?: fc.Arbitrary<number>
  variants?: fc.Arbitrary<Variant>
  odd?: fc.Arbitrary<Odd>
  chords?: 1 | 2
  altGrOnly?: boolean
}): fc.Arbitrary<History> {
  const chord = chordArb(options.picks, options.flips ?? MOSTLY_EXACT)
  return fc.record({
    platform: fc.constantFrom(...PLATFORMS),
    source: fc.constantFrom<Source>('table', 'edge', 'free'),
    press: fc.nat({ max: 1_000_000 }),
    free: fc.record({
      key: fc.nat({ max: 999 }),
      code: fc.nat({ max: 999 }),
      flags: fc.oneof(
        { weight: 2, arbitrary: fc.nat({ max: 15 }) },
        { weight: 1, arbitrary: fc.nat({ max: 31 }) },
      ),
      keyCode: fc.nat({ max: 99 }),
    }),
    altGrOnly: fc.constant(options.altGrOnly ?? false),
    variant:
      options.variants ??
      fc.constantFrom<Variant>(
        'none',
        'mac-altgraph',
        'modifier-state-throws',
        'modifier-state-missing',
      ),
    odd: options.odd ?? fc.constant<Odd>('key-undefined'),
    chords: options.chords === 2 ? fc.tuple(chord, chord) : fc.tuple(chord),
  })
}

/** Where a constructed history's press is: a table or edge list and index. */
interface At {
  source: 'table' | 'edge'
  press: number
  altGrOnly: boolean
}

/** The first table or edge press on the platform that satisfies `test`. */
function pressWhere(
  platform: Platform,
  test: (press: Press, view: PressView) => boolean,
  altGrOnly = false,
): At {
  for (const source of ['table', 'edge'] as const) {
    const press = pressList(platform, source, altGrOnly).findIndex((p) =>
      test(p, viewPress(platform, p.init)),
    )
    if (press >= 0) return { source, press, altGrOnly }
  }
  throw new Error(`No ${platform} press for a constructed history`)
}
const pressTagged = (platform: Platform, tag: string) =>
  pressWhere(platform, (_, view) => view.tags.includes(tag))
const pressLabeled = (platform: Platform, label: string, altGrOnly = false) =>
  pressWhere(platform, (press) => press.label === label, altGrOnly)

/** A free press built from pool values, for a constructed history. */
function freeAt(
  key: string,
  code: string,
  flags: number,
  keyCode = 0,
  altGrOnly = false,
): { source: 'free'; press: number; free: FreePress; altGrOnly: boolean } {
  const free = {
    key: FREE_KEYS.indexOf(key),
    code: FREE_CODES.indexOf(code),
    flags,
    keyCode: FREE_KEY_CODES.indexOf(keyCode),
  }
  if (Object.values(free).some((value) => value < 0))
    throw new Error(`No free press ${key} ${code} ${keyCode}`)
  return { source: 'free', press: 0, free, altGrOnly }
}

/** A constructed history: one press, and the chord built from `pick`. */
function construct(
  name: string,
  enters: Array<string>,
  platform: Platform,
  at: At | ReturnType<typeof freeAt>,
  pick: Partial<ChordPick>,
  variant: Variant = 'none',
) {
  return {
    name,
    enters,
    build: (generated: History): History => ({
      ...generated,
      platform,
      ...at,
      variant,
      chords: generated.chords.map((chord, index) =>
        index === 0 ? { ...chord, flips: 0, ...pick } : chord,
      ),
    }),
  }
}

/** Free-press constructed histories, each entering the tags the model gives it. */
function constructFree(
  prefix: string,
  platform: Platform,
  presses: Array<[key: string, code: string, flags: number, keyCode?: number]>,
  pick: Partial<ChordPick>,
  states: ReadonlyArray<string>,
) {
  return presses.map(([key, code, flags, keyCode]) => {
    const at = freeAt(key, code, flags, keyCode)
    const view = viewPress(platform, freePress(platform, at.free, false).init)
    return construct(
      `${prefix}: ${platform} ${JSON.stringify(key)} on ${code}, flags ${flags}${keyCode ? `, keyCode ${keyCode}` : ''}`,
      view.tags.filter((tag) => states.includes(tag)),
      platform,
      at,
      pick,
    )
  })
}

// ---------------------------------------------------------------------------
// Reach: the class of the press and the outcome of each chord
// ---------------------------------------------------------------------------

const STAND_IN_TAGS = [
  'stand-in:unidentified',
  'stand-in:digit-row',
  'stand-in:dead',
  'stand-in:ascii-symbol-with-shift',
  'stand-in:option-symbol-on-letter-key',
  'stand-in:non-latin',
  'stand-in:non-latin-text',
  'stand-in:latin-with-alt',
  'stand-in:latin-with-control-on-punctuation',
  'stand-in:keycap',
  'no-stand-in:unidentified-letter-or-numpad',
  'no-stand-in:zoom-guard',
  'no-stand-in:named',
  'no-stand-in:ascii-letter',
  'no-stand-in:ascii-symbol',
  'no-stand-in:latin',
  'no-stand-in:windows-control-alt-latin-letter',
]
const ALL_TAGS = [
  ...STAND_IN_TAGS,
  'composing',
  'altgr-nothing-new',
  'altgr-character',
  'windows-altgr-as-control-alt',
  'mac-altgraph-ignored',
  'altgraph-unreadable',
  'command-shift-unshifted',
  'symbol',
  'symbol-with-shift',
  'dotless-i',
  'matched',
  'not-matched',
  'strength-1',
  'strength-2',
  'strength-3',
  'mod-written',
  'outranked',
  'tie',
]

function reachedTags(plan: Plan): Array<string> {
  const tags = new Set(viewPress(plan.platform, plan.init).tags)
  const strengths = plan.chords.map((chord) =>
    strength(plan.platform, plan.init, chord),
  )
  for (const [index, value] of strengths.entries()) {
    tags.add(value > 0 ? 'matched' : 'not-matched')
    if (value > 0) tags.add(`strength-${value}`)
    if (plan.chords[index]!.mod) tags.add('mod-written')
  }
  if (strengths.length === 2 && strengths[0]! > 0 && strengths[1]! > 0)
    tags.add(strengths[0] === strengths[1] ? 'tie' : 'outranked')
  return [...tags]
}
const measuredBesides = (states: ReadonlyArray<string>) =>
  ALL_TAGS.filter((tag) => !states.includes(tag))

// ---------------------------------------------------------------------------
// The driver and the check, shared by the boolean laws
// ---------------------------------------------------------------------------

function pressEvent({ modifierState, ...init }: PressInit): KeyboardEvent {
  const event = keyEvent('keydown', init)
  if (modifierState)
    Object.defineProperty(event, 'getModifierState', {
      configurable: true,
      value:
        modifierState === 'missing'
          ? undefined
          : () => {
              throw new Error('getModifierState is not implemented')
            },
    })
  return event
}

function matchDriver(
  plan: Plan,
  observe: (checkpoint: string, value: unknown) => void,
): void {
  const event = pressEvent(plan.init)
  for (const chord of plan.chords) {
    try {
      observe(
        'match',
        matchesKeyboardEvent(event, chord.text as never, plan.platform),
      )
    } catch (error) {
      observe('match', `threw ${String(error)}`)
    }
  }
}

const expectedMatches = (plan: Plan): Array<boolean> =>
  plan.chords.map((chord) => strength(plan.platform, plan.init, chord) > 0)

function matchCheck(law: string) {
  return (
    plan: Plan,
    observations: ReadonlyArray<Observation>,
    expected: Array<boolean>,
  ) =>
    differs(
      'match',
      law,
      observations
        .filter((observation) => observation.checkpoint === 'match')
        .map((observation) => observation.value),
      expected,
      `${plan.label}: ${plan.chords.map((chord) => chord.text).join(', ')}`,
    ) ?? pass
}

/** Flips the first chord's recorded answer: a wrong match must be rejected. */
const flipFirstMatch = (trace: ReadonlyArray<Observation>) => {
  const index = trace.findIndex((o) => o.checkpoint === 'match')
  if (index < 0) return undefined
  return trace.map((o, i) => (i === index ? { ...o, value: !o.value } : o))
}

function matchLaw(options: {
  id: string
  law: string
  statement: string
  authority: string
  limits: string
  histories: fc.Arbitrary<History>
  states: Array<string>
  constructed: Array<ReturnType<typeof construct>>
  calibrate: string
}) {
  oracleProperty<History, Array<boolean>, Plan>({
    id: options.id,
    owns: ['src/_match.ts#matchKeyboardEvent'],
    law: {
      statement: options.statement,
      authority: `${options.authority} ${APPROVAL}`,
      limits: options.limits,
    },
    histories: {
      arbitrary: options.histories,
      states: options.states,
      measured: measuredBesides(options.states),
      runs: 100,
      fixedSeeds: [SEED],
      constructed: options.constructed,
    },
    resolve,
    model: expectedMatches,
    reached: reachedTags,
    driver: matchDriver,
    check: matchCheck(options.law),
    calibrations: [
      {
        name: `${options.law}: a flipped answer`,
        law: options.law,
        history: { constructed: options.calibrate },
        corrupt: flipFirstMatch,
      },
    ],
  })
}

// ---------------------------------------------------------------------------
// The laws
// ---------------------------------------------------------------------------

const ALL_PICKS: ReadonlyArray<KeyPick> = [
  'typed',
  'position',
  'keycap',
  'dotless-i',
  'physical',
  'other-code',
  'other-key',
]

matchLaw({
  id: 'key-matching/modifiers',
  law: 'modifiers',
  statement:
    "For every press and chord, the chord matches only when its Control, Alt and Meta, with Mod read as Command on macOS and Control on Windows and Linux, are exactly the press's: a character AltGr typed holds no Control or Alt, and Windows AltGr that typed nothing new holds Control+Alt.",
  authority:
    'docs/guides/sensible-defaults.md:30-36 ("Mod follows the platform"), :115-117 ("Mod+S does not fire for Mod+Shift+S"), :127 (AltGr); src/_match.ts:47-48 (AltGr: "synthetic Control+Alt flags are not modifiers").',
  limits:
    "Linux AltGr with a real Control or Alt held is not generated. The match itself, once modifiers agree, is the other laws'.",
  histories: historyArb({
    picks: ALL_PICKS,
    flips: fc.oneof(
      { weight: 3, arbitrary: fc.constantFrom(1, 2, 8, 9, 3, 10, 11) },
      { weight: 2, arbitrary: fc.constant(0) },
      { weight: 1, arbitrary: fc.nat({ max: 15 }) },
    ),
  }),
  states: ['matched', 'not-matched', 'mod-written'],
  constructed: [
    construct(
      'Mod+S on a US keyboard',
      ['matched', 'mod-written'],
      'mac',
      pressLabeled('mac', 'mac US meta+KeyS ("s")'),
      { key: 'typed', mod: true },
    ),
    construct(
      'Mod is not Control on macOS',
      ['not-matched', 'mod-written'],
      'mac',
      pressLabeled('mac', 'mac US ctrl+KeyS ("s")'),
      { key: 'typed', flips: 9, mod: true },
    ),
  ],
  calibrate: 'Mod+S on a US keyboard',
})

matchLaw({
  id: 'key-matching/physical',
  law: 'physical',
  statement:
    "For every press and physical chord `[Code]`, the chord matches exactly when the code is the press's code and its modifiers, Shift included, are the press's, and AltGr did not type a character.",
  authority:
    'docs/guides/sensible-defaults.md:66-77 ("Physical bindings match event.code exactly and ignore the layout"); src/match.ts:20 ("Physical bindings such as Mod+[KeyS] match event.code exactly"); src/_match.ts:59 ("AltGr matches only the character it typed, never a position").',
  limits: 'None beyond the shared ones.',
  histories: historyArb({ picks: ['physical', 'other-code'] }),
  states: [
    'matched',
    'not-matched',
    'altgr-character',
    'windows-altgr-as-control-alt',
  ],
  constructed: [
    construct(
      'AZERTY [KeyQ] on the A key',
      ['matched'],
      'linux',
      pressLabeled('linux', 'linux fr ctrl+KeyQ ("a")'),
      { key: 'physical' },
    ),
    construct(
      'AltGr+Q typing @ is not [KeyQ]',
      ['altgr-character', 'not-matched'],
      'linux',
      pressWhere(
        'linux',
        (p) =>
          p.init.key === '@' &&
          p.init.code === 'KeyQ' &&
          Boolean(p.init.altGraph),
      ),
      { key: 'physical' },
    ),
    construct(
      'Windows AltGr+F is Control+Alt+[KeyF]',
      ['windows-altgr-as-control-alt', 'matched'],
      'windows',
      pressLabeled('windows', 'edge AltGr+F typing nothing new'),
      { key: 'physical', flips: 3 },
    ),
  ],
  calibrate: 'AZERTY [KeyQ] on the A key',
})

matchLaw({
  id: 'key-matching/character',
  law: 'character',
  statement:
    "For every press and logical chord, a chord for the character the press typed matches when its modifiers are the press's, letters compared without case, with Shift written exactly for letters and named keys, and optional for a symbol, except when macOS Command+Shift reports the unshifted US character of its position outside the digit row and numpad, where Shift must be written.",
  authority:
    'docs/guides/sensible-defaults.md:40 ("matches event.key"), :58-62 (Command+Shift reports the unshifted character; letters without case), :64 (ı and İ are letters of their own), :117-119 (Shift needed to type a symbol); src/match.ts:21-23.',
  limits:
    'Look-alike letters (º and O) are not paired; a multi-code-point symbol is not generated.',
  histories: historyArb({ picks: ['typed', 'other-key'] }),
  states: [
    'matched',
    'not-matched',
    'symbol',
    'symbol-with-shift',
    'command-shift-unshifted',
    'strength-2',
    'strength-3',
  ],
  constructed: [
    construct(
      '? without writing Shift',
      ['symbol-with-shift', 'matched', 'strength-2'],
      'linux',
      pressLabeled('linux', 'linux us shift+Slash ("?")'),
      { key: 'typed', flips: 4 },
    ),
    construct(
      'Cmd+Shift+/ needs Mod+Shift+/',
      ['command-shift-unshifted', 'not-matched'],
      'mac',
      pressLabeled('mac', 'mac US shift+meta+Slash ("/")'),
      { key: 'typed', flips: 4 },
    ),
    ...(
      [
        ['windows', '/', 'Slash', 12],
        ['mac', '/', 'Slash', 4],
        ['mac', '/', 'Slash', 14],
        ['mac', '1', 'Digit1', 12],
        ['mac', '?', 'Slash', 12],
      ] as Array<[Platform, string, string, number]>
    ).flatMap(([platform, key, code, flags]) =>
      constructFree(
        'Shift that typed the symbol',
        platform,
        [[key, code, flags]],
        { key: 'typed', flips: 4 },
        ['symbol-with-shift', 'command-shift-unshifted'],
      ),
    ),
    construct(
      'a plain symbol',
      ['symbol', 'matched'],
      'windows',
      pressLabeled('windows', 'windows en none+Slash ("/")'),
      { key: 'typed' },
    ),
    construct(
      'a letter with Shift written',
      ['matched', 'strength-3'],
      'linux',
      pressLabeled('linux', 'linux de shift+KeyY ("Z")'),
      { key: 'typed' },
    ),
  ],
  calibrate: '? without writing Shift',
})

matchLaw({
  id: 'key-matching/stand-in',
  law: 'stand-in',
  statement:
    "For every press and chord for its US position or its macOS Option keycap letter, the chord matches, with the press's modifiers and Shift written exactly, when the typed output can't name a shortcut: non-Latin text, a dead key, any key on the digit row except -, + or = with only Control (macOS: only Command), Unidentified outside letter and numpad keys, an ASCII symbol typed with Shift or with macOS Option on a letter key, a Latin letter typed with Alt (but not Windows Control+Alt on a letter key) or with Control or Command on a punctuation key. With Option on macOS, the keycap letter from keyCode stands in when it names one. Any other output never stands in.",
  authority:
    'docs/guides/sensible-defaults.md:42-54 (the fallback list and "Otherwise, the character the key reports wins"); src/match.ts:25-36; src/_match.ts:138-164 (the positionStandsIn JSDoc).',
  limits:
    "Latin-script characters that aren't letters appear only with Option or AltGr. The Q and W keys of Greek, Bulgarian and Hebrew, and Thai and Programmer Dvorak digits behind the zoom guard, follow this law and fire no hotkey there.",
  histories: historyArb({ picks: ['position', 'keycap', 'other-key'] }),
  states: [...STAND_IN_TAGS, 'matched', 'not-matched', 'strength-1'],
  constructed: [
    ...STAND_IN_TAGS.map((tag) => {
      const platform: Platform =
        tag === 'stand-in:keycap' ||
        tag === 'stand-in:option-symbol-on-letter-key' ||
        tag === 'stand-in:non-latin-text'
          ? 'mac'
          : tag === 'no-stand-in:windows-control-alt-latin-letter'
            ? 'windows'
            : 'linux'
      return construct(
        `position for ${tag}`,
        [tag],
        platform,
        tag === 'stand-in:digit-row'
          ? pressLabeled('linux', 'linux fr none+Digit1 ("&")')
          : pressTagged(platform, tag),
        { key: tag === 'stand-in:keycap' ? 'keycap' : 'position' },
      )
    }),
    construct(
      'Russian Ctrl+S',
      ['stand-in:non-latin', 'matched', 'strength-1'],
      'linux',
      pressLabeled('linux', 'linux ru ctrl+KeyS ("ы")'),
      { key: 'position' },
    ),
    ...constructFree(
      'numpad position',
      'linux',
      [
        'Numpad1',
        'NumpadAdd',
        'NumpadSubtract',
        'NumpadMultiply',
        'NumpadDivide',
        'NumpadDecimal',
        'NumpadEnter',
      ].map((code) => ['ы', code, 1] as [string, string, number]),
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'zoom modifiers',
      'mac',
      [8, 9, 1, 12, 10, 0].map(
        (flags) => ['-', 'Digit6', flags] as [string, string, number],
      ),
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'zoom modifiers',
      'linux',
      [1, 9, 8, 5, 3, 0].map(
        (flags) => ['-', 'Digit6', flags] as [string, string, number],
      ),
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'ASCII symbol',
      'mac',
      [
        ['@', 'KeyQ', 0],
        ['@', 'Quote', 2],
        ['@', 'KeyQ', 2],
      ],
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'ASCII symbol',
      'linux',
      [['@', 'KeyQ', 2]],
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'Latin letter',
      'windows',
      [
        ['å', 'KeyA', 2],
        ['å', 'KeyA', 3],
        ['å', 'Quote', 1],
        ['å', 'KeyA', 8],
      ],
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'Latin letter',
      'linux',
      [['å', 'KeyA', 3]],
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'Latin letter',
      'mac',
      [['å', 'KeyA', 3]],
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'keyCode edges',
      'mac',
      [
        ['ы', 'KeyQ', 2, 64],
        ['ы', 'KeyQ', 2, 91],
        ['ы', 'KeyQ', 2, 65],
        ['ы', 'KeyQ', 2, 90],
        ['שׁ', 'KeyQ', 2, 65],
      ],
      { key: 'keycap' },
      STAND_IN_TAGS,
    ),
    ...constructFree(
      'Latin letter with a mark',
      'linux',
      [['q\u0303', 'KeyQ', 0]],
      { key: 'position' },
      STAND_IN_TAGS,
    ),
    construct(
      'AZERTY Ctrl+- is not Mod+6',
      ['no-stand-in:zoom-guard', 'not-matched'],
      'linux',
      pressLabeled('linux', 'linux fr ctrl+Digit6 ("-")'),
      { key: 'position' },
    ),
  ],
  calibrate: 'Russian Ctrl+S',
})

matchLaw({
  id: 'key-matching/altgr',
  law: 'altgr',
  statement:
    'For every press with AltGr held on Windows or Linux, a character AltGr typed matches only a chord for that character (Shift optional for a symbol), never a Control+Alt chord, a position or a code; AltGr that typed nothing new (a named key, an ASCII letter or digit) matches nothing on Linux and is Control+Alt on Windows. On macOS the AltGraph state is ignored.',
  authority:
    'docs/guides/sensible-defaults.md:53 ("On Windows, Control+Alt works like AltGr"), :127 ("AltGr. ... never a Control+Alt shortcut ... An ASCII letter or digit always counts as nothing new"); src/_keyboard-event.ts:26-28 (WebKit reports AltGraph for Option), :145-150 (altGraphTypedCharacter JSDoc).',
  limits: 'Linux AltGr with a real Control or Alt held is not generated.',
  histories: historyArb({
    picks: ALL_PICKS,
    altGrOnly: true,
    variants: fc.constantFrom<Variant>(
      'none',
      'none',
      'modifier-state-throws',
      'modifier-state-missing',
    ),
  }),
  states: [
    'altgr-character',
    'altgr-nothing-new',
    'windows-altgr-as-control-alt',
    'mac-altgraph-ignored',
    'matched',
    'not-matched',
  ],
  constructed: [
    construct(
      'AltGr+Q types @',
      ['altgr-character', 'matched'],
      'linux',
      pressWhere(
        'linux',
        (p) => p.init.key === '@' && p.init.code === 'KeyQ',
        true,
      ),
      { key: 'typed' },
    ),
    construct(
      'Windows AltGr+Q types @',
      ['altgr-character', 'matched'],
      'windows',
      pressWhere(
        'windows',
        (p) => p.init.key === '@' && p.init.code === 'KeyQ' && p.init.ctrlKey,
        true,
      ),
      { key: 'typed', flips: 3 },
    ),
    ...(['linux', 'windows'] as const).map((platform) =>
      construct(
        `${platform} AltGr dead key`,
        ['altgr-character', 'matched'],
        platform,
        pressLabeled(platform, 'edge AltGr dead key', true),
        { key: 'typed' },
      ),
    ),
    construct(
      'AltGr types a letter with a mark',
      ['altgr-character', 'matched'],
      'linux',
      freeAt('שׁ', 'KeyQ', 16, 0, true),
      { key: 'typed' },
    ),
    construct(
      'Linux AltGr+F types nothing new',
      ['altgr-nothing-new', 'not-matched'],
      'linux',
      pressLabeled('linux', 'edge AltGr+F typing nothing new', true),
      { key: 'typed' },
    ),
    construct(
      'Windows AltGr+Home is Control+Alt+Home',
      ['windows-altgr-as-control-alt', 'matched'],
      'windows',
      pressLabeled('windows', 'edge AltGr+Home', true),
      { key: 'typed', flips: 3 },
    ),
    construct(
      'macOS Option reported as AltGraph',
      ['mac-altgraph-ignored', 'matched'],
      'mac',
      pressLabeled('mac', 'mac US alt+KeyS ("ß")', true),
      { key: 'keycap' },
    ),
  ],
  calibrate: 'AltGr+Q types @',
})

matchLaw({
  id: 'key-matching/dotless-i',
  law: 'dotless-i',
  statement:
    "For every press that types Turkish ı without Alt, the chord I matches with the press's modifiers and Shift; a chord for ı never matches a press that types i, and İ matches only a press that types İ.",
  authority:
    'docs/guides/sensible-defaults.md:64 ("I fires on the key that types i, and also on the key that types ı"); src/match.ts:38-39; src/_match.ts:98-101.',
  limits: 'None beyond the shared ones.',
  histories: historyArb({
    picks: ['typed', 'dotless-i', 'other-key', 'position'],
  }),
  states: ['dotless-i', 'matched', 'not-matched', 'strength-2'],
  constructed: [
    construct(
      'I on the ı key',
      ['dotless-i', 'matched', 'strength-2'],
      'windows',
      pressLabeled('windows', 'edge Turkish ı key'),
      { key: 'dotless-i' },
    ),
    construct(
      'I on Option+Shift+B typing ı',
      ['not-matched'],
      'mac',
      pressLabeled('mac', 'edge Option+Shift+B types ı'),
      { key: 'dotless-i' },
    ),
  ],
  calibrate: 'I on the ı key',
})

matchLaw({
  id: 'key-matching/composition',
  law: 'composition',
  statement:
    'For every press while an input method editor composes (isComposing, keyCode 229, key Process, or Unidentified without a usable code), no chord matches.',
  authority:
    'docs/guides/sensible-defaults.md:128 ("IME composition ... no hotkey fires ... the Enter that Safari sends right after composition ends"); src/match.ts:39-40; src/_keyboard-event.ts:58-66 (isComposingEvent JSDoc).',
  limits: 'None beyond the shared ones.',
  histories: historyArb({
    picks: ['typed', 'position', 'keycap', 'physical'],
    variants: fc.constantFrom<Variant>(
      'is-composing',
      'key-code-229',
      'process',
      'unidentified-no-code',
      'unidentified-code',
      'unidentified-modifier',
    ),
  }),
  states: ['composing', 'not-matched'],
  constructed: [
    construct(
      'Safari commit Enter',
      ['composing', 'not-matched'],
      'mac',
      pressLabeled('mac', 'edge Enter'),
      { key: 'typed' },
      'key-code-229',
    ),
    ...(
      [
        'is-composing',
        'process',
        'unidentified-no-code',
        'unidentified-code',
        'unidentified-modifier',
      ] as const
    ).map((variant) =>
      construct(
        `composing: ${variant}`,
        ['composing', 'not-matched'],
        'linux',
        pressLabeled('linux', 'linux us none+KeyS ("s")'),
        { key: 'typed' },
        variant,
      ),
    ),
  ],
  calibrate: 'Safari commit Enter',
})

// ---------------------------------------------------------------------------
// Strength: which of two registrations runs
// ---------------------------------------------------------------------------

function strengthDriver(
  plan: Plan,
  observe: (checkpoint: string, value: unknown) => void,
): void {
  const manager = HotkeyManager.getInstance()
  const fired: Array<number> = []
  try {
    const handles = plan.chords.map((chord, index) =>
      manager.register(chord.text as never, () => fired.push(index), {
        platform: plan.platform,
        ignoreInputs: false,
        conflictBehavior: 'allow',
      }),
    )
    document.dispatchEvent(pressEvent(plan.init))
    for (const handle of handles) handle.unregister()
    observe('fired', [...fired].sort())
  } catch (error) {
    observe('fired', `threw ${String(error)}`)
  } finally {
    HotkeyManager.resetInstance()
  }
}

oracleProperty<History, Array<number>, Plan>({
  id: 'key-matching/strength',
  owns: ['src/_match.ts#matchKeyboardEvent'],
  law: {
    statement:
      'For every press and two registered chords that both match it, a chord runs exactly when no other registered chord matches the press more strongly: the exact code, or the exact character with Shift as written, over a symbol matched without the Shift that may have typed it or ı read as I, over a position or keycap standing in.',
    authority: `docs/guides/sensible-defaults.md:56 ("an exact match takes priority over a fallback"), :60 ("fires Mod+Shift+/ when that is registered, and Mod+/ otherwise"), :64 ("An ı binding takes priority there"); src/_match.ts:19-27 (the KeyboardEventMatch score JSDoc). ${APPROVAL}`,
    limits:
      "Registrations share one target and scope; scope ranking and other dispatch rules are the manager oracle's.",
  },
  histories: {
    arbitrary: historyArb({
      picks: ['typed', 'position', 'keycap', 'dotless-i', 'physical'],
      chords: 2,
    }),
    states: ['outranked', 'tie', 'strength-1', 'strength-2', 'strength-3'],
    measured: measuredBesides([
      'outranked',
      'tie',
      'strength-1',
      'strength-2',
      'strength-3',
    ]),
    runs: 50,
    fixedSeeds: [SEED],
    constructed: [
      {
        name: '! over Shift+1',
        enters: ['outranked', 'strength-1', 'strength-2'],
        build: (generated) => ({
          ...generated,
          platform: 'linux',
          ...pressLabeled('linux', 'linux us shift+Digit1 ("!")'),
          variant: 'none',
          chords: [
            { key: 'typed', pool: 0, flips: 4, mod: false },
            { key: 'position', pool: 0, flips: 0, mod: false },
          ],
        }),
      },
      {
        name: 'Mod+Shift+/ over Mod+/ on German',
        enters: ['outranked', 'strength-2', 'strength-3'],
        build: (generated) => ({
          ...generated,
          platform: 'linux',
          ...pressLabeled('linux', 'linux de ctrl+shift+Digit7 ("/")'),
          variant: 'none',
          chords: [
            { key: 'typed', pool: 0, flips: 0, mod: true },
            { key: 'typed', pool: 0, flips: 4, mod: true },
          ],
        }),
      },
      {
        name: 'ı over I',
        enters: ['outranked', 'strength-2', 'strength-3'],
        build: (generated) => ({
          ...generated,
          platform: 'windows',
          ...pressLabeled('windows', 'edge Turkish ı key'),
          variant: 'none',
          chords: [
            { key: 'typed', pool: 0, flips: 0, mod: false },
            { key: 'dotless-i', pool: 0, flips: 0, mod: false },
          ],
        }),
      },
      {
        name: 'Meta+[Slash] over Meta+/',
        enters: ['outranked', 'strength-2', 'strength-3'],
        build: (generated) => ({
          ...generated,
          platform: 'mac',
          ...freeAt('/', 'Slash', 8),
          variant: 'none',
          chords: [
            { key: 'typed', pool: 0, flips: 0, mod: false },
            { key: 'physical', pool: 0, flips: 0, mod: false },
          ],
        }),
      },
      {
        name: 'the same chord twice',
        enters: ['tie', 'strength-3'],
        build: (generated) => ({
          ...generated,
          platform: 'linux',
          ...pressLabeled('linux', 'linux us ctrl+KeyS ("s")'),
          variant: 'none',
          chords: [
            { key: 'typed', pool: 0, flips: 0, mod: true },
            { key: 'typed', pool: 0, flips: 0, mod: false },
          ],
        }),
      },
    ],
  },
  resolve,
  model: (plan) => {
    const strengths = plan.chords.map((chord) =>
      strength(plan.platform, plan.init, chord),
    )
    const best = Math.max(...strengths)
    return strengths.flatMap((value, index) =>
      value > 0 && value === best ? [index] : [],
    )
  },
  reached: reachedTags,
  driver: strengthDriver,
  check: (plan, observations, expected) =>
    differs(
      'fired',
      'strength',
      observations.find((o) => o.checkpoint === 'fired')?.value,
      expected,
      `${plan.label}: ${plan.chords.map((chord) => chord.text).join(' and ')}`,
    ) ?? pass,
  calibrations: [
    {
      name: 'strength: both run',
      law: 'strength',
      history: { constructed: '! over Shift+1' },
      corrupt: (trace) =>
        trace.map((o) =>
          o.checkpoint === 'fired' ? { ...o, value: [0, 1] } : o,
        ),
    },
  ],
})

// ---------------------------------------------------------------------------
// No throw on odd events
// ---------------------------------------------------------------------------

function oddEvent(init: PressInit, odd: Odd): KeyboardEvent {
  const event = pressEvent(
    odd === 'key-empty'
      ? { ...init, key: '' }
      : odd === 'key-proto'
        ? { ...init, key: 'constructor' }
        : odd === 'code-proto'
          ? { ...init, code: '__proto__' }
          : init,
  )
  const define = (name: string, value: unknown) =>
    Object.defineProperty(event, name, { configurable: true, value })
  if (odd === 'key-undefined') define('key', undefined)
  if (odd === 'code-undefined') define('code', undefined)
  if (odd === 'modifier-state-throws')
    define('getModifierState', () => {
      throw new Error('getModifierState is not implemented')
    })
  if (odd === 'modifier-state-missing') define('getModifierState', undefined)
  return event
}

oracleProperty<History, Array<string>, Plan>({
  id: 'key-matching/no-throw',
  owns: ['src/_match.ts#matchKeyboardEvent'],
  law: {
    statement:
      'For every press and chord, including events with no key or code, a key or code named like an Object.prototype member, and a getModifierState that throws or is missing, matchesKeyboardEvent returns a boolean.',
    authority: `src/_keyboard-event.ts:34 ("Synthetic events and older browsers may not implement this reliably"), :80-82 ("The key can be missing on events that autofill and browser extensions send"); src/match.ts:45 (@returns True if the event matches). ${APPROVAL}`,
    limits: 'Which boolean an odd event gets is not checked.',
  },
  histories: {
    arbitrary: historyArb({
      picks: ALL_PICKS,
      odd: fc.constantFrom<Odd>(
        'key-undefined',
        'code-undefined',
        'key-empty',
        'code-proto',
        'key-proto',
        'modifier-state-throws',
        'modifier-state-missing',
      ),
    }),
    runs: 100,
    fixedSeeds: [SEED],
    fixed: [
      {
        name: 'Ctrl+S with no key',
        history: {
          platform: 'linux',
          ...pressLabeled('linux', 'linux us ctrl+KeyS ("s")'),
          free: { key: 0, code: 0, flags: 0, keyCode: 0 },
          variant: 'none',
          odd: 'key-undefined',
          chords: [{ key: 'position', pool: 0, flips: 0, mod: true }],
        },
      },
    ],
  },
  resolve,
  model: (plan) => plan.chords.map(() => 'boolean'),
  driver: (plan, observe) => {
    for (const chord of plan.chords) {
      try {
        const event = oddEvent(plan.init, plan.odd)
        observe(
          'returns',
          typeof matchesKeyboardEvent(
            event,
            chord.text as never,
            plan.platform,
          ),
        )
      } catch (error) {
        observe('returns', `threw ${String(error)}`)
      }
    }
  },
  check: (plan, observations, expected) =>
    differs(
      'returns',
      'no throw',
      observations
        .filter((o) => o.checkpoint === 'returns')
        .map((o) => o.value),
      expected,
      `${plan.label} (${plan.odd}): ${plan.chords.map((chord) => chord.text).join(', ')}`,
    ) ?? pass,
  calibrations: [
    {
      name: 'no throw: a throw',
      law: 'no throw',
      history: { fixed: 'Ctrl+S with no key' },
      corrupt: (trace) =>
        trace.map((o) =>
          o.checkpoint === 'returns' ? { ...o, value: 'threw TypeError' } : o,
        ),
    },
  ],
})
