// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHotkeyRegistrations } from '../src/useHotkeyRegistrations'

describe('useHotkeyRegistrations', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('returns an empty array when no registrations exist', () => {
    const { result } = renderHook(() => useHotkeyRegistrations())
    expect(result.current).toEqual([])
  })

  it('lists chords and sequences together with kind-specific views', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', vi.fn(), {
      platform: 'mac',
      meta: { name: 'Save', description: 'Save the document' },
    })
    manager.register(['G', 'G'], vi.fn(), { meta: { name: 'Go to top' } })

    const { result } = renderHook(() => useHotkeyRegistrations())

    expect(result.current.map((reg) => [reg.kind, reg.hotkey])).toEqual([
      ['chord', 'Mod+S'],
      ['sequence', ['G', 'G']],
    ])
    expect(result.current[0]!.options.meta).toEqual({
      name: 'Save',
      description: 'Save the document',
    })
    expect(result.current[1]!.options.meta).toEqual({ name: 'Go to top' })
  })

  it('does not expose callbacks', () => {
    HotkeyManager.getInstance().register('Mod+S', vi.fn(), { platform: 'mac' })
    const { result } = renderHook(() => useHotkeyRegistrations())
    const view = result.current[0]!
    expect(view).not.toHaveProperty('callback')
    for (const key of [
      'id',
      'kind',
      'hotkey',
      'options',
      'parsedHotkey',
      'target',
      'triggerCount',
      'hasFired',
    ]) {
      expect(view).toHaveProperty(key)
    }
  })

  it('updates reactively as registrations are added and removed', () => {
    const manager = HotkeyManager.getInstance()
    const { result } = renderHook(() => useHotkeyRegistrations())
    expect(result.current).toHaveLength(0)

    let handle: ReturnType<typeof manager.register> | undefined
    act(() => {
      handle = manager.register(['G', 'G'], vi.fn())
      manager.register('Mod+S', vi.fn(), { platform: 'mac' })
    })
    expect(result.current).toHaveLength(2)

    act(() => handle!.unregister())
    expect(result.current.map((reg) => reg.hotkey)).toEqual(['Mod+S'])
  })

  it('reports sequence progress', () => {
    const manager = HotkeyManager.getInstance()
    manager.register(['G', 'H'], vi.fn())
    const { result } = renderHook(() => useHotkeyRegistrations())
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
      )
    })
    const [view] = result.current
    expect(view?.kind === 'sequence' && view.matchedStepCount).toBe(1)
  })
})
