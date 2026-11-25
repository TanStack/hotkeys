import { renderToString } from '@solidjs/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHotkeyRecorder } from '../src/createHotkeyRecorder'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createHotkeyRecorder on the server', () => {
  it('renders without writing signals', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Recorder() {
      const recorder = createHotkeyRecorder({ onRecord: () => {} })
      return <span>{recorder.isRecording() ? 'recording' : 'idle'}</span>
    }

    expect(renderToString(() => <Recorder />)).toContain('idle')
    expect([...warn.mock.calls, ...error.mock.calls]).toEqual([])
  })
})
