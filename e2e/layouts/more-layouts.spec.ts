// More keyboard layouts, for code paths the cases in layouts.spec.ts don't
// reach: Turkish dotless i, accented letters on the Czech digit row, the ISO
// and JIS extra keys (IntlBackslash, IntlRo, IntlYen), Russian with a Latin
// group in the keymap, and the numpad with NumLock on and off.
//
// Each case also checks what the recorder records in both modes and what the
// recorded binding displays as, with and without the browser's layout map.
import { describeLayouts } from '../support/layout-cases'
import { expect, useLayout } from '../support/layout-fixtures'

// Turkish Q: the I position types dotless "ı" (Shift: "I"), and the US
// apostrophe position types "i" (Shift: dotted "İ").
describeLayouts('Turkish', {
  bindings: [
    'I',
    'ı',
    'İ',
    'Shift+I',
    'Shift+İ',
    'Mod+I',
    '[KeyI]',
    '[Quote]',
    'Mod+[Quote]',
    'Ş',
    ';',
    'Mod+[',
    'Ğ',
  ],
  // Mod+I also keeps Firefox's Ctrl+' quick find from taking focus.
  registered: ['I', 'Mod+I', 'Shift+İ', 'Ş'],
  layouts: {
    tr: [
      // "ı" is its own letter, but "I" also fires on its key, as VK_I does
      // in native Windows apps.
      {
        keys: 'KeyI',
        matches: ['I', 'ı', '[KeyI]'],
        parsed: 'ı',
        recorded: '[KeyI]',
        recordedByKey: 'ı',
        label: 'I',
        layoutLabel: 'ı',
      },
      {
        keys: 'Shift+KeyI',
        matches: ['Shift+I'],
        parsed: 'Shift+I',
        recorded: 'Shift+[KeyI]',
      },
      // BUG-124: a binding for "ı" never fires on the key that types "i".
      {
        keys: 'Quote',
        matches: ['I', '[Quote]'],
        parsed: 'I',
        recorded: '[Quote]',
        recordedByKey: 'I',
        layoutLabel: 'I',
      },
      // Letters need their exact Shift state, so "İ" alone doesn't match.
      {
        keys: 'Shift+Quote',
        matches: ['Shift+İ'],
        parsed: 'Shift+İ',
        recorded: 'Shift+[Quote]',
        recordedByKey: 'Shift+İ',
      },
      {
        keys: 'Control+KeyI',
        matches: ['Mod+I'],
        parsed: 'Mod+ı',
        recorded: 'Mod+[KeyI]',
        recordedByKey: 'Mod+ı',
        label: 'Ctrl+I',
        layoutLabel: 'Ctrl+ı',
      },
      {
        keys: 'Control+Quote',
        matches: ['Mod+I', 'Mod+[Quote]'],
        parsed: 'Mod+I',
        recorded: 'Mod+[Quote]',
      },
      // A Latin letter typed on its own never falls back to the US ";".
      {
        keys: 'Semicolon',
        matches: ['Ş'],
        parsed: 'Ş',
        recorded: '[Semicolon]',
        recordedByKey: 'Ş',
        label: ';',
        layoutLabel: 'Ş',
      },
      // With Control on a punctuation key it does: Ctrl+ğ fires Mod+[.
      { keys: 'Control+BracketLeft', matches: ['Mod+['], parsed: 'Mod+Ğ' },
    ],
  },
})

