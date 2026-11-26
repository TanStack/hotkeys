// @vitest-environment happy-dom

import { HotkeyManager } from '@tanstack/hotkeys'
import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

  it('stops applying an option the caller no longer passes', () => {
    const onRecord = vi.fn()
    const { result, rerender } = renderHook(
      ({ strict }: { strict: boolean }) =>
        useHotkeyRecorder(
          strict
            ? { onRecord, validate: () => 'reserved' as const }
            : { onRecord },
        ),
      { initialProps: { strict: true } },
    )
    rerender({ strict: false })
    act(() => result.current.startRecording())
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          code: 'KeyK',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    expect(onRecord).toHaveBeenCalledOnce()
  })
})
