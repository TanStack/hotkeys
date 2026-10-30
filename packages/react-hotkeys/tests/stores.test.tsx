import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { useSelector } from '@tanstack/react-store'
import {
  HotkeyManager,
  KeyStateTracker,
  getHotkeyManager,
  getKeyStateTracker,
} from '@tanstack/hotkeys'
import { useHotkeyRegistrations, useKeyHold } from '../src'

function press(type: 'keydown' | 'keyup', key: string) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }))
  })
}

afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

describe('stores', () => {
  it('work with useSelector from @tanstack/react-store', () => {
    const { result } = renderHook(() => ({
      count: useSelector(getHotkeyManager().registrations, (s) => s.size),
      held: useSelector(getKeyStateTracker().store, (s) => s.heldKeys),
    }))
    expect(result.current).toEqual({ count: 0, held: [] })
    act(() => {
      getHotkeyManager().register('Mod+K', () => {})
    })
    press('keydown', 'Shift')
    expect(result.current).toEqual({ count: 1, held: ['Shift'] })
  })

  it('re-render hooks only when the selected value changes', () => {
    let renders = 0
    const { result } = renderHook(() => {
      renders++
      return useKeyHold('Shift')
    })
    expect(renders).toBe(1)
    press('keydown', 'Control')
    press('keyup', 'Control')
    expect(renders).toBe(1)
    press('keydown', 'Shift')
    expect(result.current).toBe(true)
    expect(renders).toBe(2)
  })

  it('keep the same selection between renders until the store changes', () => {
    act(() => {
      getHotkeyManager().register('Mod+K', () => {})
    })
    const { result, rerender } = renderHook(() => useHotkeyRegistrations())
    const first = result.current
    expect(first).toHaveLength(1)
    press('keydown', 'Shift')
    expect(result.current).toBe(first)
    act(() => {
      getHotkeyManager().register('Mod+J', () => {})
    })
    expect(result.current).toHaveLength(2)
    rerender()
    expect(result.current).toHaveLength(2)
  })
})