// Czech QWERTZ: the digit row types "+ ě š č" and needs Shift for digits.
describeLayouts('Czech digit row', {
  bindings: [
    '1',
    '2',
    '3',
    '4',
    '+',
    'ě',
    'Š',
    'č',
    'Shift+2',
    'Mod+1',
    'Mod+2',
    'Mod+3',
    'Mod+Ě',
    'Mod+Shift+2',
    '[Digit2]',
  ],
  registered: ['2', 'č', 'Mod+2', 'Mod+3'],
  layouts: {
    cz: [
      {
        keys: 'Digit1',
        matches: ['1', '+'],
        parsed: '+',
        recorded: '[Digit1]',
        recordedByKey: '+',
        label: '1',
        layoutLabel: '+',
      },
      {
        keys: 'Digit2',
        matches: ['2', 'ě', '[Digit2]'],
        parsed: 'Ě',
        recorded: '[Digit2]',
        recordedByKey: 'Ě',
        label: '2',
        layoutLabel: 'Ě',
      },
      { keys: 'Digit3', matches: ['3', 'Š'], parsed: 'Š' },
      // "č" is registered, and the exact match beats the fallback to 4.
      { keys: 'Digit4', matches: ['4', 'č'], parsed: 'Č' },
      {
        keys: 'Shift+Digit2',
        matches: ['2', 'Shift+2'],
        parsed: 'Shift+2',
        recorded: 'Shift+[Digit2]',
        recordedByKey: 'Shift+2',
      },
      {
        keys: 'Control+Digit2',
        matches: ['Mod+2', 'Mod+Ě'],
        parsed: 'Mod+Ě',
        recorded: 'Mod+[Digit2]',
        recordedByKey: 'Mod+Ě',
        label: 'Ctrl+2',
        layoutLabel: 'Ctrl+Ě',
      },
      { keys: 'Control+Digit3', matches: ['Mod+3'], parsed: 'Mod+Š' },
      // The digit needs Shift on this layout, so Mod+2 accepts it too.
      {
        keys: 'Control+Shift+Digit2',
        matches: ['Mod+2', 'Mod+Shift+2'],
        parsed: 'Mod+Shift+2',
      },
    ],
  },
})

// UK: the extra ISO key left of Z (IntlBackslash) types "\", the US "\"
// position types "#", and Shift+3 types "£".
describeLayouts('UK', {
  bindings: [
    '\\',
    '|',
    '#',
    '£',
    '3',
    'Shift+3',
    '"',
    'Shift+2',
    '@',
    "'",
    "Shift+'",
    'Mod+\\',
    'Mod+#',
    '[IntlBackslash]',
    '[Backslash]',
    'Mod+[IntlBackslash]',
  ],
  registered: ['\\', '#', 'Mod+\\', 'Mod+#'],
  layouts: {
    gb: [
      {
        keys: 'IntlBackslash',
        matches: ['\\', '[IntlBackslash]'],
        parsed: '\\',
        recorded: '[IntlBackslash]',
        recordedByKey: '\\',
        layoutLabel: '\\',
      },
      {
        keys: 'Shift+IntlBackslash',
        matches: ['|'],
        parsed: 'Shift+|',
        recorded: 'Shift+[IntlBackslash]',
      },
      // Without a layout map the label is the US key at that position.
      {
        keys: 'Backslash',
        matches: ['#', '[Backslash]'],
        parsed: '#',
        recorded: '[Backslash]',
        recordedByKey: '#',
        label: '\\',
        layoutLabel: '#',
      },
      {
        keys: 'Shift+Digit3',
        matches: ['£', 'Shift+3'],
        parsed: 'Shift+£',
        recorded: 'Shift+[Digit3]',
        recordedByKey: 'Shift+£',
        label: 'Shift+3',
      },
      { keys: 'Shift+Digit2', matches: ['"', 'Shift+2'], parsed: 'Shift+"' },
      { keys: 'Shift+Quote', matches: ['@', "Shift+'"], parsed: 'Shift+@' },
      {
        keys: 'Control+IntlBackslash',
        matches: ['Mod+\\', 'Mod+[IntlBackslash]'],
        parsed: 'Mod+\\',
        recorded: 'Mod+[IntlBackslash]',
      },
      // An ASCII symbol never falls back: Ctrl+# is not Mod+\.
      { keys: 'Control+Backslash', matches: ['Mod+#'], parsed: 'Mod+#' },
    ],
  },
})

// Brazilian ABNT2: IntlRo, right of the period key, types "/" and "?".
describeLayouts('Brazilian ABNT2', {
  bindings: [
    '/',
    '?',
    'Mod+/',
    'Ç',
    ';',
    "'",
    '[Quote]',
    '[IntlRo]',
    'Shift+[IntlRo]',
    'Mod+[IntlRo]',
  ],
  registered: ['/', '?', 'Mod+/', 'Ç'],
  layouts: {
    br: [
      {
        keys: 'IntlRo',
        matches: ['/', '[IntlRo]'],
        parsed: '/',
        recorded: '[IntlRo]',
        recordedByKey: '/',
        layoutLabel: '/',
      },
      {
        keys: 'Shift+IntlRo',
        matches: ['?', 'Shift+[IntlRo]'],
        parsed: 'Shift+?',
        recorded: 'Shift+[IntlRo]',
        recordedByKey: 'Shift+?',
      },
      {
        keys: 'Control+IntlRo',
        matches: ['Mod+/', 'Mod+[IntlRo]'],
        parsed: 'Mod+/',
        recorded: 'Mod+[IntlRo]',
      },
      {
        keys: 'Semicolon',
        matches: ['Ç'],
        parsed: 'Ç',
        recorded: '[Semicolon]',
        label: ';',
        layoutLabel: 'Ç',
      },
      // A dead key falls back to its position.
      {
        keys: 'Quote',
        matches: ["'", '[Quote]'],
        parsed: 'Dead',
        recorded: '[Quote]',
      },
    ],
  },
})

