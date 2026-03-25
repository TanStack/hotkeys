// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@solidjs/testing-library'
import { HotkeyManager } from '@tanstack/hotkeys'
import {
  createHotkeys,
  type CreateHotkeyDefinition,
} from '../src/createHotkeys'
import { createSignal, type Component } from 'solid-js'

describe('createHotkeys', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('should register multiple hotkey handlers', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    const TestComponent: Component = () => {
      createHotkeys([
        { hotkey: 'Mod+S', callback: saveCb, options: { platform: 'mac' } },
        { hotkey: 'Mod+Z', callback: undoCb, options: { platform: 'mac' } },
      ])
      return null
    }

    render(() => <TestComponent />)

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)
  })

  it('should call the correct callback for each hotkey', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    const TestComponent: Component = () => {
      createHotkeys(
        [
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ],
        { platform: 'mac' },
      )
      return null
    }

    render(() => <TestComponent />)

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(saveCb).toHaveBeenCalledTimes(1)
    expect(undoCb).not.toHaveBeenCalled()

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(undoCb).toHaveBeenCalledTimes(1)
  })

  it('should unregister all hotkeys on unmount', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    const TestComponent: Component = () => {
      createHotkeys(
        [
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ],
        { platform: 'mac' },
      )
      return null
    }

    const { unmount } = render(() => <TestComponent />)

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)

    unmount()
    expect(manager.getRegistrationCount()).toBe(0)
  })

  it('should handle an empty array as a no-op', () => {
    const TestComponent: Component = () => {
      createHotkeys([])
      return null
    }

    render(() => <TestComponent />)

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(0)
  })

  it('should merge commonOptions with per-definition options', () => {
    const enabledCb = vi.fn()
    const disabledCb = vi.fn()

    const TestComponent: Component = () => {
      createHotkeys(
        [
          { hotkey: 'Mod+S', callback: enabledCb },
          {
            hotkey: 'Mod+Z',
            callback: disabledCb,
            options: { enabled: false },
          },
        ],
        { platform: 'mac' },
      )
      return null
    }

    render(() => <TestComponent />)

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true,
      }),
    )

    expect(enabledCb).toHaveBeenCalledTimes(1)
    expect(disabledCb).not.toHaveBeenCalled()

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)
    const disabledReg = [...manager.registrations.state.values()].find(
      (r) => r.hotkey === 'Mod+Z',
    )
    expect(disabledReg?.options.enabled).toBe(false)
  })

  it('should preserve registration id when toggling enabled', () => {
    const callback = vi.fn()
    const manager = HotkeyManager.getInstance()
    const [enabled, setEnabled] = createSignal(true)

    const TestComponent: Component = () => {
      createHotkeys(() => [
        {
          hotkey: 'Mod+S',
          callback,
          options: { platform: 'mac', enabled: enabled() },
        },
      ])
      return null
    }

    render(() => <TestComponent />)

    const idBefore = [...manager.registrations.state.keys()][0]
    expect(manager.getRegistrationCount()).toBe(1)

    setEnabled(false)
    expect([...manager.registrations.state.keys()][0]).toBe(idBefore)

    setEnabled(true)
    expect([...manager.registrations.state.keys()][0]).toBe(idBefore)
  })

  it('should handle dynamic array changes via accessor', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()
    const escapeCb = vi.fn()

    const TestComponent: Component = () => {
      const [defs, setDefs] = createSignal<Array<CreateHotkeyDefinition>>([
        { hotkey: 'Mod+S', callback: saveCb },
        { hotkey: 'Mod+Z', callback: undoCb },
      ])

      createHotkeys(() => defs(), { platform: 'mac' })

      return (
        <button
          type="button"
          onClick={() =>
            setDefs([
              { hotkey: 'Mod+S', callback: saveCb },
              { hotkey: 'Escape', callback: escapeCb },
            ])
          }
        >
          Update
        </button>
      )
    }

    const { getByRole } = render(() => <TestComponent />)

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)

    getByRole('button').click()

    expect(manager.getRegistrationCount()).toBe(2)

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(undoCb).not.toHaveBeenCalled()

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    expect(escapeCb).toHaveBeenCalledTimes(1)
  })
})
