// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { HotkeyRecorder } from '../src/hotkey-recorder'
import { isRecordingEvent } from '../src/_recording-guard'

describe('HotkeyRecorder without a document', () => {
  // Server renders rarely run cleanup, so a started recorder would stay in the
  // shared session set and suspend dispatch for the life of the process.
  it('does not start recording', () => {
    const recorder = new HotkeyRecorder({ onRecord: () => {} })
    recorder.start()
    expect(recorder.store.state.isRecording).toBe(false)
    expect(isRecordingEvent({ code: 'KeyK', key: 'k' } as KeyboardEvent)).toBe(
      false,
    )
  })
})
