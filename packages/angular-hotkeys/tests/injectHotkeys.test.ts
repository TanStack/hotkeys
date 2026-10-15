// @vitest-environment happy-dom
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { injectHotkeys } from '../src/injectHotkeys'

describe('injectHotkeys', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
  })

  afterEach(() => {
    TestBed.resetTestingModule()
    HotkeyManager.resetInstance()
  })

  it('should register multiple hotkey handlers', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    TestBed.runInInjectionContext(() => {
      injectHotkeys(
        [
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ],
        { platform: 'mac' },
      )
    })
    TestBed.flushEffects()

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)
  })

  it('should call the correct callback for each hotkey', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    TestBed.runInInjectionContext(() => {
      injectHotkeys(
        [
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ],
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

  it('should unregister all hotkeys on teardown', () => {
    const saveCb = vi.fn()
    const undoCb = vi.fn()

    TestBed.runInInjectionContext(() => {
      injectHotkeys(
        [
          { hotkey: 'Mod+S', callback: saveCb },
          { hotkey: 'Mod+Z', callback: undoCb },
        ],
        { platform: 'mac' },
      )
    })
    TestBed.flushEffects()

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)

    TestBed.resetTestingModule()
    expect(manager.getRegistrationCount()).toBe(0)
  })

  it('should handle an empty array as a no-op', () => {
    TestBed.runInInjectionContext(() => {
      injectHotkeys([], { platform: 'mac' })
    })
    TestBed.flushEffects()

    const manager = HotkeyManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(0)
  })

  it('should merge commonOptions with per-definition options', () => {
    const enabledCb = vi.fn()
    const disabledCb = vi.fn()

    TestBed.runInInjectionContext(() => {
      injectHotkeys(
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
    })
    TestBed.flushEffects()

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
  })
})
