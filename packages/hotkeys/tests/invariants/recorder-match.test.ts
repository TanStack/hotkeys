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

  it('records every press that is not a recorder control key, a whitespace character, or AltGr that typed nothing new', () => {
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
      // Outside Windows, AltGr that typed nothing new fires no hotkey
      if (
        result.kind === 'rejected' &&
        result.rejection.reason === 'alt-graph' &&
        platform === 'linux' &&
        init.altGraph &&
        !altGraphTypedCharacter(init.key)
      ) {
        continue
      }
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

  it('rejects an AltGr press that types nothing new when recording by key', () => {
    const cases = events.filter(
      ({ init }) => init.altGraph && !altGraphTypedCharacter(init.key),
    )
    if (platform === 'mac') expect(cases).toEqual([])
    else expect(cases.length).toBeGreaterThan(0)
    expect(checkRecorded(cases, 'key')).toEqual([])
    // Windows treats these presses as Control+Alt, and records that
    if (platform !== 'linux') return
    const log = failureLog()
    for (const { label, init } of cases) {
      const result = record(init, platform, 'key')
      if (result.kind !== 'rejected' || result.rejection.reason !== 'alt-graph')
        log.add(`${label}: ${JSON.stringify(result)}`)
    }
    expect(log.report()).toEqual([])
  })

  it('ignores a key on a modifier position when recording by code', () => {
    const cases = events.filter(({ init }) =>
      /^(Control|Shift|Alt|Meta)(Left|Right)$/.test(init.code ?? ''),
    )
    expect(cases.length).toBeGreaterThan(0)
    const log = failureLog()
    for (const { label, init } of cases) {
      const result = record(init, platform, 'code')
      if (result.kind !== 'none') log.add(`${label}: ${JSON.stringify(result)}`)
    }
    expect(log.report()).toEqual([])
  })
})
