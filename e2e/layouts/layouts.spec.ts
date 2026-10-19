// How logical and physical bindings behave on real keyboard layouts.
//
// Rules under test (see the "Keyboard layouts" guide):
// - Logical bindings follow what the key types. ASCII letters are
//   authoritative, so Dvorak's physical S (types "o") fires O, not S.
// - When a key types something else (a symbol, a dead key, or a non-Latin
//   letter), logical bindings fall back to the conventional key at that
//   position: Russian KeyS ("ы") fires S, AZERTY Digit1 ("&") fires 1.
// - Physical bindings such as [KeyQ] always follow the position.
import { describeLayouts } from '../support/layout-cases'

describeLayouts('Layout', {
  bindings: [
    'A',
    'Q',
    'S',
    'O',
    'Y',
    'Z',
    '[KeyA]',
    '[KeyQ]',
    '[KeyS]',
    '[KeyY]',
    'Mod+A',
    'Mod+Q',
    'Mod+S',
    'Mod+O',
    'Mod+Z',
    'Mod+Y',
    '1',
    '&',
    'Shift+1',
    'Mod+1',
    '/',
    'Shift+7',
    '`',
    '^',
    '[Backquote]',
  ],
  registered: ['A', 'Q', 'Mod+S', 'Mod+O', 'Mod+Z', '1', '/'],
  layouts: {
    // French AZERTY: A and Q swap, digits need Shift.
    fr: [
      {
        keys: 'KeyQ',
        matches: ['A', '[KeyQ]'],
        parsed: 'A',
        recorded: '[KeyQ]',
      },
      {
        keys: 'KeyA',
        matches: ['Q', '[KeyA]'],
        parsed: 'Q',
        recorded: '[KeyA]',
      },
      {
        keys: 'Control+KeyQ',
        matches: ['Mod+A'],
        parsed: 'Mod+A',
        recorded: 'Mod+[KeyQ]',
      },
      {
        keys: 'Digit1',
        matches: ['&', '1'],
        parsed: '&',
        recorded: '[Digit1]',
      },
      { keys: 'Shift+Digit1', matches: ['1', 'Shift+1'], parsed: 'Shift+1' },
      { keys: 'Control+Digit1', matches: ['Mod+1'], parsed: 'Mod+&' },
    ],
    // German QWERTZ: Y and Z swap, / is Shift+7, ^ is a dead key.
    de: [
      {
        keys: 'KeyY',
        matches: ['Z', '[KeyY]'],
        parsed: 'Z',
        recorded: '[KeyY]',
      },
      { keys: 'KeyZ', matches: ['Y'], parsed: 'Y' },
      { keys: 'Control+KeyY', matches: ['Mod+Z'], parsed: 'Mod+Z' },
      { keys: 'Shift+Digit7', matches: ['/', 'Shift+7'], parsed: 'Shift+/' },
      {
        keys: 'Backquote',
        matches: ['[Backquote]', '`'],
        parsed: 'Dead',
        recorded: '[Backquote]',
      },
    ],
    // US Dvorak: letters move, and Q types an apostrophe.
    'us(dvorak)': [
      {
        keys: 'KeyS',
        matches: ['O', '[KeyS]'],
        parsed: 'O',
        recorded: '[KeyS]',
      },
      { keys: 'Control+KeyS', matches: ['Mod+O'], parsed: 'Mod+O' },
      { keys: 'KeyQ', matches: ['Q', '[KeyQ]'], parsed: "'" },
    ],
    // Russian: Cyrillic letters fall back to the Latin key at that position.
    ru: [
      {
        keys: 'KeyS',
        matches: ['S', '[KeyS]'],
        parsed: 'Ы',
        recorded: '[KeyS]',
      },
      {
        keys: 'Control+KeyS',
        matches: ['Mod+S'],
        parsed: 'Mod+Ы',
        recorded: 'Mod+[KeyS]',
      },
      { keys: 'KeyA', matches: ['A', '[KeyA]'], parsed: 'Ф' },
    ],
  },
})
