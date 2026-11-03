// @vitest-environment happy-dom
import {
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import { renderHook, render, act, fireEvent } from '@testing-library/react'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeys } from '../src/useHotkeys'
import type {
  Hotkey,
  HotkeyCallbackContext,
  HotkeyChordCallbackContext,
  HotkeySequenceCallbackContext,
} from '@tanstack/hotkeys'
import React, { useState, useRef } from 'react'

describe('useHotkey', () => {
  // Reset the HotkeyManager singleton between tests
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('should register a hotkey handler', () => {
    const callback = vi.fn()
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    renderHook(() => useHotkey('Mod+S', callback, { platform: 'mac' }))

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false,
    )

    addEventListenerSpy.mockRestore()
  })

  it('should remove handler on unmount', () => {
    const callback = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useHotkey('Mod+S', callback, { platform: 'mac' }),
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      false,
    )

    removeEventListenerSpy.mockRestore()
  })

  it('should call callback when hotkey matches', () => {
    const callback = vi.fn()

    renderHook(() => useHotkey('Mod+S', callback, { platform: 'mac' }))

    // Simulate keydown event
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(callback).toHaveBeenCalled()
  })

  it('should not call callback when hotkey does not match', () => {
    const callback = vi.fn()

    renderHook(() => useHotkey('Mod+S', callback, { platform: 'mac' }))

    // Simulate different keydown event
    const event = new KeyboardEvent('keydown', {
      key: 'a',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should use keyup event when specified', () => {
    const callback = vi.fn()
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    renderHook(() => useHotkey('Escape', callback, { eventType: 'keyup' }))

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
      false,
    )

    addEventListenerSpy.mockRestore()
  })

  describe('stale closure prevention', () => {
    it('should have access to latest state values in callback', () => {
      // This tests that the callback is synced on every render to avoid stale closures
      const capturedValues: Array<number> = []

      const { result, rerender } = renderHook(() => {
        const [count, setCount] = useState(0)

        useHotkey(
          'Mod+S',
          () => {
            capturedValues.push(count)
          },
          { platform: 'mac' },
        )

        return { count, setCount }
      })

      // Trigger hotkey - should capture count = 0
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0])

      // Update state
      act(() => {
        result.current.setCount(5)
      })

      // Rerender to sync the callback
      rerender()

      // Trigger hotkey again - should capture count = 5 (not stale 0)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0, 5])

      // Update state again
      act(() => {
        result.current.setCount(10)
      })

      rerender()

      // Trigger again - should capture count = 10
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

      const { rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useHotkey('Mod+S', callback, { platform: 'mac', enabled }),
        { initialProps: { enabled: true } },
      )

      // Should fire when enabled
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      // Disable the hotkey
      rerender({ enabled: false })

      // Should not fire when disabled
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1) // unchanged

      // Re-enable
      rerender({ enabled: true })

      // Should fire again
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

      const { rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) =>
          useHotkey('Mod+S', callback, { platform: 'mac', enabled }),
        { initialProps: { enabled: true } },
      )

      const idBefore = [...manager.registrations.state.keys()][0]
      expect(manager.getRegistrationCount()).toBe(1)
      expect(idBefore).toBeDefined()

      rerender({ enabled: false })
      expect(manager.getRegistrationCount()).toBe(1)
      expect([...manager.registrations.state.keys()][0]).toBe(idBefore)
      expect(manager.registrations.state.get(idBefore!)?.options.enabled).toBe(
        false,
      )

      rerender({ enabled: true })
      expect([...manager.registrations.state.keys()][0]).toBe(idBefore)
      expect(
        manager.registrations.state.get(idBefore!)?.options.enabled,
      ).not.toBe(false)
    })
  })

  describe('target handling', () => {
    it('should wait for ref to be attached', () => {
      const callback = vi.fn()

      renderHook(() => {
        const ref = useRef<HTMLDivElement | null>(null)
        useHotkey('Mod+S', callback, { target: ref, platform: 'mac' })
        return ref
      })

      // Trigger on document - should not fire (target is ref, not document)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )

      // Callback should not have been called (ref.current is null)
      expect(callback).not.toHaveBeenCalled()
    })

    it('follows an element that a child mounts with a callback ref', () => {
      const callback = vi.fn()

      function Panel({
        panelRef,
      }: {
        panelRef: (el: HTMLDivElement | null) => void
      }) {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen(!open)}>toggle</button>
            {open && <div data-testid="panel" ref={panelRef} />}
          </>
        )
      }

      function Owner() {
        const [panel, setPanel] = useState<HTMLDivElement | null>(null)
        useHotkey('K', callback, { target: panel })
        return <Panel panelRef={setPanel} />
      }

      const { getByText, getByTestId } = render(<Owner />)
      const registrations = () => getHotkeyManager().registrations.state.size
      const pressK = () => {
        fireEvent.keyDown(getByTestId('panel'), { key: 'k' })
        fireEvent.keyUp(getByTestId('panel'), { key: 'k' })
      }
      expect(registrations()).toBe(0)

      fireEvent.click(getByText('toggle'))
      expect(registrations()).toBe(1)
      pressK()
      expect(callback).toHaveBeenCalledTimes(1)

      fireEvent.click(getByText('toggle'))
      expect(registrations()).toBe(0)

      // A new node replaces the removed one.
      fireEvent.click(getByText('toggle'))
      expect(registrations()).toBe(1)
      pressK()
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  // https://github.com/TanStack/hotkeys/issues/116
  it('does not run a chord for the key that completes a sequence', () => {
    const chord = vi.fn()
    const sequence = vi.fn()
    renderHook(() => {
      useHotkey('C', chord)
      useHotkey(['G', 'C'], sequence)
    })

    for (const key of ['g', 'c']) {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true }),
      )
      document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
    }
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()
  })
})

