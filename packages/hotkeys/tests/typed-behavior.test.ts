import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  formatForDisplay,
  formatHotkey,
  getHotkeyManager,
  matchesKeyboardEvent,
  normalizeHotkey,
  normalizeKeyName,
  parseHotkey,
  validateHotkey,
} from '../src'
import { normalizeKeyboardEvent } from '../src/_keyboard-event'
import { LOGICAL_ONLY_NAMED_KEYS, SHARED_NAMED_KEYS } from '../src/_named-keys'
import { hotkeyChordFromKeydown } from '../src/_recorder-chord'
import type { FormatDisplayOptions, HotkeyChord } from '../src'

// Fingerprints of how the library treats every valid typed hotkey and a wide
// range of realistic keyboard events. A changed fingerprint means behavior
// changed for typed code: find out why before updating it.

const PLATFORMS = ['mac', 'windows', 'linux'] as const
const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
const DIGITS = [...'0123456789']
const FUNCTION_KEYS = Array.from({ length: 24 }, (_, i) => `F${i + 1}`)
const NAVIGATION = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]
const EDITING = ['Enter', 'Escape', 'Space', 'Tab', 'Backspace', 'Delete']
const PUNCTUATION = [...'/[]\\=-,.;`\'+?!@#$%^&*()_{}|:"<>~']
const LOGICAL_KEYS = [
  ...LETTERS,
  ...DIGITS,
  ...FUNCTION_KEYS,
  ...NAVIGATION,
  ...EDITING,
  ...PUNCTUATION,
  ...SHARED_NAMED_KEYS,
  ...LOGICAL_ONLY_NAMED_KEYS,
]
const PHYSICAL_CODES = [
  ...LETTERS.map((letter) => `Key${letter}`),
  ...DIGITS.map((digit) => `Digit${digit}`),
  ...DIGITS.map((digit) => `Numpad${digit}`),
  ...['Alt', 'Control', 'Meta', 'Shift'].flatMap((m) => [
    `${m}Left`,
    `${m}Right`,
  ]),
  ...EDITING,
  ...NAVIGATION,
  ...FUNCTION_KEYS,
  ...SHARED_NAMED_KEYS,
  ...[
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
  ],
  ...[1, 2, 3, 4, 5].map((n) => `Lang${n}`),
  ...[
    'Add',
    'Backspace',
    'Clear',
    'ClearEntry',
    'Comma',
    'Decimal',
    'Divide',
    'Enter',
    'Equal',
    'Hash',
    'MemoryAdd',
    'MemoryClear',
    'MemoryRecall',
    'MemoryStore',
    'MemorySubtract',
    'Multiply',
    'ParenLeft',
    'ParenRight',
    'Star',
    'Subtract',
  ].map((name) => `Numpad${name}`),
  ...[
    'LaunchApp1',
    'LaunchApp2',
    'MediaSelect',
    'Sleep',
    'Turbo',
    'Abort',
    'Resume',
    'Suspend',
  ],
]
// Every modifier prefix the HotkeyChord type allows
const PREFIXES = [
  '',
  'Control+',
  'Alt+',
  'Shift+',
  'Meta+',
  'Mod+',
  'Control+Alt+',
  'Control+Shift+',
  'Control+Meta+',
  'Alt+Shift+',
  'Alt+Meta+',
  'Shift+Meta+',
  'Mod+Alt+',
  'Mod+Shift+',
  'Control+Alt+Shift+',
  'Control+Alt+Meta+',
  'Control+Shift+Meta+',
  'Alt+Shift+Meta+',
  'Mod+Alt+Shift+',
  'Control+Alt+Shift+Meta+',
]
const KEYS = [...LOGICAL_KEYS, ...PHYSICAL_CODES.map((code) => `[${code}]`)]
const CHORDS = PREFIXES.flatMap((prefix) =>
  KEYS.map((key) => (prefix + key) as HotkeyChord),
)
const RAW_CHORDS = [
  ...LOGICAL_KEYS.flatMap((key) => [
    { key },
    { key, mod: true },
    { key, ctrl: true, shift: true },
    { key, alt: true, meta: true },
  ]),
  ...PHYSICAL_CODES.flatMap((code) => [
    { code },
    { code, mod: true, alt: true },
  ]),
]
const SEQUENCES = KEYS.slice(0, 200).map(
  (key, i) =>
    [
      PREFIXES[i % PREFIXES.length]! + key,
      KEYS[(i * 7) % KEYS.length]!,
    ] as Array<HotkeyChord>,
)

