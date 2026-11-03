// @vitest-environment happy-dom
import { StrictMode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { HotkeyManager } from '@tanstack/hotkeys'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'

describe('useHotkeyRecorder', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it.each([
    ['', undefined],
    [' under StrictMode', StrictMode],
  ])('keeps action identities across renders%s', (_, wrapper) => {
    const { result, rerender } = renderHook(
      () => useHotkeyRecorder({ onRecord: () => {} }),
      { wrapper },
    )
    const first = result.current
    rerender()
    act(() => result.current.startRecording())
    expect(result.current.isRecording).toBe(true)

    expect(result.current).not.toBe(first)
    expect(result.current.startRecording).toBe(first.startRecording)
    expect(result.current.stopRecording).toBe(first.stopRecording)
    expect(result.current.cancelRecording).toBe(first.cancelRecording)
    expect(result.current.commitRecording).toBe(first.commitRecording)

    act(() => first.stopRecording())
    expect(result.current.isRecording).toBe(false)
  })
})
