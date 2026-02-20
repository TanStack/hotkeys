// @vitest-environment happy-dom
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { injectHotkey } from '../src/injectHotkey'

describe('injectHotkey', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    })
  })

  afterEach(() => {
    TestBed.resetTestingModule()
    HotkeyManager.resetInstance()
  })

  it('should register a hotkey handler', () => {
    const callback = vi.fn()
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    TestBed.runInInjectionContext(() => {
      injectHotkey('Mod+S', callback, { platform: 'mac' })
    })
    TestBed.flushEffects()

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
  })

  it('should remove handler on unmount', () => {
    const callback = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    TestBed.runInInjectionContext(() => {
      injectHotkey('Mod+S', callback, { platform: 'mac' })
    })
    TestBed.flushEffects()

    TestBed.resetTestingModule()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    )

    removeEventListenerSpy.mockRestore()
  })

  it('should call callback when hotkey matches', () => {
    const callback = vi.fn()

    TestBed.runInInjectionContext(() => {
      injectHotkey('Mod+S', callback, { platform: 'mac' })
    })
    TestBed.flushEffects()

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

    TestBed.runInInjectionContext(() => {
      injectHotkey('Mod+S', callback, { platform: 'mac' })
    })
    TestBed.flushEffects()

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

    TestBed.runInInjectionContext(() => {
      injectHotkey('Escape', callback, { eventType: 'keyup' })
    })
    TestBed.flushEffects()

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
  })

  describe('stale closure prevention', () => {
    it('should have access to latest state values in callback', () => {
      const capturedValues: Array<number> = []
      const count = signal(0)

      TestBed.runInInjectionContext(() => {
        injectHotkey(
          'Mod+S',
          () => {
            capturedValues.push(count())
          },
          { platform: 'mac' },
        )
      })
      TestBed.flushEffects()

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0])

      count.update((c) => c + 5)
      TestBed.flushEffects()

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(capturedValues).toEqual([0, 5])

      count.update((c) => c + 5)
      TestBed.flushEffects()

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
      const enabled = signal(true)

      TestBed.runInInjectionContext(() => {
        injectHotkey('Mod+S', callback, () => ({
          platform: 'mac',
          enabled: enabled(),
        }))
      })
      TestBed.flushEffects()

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      enabled.set(false)
      TestBed.flushEffects()

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      enabled.set(true)
      TestBed.flushEffects()

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
      const target = signal<HTMLElement | null>(null)

      TestBed.runInInjectionContext(() => {
        injectHotkey('Mod+S', callback, () => ({
          target: target(),
          platform: 'mac',
        }))
      })
      TestBed.flushEffects()

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )
      expect(callback).not.toHaveBeenCalled()

      const targetEl = document.createElement('div')
      document.body.appendChild(targetEl)
      target.set(targetEl)
      TestBed.flushEffects()

      targetEl.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          metaKey: true,
          bubbles: true,
        }),
      )

      expect(callback).toHaveBeenCalled()

      targetEl.remove()
    })
  })
})
