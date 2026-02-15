// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@solidjs/testing-library'
import { HotkeyManager } from '@tanstack/hotkeys'
import { createHotkey } from '../src/createHotkey'
import { createSignal, type Component } from 'solid-js'

describe('createHotkey', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('should register a hotkey handler', () => {
    const callback = vi.fn()
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    const TestComponent: Component = () => {
      createHotkey('Mod+S', callback, { platform: 'mac' })
      return null
    }

    render(() => <TestComponent />)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
  })

  it('should remove handler on unmount', () => {
    const callback = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const TestComponent: Component = () => {
      createHotkey('Mod+S', callback, { platform: 'mac' })
      return null
    }

    const { unmount } = render(() => <TestComponent />)
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )

    removeEventListenerSpy.mockRestore()
  })

  it('should call callback when hotkey matches', () => {
    const callback = vi.fn()

    const TestComponent: Component = () => {
      createHotkey('Mod+S', callback, { platform: 'mac' })
      return null
    }

    render(() => <TestComponent />)

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

    const TestComponent: Component = () => {
      createHotkey('Mod+S', callback, { platform: 'mac' })
      return null
    }

    render(() => <TestComponent />)

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

    const TestComponent: Component = () => {
      createHotkey('Escape', callback, { eventType: 'keyup' })
      return null
    }

    render(() => <TestComponent />)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
  })

  describe('stale closure prevention', () => {
    it('should have access to latest state values in callback', () => {
      const capturedValues: Array<number> = []

      const TestComponent: Component = () => {
        const [count, setCount] = createSignal(0)

        createHotkey(
          'Mod+S',
          () => {
            capturedValues.push(count())
          },
          { platform: 'mac' },
        )

        return (
          <button type="button" onClick={() => setCount((c) => c + 5)}>
            {count()}
          </button>
        )
      }

      const { getByRole } = render(() => <TestComponent />)

      // Trigger hotkey - should capture count = 0
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0])

      // Update state via button click (triggers re-run)
      getByRole('button').click()

      // Trigger hotkey again - count is now 5, callback uses count() for latest
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0, 5])

      getByRole('button').click()

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0, 5, 10])
    })

    it('should sync enabled option when accessor changes', () => {
      const callback = vi.fn()

      const TestComponent: Component = () => {
        const [enabled, setEnabled] = createSignal(true)
        createHotkey('Mod+S', callback, () => ({
          platform: 'mac' as const,
          enabled: enabled(),
        }))
        return (
          <button type="button" onClick={() => setEnabled((e) => !e)}>
            Toggle
          </button>
        )
      }

      const { getByRole } = render(() => <TestComponent />)

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
      getByRole('button').click()

      // Should not fire when disabled
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      // Re-enable
      getByRole('button').click()

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  describe('target handling', () => {
    it('should wait for target signal to be attached', () => {
      const callback = vi.fn()

      const TestComponent: Component = () => {
        const [target, setTarget] = createSignal<HTMLElement | null>(null)
        createHotkey('Mod+S', callback, () => ({
          target: target(),
          platform: 'mac',
        }))
        return <div ref={setTarget} data-testid="target" />
      }

      render(() => <TestComponent />)

      // Target starts as null (before ref callback runs) - but ref runs synchronously
      // when the div is mounted. So target might be set. Let me use Show to delay
      // rendering the element with the ref.

      const TestComponentDelayed: Component = () => {
        const [mounted, setMounted] = createSignal(false)
        const [target, setTarget] = createSignal<HTMLElement | null>(null)
        createHotkey('Mod+S', callback, () => ({
          target: target(),
          platform: 'mac',
        }))
        return (
          <div>
            <button
              type="button"
              onClick={() => setMounted(true)}
              data-testid="mount-btn"
            >
              Mount
            </button>
            {mounted() && <div ref={setTarget} data-testid="target" />}
          </div>
        )
      }

      const { getByTestId } = render(() => <TestComponentDelayed />)

      // Before clicking Mount, target is null - hotkey should not be registered
      // (or registered on nothing). Dispatch on document - callback should not fire
      // because we never registered (we skipped when target was null)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).not.toHaveBeenCalled()

      // Mount the target div
      getByTestId('mount-btn').click()

      // Now target is set. Dispatch on the target element for the hotkey to fire
      const targetEl = getByTestId('target')
      const event = new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      })
      targetEl.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })
  })
})
