import { bench } from 'heisenbench/bench'
import {
  createSequenceMatcher,
  matchesKeyboardEvent,
  parseHotkey,
} from '../src'

// Keys as a US layout reports them
const keys = [
  { key: 's', code: 'KeyS', metaKey: true },
  { key: 'k', code: 'KeyK', metaKey: true, shiftKey: true },
  { key: '?', code: 'Slash', shiftKey: true },
  { key: 'ArrowUp', code: 'ArrowUp', altKey: true },
  { key: 'Escape', code: 'Escape' },
  { key: 'x', code: 'KeyX' },
] as const

const chords = [
  'Mod+S',
  'Mod+Shift+K',
  'Shift+?',
  'Alt+ArrowUp',
  'Escape',
] as const

bench(
  'matchesKeyboardEvent: six key presses against five parsed chords',
  ({ events, parsed }) => {
    let matched = 0
    for (const event of events) {
      for (const chord of parsed) {
        if (matchesKeyboardEvent(event, chord, 'mac')) matched++
      }
    }
    return matched
  },
  {
    setup: () => ({
      events: keys.map((init) => new KeyboardEvent('keydown', init)),
      parsed: chords.map((chord) => parseHotkey(chord, 'mac')),
    }),
  },
)

bench(
  'matchesKeyboardEvent: six key presses against five chord strings',
  ({ events }) => {
    let matched = 0
    for (const event of events) {
      for (const chord of chords) {
        if (matchesKeyboardEvent(event, chord, 'mac')) matched++
      }
    }
    return matched
  },
  {
    setup: () => ({
      events: keys.map((init) => new KeyboardEvent('keydown', init)),
    }),
  },
)

bench(
  'createSequenceMatcher: typing g g G',
  ({ matcher, events }) => {
    let fired = 0
    for (const event of events) if (matcher.match(event)) fired++
    return fired
  },
  {
    // Building the matcher parses the sequence; keep that out of the count.
    setup: () => ({
      matcher: createSequenceMatcher(['G', 'G', 'Shift+G'], {
        platform: 'windows',
      }),
      events: [
        new KeyboardEvent('keydown', { key: 'g', code: 'KeyG' }),
        new KeyboardEvent('keydown', { key: 'g', code: 'KeyG' }),
        new KeyboardEvent('keydown', {
          key: 'G',
          code: 'KeyG',
          shiftKey: true,
        }),
      ],
    }),
  },
)
