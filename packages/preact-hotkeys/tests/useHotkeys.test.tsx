// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/preact'
import { HotkeyManager } from '@tanstack/hotkeys'
import { useHotkeys } from '../src/useHotkeys'
import type { UseHotkeyDefinition } from '../src/useHotkeys'

function MultiHotkeyComponent({
  definitions,
  platform = 'mac',
}: {
  definitions: Array<UseHotkeyDefinition>
  platform?: string
}) {
  useHotkeys(definitions, { platform } as any)
  return null
}

describe('useHotkeys', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
    cleanup()
  })

  it('should register multiple hotkey handlers', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    render(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback: saveCb, options: { platform: 'mac' } },
          { hotkey: 'Mod+Z', callback: undoCb, options: { platform: 'mac' } },
        ]}
      />,
    )

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)
  })

  it('should call the correct callback for each hotkey', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    render(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ]}
      />,
    )

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
    expect(saveCb).toHaveBeenCalledTimes(1)
    expect(undoCb).toHaveBeenCalledTimes(1)
  })

  it('should unregister all hotkeys on unmount', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    const { unmount } = render(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ]}
      />,
    )

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)

    unmount()
    expect(manager.getRegistrationCount()).toBe(0)
  })

  it('should handle an empty array as a no-op', () => {
    render(<MultiHotkeyComponent definitions={[]} />)

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(0)
  })

  it('should handle dynamic array changes (add hotkey)', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()
    const escapeCb = vi.fn()

    const { rerender } = render(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ]}
      />,
    )

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)

    rerender(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
          { hotkey: 'Escape', callback: escapeCb },
        ]}
      />,
    )

    expect(manager.getRegistrationCount()).toBe(3)

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    )
    expect(escapeCb).toHaveBeenCalledTimes(1)
  })

  it('should handle dynamic array changes (remove hotkey)', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    const { rerender } = render(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ]}
      />,
    )

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)

    rerender(
      <MultiHotkeyComponent
        definitions={[{ hotkey: 'Mod+S', callback: saveCb }]}
      />,
    )

    expect(manager.getRegistrationCount()).toBe(1)

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(undoCb).not.toHaveBeenCalled()
  })

  it('should merge commonOptions with per-definition options', () => {
    const enabledCb = vi.fn()
    const disabledCb = vi.fn()

    render(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback: enabledCb },
          {
            hotkey: 'Mod+Z',
            callback: disabledCb,
            options: { enabled: false },
          },
        ]}
      />,
    )

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

  it('should move a registration when only the target changes', () => {
    const callback = vi.fn()
    const targetA = document.createElement('div')
    const targetB = document.createElement('div')

    const { rerender } = render(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback, options: { target: targetA } },
        ]}
      />,
    )

    targetA.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(callback).toHaveBeenCalledTimes(1)

    rerender(
      <MultiHotkeyComponent
        definitions={[
          { hotkey: 'Mod+S', callback, options: { target: targetB } },
        ]}
      />,
    )
    expect(HotkeyManager.getInstance().getRegistrationCount()).toBe(1)

    targetA.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(callback).toHaveBeenCalledTimes(1)

    targetB.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )
    expect(callback).toHaveBeenCalledTimes(2)
  })

  describe('stale closure prevention', () => {
    function ClosureComponent({
      count,
      capturedValues,
    }: {
      count: number
      capturedValues: Array<number>
    }) {
      useHotkeys(
        [
          {
            hotkey: 'Mod+S',
            callback: () => {
              capturedValues.push(count)
            },
          },
        ],
        { platform: 'mac' },
      )
      return null
    }

    it('should have access to latest state values in callbacks', () => {
      const capturedValues: Array<number> = []
      const { rerender } = render(
        <ClosureComponent count={0} capturedValues={capturedValues} />,
      )

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0])

      rerender(<ClosureComponent count={5} capturedValues={capturedValues} />)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0, 5])

      rerender(<ClosureComponent count={10} capturedValues={capturedValues} />)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0, 5, 10])
    })

    it('should sync enabled option on every render', () => {
      const callback = vi.fn()

      function EnabledComponent({ enabled }: { enabled: boolean }) {
        useHotkeys([{ hotkey: 'Mod+S', callback, options: { enabled } }], {
          platform: 'mac',
        })
        return null
      }

      const { rerender } = render(<EnabledComponent enabled={true} />)

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      rerender(<EnabledComponent enabled={false} />)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      rerender(<EnabledComponent enabled={true} />)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should preserve registration id when toggling enabled', () => {
      const callback = vi.fn()
      const manager = HotkeyManager.getInstance()

      function EnabledComponent({ enabled }: { enabled: boolean }) {
        useHotkeys([{ hotkey: 'Mod+S', callback, options: { enabled } }], {
          platform: 'mac',
        })
        return null
      }

      const { rerender } = render(<EnabledComponent enabled={true} />)

      const idBefore = [...manager.registrations.state.keys()][0]
      expect(manager.getRegistrationCount()).toBe(1)

      rerender(<EnabledComponent enabled={false} />)
      expect(manager.getRegistrationCount()).toBe(1)
      expect([...manager.registrations.state.keys()][0]).toBe(idBefore)

      rerender(<EnabledComponent enabled={true} />)
      expect([...manager.registrations.state.keys()][0]).toBe(idBefore)
    })
  })
})