// Japanese JIS: IntlYen (left of Backspace) and IntlRo (right of "/") both
// type "\" on Linux. Symbols move: ":" and "@" need no Shift.
describeLayouts('Japanese JIS', {
  bindings: [
    '\\',
    '|',
    '_',
    'Mod+\\',
    '[IntlRo]',
    '[IntlYen]',
    'Mod+[IntlYen]',
    ':',
    "'",
    '[Quote]',
    '@',
    '[',
  ],
  registered: ['\\', '|', '_', '@'],
  layouts: {
    jp: [
      {
        keys: 'IntlYen',
        matches: ['\\', '[IntlYen]'],
        parsed: '\\',
        recorded: '[IntlYen]',
        recordedByKey: '\\',
        layoutLabel: '\\',
      },
      {
        keys: 'Shift+IntlYen',
        matches: ['|'],
        parsed: 'Shift+|',
        recorded: 'Shift+[IntlYen]',
      },
      {
        keys: 'IntlRo',
        matches: ['\\', '[IntlRo]'],
        parsed: '\\',
        recorded: '[IntlRo]',
        layoutLabel: '\\',
      },
      { keys: 'Shift+IntlRo', matches: ['_'], parsed: 'Shift+_' },
      {
        keys: 'Control+IntlYen',
        matches: ['Mod+\\', 'Mod+[IntlYen]'],
        parsed: 'Mod+\\',
        recorded: 'Mod+[IntlYen]',
      },
      // ASCII never falls back: the US "[" position types "@".
      {
        keys: 'BracketLeft',
        matches: ['@'],
        parsed: '@',
        recorded: '[BracketLeft]',
        recordedByKey: '@',
        label: '[',
        layoutLabel: '@',
      },
      { keys: 'Quote', matches: [':', '[Quote]'], parsed: ':' },
    ],
  },
})

// Russian with US as the second group, as most Russian users have it.
// Browsers report the Cyrillic letter even with Control, so Latin bindings
// match through the position fallback. Chromium's layout map takes the Latin
// group, so labels stay Latin.
describeLayouts('Russian with a US group', {
  bindings: [
    'S',
    'Ы',
    'C',
    'Mod+S',
    'Mod+Ы',
    'Mod+C',
    'Mod+Shift+S',
    '[KeyS]',
    '/',
    '.',
    'Mod+/',
    'Mod+.',
  ],
  // Registered so Firefox's Save and Screenshot shortcuts stay closed.
  registered: ['S', 'Mod+S', 'Mod+Shift+S', 'Mod+C'],
  layouts: {
    'ru,us': [
      {
        keys: 'KeyS',
        matches: ['S', 'Ы', '[KeyS]'],
        parsed: 'Ы',
        recorded: '[KeyS]',
        recordedByKey: 'Ы',
        label: 'S',
        layoutLabel: 'S',
      },
      {
        keys: 'Control+KeyS',
        matches: ['Mod+S', 'Mod+Ы'],
        parsed: 'Mod+Ы',
        recorded: 'Mod+[KeyS]',
        label: 'Ctrl+S',
        layoutLabel: 'Ctrl+S',
      },
      {
        keys: 'Control+Shift+KeyS',
        matches: ['Mod+Shift+S'],
        parsed: 'Mod+Shift+Ы',
      },
      // Cyrillic "с" looks like a Latin c and falls back to C.
      { keys: 'Control+KeyC', matches: ['Mod+C'], parsed: 'Mod+С' },
      // The US "/" position types ".", an ASCII symbol: no fallback.
      { keys: 'Slash', matches: ['.'], parsed: '.' },
      { keys: 'Control+Slash', matches: ['Mod+.'], parsed: 'Mod+.' },
    ],
  },
})

// The numpad on US. Physical bindings name the numpad key; logical ones
// follow what it types: digits with NumLock on, navigation keys with it off.
const NUMPAD_BINDINGS = [
  '1',
  '5',
  '8',
  '.',
  'End',
  'Clear',
  'ArrowUp',
  'Delete',
  'Shift+ArrowUp',
  'Shift+8',
  'Mod+1',
  'Mod+End',
  '[Numpad1]',
  '[Numpad5]',
  'Mod+[Numpad1]',
]
const NUMPAD_REGISTERED = ['1', '8', 'End', 'ArrowUp']

