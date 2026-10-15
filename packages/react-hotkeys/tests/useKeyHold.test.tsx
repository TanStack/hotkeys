import { afterEach, expect, it } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { KeyStateTracker } from '@tanstack/hotkeys'
import { useKeyHold } from '../src'

/** Marks a test event as real user input; the tracker ignores synthetic events for recovery. */
function trusted<T extends Event>(event: T): T {
  Object.defineProperty(event, 'isTrusted', { value: true })
  return event
}

afterEach(() => {
  cleanup()
  KeyStateTracker.resetInstance()
})

it.each(['keyboard', 'mouse'])(
  'updates after a missed modifier keyup when the next %s event reports its release',
  (input) => {
    const { result } = renderHook(() => useKeyHold('Shift'))
    act(() => {
      document.dispatchEvent(
        trusted(
          new KeyboardEvent('keydown', {
            key: 'Shift',
            code: 'ShiftLeft',
            shiftKey: true,
            bubbles: true,
          }),
        ),
      )
    })
    expect(result.current).toBe(true)

    // Simulate a missing release with no blur, followed by ordinary input.
    act(() => {
      document.dispatchEvent(
        trusted(
          input === 'keyboard'
            ? new KeyboardEvent('keydown', {
                key: 'a',
                code: 'KeyA',
                bubbles: true,
              })
            : new MouseEvent('mousemove', { bubbles: true }),
        ),
      )
    })
    expect(result.current).toBe(false)
  },
)
