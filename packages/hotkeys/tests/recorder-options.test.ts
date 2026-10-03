import { afterEach, expect, it, vi } from 'vitest'
import { HotkeyRecorder } from '../src/hotkey-recorder'
import { HotkeySequenceRecorder } from '../src/hotkey-sequence-recorder'
import type { HotkeyRecorderOptions } from '../src/hotkey-recorder'
import type { HotkeySequenceRecorderOptions } from '../src/hotkey-sequence-recorder'

const recorders: Array<HotkeyRecorder | HotkeySequenceRecorder> = []
afterEach(() => {
  recorders.splice(0).forEach((recorder) => recorder.destroy())
  vi.useRealTimers()
})
function press(key: string, code: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true }),
  )
}

it('reads current policy and callbacks during a hotkey recording session', () => {
  const stale = vi.fn()
  const current = vi.fn()
  const rejected = vi.fn()
  let options: HotkeyRecorderOptions = {
    recordBy: 'key',
    onRecord: stale,
    validate: () => false,
    onReject: rejected,
  }
  const recorder = new HotkeyRecorder(() => options)
  recorders.push(recorder)
  recorder.start()
  press('a', 'KeyA')
  expect(rejected).toHaveBeenCalledOnce()
  expect(recorder.store.state.isRecording).toBe(true)
  options = { onRecord: current }
  press('ß', 'KeyS')
  expect(current).toHaveBeenCalledWith('[KeyS]')
  expect(stale).not.toHaveBeenCalled()
})

it('reads current sequence commit policy and idle callbacks without losing steps', () => {
  vi.useFakeTimers()
  const stale = vi.fn()
  const current = vi.fn()
  let options: HotkeySequenceRecorderOptions = {
    onRecord: stale,
    recordBy: 'key',
    commitKeys: 'none',
    idleTimeoutMs: 100,
  }
  const recorder = new HotkeySequenceRecorder(() => options)
  recorders.push(recorder)
  recorder.start()
  press('g', 'KeyG')
  options = { ...options, onRecord: current }
  vi.advanceTimersByTime(100)
  expect(current).toHaveBeenCalledWith(['G'])
  expect(stale).not.toHaveBeenCalled()
  recorder.start()
  press('g', 'KeyG')
  options = { onRecord: current, recordBy: 'key' }
  press('Enter', 'Enter')
  expect(current).toHaveBeenCalledTimes(2)
  expect(recorder.store.state.isRecording).toBe(false)
})

it('merges explicit setOptions overrides over a live options source', () => {
  const callback = vi.fn()
  const recorder = new HotkeyRecorder(() => ({
    recordBy: 'key',
    onRecord: callback,
  }))
  recorders.push(recorder)
  recorder.setOptions({ recordBy: 'code' })
  recorder.start()
  press('ß', 'KeyS')
  expect(callback).toHaveBeenCalledWith('[KeyS]')
})