describe('callback context types', () => {
  it('narrows the context to the kind of hotkey passed to useHotkey', () => {
    const loadHotkey = (): Hotkey => 'G'
    renderHook(() => {
      useHotkey('Mod+S', (_event, context) => {
        expectTypeOf(context).toEqualTypeOf<HotkeyChordCallbackContext>()
      })
      useHotkey({ key: 'S', mod: true }, (_event, { parsedChord }) => {
        expectTypeOf(parsedChord.modifiers).toBeArray()
      })
      useHotkey(['G', 'H'], (_event, context) => {
        expectTypeOf(context).toEqualTypeOf<HotkeySequenceCallbackContext>()
      })
      useHotkey(['Escape'], (_event, context) => {
        expectTypeOf(context).toEqualTypeOf<HotkeyChordCallbackContext>()
      })
      useHotkey(
        [{ key: 'K', mod: true }, 'C'],
        (_event, context) => {
          expectTypeOf(context).toEqualTypeOf<HotkeySequenceCallbackContext>()
        },
        { timeout: 500 },
      )
      useHotkey(loadHotkey(), (_event, context) => {
        expectTypeOf(context).toEqualTypeOf<HotkeyCallbackContext>()
      })
      useHotkeys([
        {
          hotkey: 'Mod+S',
          callback: (_event, context) => {
            expectTypeOf(context).toEqualTypeOf<HotkeyCallbackContext>()
          },
        },
      ])
    })
  })
})

describe('sequence steps written as objects', () => {
  it('registers object steps in normalized form', () => {
    const callback = vi.fn()
    renderHook(() =>
      useHotkey([{ key: 'K', mod: true }, 'C'], callback, { platform: 'mac' }),
    )
    const [registration] =
      HotkeyManager.getInstance().registrations.state.values()
    expect(registration).toMatchObject({
      kind: 'sequence',
      hotkey: ['Mod+K', 'C'],
    })
    for (const init of [{ key: 'k', metaKey: true }, { key: 'c' }]) {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { ...init, bubbles: true }),
      )
    }
    expect(callback).toHaveBeenCalledOnce()
  })
})