// Events as browsers report them, with every modifier combination
const PUNCTUATION_CODES: Record<string, string> = {
  '`': 'Backquote',
  '\\': 'Backslash',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  ',': 'Comma',
  '=': 'Equal',
  '-': 'Minus',
  '.': 'Period',
  "'": 'Quote',
  ';': 'Semicolon',
  '/': 'Slash',
}
const BASE_EVENTS: Array<KeyboardEventInit> = [
  ...LETTERS.flatMap((letter) => [
    { key: letter.toLowerCase(), code: `Key${letter}` },
    { key: letter, code: `Key${letter}` },
  ]),
  ...DIGITS.flatMap((digit) => [
    { key: digit, code: `Digit${digit}` },
    { key: digit, code: `Numpad${digit}` },
  ]),
  ...FUNCTION_KEYS.map((key) => ({ key, code: key })),
  ...NAVIGATION.map((key) => ({ key, code: key })),
  ...EDITING.map((key) => ({ key: key === 'Space' ? ' ' : key, code: key })),
  { key: 'Enter', code: 'NumpadEnter' },
  { key: '+', code: 'NumpadAdd' },
  { key: '-', code: 'NumpadSubtract' },
  { key: '*', code: 'NumpadMultiply' },
  { key: '/', code: 'NumpadDivide' },
  { key: '.', code: 'NumpadDecimal' },
  ...PUNCTUATION.map((key) => ({ key, code: PUNCTUATION_CODES[key] ?? '' })),
  ...SHARED_NAMED_KEYS.map((key) => ({ key, code: key })),
  ...LOGICAL_ONLY_NAMED_KEYS.map((key) => ({ key, code: '' })),
  { key: 'Control', code: 'ControlLeft' },
  { key: 'Shift', code: 'ShiftRight' },
  { key: 'Alt', code: 'AltLeft' },
  { key: 'Meta', code: 'MetaLeft' },
  { key: 'AltGraph', code: 'AltRight' },
  { key: 'Dead', code: 'BracketLeft' },
  { key: 'Unidentified', code: '' },
  { key: 'Process', code: 'KeyA' },
  { key: 'é', code: 'Digit2' },
  { key: 'ß', code: 'Minus' },
  { key: 'ф', code: 'KeyA' },
  { key: 'ㅂ', code: 'KeyQ' },
  { key: '€', code: 'KeyE' },
  { key: ' ', code: 'Space' },
]
const EVENTS: Array<KeyboardEventInit> = [
  ...BASE_EVENTS.flatMap((event) =>
    Array.from({ length: 16 }, (_, i) => ({
      ...event,
      ctrlKey: !!(i & 1),
      altKey: !!(i & 2),
      shiftKey: !!(i & 4),
      metaKey: !!(i & 8),
    })),
  ),
  ...BASE_EVENTS.map((event) => ({
    ...event,
    ctrlKey: true,
    altKey: true,
    modifierAltGraph: true,
  })),
]
const CHARACTER_EVENTS: Array<KeyboardEventInit> = []
for (let point = 0x20; point <= 0x2fff; point++) {
  const key = String.fromCodePoint(point)
  CHARACTER_EVENTS.push(
    { key, code: '' },
    { key, code: 'KeyA', shiftKey: true },
  )
}

/** Hashes every result, so a single changed output changes the fingerprint. */
function fingerprint(produce: (record: (value: unknown) => void) => void) {
  const hash = createHash('sha256')
  produce((value) => {
    let text: string
    try {
      // Undefined has no JSON text
      text = String(JSON.stringify(value))
    } catch (error) {
      text = `throws ${(error as Error).message}`
    }
    hash.update(`${text}\n`)
  })
  return hash.digest('hex').slice(0, 16)
}

