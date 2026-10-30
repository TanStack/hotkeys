// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@solidjs/testing-library'
import { HotkeyManager } from '@tanstack/hotkeys'
import { createSignal, flush } from 'solid-js'
import { createHotkeys } from '../src/createHotkeys'
import type { Component } from 'solid-js'
import type { CreateHotkeyDefinition } from '../src/createHotkeys'

function dispatchKey(key: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

describe('createHotkeys', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('should register multiple sequence handlers', () => {
    const a = vi.fn()
    const b = vi.fn()

    const TestComponent: Component = () => {
      createHotkeys([
        { hotkey: ['G', 'G'], callback: a },
        { hotkey: ['D', 'D'], callback: b },
      ])
      return null
    }

    render(() => <TestComponent />)

    expect(HotkeyManager.getInstance().getRegistrationCount()).toBe(2)
  })

  it('should call the correct callback for each sequence', () => {
    const gg = vi.fn()
    const dd = vi.fn()

    const TestComponent: Component = () => {
      createHotkeys([
        { hotkey: ['G', 'G'], callback: gg },
        { hotkey: ['D', 'D'], callback: dd },
      ])
      return null
    }

    render(() => <TestComponent />)

    dispatchKey('g')
    dispatchKey('g')
    expect(gg).toHaveBeenCalledTimes(1)
    expect(dd).not.toHaveBeenCalled()

    dispatchKey('d')
    dispatchKey('d')
    expect(gg).toHaveBeenCalledTimes(1)
    expect(dd).toHaveBeenCalledTimes(1)
  })

  it('should unregister all sequences on unmount', () => {
    const TestComponent: Component = () => {
      createHotkeys([
        { hotkey: ['G', 'G'], callback: vi.fn() },
        { hotkey: ['D', 'D'], callback: vi.fn() },
      ])
      return null
    }

    const { unmount } = render(() => <TestComponent />)

    expect(HotkeyManager.getInstance().getRegistrationCount()).toBe(2)
    unmount()
    expect(HotkeyManager.getInstance().getRegistrationCount()).toBe(0)
  })

  it('should handle an empty array as a no-op', () => {
    const TestComponent: Component = () => {
      createHotkeys([])
      return null
    }

    render(() => <TestComponent />)
    expect(HotkeyManager.getInstance().getRegistrationCount()).toBe(0)
  })

  it('should skip definitions with an empty sequence', () => {
    const TestComponent: Component = () => {
      createHotkeys([
        { hotkey: [], callback: vi.fn() },
        { hotkey: ['G', 'G'], callback: vi.fn() },
      ])
      return null
    }

    render(() => <TestComponent />)
    expect(HotkeyManager.getInstance().getRegistrationCount()).toBe(1)
  })

  it('should register disabled sequences and keep them in the manager', () => {
    const enabledCb = vi.fn()
    const disabledCb = vi.fn()

    const TestComponent: Component = () => {
      createHotkeys([
        { hotkey: ['G', 'G'], callback: enabledCb },
        {
          hotkey: ['D', 'D'],
          callback: disabledCb,
          options: { enabled: false },
        },
      ])
      return null
    }

    render(() => <TestComponent />)

    dispatchKey('g')
    dispatchKey('g')
    dispatchKey('d')
    dispatchKey('d')
    expect(enabledCb).toHaveBeenCalledTimes(1)
    expect(disabledCb).not.toHaveBeenCalled()

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)
    const disabledView = [...manager.registrations.state.values()].find(
      (r) => r.hotkey[0] === 'D' && r.hotkey[1] === 'D',
    )
    expect(disabledView?.options.enabled).toBe(false)
  })

  it('should preserve registration id when toggling enabled', () => {
    const callback = vi.fn()
    const manager = HotkeyManager.getInstance()
    const [enabled, setEnabled] = createSignal(true)

    const TestComponent: Component = () => {
      createHotkeys(() => [
        { hotkey: ['G', 'G'], callback, options: { enabled: enabled() } },
      ])
      return null
    }

    render(() => <TestComponent />)

    const idBefore = [...manager.registrations.state.keys()][0]
    expect(manager.getRegistrationCount()).toBe(1)

    setEnabled(false)
    flush()
    expect([...manager.registrations.state.keys()][0]).toBe(idBefore)

    setEnabled(true)
    flush()
    expect([...manager.registrations.state.keys()][0]).toBe(idBefore)
  })

  it('should handle dynamic accessor for definitions', () => {
    const gg = vi.fn()
    const yy = vi.fn()
    const [defs, setDefs] = createSignal<Array<CreateHotkeyDefinition>>([
      { hotkey: ['G', 'G'], callback: gg },
    ])

    const TestComponent: Component = () => {
      createHotkeys(() => defs())
      return null
    }

    render(() => <TestComponent />)

    dispatchKey('y')
    dispatchKey('y')
    expect(yy).not.toHaveBeenCalled()

    setDefs([
      { hotkey: ['G', 'G'], callback: gg },
      { hotkey: ['Y', 'Y'], callback: yy },
    ])
    flush()

    dispatchKey('y')
    dispatchKey('y')
    expect(yy).toHaveBeenCalledTimes(1)
  })
})
