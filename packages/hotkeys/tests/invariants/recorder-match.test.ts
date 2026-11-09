import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  matchesKeyboardEvent,
  normalizeHotkey,
  validateHotkey,
} from '../../src'
import {
  PLATFORMS,
  altGraphTypedCharacter,
  failureLog,
  isBug085,
  isBug087,
  makeEvent,
  realisticEvents,
} from './fixtures'
import type { Hotkey, HotkeyChord, RecorderRejection } from '../../src'
import type { EventCase, Platform } from './fixtures'

// A chord the recorder stores from a key press must match that same key
// press, both through the matcher and as a registered hotkey.

afterEach(() => {
  HotkeyManager.resetInstance()
  vi.restoreAllMocks()
})

type RecordResult =
  | { kind: 'recorded'; hotkey: Hotkey }
  | { kind: 'rejected'; rejection: RecorderRejection }
  | { kind: 'none' }

function record(
  init: EventCase['init'],
  platform: Platform,
  recordBy: 'code' | 'key',
): RecordResult {
  let result: RecordResult = { kind: 'none' }
  const recorder = new HotkeyRecorder({
    platform,
    recordBy,
    onRecord: (hotkey) => (result = { kind: 'recorded', hotkey }),
    onReject: (rejection) => (result = { kind: 'rejected', rejection }),
  })
  recorder.start()
  document.dispatchEvent(makeEvent('keydown', init))
  recorder.destroy()
  // Hotkeys stay paused for a recorded key until its release
  document.dispatchEvent(makeEvent('keyup', init))
  return result
}

/** Keys the recorder handles itself instead of recording. */
function recorderControlKey(init: EventCase['init']): boolean {
  const modified = init.ctrlKey || init.altKey || init.metaKey || init.altGraph
  return (
    init.key === 'Escape' ||
    (init.key === 'Tab' && !modified) ||
    ((init.key === 'Backspace' || init.key === 'Delete') &&
      !modified &&
      !init.shiftKey)
  )
}

describe.each(PLATFORMS)('recorded chords on %s', (platform) => {
  const events = realisticEvents(platform)

  describe.each(['code', 'key'] as const)('recordBy: %s', (recordBy) => {
    it('match the key press they were recorded from', () => {
      const log = failureLog()
      let recorded = 0
      for (const { label, init } of events) {
        // Known bugs, covered by the skipped tests below
        if (isBug085(init, platform, recordBy) || isBug087(init, recordBy))
          continue
        const result = record(init, platform, recordBy)
        if (result.kind !== 'recorded') continue
        recorded++
        const hotkey = result.hotkey as HotkeyChord
        if (typeof hotkey !== 'string') {
          log.add(`${label}: recorded a sequence ${JSON.stringify(hotkey)}`)
          continue
        }
        if (!validateHotkey(hotkey).valid) {
          log.add(`${label}: recorded invalid ${hotkey}`)
        }
        if (normalizeHotkey(hotkey, platform) !== hotkey) {
          log.add(`${label}: recorded ${hotkey}, which is not in normal form`)
        }
        if (
          !matchesKeyboardEvent(makeEvent('keydown', init), hotkey, platform)
        ) {
          log.add(`${label}: recorded ${hotkey}, which doesn't match it`)
        }
      }
      expect(log.report()).toEqual([])
      // Most presses record; a broken fixture would record nothing
      expect(recorded).toBeGreaterThan(events.length / 2)
    })

    it('fire a hotkey registered with the recorded chord', () => {
      const log = failureLog()
      const manager = HotkeyManager.getInstance()
      for (const { label, init } of events) {
        if (isBug085(init, platform, recordBy) || isBug087(init, recordBy))
          continue
        const result = record(init, platform, recordBy)
        if (result.kind !== 'recorded') continue
        const hotkey = result.hotkey as HotkeyChord
        const callback = vi.fn()
        const handle = manager.register(hotkey, callback, {
          platform,
          ignoreInputs: false,
          conflictBehavior: 'allow',
        })
        document.dispatchEvent(makeEvent('keydown', init))
        handle.unregister()
        if (callback.mock.calls.length !== 1) {
          log.add(
            `${label}: ${hotkey} fired ${callback.mock.calls.length} times`,
          )
        }
      }
      expect(log.report()).toEqual([])
    })
  })

  it('records every press that is not a recorder control key or a whitespace character', () => {
    const log = failureLog()
    for (const { label, init } of events) {
      if (recorderControlKey(init)) continue
      const result = record(init, platform, 'key')
      if (result.kind === 'recorded') continue
      const whitespace = init.key === ' '
      const unidentified = init.key === 'Unidentified'
      if (
        result.kind === 'rejected' &&
        result.rejection.reason === 'whitespace' &&
        whitespace
      ) {
        continue
      }
      if (result.kind === 'none' && unidentified) continue
      log.add(`${label}: ${JSON.stringify(result)}`)
    }
    expect(log.report()).toEqual([])
  })

  it('rejects AltGr presses when recording by code', () => {
    const log = failureLog()
    for (const { label, init } of events) {
      if (!init.altGraph || platform === 'mac') continue
      const result = record(init, platform, 'code')
      // Windows treats AltGr that types nothing new as Control+Alt
      if (result.kind === 'recorded') {
        if (platform !== 'windows') {
          log.add(`${label}: recorded ${JSON.stringify(result.hotkey)}`)
        }
        continue
      }
      if (
        result.kind !== 'rejected' ||
        result.rejection.reason !== 'alt-graph'
      ) {
        log.add(`${label}: ${JSON.stringify(result)}`)
      }
    }
    expect(log.report()).toEqual([])
  })

  /** Checks that a recorded chord is valid, matches its press and fires. */
  function checkRecorded(
    cases: Array<EventCase>,
    recordBy: 'code' | 'key',
  ): Array<string> {
    const log = failureLog()
    for (const { label, init } of cases) {
      const result = record(init, platform, recordBy)
      if (result.kind !== 'recorded') continue
      const hotkey = result.hotkey as HotkeyChord
      if (!validateHotkey(hotkey).valid)
        log.add(`${label}: recorded invalid ${hotkey}`)
      if (!matchesKeyboardEvent(makeEvent('keydown', init), hotkey, platform)) {
        log.add(`${label}: recorded ${hotkey}, which doesn't match it`)
      }
      const callback = vi.fn()
      const handle = HotkeyManager.getInstance().register(hotkey, callback, {
        platform,
        ignoreInputs: false,
        conflictBehavior: 'allow',
      })
      document.dispatchEvent(makeEvent('keydown', init))
      handle.unregister()
      if (callback.mock.calls.length !== 1) {
        log.add(`${label}: ${hotkey} fired ${callback.mock.calls.length} times`)
      }
    }
    return log.report()
  }

  // issues/bugs/BUG-085-linux-altgr-recording-never-fires.md
  it.skip('BUG-085: an AltGr press that types nothing new records a chord that matches it', () => {
    const cases = events.filter(
      ({ init }) => init.altGraph && !altGraphTypedCharacter(init.key),
    )
    if (platform === 'mac') expect(cases).toEqual([])
    else expect(cases.length).toBeGreaterThan(0)
    expect(checkRecorded(cases, 'key')).toEqual([])
  })

  // issues/bugs/BUG-087-recorder-stores-modifier-position-codes.md
  it.skip('BUG-087: a key on a modifier position records a chord that matches it', () => {
    const cases = events.filter(({ init }) => isBug087(init, 'code'))
    expect(cases.length).toBeGreaterThan(0)
    expect(checkRecorded(cases, 'code')).toEqual([])
  })
})