function attempt(run: () => unknown): unknown {
  try {
    return run()
  } catch (error) {
    return `throws ${(error as Error).message}`
  }
}

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

// Hundreds of thousands of checks: slow CI machines need more than the default 5s
describe('typed hotkeys and real events', { timeout: 120_000 }, () => {
  it('parse, normalize, and validate the same way', () => {
    expect({
      parse: fingerprint((record) => {
        for (const hotkey of [...CHORDS, ...RAW_CHORDS])
          for (const platform of PLATFORMS)
            record(attempt(() => parseHotkey(hotkey as never, platform)))
      }),
      normalize: fingerprint((record) => {
        for (const hotkey of [...CHORDS, ...RAW_CHORDS, ...SEQUENCES])
          for (const platform of PLATFORMS)
            record(attempt(() => normalizeHotkey(hotkey as never, platform)))
      }),
      validate: fingerprint((record) => {
        for (const hotkey of [...CHORDS, ...SEQUENCES]) {
          const { valid, errors } = validateHotkey(hotkey)
          record([valid, errors])
        }
      }),
    }).toMatchInlineSnapshot(`
      {
        "normalize": "0d92ff2ad9236594",
        "parse": "d02540157b06b9cb",
        "validate": "8be13344638ee910",
      }
    `)
  })

  it('display the same way', () => {
    const layoutMap = new Map([
      ['KeyA', 'q'],
      ['KeyQ', 'a'],
      ['Digit2', 'é'],
      ['Semicolon', 'm'],
      ['BracketLeft', '^'],
    ])
    const options: Array<FormatDisplayOptions> = PLATFORMS.flatMap(
      (platform) => [
        { platform },
        { platform, useSymbols: false },
        { platform, useSymbols: { modifiers: false } },
        { platform, parts: true },
        { platform, layoutMap },
        {
          platform,
          keyLabels: { Escape: 'Esc!', KeyA: 'A-key', '/': 'slash' },
        },
        { platform, separatorToken: ' + ' },
      ],
    )
    expect({
      formatForDisplay: fingerprint((record) => {
        for (const hotkey of [...CHORDS, ...RAW_CHORDS, ...SEQUENCES])
          for (const option of options)
            record(attempt(() => formatForDisplay(hotkey as never, option)))
      }),
      formatHotkey: fingerprint((record) => {
        for (const chord of CHORDS)
          for (const platform of PLATFORMS)
            record(attempt(() => formatHotkey(parseHotkey(chord, platform))))
      }),
    }).toMatchInlineSnapshot(`
      {
        "formatForDisplay": "7943b4ce623dc19d",
        "formatHotkey": "8cf79e51bf8a74c9",
      }
    `)
  })

  it('normalize events and match them the same way', () => {
    const chordsByKey = new Map<string, Array<HotkeyChord>>()
    for (const chord of CHORDS) {
      const parsed = parseHotkey(chord, 'windows')
      const id = parsed.code ?? parsed.key
      chordsByKey.set(id, [...(chordsByKey.get(id) ?? []), chord])
    }
    const sample = CHORDS.filter((_, i) => i % 97 === 0)
    const candidates = (init: KeyboardEventInit) => [
      ...(chordsByKey.get(normalizeKeyName(init.key!)) ?? []),
      ...(chordsByKey.get(init.code ?? '') ?? []),
      ...sample,
    ]
    expect({
      events: fingerprint((record) => {
        for (const init of [...EVENTS, ...CHARACTER_EVENTS]) {
          const event = new KeyboardEvent('keydown', init)
          record(normalizeKeyName(init.key!))
          for (const platform of PLATFORMS)
            record(normalizeKeyboardEvent(event, platform))
        }
      }),
      matching: fingerprint((record) => {
        for (const init of EVENTS) {
          const event = new KeyboardEvent('keydown', init)
          for (const platform of PLATFORMS)
            for (const chord of candidates(init))
              record(matchesKeyboardEvent(event, chord, platform))
        }
        for (const init of CHARACTER_EVENTS) {
          const event = new KeyboardEvent('keydown', init)
          for (const chord of candidates(init).slice(0, 12))
            record(matchesKeyboardEvent(event, chord, 'windows'))
        }
      }),
    }).toMatchInlineSnapshot(`
      {
        "events": "462410f6b9f4d67d",
        "matching": "a1049dfe50debf64",
      }
    `)
  })

  it('record and fire the same way', () => {
    const recorded = fingerprint((record) => {
      for (const init of [...EVENTS, ...CHARACTER_EVENTS]) {
        const event = new KeyboardEvent('keydown', init)
        for (const platform of PLATFORMS)
          for (const mode of ['key', 'code'] as const)
            record(attempt(() => hotkeyChordFromKeydown(event, platform, mode)))
      }
    })

    const recorders = fingerprint((record) => {
      for (const platform of ['mac', 'windows'] as const)
        for (const recordBy of ['key', 'code'] as const) {
          const log: Array<unknown> = []
          const recorder = new HotkeyRecorder({
            platform,
            recordBy,
            maxSteps: 1,
            onRecord: (hotkey) => log.push(['record', hotkey]),
            onReject: (rejection) =>
              log.push(['reject', rejection.reason, rejection.hotkey]),
          })
          for (const init of [...EVENTS, ...CHARACTER_EVENTS]) {
            log.length = 0
            recorder.start()
            document.body.dispatchEvent(
              new KeyboardEvent('keydown', {
                ...init,
                bubbles: true,
                cancelable: true,
              }),
            )
            document.body.dispatchEvent(
              new KeyboardEvent('keyup', { ...init, bubbles: true }),
            )
            record([log, recorder.store.state.recordedHotkey])
            recorder.cancel()
          }
          recorder.destroy()
        }
    })

    const fired = fingerprint((record) => {
      for (const platform of PLATFORMS) {
        HotkeyManager.resetInstance()
        const calls: Array<string> = []
        CHORDS.filter((_, i) => i % 7 === 0).forEach((chord) =>
          getHotkeyManager().register(chord, () => calls.push(chord), {
            platform,
            conflictBehavior: 'allow',
          }),
        )
        for (const init of EVENTS) {
          calls.length = 0
          document.body.dispatchEvent(
            new KeyboardEvent('keydown', {
              ...init,
              bubbles: true,
              cancelable: true,
            }),
          )
          document.body.dispatchEvent(
            new KeyboardEvent('keyup', { ...init, bubbles: true }),
          )
          record([...calls].sort())
        }
      }
    })

    expect({ recorded, recorders, fired }).toMatchInlineSnapshot(`
      {
        "fired": "065cc7708e138a89",
        "recorded": "b99a3f21d18e091a",
        "recorders": "d6d2f05bc882d528",
      }
    `)
  })

  // Fingerprinted with formatForDisplay before it accepted only hotkeys
  it('display held keys the same way', () => {
    // Whitespace keys are checked separately: formatForDisplay trimmed them
    // away, and { key } shows them
    const heldKeys = new Set(
      [...BASE_EVENTS, ...CHARACTER_EVENTS]
        .map((init) => normalizeKeyName(init.key!))
        .filter((key) => key.trim()),
    )
    const options: Array<FormatDisplayOptions> = PLATFORMS.flatMap(
      (platform) => [
        { platform },
        { platform, useSymbols: false },
        { platform, useSymbols: { keys: false } },
        { platform, keyLabels: { Escape: 'Esc!', A: 'A-key', Shift: 'Sh' } },
      ],
    )
    expect(
      fingerprint((record) => {
        for (const key of heldKeys)
          for (const option of options)
            record(attempt(() => formatForDisplay({ key }, option)))
      }),
    ).toMatchInlineSnapshot(`"32b3ac7ea1c5cc51"`)
    expect(formatForDisplay({ key: ' ' }, { platform: 'mac' })).toBe('␣')
    expect(formatForDisplay({ key: '\u00a0' }, { platform: 'mac' })).toBe(
      '\u00a0',
    )
  })
})
