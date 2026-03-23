import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeySequenceRecorder } from '../src/hotkey-sequence-recorder'

function createKeyboardEvent(
  type: 'keydown' | 'keyup',
  key: string,
  options: {
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
  } = {},
): KeyboardEvent {
  return new KeyboardEvent(type, {
    key,
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    bubbles: true,
  })
}

describe('HotkeySequenceRecorder', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('appends chords and commits on Enter by default', () => {
    const onRecord = vi.fn()
    const r = new HotkeySequenceRecorder({ onRecord })
    r.start()

    document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
    expect(r.store.state.steps.length).toBe(1)

    document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
    expect(r.store.state.steps.length).toBe(2)

    document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
    expect(onRecord).toHaveBeenCalledTimes(1)
    expect(onRecord).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(String), expect.any(String)]),
    )
    expect(r.store.state.isRecording).toBe(false)
    const [recorded] = onRecord.mock.calls[0] ?? []
    expect(recorded).toBeDefined()
    expect(r.store.state.recordedSequence).toEqual(recorded)
  })

  it('commitKeys none requires commit()', () => {
    const onRecord = vi.fn()
    const r = new HotkeySequenceRecorder({
      onRecord,
      commitKeys: 'none',
    })
    r.start()

    document.dispatchEvent(createKeyboardEvent('keydown', 'a'))
    document.dispatchEvent(createKeyboardEvent('keydown', 'b'))
    expect(r.store.state.steps.length).toBe(2)

    document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
    expect(onRecord).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)

    r.commit()
    expect(onRecord).toHaveBeenCalledTimes(1)
    expect(r.store.state.isRecording).toBe(false)
  })

  it('commit() is no-op with zero steps', () => {
    const onRecord = vi.fn()
    const r = new HotkeySequenceRecorder({ onRecord })
    r.start()
    r.commit()
    expect(onRecord).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)
  })

  it('Escape calls onCancel and stops', () => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    const r = new HotkeySequenceRecorder({ onRecord, onCancel })
    r.start()
    document.dispatchEvent(createKeyboardEvent('keydown', 'x'))
    document.dispatchEvent(createKeyboardEvent('keydown', 'Escape'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onRecord).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(false)
    expect(r.store.state.steps).toEqual([])
  })

  it('Backspace pops last step', () => {
    const onRecord = vi.fn()
    const r = new HotkeySequenceRecorder({ onRecord })
    r.start()
    document.dispatchEvent(createKeyboardEvent('keydown', 'a'))
    document.dispatchEvent(createKeyboardEvent('keydown', 'b'))
    expect(r.store.state.steps.length).toBe(2)

    document.dispatchEvent(createKeyboardEvent('keydown', 'Backspace'))
    expect(r.store.state.steps.length).toBe(1)
    expect(onRecord).not.toHaveBeenCalled()
  })

  it('Backspace with no steps clears via onRecord([]) and onClear', () => {
    const onRecord = vi.fn()
    const onClear = vi.fn()
    const r = new HotkeySequenceRecorder({ onRecord, onClear })
    r.start()
    document.dispatchEvent(createKeyboardEvent('keydown', 'Backspace'))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onRecord).toHaveBeenCalledWith([])
    expect(r.store.state.isRecording).toBe(false)
  })

  it('idle timeout commits only after first step', () => {
    vi.useFakeTimers()
    const onRecord = vi.fn()
    const r = new HotkeySequenceRecorder({
      onRecord,
      idleTimeoutMs: 500,
    })
    r.start()

    vi.advanceTimersByTime(2000)
    expect(onRecord).not.toHaveBeenCalled()

    document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
    vi.advanceTimersByTime(499)
    expect(onRecord).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(onRecord).toHaveBeenCalledTimes(1)
    const [idleRecorded] = onRecord.mock.calls[0] ?? []
    expect(idleRecorded).toBeDefined()
    expect(idleRecorded?.length).toBeGreaterThanOrEqual(1)
  })

  it('stop does not call onRecord or onCancel', () => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    const r = new HotkeySequenceRecorder({ onRecord, onCancel })
    r.start()
    document.dispatchEvent(createKeyboardEvent('keydown', 'z'))
    r.stop()

    expect(onCancel).not.toHaveBeenCalled()
    expect(onRecord).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(false)
  })

  it('commitOnEnter false allows Enter as chord when using commit()', () => {
    const onRecord = vi.fn()
    const r = new HotkeySequenceRecorder({
      onRecord,
      commitOnEnter: false,
      commitKeys: 'enter',
    })
    r.start()
    document.dispatchEvent(createKeyboardEvent('keydown', 'a'))
    document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
    expect(r.store.state.steps.length).toBe(2)
    r.commit()
    expect(onRecord).toHaveBeenCalledTimes(1)
  })
})
