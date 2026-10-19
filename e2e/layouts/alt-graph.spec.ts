// AltGr on real keyboard layouts. Linux layouts put a character on almost
// every AltGr key; tanstack(winno) leaves AltGr+F/K/A empty like Windows
// Norwegian does. On Linux, AltGr is not Control+Alt, so AltGr with a key that
// types no new character fires nothing. (On Windows it fires Control+Alt
// chords; the unit tests cover that event shape.)
import { describeLayouts } from '../support/layout-cases'
import type { LayoutCase } from '../support/layout-cases'
import type { Layout } from '../support/layout-fixtures'

const BINDINGS = [
  'F',
  '[KeyF]',
  'Shift+F',
  'Alt+F',
  'Control+Alt+F',
  'Control+Alt+[KeyF]',
  'Control+Alt+Shift+F',
  'K',
  'Alt+K',
  'Control+Alt+K',
  'A',
  'ą',
  'Control+Alt+A',
  'E',
  '€',
  '2',
  '@',
  'Control+Alt+2',
  'Control+Alt+[Digit2]',
  'Home',
  '[Home]',
  'Alt+Home',
  'Control+Alt+Home',
  'Control+Alt+[Home]',
  'End',
  'Alt+End',
  'Control+Alt+End',
  'Space',
  'Control+Alt+Space',
]

/** Registered with the HotkeyManager to check dispatch end to end. */
const REGISTERED = ['F', 'Control+Alt+F', 'Home', 'Control+Alt+Home']

// Shared by every layout with AltGr. These keys have nothing on AltGr.
const ALT_GR_LAYOUT_CASES: Array<LayoutCase> = [
  {
    keys: 'Home',
    matches: ['Home', '[Home]'],
    parsed: 'Home',
    recorded: '[Home]',
  },
  // AltGr with a key it does not change fires nothing on Linux.
  {
    keys: 'AltGr+Home',
    matches: [],
    parsed: 'Home',
    recorded: { reject: 'alt-graph' },
  },
  { keys: 'AltGr+End', matches: [], parsed: 'End' },
  // Linux layouts type a no-break space (U+00A0): character entry.
  {
    keys: 'AltGr+Space',
    matches: [],
    parsed: '\u00a0',
    recorded: { reject: 'alt-graph' },
  },
  // Left Control + left Alt is Control+Alt, not AltGr.
  {
    keys: 'Control+Alt+Home',
    matches: ['Control+Alt+Home', 'Control+Alt+[Home]'],
    parsed: 'Mod+Alt+Home',
    recorded: 'Mod+Alt+[Home]',
  },
  { keys: 'KeyF', matches: ['F', '[KeyF]'], parsed: 'F', recorded: '[KeyF]' },
]

// AltGr typing a character: only the character matches.
const AT_SIGN: LayoutCase = {
  keys: 'AltGr+Digit2',
  matches: ['@'],
  parsed: '@',
  recorded: { reject: 'alt-graph' },
}
const EURO: LayoutCase = { keys: 'AltGr+KeyE', matches: ['€'], parsed: '€' }

const LAYOUTS: Record<Layout, Array<LayoutCase>> = {
  'tanstack(winno)': [
    ...ALT_GR_LAYOUT_CASES,
    AT_SIGN,
    EURO,
    // The bug from discussion #168: AltGr+F types f but must not fire F.
    {
      keys: 'AltGr+KeyF',
      matches: [],
      parsed: 'F',
      recorded: { reject: 'alt-graph' },
    },
    { keys: 'AltGr+Shift+KeyF', matches: [], parsed: 'Shift+F' },
    { keys: 'AltGr+KeyK', matches: [], parsed: 'K' },
  ],
  // Linux Norwegian: AltGr+F types "đ".
  no: [
    ...ALT_GR_LAYOUT_CASES,
    AT_SIGN,
    EURO,
    {
      keys: 'AltGr+KeyF',
      matches: [],
      parsed: 'Đ',
      recorded: { reject: 'alt-graph' },
    },
  ],
  // Polish: AltGr types letters with diacritics.
  pl: [
    ...ALT_GR_LAYOUT_CASES,
    {
      keys: 'AltGr+KeyA',
      matches: ['ą'],
      parsed: 'Ą',
      recorded: { reject: 'alt-graph' },
    },
    { keys: 'KeyA', matches: ['A'], parsed: 'A', recorded: '[KeyA]' },
  ],
  // US has no AltGr: right Alt is Alt.
  // Avoids Alt+F and Alt+Home, which browsers keep for their menu and home page.
  us: [
    { keys: 'KeyF', matches: ['F', '[KeyF]'], parsed: 'F', recorded: '[KeyF]' },
    {
      keys: 'AltGr+KeyK',
      matches: ['Alt+K'],
      parsed: 'Alt+K',
      recorded: 'Alt+[KeyK]',
    },
    {
      keys: 'AltGr+End',
      matches: ['Alt+End'],
      parsed: 'Alt+End',
      recorded: 'Alt+[End]',
    },
    { keys: 'Digit2', matches: ['2'], parsed: '2', recorded: '[Digit2]' },
  ],
}

describeLayouts('AltGr', {
  bindings: BINDINGS,
  registered: REGISTERED,
  layouts: LAYOUTS,
})
