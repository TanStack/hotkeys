import { bench } from 'heisenbench/bench'
import { formatForDisplay, normalizeHotkey, parseHotkey } from '../src'

const chords = [
  'Mod+S',
  'Mod+Shift+K',
  'Control+Alt+Delete',
  'Alt+ArrowUp',
  'Shift+?',
  'Escape',
  'F12',
  'Mod+[KeyQ]',
] as const

bench('parseHotkey: eight chord strings', () => {
  for (const chord of chords) parseHotkey(chord, 'mac')
})

bench('parseHotkey: a three-step sequence', () =>
  parseHotkey(['G', 'G', 'Shift+G'], 'windows'))

bench('normalizeHotkey: eight chord strings', () => {
  for (const chord of chords) normalizeHotkey(chord, 'windows')
})

bench('formatForDisplay: eight chords on mac', () => {
  for (const chord of chords) formatForDisplay(chord, { platform: 'mac' })
})

bench('formatForDisplay: eight chords on windows', () => {
  for (const chord of chords) formatForDisplay(chord, { platform: 'windows' })
})
