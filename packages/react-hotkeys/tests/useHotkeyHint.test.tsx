// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import {
  HotkeyManager,
  KeyStateTracker,
  SequenceManager,
} from '@tanstack/hotkeys'
import { useHotkey, useHotkeyHint, useHotkeySequence } from '../src'

function key(
  type: string,
  key: string,
  code: string,
  flags: KeyboardEventInit = {},
) {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent(type, { key, code, bubbles: true, ...flags }),
    )
  })
}
afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  KeyStateTracker.resetInstance()
})
it('selects hint visibility without rerendering on unrelated keys and clears on blur', () => {
  const renders = vi.fn()
  const { result, rerender } = renderHook(
    ({ binding }) => {
      renders()
      return useHotkeyHint(binding, { platform: 'mac' })
    },
    {
      initialProps: {
        binding:
          'Alt+Shift+[KeyS]' as const as import('@tanstack/hotkeys').Hotkey,
      },
    },
  )
  expect(result.current).toBe(false)
  key('keydown', 'Alt', 'AltLeft', { altKey: true })
  expect(result.current).toBe(true)
  const count = renders.mock.calls.length
  key('keydown', 'x', 'KeyX', { altKey: true })
  expect(renders).toHaveBeenCalledTimes(count)
  rerender({ binding: 'Control+[KeyS]' })
  expect(result.current).toBe(false)
  rerender({ binding: 'Alt+Shift+[KeyS]' })
  expect(result.current).toBe(true)
  act(() => {
    window.dispatchEvent(new Event('blur'))
  })
  expect(result.current).toBe(false)
})
it('preserves raw code bindings through hook normalization and sequence registration', () => {
  const single = vi.fn(),
    sequence = vi.fn()
  const { unmount } = renderHook(() => {
    useHotkey({ code: 'KeyQ', shift: true }, single)
    useHotkeySequence(['Shift+[KeyQ]', '[NumpadEnter]'], sequence)
  })
  key('keydown', 'A', 'KeyQ', { shiftKey: true })
  key('keyup', 'a', 'KeyQ')
  key('keydown', 'Enter', 'NumpadEnter')
  expect(single).toHaveBeenCalledOnce()
  expect(sequence).toHaveBeenCalledOnce()
  unmount()
  expect(HotkeyManager.getInstance().registrations.state.size).toBe(0)
  expect(SequenceManager.getInstance().registrations.state.size).toBe(0)
})
it('moves an unchanged binding to a new target after commit', () => {
  const a = document.createElement('div'),
    b = document.createElement('div'),
    callback = vi.fn()
  document.body.append(a, b)
  const { rerender, unmount } = renderHook(
    ({ target }) => useHotkey('[KeyQ]', callback, { target }),
    { initialProps: { target: a } },
  )
  rerender({ target: b })
  act(() => {
    a.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true }),
    )
  })
  expect(callback).not.toHaveBeenCalled()
  act(() => {
    b.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true }),
    )
  })
  expect(callback).toHaveBeenCalledOnce()
  unmount()
  a.remove()
  b.remove()
})
