import { bench } from 'heisenbench/bench'
import { HotkeyManager } from '../src'
import type { LetterKey, NumberKey, RegisterableHotkey } from '../src'

const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] as Array<LetterKey>
const digits = [...'1234567890'] as Array<NumberKey>

// A command palette's worth of bindings: chords on several modifiers,
// named keys, and a few sequences.
const hotkeys: Array<RegisterableHotkey> = [
  ...letters.map((key) => `Mod+${key}` as const),
  ...letters.slice(0, 10).map((key) => `Mod+Shift+${key}` as const),
  ...digits.map((key) => `Alt+${key}` as const),
  'Escape',
  'Enter',
  'ArrowUp',
  'ArrowDown',
  ['G', 'G'],
  ['G', 'I'],
  ['G', 'Shift+G'],
]

const noop = () => {}

function registerAll() {
  HotkeyManager.resetInstance()
  const manager = HotkeyManager.getInstance()
  for (const hotkey of hotkeys)
    manager.register(hotkey, noop, { platform: 'mac' })
  return manager
}

bench(`HotkeyManager.register: ${hotkeys.length} hotkeys`, registerAll, {
  teardown: () => HotkeyManager.resetInstance(),
})

bench(
  `HotkeyManager: ten key presses with ${hotkeys.length} hotkeys registered`,
  ({ events }) => {
    for (const event of events) document.dispatchEvent(event)
  },
  {
    setup: () => {
      registerAll()
      const press = (init: KeyboardEventInit) =>
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          ...init,
        })
      return {
        events: [
          press({ key: 's', code: 'KeyS', metaKey: true }),
          press({ key: 'b', code: 'KeyB', metaKey: true, shiftKey: true }),
          press({ key: '3', code: 'Digit3', altKey: true }),
          press({ key: 'Escape', code: 'Escape' }),
          press({ key: 'ArrowDown', code: 'ArrowDown' }),
          press({ key: 'g', code: 'KeyG' }),
          press({ key: 'g', code: 'KeyG' }),
          press({ key: 'x', code: 'KeyX' }),
          press({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }),
          press({ key: 'q', code: 'KeyQ', ctrlKey: true }),
        ],
      }
    },
    teardown: () => HotkeyManager.resetInstance(),
  },
)