describeLayouts('NumLock on', {
  numLock: true,
  bindings: NUMPAD_BINDINGS,
  registered: NUMPAD_REGISTERED,
  layouts: {
    us: [
      {
        keys: 'Numpad1',
        matches: ['1', '[Numpad1]'],
        parsed: '1',
        recorded: '[Numpad1]',
        recordedByKey: '1',
        label: 'Numpad 1',
        layoutLabel: 'Numpad 1',
      },
      { keys: 'Numpad5', matches: ['5', '[Numpad5]'], parsed: '5' },
      { keys: 'Numpad8', matches: ['8'], parsed: '8' },
      {
        keys: 'NumpadDecimal',
        matches: ['.'],
        parsed: '.',
        recorded: '[NumpadDecimal]',
        recordedByKey: '.',
        label: 'Numpad Decimal',
      },
      // On Linux, Shift with NumLock on types the navigation key, and the
      // browser still reports Shift.
      {
        keys: 'Shift+Numpad8',
        matches: ['Shift+ArrowUp'],
        parsed: 'Shift+ArrowUp',
        recorded: 'Shift+[Numpad8]',
      },
      {
        keys: 'Control+Numpad1',
        matches: ['Mod+1', 'Mod+[Numpad1]'],
        parsed: 'Mod+1',
        recorded: 'Mod+[Numpad1]',
        recordedByKey: 'Mod+1',
        label: 'Ctrl+Numpad 1',
      },
    ],
  },
})

describeLayouts('NumLock off', {
  bindings: NUMPAD_BINDINGS,
  registered: NUMPAD_REGISTERED,
  layouts: {
    us: [
      {
        keys: 'Numpad1',
        matches: ['End', '[Numpad1]'],
        parsed: 'End',
        recorded: '[Numpad1]',
        recordedByKey: 'End',
        label: 'Numpad 1',
      },
      { keys: 'Numpad8', matches: ['ArrowUp'], parsed: 'ArrowUp' },
      {
        keys: 'Control+Numpad1',
        matches: ['Mod+End', 'Mod+[Numpad1]'],
        parsed: 'Mod+End',
        recorded: 'Mod+[Numpad1]',
      },
      // The recorder treats Delete as "clear", wherever it comes from.
      {
        keys: 'NumpadDecimal',
        matches: ['Delete'],
        parsed: 'Delete',
        recorded: 'cleared',
      },
    ],
  },
})

// Numpad 5 with NumLock off: Chromium reports "Clear" and Firefox reports
// "Unidentified". Neither should fire the digit.
const numpad = useLayout('us', NUMPAD_BINDINGS, NUMPAD_REGISTERED)
numpad.describe('Numpad 5 with NumLock off on us', () => {
  // BUG-123 (issues/bugs/BUG-123-firefox-numlock-off-numpad5-fires-5.md):
  // Firefox's "Unidentified" falls back to the position and fires 5.
  numpad(
    'BUG-123: Numpad5 fires no digit',
    async ({ keyboard, browserName }) => {
      numpad.skip(browserName === 'firefox', 'BUG-123')
      const { keydown, fired } = await keyboard.press('Numpad5')
      expect(keydown.code).toBe('Numpad5')
      expect(keydown.matches).not.toContain('5')
      expect(fired).toEqual([])
      expect(await keyboard.record('Numpad5')).toBe('[Numpad5]')
    },
  )
})

// The extra ISO and JIS keys have no US key, so without a layout map they
// get the keycap legends the UI Events code spec gives.
const intl = useLayout('gb', [])
intl.describe('Labels for the extra ISO and JIS keys', () => {
  // BUG-125: the label was the code name, such as "IntlBackslash".
  intl(
    'BUG-125: IntlBackslash, IntlRo and IntlYen get readable labels',
    async ({ keyboard, page }) => {
      expect(keyboard, 'harness loaded').toBeDefined()
      for (const [binding, expected] of [
        ['[IntlBackslash]', '\\'],
        ['[IntlRo]', '\\'],
        ['[IntlYen]', '¥'],
      ]) {
        const { label } = await page.evaluate(
          (b) => window.harness.formatLabels(b),
          binding,
        )
        expect(label, binding).toBe(expected)
      }
    },
  )
})
