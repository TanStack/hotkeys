import { afterAll, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  matchesKeyboardEvent,
  normalizeHotkey,
  parseHotkey,
  validateHotkey,
} from '../../src'
import { matchKeyboardEvent } from '../../src/_match'
import { hotkeyChordFromKeydown } from '../../src/_recorder-chord'
import {
  allLayoutPresses,
  layoutPress,
  layoutsFor,
} from '../fixtures/layout-events'
import { PLATFORMS, failureLog, makeEvent } from './fixtures'
import type { HotkeyChord } from '../../src'
import type { EventCase, Platform } from './fixtures'

// Property tests take well under a second each here, but CI runs several
// packages' tests at once on a small runner, which makes them 20 to 30 times
// slower than the 5 s default allows.
vi.setConfig({ testTimeout: 60_000 })

// Every chord the recorder makes from a key press fires on that press, in
// every `recordBy` mode, for every press on every layout in layout-table.json
// with every modifier combination, plus the numpad with NumLock on and off.

afterAll(() => {
  HotkeyManager.resetInstance()
})

const NUMPAD: Record<string, [on: string, off: string]> = {
  Numpad0: ['0', 'Insert'],
  Numpad1: ['1', 'End'],
  Numpad2: ['2', 'ArrowDown'],
  Numpad3: ['3', 'PageDown'],
  Numpad4: ['4', 'ArrowLeft'],
  Numpad5: ['5', 'Clear'],
  Numpad6: ['6', 'ArrowRight'],
  Numpad7: ['7', 'Home'],
  Numpad8: ['8', 'ArrowUp'],
  Numpad9: ['9', 'PageUp'],
  NumpadDecimal: [',', 'Delete'],
  NumpadAdd: ['+', '+'],
  NumpadSubtract: ['-', '-'],
  NumpadMultiply: ['*', '*'],
  NumpadDivide: ['/', '/'],
  NumpadEnter: ['Enter', 'Enter'],
}

/** Numpad presses with every modifier combination and NumLock on and off. */
function numpadPresses(): Array<EventCase['init']> {
  const inits: Array<EventCase['init']> = []
  for (const [code, keys] of Object.entries(NUMPAD)) {
    for (const key of new Set([...keys, '.'])) {
      if (key === '.' && code !== 'NumpadDecimal') continue
      for (let i = 0; i < 16; i++) {
        inits.push({
          key,
          code,
          ctrlKey: !!(i & 1),
          altKey: !!(i & 2),
          shiftKey: !!(i & 4),
          metaKey: !!(i & 8),
        })
      }
    }
  }
  return inits
}

/** Each distinct keydown the platform's layouts send, once. */
function pressesFor(platform: Platform): Array<EventCase> {
  const seen = new Set<string>()
  const cases: Array<EventCase> = []
  const add = (label: string, init: EventCase['init']) => {
    const id = JSON.stringify(init)
    if (seen.has(id)) return
    seen.add(id)
    cases.push({ label, init })
  }
  for (const press of allLayoutPresses(platform)) add(press.label, press.init)
  for (const init of numpadPresses()) {
    add(`${platform} numpad ${JSON.stringify(init)}`, init)
  }
  return cases
}

describe.each(PLATFORMS)(
  'recorded chords on every layout on %s',
  (platform) => {
    const presses = pressesFor(platform)

    it.each(['auto', 'code', 'key'] as const)(
      'recordBy: %s records chords that fire on the press they came from',
      (recordBy) => {
        const log = failureLog()
        const manager = HotkeyManager.getInstance()
        const chords: Array<HotkeyChord> = []
        const recorder = new HotkeyRecorder({
          platform,
          recordBy,
          onRecord: (hotkey) => chords.push(hotkey),
        })
        let recorded = 0
        for (const { label, init } of presses) {
          const event = makeEvent('keydown', init)
          chords.length = 0
          recorder.start()
          document.dispatchEvent(event)
          recorder.stop()
          // Hotkeys stay paused for a recorded key until its release
          document.dispatchEvent(makeEvent('keyup', init))
          const hotkey = chords[0]
          if (hotkey === undefined) continue
          recorded++
          if (!validateHotkey(hotkey).valid) {
            log.add(`${label}: recorded invalid ${hotkey}`)
            continue
          }
          if (normalizeHotkey(hotkey, platform) !== hotkey) {
            log.add(`${label}: recorded ${hotkey}, which is not in normal form`)
          }
          if (!matchesKeyboardEvent(event, hotkey, platform)) {
            log.add(`${label}: recorded ${hotkey}, which doesn't match it`)
            continue
          }
          // A counter, not vi.fn(): Vitest holds every call until the test ends
          let calls = 0
          const handle = manager.register(hotkey, () => calls++, {
            platform,
            ignoreInputs: false,
            conflictBehavior: 'allow',
          })
          document.dispatchEvent(makeEvent('keydown', init))
          document.dispatchEvent(makeEvent('keyup', init))
          handle.unregister()
          if (calls !== 1) log.add(`${label}: ${hotkey} fired ${calls} times`)
        }
        recorder.destroy()
        expect(log.report()).toEqual([])
        // A broken fixture would record next to nothing
        expect(recorded).toBeGreaterThan(presses.length / 2)
      },
    )
  },
)

// A press with Shift records a chord that the same key without Shift doesn't
// fire, so Cmd+Shift+key and Cmd+key can be bound apart on every layout.
describe.each(PLATFORMS)('recorded chords with Shift on %s', (platform) => {
  it('do not fire on the same key without Shift', () => {
    const log = failureLog()
    let checked = 0
    for (const layout of layoutsFor(platform)) {
      for (const code of layout.keys.keys()) {
        for (let i = 0; i < 8; i++) {
          const mods = { ctrl: !!(i & 1), alt: !!(i & 2), meta: !!(i & 4) }
          const shifted = layoutPress(layout, code, { ...mods, shift: true })
          const plain = layoutPress(layout, code, mods)
          if (!shifted || !plain) continue
          // Where Shift types the same character, as Canadian Shift+., the
          // event can't tell the two apart. macOS Command can: it reports the
          // unshifted character on a key whose Shift changes it.
          if (
            plain.init.key === shifted.init.key &&
            !(platform === 'mac' && mods.meta && !mods.alt)
          ) {
            continue
          }
          const hotkey = hotkeyChordFromKeydown(
            makeEvent('keydown', shifted.init),
            platform,
          )
          if (hotkey === null) continue
          checked++
          // A stand-in match by position fires a hand-written chord the same
          // way, as AZERTY `1` fires on `&`, so only a closer match counts
          const { score } = matchKeyboardEvent(
            makeEvent('keydown', plain.init),
            parseHotkey(hotkey, platform),
            platform,
          )
          if (score > 1) {
            log.add(
              `${shifted.label}: recorded ${hotkey}, which also fires without Shift`,
            )
          }
        }
      }
    }
    expect(log.report()).toEqual([])
    expect(checked).toBeGreaterThan(1000)
  })
})
