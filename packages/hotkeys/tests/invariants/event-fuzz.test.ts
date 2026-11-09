import { keyEvent, keyup } from '@tanstack/hotkeys-test-utils'
import fc from 'fast-check'
import { afterEach, describe, expect, it } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  matchesKeyboardEvent,
  normalizeHotkey,
  parseKeyboardEvent,
} from '../../src'
import {
  KEY_TOKENS,
  PHYSICAL_CODES,
  PLATFORMS,
  isBug085,
  isBug087,
} from './fixtures'
import type { Hotkey } from '../../src'

// Arbitrary key events: whatever `key` and `code` a browser, extension or
// test tool sends, matching never throws and a recorded chord matches the
// press it came from.

const RUNS = {
  seed: Number(process.env.HOTKEYS_FUZZ_SEED ?? 20261108),
  numRuns: Number(process.env.HOTKEYS_FUZZ_RUNS ?? 300),
}

afterEach(() => {
  HotkeyManager.resetInstance()
})

const eventInit = fc.record({
  key: fc.oneof(
    fc.constantFrom(
      ...KEY_TOKENS.filter((token) => !token.startsWith('[')),
      'Dead',
      'Unidentified',
      'Process',
      'AltGraph',
      'Control',
      'Shift',
      'OS',
      ' ',
      ' ',
      '+',
      'é',
    ),
    // Browsers report one character, or a named key
    fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
    fc.string({ unit: 'binary', minLength: 1, maxLength: 1 }),
  ),
  code: fc.oneof(
    fc.constantFrom(
      ...PHYSICAL_CODES,
      '',
      'Unidentified',
      'ShiftLeft',
      'AltRight',
    ),
    fc.string({ maxLength: 8 }),
  ),
  ctrlKey: fc.boolean(),
  altKey: fc.boolean(),
  shiftKey: fc.boolean(),
  metaKey: fc.boolean(),
  altGraph: fc.boolean(),
})

const platform = fc.constantFrom(...PLATFORMS)

describe('arbitrary key events', () => {
  it('parsing and matching never throw', () => {
    fc.assert(
      fc.property(
        eventInit,
        platform,
        fc.constantFrom(...KEY_TOKENS),
        (init, p, token) => {
          const event = keyEvent('keydown', init)
          parseKeyboardEvent(event, p)
          matchesKeyboardEvent(event, token as never, p)
          matchesKeyboardEvent(event, `Control+Shift+${token}` as never, p)
        },
      ),
      RUNS,
    )
  })

  it.each(['code', 'key'] as const)(
    'a chord recorded by %s matches the press it came from',
    (recordBy) => {
      fc.assert(
        fc.property(eventInit, platform, (init, p) => {
          // Known bugs, covered by skipped tests in recorder-match.test.ts
          fc.pre(!isBug085(init, p, recordBy) && !isBug087(init, recordBy))
          let recorded: Hotkey | undefined
          const recorder = new HotkeyRecorder({
            platform: p,
            recordBy,
            onRecord: (hotkey) => (recorded = hotkey),
          })
          recorder.start()
          keyEvent('keydown', { ...init, target: document })
          recorder.destroy()
          keyup({ ...init, target: document })
          if (recorded === undefined) return
          expect(typeof recorded).toBe('string')
          expect(normalizeHotkey(recorded, p)).toBe(recorded)
          expect(
            matchesKeyboardEvent(
              keyEvent('keydown', init),
              recorded as never,
              p,
            ),
          ).toBe(true)
        }),
        RUNS,
      )
    },
  )
})
