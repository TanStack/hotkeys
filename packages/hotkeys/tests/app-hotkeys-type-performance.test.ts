import { describe, expect, expectTypeOf, it } from 'vitest'
import { defineAppHotkeys } from '../src/index'
import type { AppHotkey, HotkeyChord, HotkeySequence } from '../src/index'

// The type check of this file is the test. TypeScript 5.7 and later took
// seconds and gigabytes for a few dozen entries, and ran out of memory at 50
// sequences, while `defineAppHotkeys` intersected each declaration with a
// copy of itself. A regression makes `tsc` slow or crash here.
const appHotkeys = defineAppHotkeys({
  'chord.00': { hotkey: 'Mod+Shift+A', meta: { name: 'Chord 00' } },
  'sequence.00': {
    hotkey: ['G', 'A'],
    meta: { name: 'Sequence 00' },
    options: { timeout: 800 },
  },
  'chord.01': { hotkey: 'Mod+Shift+B', meta: { name: 'Chord 01' } },
  'sequence.01': {
    hotkey: ['G', 'B'],
    meta: { name: 'Sequence 01' },
    options: { timeout: 800 },
  },
  'chord.02': { hotkey: 'Mod+Shift+C', meta: { name: 'Chord 02' } },
  'sequence.02': {
    hotkey: ['G', 'C'],
    meta: { name: 'Sequence 02' },
    options: { timeout: 800 },
  },
  'chord.03': { hotkey: 'Mod+Shift+D', meta: { name: 'Chord 03' } },
  'sequence.03': {
    hotkey: ['G', 'D'],
    meta: { name: 'Sequence 03' },
    options: { timeout: 800 },
  },
  'chord.04': { hotkey: 'Mod+Shift+E', meta: { name: 'Chord 04' } },
  'sequence.04': {
    hotkey: ['G', 'E'],
    meta: { name: 'Sequence 04' },
    options: { timeout: 800 },
  },
  'chord.05': { hotkey: 'Mod+Shift+F', meta: { name: 'Chord 05' } },
  'sequence.05': {
    hotkey: ['G', 'F'],
    meta: { name: 'Sequence 05' },
    options: { timeout: 800 },
  },
  'chord.06': { hotkey: 'Mod+Shift+G', meta: { name: 'Chord 06' } },
  'sequence.06': {
    hotkey: ['G', 'G'],
    meta: { name: 'Sequence 06' },
    options: { timeout: 800 },
  },
  'chord.07': { hotkey: 'Mod+Shift+H', meta: { name: 'Chord 07' } },
  'sequence.07': {
    hotkey: ['G', 'H'],
    meta: { name: 'Sequence 07' },
    options: { timeout: 800 },
  },
  'chord.08': { hotkey: 'Mod+Shift+I', meta: { name: 'Chord 08' } },
  'sequence.08': {
    hotkey: ['G', 'I'],
    meta: { name: 'Sequence 08' },
    options: { timeout: 800 },
  },
  'chord.09': { hotkey: 'Mod+Shift+J', meta: { name: 'Chord 09' } },
  'sequence.09': {
    hotkey: ['G', 'J'],
    meta: { name: 'Sequence 09' },
    options: { timeout: 800 },
  },
  'chord.10': { hotkey: 'Mod+Shift+K', meta: { name: 'Chord 10' } },
  'sequence.10': {
    hotkey: ['G', 'K'],
    meta: { name: 'Sequence 10' },
    options: { timeout: 800 },
  },
  'chord.11': { hotkey: 'Mod+Shift+L', meta: { name: 'Chord 11' } },
  'sequence.11': {
    hotkey: ['G', 'L'],
    meta: { name: 'Sequence 11' },
    options: { timeout: 800 },
  },
  'chord.12': { hotkey: 'Mod+Shift+M', meta: { name: 'Chord 12' } },
  'sequence.12': {
    hotkey: ['G', 'M'],
    meta: { name: 'Sequence 12' },
    options: { timeout: 800 },
  },
  'chord.13': { hotkey: 'Mod+Shift+N', meta: { name: 'Chord 13' } },
  'sequence.13': {
    hotkey: ['G', 'N'],
    meta: { name: 'Sequence 13' },
    options: { timeout: 800 },
  },
  'chord.14': { hotkey: 'Mod+Shift+O', meta: { name: 'Chord 14' } },
  'sequence.14': {
    hotkey: ['G', 'O'],
    meta: { name: 'Sequence 14' },
    options: { timeout: 800 },
  },
  'chord.15': { hotkey: 'Mod+Shift+P', meta: { name: 'Chord 15' } },
  'sequence.15': {
    hotkey: ['G', 'P'],
    meta: { name: 'Sequence 15' },
    options: { timeout: 800 },
  },
  'chord.16': { hotkey: 'Mod+Shift+Q', meta: { name: 'Chord 16' } },
  'sequence.16': {
    hotkey: ['G', 'Q'],
    meta: { name: 'Sequence 16' },
    options: { timeout: 800 },
  },
  'chord.17': { hotkey: 'Mod+Shift+R', meta: { name: 'Chord 17' } },
  'sequence.17': {
    hotkey: ['G', 'R'],
    meta: { name: 'Sequence 17' },
    options: { timeout: 800 },
  },
  'chord.18': { hotkey: 'Mod+Shift+S', meta: { name: 'Chord 18' } },
  'sequence.18': {
    hotkey: ['G', 'S'],
    meta: { name: 'Sequence 18' },
    options: { timeout: 800 },
  },
  'chord.19': { hotkey: 'Mod+Shift+T', meta: { name: 'Chord 19' } },
  'sequence.19': {
    hotkey: ['G', 'T'],
    meta: { name: 'Sequence 19' },
    options: { timeout: 800 },
  },
  'chord.20': { hotkey: 'Mod+Shift+U', meta: { name: 'Chord 20' } },
  'sequence.20': {
    hotkey: ['G', 'U'],
    meta: { name: 'Sequence 20' },
    options: { timeout: 800 },
  },
  'chord.21': { hotkey: 'Mod+Shift+V', meta: { name: 'Chord 21' } },
  'sequence.21': {
    hotkey: ['G', 'V'],
    meta: { name: 'Sequence 21' },
    options: { timeout: 800 },
  },
  'chord.22': { hotkey: 'Mod+Shift+W', meta: { name: 'Chord 22' } },
  'sequence.22': {
    hotkey: ['G', 'W'],
    meta: { name: 'Sequence 22' },
    options: { timeout: 800 },
  },
  'chord.23': { hotkey: 'Mod+Shift+X', meta: { name: 'Chord 23' } },
  'sequence.23': {
    hotkey: ['G', 'X'],
    meta: { name: 'Sequence 23' },
    options: { timeout: 800 },
  },
  'chord.24': { hotkey: 'Mod+Shift+Y', meta: { name: 'Chord 24' } },
  'sequence.24': {
    hotkey: ['G', 'Y'],
    meta: { name: 'Sequence 24' },
    options: { timeout: 800 },
  },
  'chord.25': { hotkey: 'Mod+Shift+Z', meta: { name: 'Chord 25' } },
  'sequence.25': {
    hotkey: ['G', 'Z'],
    meta: { name: 'Sequence 25' },
    options: { timeout: 800 },
  },
  'chord.26': { hotkey: 'Mod+Shift+A', meta: { name: 'Chord 26' } },
  'sequence.26': {
    hotkey: ['G', 'A'],
    meta: { name: 'Sequence 26' },
    options: { timeout: 800 },
  },
  'chord.27': { hotkey: 'Mod+Shift+B', meta: { name: 'Chord 27' } },
  'sequence.27': {
    hotkey: ['G', 'B'],
    meta: { name: 'Sequence 27' },
    options: { timeout: 800 },
  },
  'chord.28': { hotkey: 'Mod+Shift+C', meta: { name: 'Chord 28' } },
  'sequence.28': {
    hotkey: ['G', 'C'],
    meta: { name: 'Sequence 28' },
    options: { timeout: 800 },
  },
  'chord.29': { hotkey: 'Mod+Shift+D', meta: { name: 'Chord 29' } },
  'sequence.29': {
    hotkey: ['G', 'D'],
    meta: { name: 'Sequence 29' },
    options: { timeout: 800 },
  },
  'chord.30': { hotkey: 'Mod+Shift+E', meta: { name: 'Chord 30' } },
  'sequence.30': {
    hotkey: ['G', 'E'],
    meta: { name: 'Sequence 30' },
    options: { timeout: 800 },
  },
  'chord.31': { hotkey: 'Mod+Shift+F', meta: { name: 'Chord 31' } },
  'sequence.31': {
    hotkey: ['G', 'F'],
    meta: { name: 'Sequence 31' },
    options: { timeout: 800 },
  },
  'chord.32': { hotkey: 'Mod+Shift+G', meta: { name: 'Chord 32' } },
  'sequence.32': {
    hotkey: ['G', 'G'],
    meta: { name: 'Sequence 32' },
    options: { timeout: 800 },
  },
  'chord.33': { hotkey: 'Mod+Shift+H', meta: { name: 'Chord 33' } },
  'sequence.33': {
    hotkey: ['G', 'H'],
    meta: { name: 'Sequence 33' },
    options: { timeout: 800 },
  },
  'chord.34': { hotkey: 'Mod+Shift+I', meta: { name: 'Chord 34' } },
  'sequence.34': {
    hotkey: ['G', 'I'],
    meta: { name: 'Sequence 34' },
    options: { timeout: 800 },
  },
  'chord.35': { hotkey: 'Mod+Shift+J', meta: { name: 'Chord 35' } },
  'sequence.35': {
    hotkey: ['G', 'J'],
    meta: { name: 'Sequence 35' },
    options: { timeout: 800 },
  },
  'chord.36': { hotkey: 'Mod+Shift+K', meta: { name: 'Chord 36' } },
  'sequence.36': {
    hotkey: ['G', 'K'],
    meta: { name: 'Sequence 36' },
    options: { timeout: 800 },
  },
  'chord.37': { hotkey: 'Mod+Shift+L', meta: { name: 'Chord 37' } },
  'sequence.37': {
    hotkey: ['G', 'L'],
    meta: { name: 'Sequence 37' },
    options: { timeout: 800 },
  },
  'chord.38': { hotkey: 'Mod+Shift+M', meta: { name: 'Chord 38' } },
  'sequence.38': {
    hotkey: ['G', 'M'],
    meta: { name: 'Sequence 38' },
    options: { timeout: 800 },
  },
  'chord.39': { hotkey: 'Mod+Shift+N', meta: { name: 'Chord 39' } },
  'sequence.39': {
    hotkey: ['G', 'N'],
    meta: { name: 'Sequence 39' },
    options: { timeout: 800 },
  },
  'chord.40': { hotkey: 'Mod+Shift+O', meta: { name: 'Chord 40' } },
  'sequence.40': {
    hotkey: ['G', 'O'],
    meta: { name: 'Sequence 40' },
    options: { timeout: 800 },
  },
  'chord.41': { hotkey: 'Mod+Shift+P', meta: { name: 'Chord 41' } },
  'sequence.41': {
    hotkey: ['G', 'P'],
    meta: { name: 'Sequence 41' },
    options: { timeout: 800 },
  },
  'chord.42': { hotkey: 'Mod+Shift+Q', meta: { name: 'Chord 42' } },
  'sequence.42': {
    hotkey: ['G', 'Q'],
    meta: { name: 'Sequence 42' },
    options: { timeout: 800 },
  },
  'chord.43': { hotkey: 'Mod+Shift+R', meta: { name: 'Chord 43' } },
  'sequence.43': {
    hotkey: ['G', 'R'],
    meta: { name: 'Sequence 43' },
    options: { timeout: 800 },
  },
  'chord.44': { hotkey: 'Mod+Shift+S', meta: { name: 'Chord 44' } },
  'sequence.44': {
    hotkey: ['G', 'S'],
    meta: { name: 'Sequence 44' },
    options: { timeout: 800 },
  },
  'chord.45': { hotkey: 'Mod+Shift+T', meta: { name: 'Chord 45' } },
  'sequence.45': {
    hotkey: ['G', 'T'],
    meta: { name: 'Sequence 45' },
    options: { timeout: 800 },
  },
  'chord.46': { hotkey: 'Mod+Shift+U', meta: { name: 'Chord 46' } },
  'sequence.46': {
    hotkey: ['G', 'U'],
    meta: { name: 'Sequence 46' },
    options: { timeout: 800 },
  },
  'chord.47': { hotkey: 'Mod+Shift+V', meta: { name: 'Chord 47' } },
  'sequence.47': {
    hotkey: ['G', 'V'],
    meta: { name: 'Sequence 47' },
    options: { timeout: 800 },
  },
  'chord.48': { hotkey: 'Mod+Shift+W', meta: { name: 'Chord 48' } },
  'sequence.48': {
    hotkey: ['G', 'W'],
    meta: { name: 'Sequence 48' },
    options: { timeout: 800 },
  },
  'chord.49': { hotkey: 'Mod+Shift+X', meta: { name: 'Chord 49' } },
  'sequence.49': {
    hotkey: ['G', 'X'],
    meta: { name: 'Sequence 49' },
    options: { timeout: 800 },
  },
})

describe('defineAppHotkeys with many entries', () => {
  it('keeps each entry typed by id and kind', () => {
    expect(Object.keys(appHotkeys)).toHaveLength(100)
    expectTypeOf(appHotkeys['chord.49']).toEqualTypeOf<
      AppHotkey<'chord.49', HotkeyChord>
    >()
    expectTypeOf(appHotkeys['sequence.49']).toEqualTypeOf<
      AppHotkey<'sequence.49', HotkeySequence>
    >()
  })
})
