// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/preact'
import { useRef } from 'preact/hooks'
import { HotkeyManager } from '@tanstack/hotkeys'
import { useHotkey } from '../src/useHotkey'
import type { HotkeyCallback } from '@tanstack/hotkeys'

function HotkeyTestComponent({
  callback,
  enabled = true,
  eventType = 'keydown',
}: {
  callback: HotkeyCallback
  enabled?: boolean
  eventType?: 'keydown' | 'keyup'
}) {
  useHotkey('Mod+S', callback, { platform: 'mac', enabled, eventType })
  return null
}

describe('useHotkey', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
    cleanup()
  })

  it('should register a hotkey handler', () => {
    const callback = vi.fn()
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    render(<HotkeyTestComponent callback={callback} />)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
  })

  it('should remove handler on unmount', () => {
    const callback = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = render(<HotkeyTestComponent callback={callback} />)
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )

    removeEventListenerSpy.mockRestore()
  })

  it('should call callback when hotkey matches', () => {
    const callback = vi.fn()
    render(<HotkeyTestComponent callback={callback} />)

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      }),
    )

    expect(callback).toHaveBeenCalled()
  })

  it('should not call callback when hotkey does not match', () => {
    const callback = vi.fn()
    render(<HotkeyTestComponent callback={callback} />)

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        bubbles: true,
      }),
    )

    expect(callback).not.toHaveBeenCalled()
  })

  it('should use keyup event when specified', () => {
    const callback = vi.fn()
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    render(
      <HotkeyTestComponent callback={callback} eventType="keyup" enabled={true} />,
    )

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
  })

  describe('stale closure prevention', () => {
    function ClosureComponent({
      count,
      capturedValues,
    }: {
      count: number
      capturedValues: Array<number>
    }) {
      useHotkey(
        'Mod+S',
        () => {
          capturedValues.push(count)
        },
        { platform: 'mac' },
      )
      return null
    }

    it('should have access to latest state values in callback', () => {
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
      const { rerender } = render(
        <HotkeyTestComponent callback={callback} enabled={true} />,
      )

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      rerender(<HotkeyTestComponent callback={callback} enabled={false} />)
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      rerender(<HotkeyTestComponent callback={callback} enabled={true} />)
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
    function RefTargetComponent({ callback }: { callback: HotkeyCallback }) {
      const ref = useRef<HTMLDivElement | null>(null)
      useHotkey('Mod+S', callback, { target: ref, platform: 'mac' })
      return null
    }

    it('should wait for ref to be attached', () => {
      const callback = vi.fn()
      render(<RefTargetComponent callback={callback} />)

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
