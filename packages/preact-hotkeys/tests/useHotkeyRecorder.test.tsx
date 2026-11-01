// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/preact'
import { HotkeyManager } from '@tanstack/hotkeys'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import type { PreactHotkeyRecorder } from '../src/useHotkeyRecorder'

describe('useHotkeyRecorder', () => {
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  it('keeps action identities across renders', () => {
    const results: Array<PreactHotkeyRecorder> = []
    function Recorder({ n }: { n: number }) {
      results.push(useHotkeyRecorder({ onRecord: () => {} }))
      return <span>{n}</span>
    }
    const { rerender } = render(<Recorder n={1} />)
    rerender(<Recorder n={2} />)
    const [first, last] = [results[0]!, results.at(-1)!]

    expect(last).not.toBe(first)
    expect(last.startRecording).toBe(first.startRecording)
    expect(last.stopRecording).toBe(first.stopRecording)
    expect(last.cancelRecording).toBe(first.cancelRecording)
    expect(last.commitRecording).toBe(first.commitRecording)

    act(() => first.startRecording())
    expect(results.at(-1)!.isRecording).toBe(true)
  })
})
