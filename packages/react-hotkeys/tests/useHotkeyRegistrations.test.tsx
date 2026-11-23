// @vitest-environment happy-dom

import { HotkeyManager } from '@tanstack/hotkeys'
import { act, cleanup, render, renderHook } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyRegistrations } from '../src/useHotkeyRegistrations'
import { useHotkeyScopesState } from '../src/useHotkeyScopesState'

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
      'parsedChord',
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

  it('reports whether each registration can fire', () => {
    const manager = HotkeyManager.getInstance()
    const handle = manager.register('Mod+S', vi.fn(), { platform: 'mac' })
    manager.register('Escape', vi.fn(), { scope: 'dialog' })
    const { result } = renderHook(() => useHotkeyRegistrations())
    const statuses = () => result.current.map((reg) => reg.status)

    expect(statuses()).toEqual(['active', 'suspended'])

    let release = () => {}
    act(() => {
      release = manager.activateScope('dialog', { exclusive: true })
    })
    expect(statuses()).toEqual(['suspended', 'active'])

    act(() => {
      release()
      handle.setOptions({ enabled: false })
    })
    expect(statuses()).toEqual(['disabled', 'suspended'])
  })
})

describe('useHotkeyScopesState', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('updates when scopes activate and release', () => {
    const manager = HotkeyManager.getInstance()
    const { result } = renderHook(() => useHotkeyScopesState())
    expect(result.current.exclusive).toBeNull()

    let release = () => {}
    act(() => {
      release = manager.activateScope('dialog', { exclusive: true })
    })
    expect(result.current).toMatchObject({
      active: ['dialog'],
      exclusive: 'dialog',
      suspended: ['global'],
    })

    act(() => release())
    expect(result.current.exclusive).toBeNull()
  })
})

describe('useHotkeyRegistrations with inline meta', () => {
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  const inlineMeta = (name: string) => ({
    name,
    ...({
      keywords: ['file', 'write'],
      icon: <svg aria-hidden />,
      run: () => {},
    } as object),
  })

  it('settles when the component that registers also lists', () => {
    let renders = 0
    function SaveButton() {
      if (++renders > 20) throw new Error('did not settle')
      useHotkey('Mod+S', () => {}, { meta: inlineMeta('Save') })
      const registrations = useHotkeyRegistrations()
      return <output>{registrations[0]?.options.meta?.name ?? 'none'}</output>
    }

    const view = render(<SaveButton />)

    expect(view.getByText('Save')).toBeTruthy()
    expect(renders).toBeLessThanOrEqual(3)
  })

  it('settles when a parent lists and a child registers', () => {
    let renders = 0
    function Child() {
      useHotkey('Mod+S', () => {}, { meta: inlineMeta('Save') })
      return null
    }
    function Palette() {
      if (++renders > 20) throw new Error('did not settle')
      const registrations = useHotkeyRegistrations()
      return (
        <>
          <output>{registrations.length} hotkeys</output>
          <Child />
        </>
      )
    }

    const view = render(<Palette />)

    expect(view.getByText('1 hotkeys')).toBeTruthy()
    expect(renders).toBeLessThanOrEqual(3)
  })

  it('shows a meta change that alters content', () => {
    let renders = 0
    function SaveButton({ name }: { name: string }) {
      if (++renders > 20) throw new Error('did not settle')
      useHotkey('Mod+S', () => {}, { meta: inlineMeta(name) })
      const registrations = useHotkeyRegistrations()
      return <output>{registrations[0]?.options.meta?.name ?? 'none'}</output>
    }

    const view = render(<SaveButton name="Save" />)
    view.rerender(<SaveButton name="Save as" />)

    expect(view.getByText('Save as')).toBeTruthy()
  })
})
