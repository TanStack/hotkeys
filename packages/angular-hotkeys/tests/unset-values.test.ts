// @vitest-environment happy-dom
import { provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { injectHotkey } from '../src/injectHotkey'
import { injectHotkeyHint } from '../src/injectHotkeyHint'
import { injectHotkeys } from '../src/injectHotkeys'
import { provideHotkeys } from '../src/hotkeys-provider'
import type { Hotkey } from '@tanstack/hotkeys'

const count = () => getHotkeyManager().registrations.state.size
const pressK = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
  )

describe('nullish hotkeys', () => {
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

  it('a signal hotkey that becomes undefined or null unregisters, and registers again', () => {
    const callback = vi.fn()
    const shortcut = signal<Hotkey | null | undefined>('K')
    TestBed.runInInjectionContext(() =>
      injectHotkey(() => shortcut(), callback),
    )
    TestBed.flushEffects()
    expect(count()).toBe(1)

    for (const unset of [undefined, null]) {
      shortcut.set(unset)
      TestBed.flushEffects()
      expect(count()).toBe(0)
      pressK()
      expect(callback).not.toHaveBeenCalled()
    }

    shortcut.set('K')
    TestBed.flushEffects()
    expect(count()).toBe(1)
    pressK()
    expect(callback).toHaveBeenCalledOnce()
  })

  it('an undefined hotkey registers nothing', () => {
    const shortcut: Hotkey | undefined = undefined
    TestBed.runInInjectionContext(() => injectHotkey(shortcut, () => {}))
    TestBed.flushEffects()
    expect(count()).toBe(0)
  })

  it('the hint is false for no hotkey', () => {
    const hints = TestBed.runInInjectionContext(() => [
      injectHotkeyHint(undefined),
      injectHotkeyHint(null),
      injectHotkeyHint(() => undefined),
    ])
    expect(hints.map((hint) => hint())).toEqual([false, false, false])
  })

  it('injectHotkeys skips nullish definitions', () => {
    const shortcuts: Array<Hotkey | undefined> = ['A', undefined, 'B']
    TestBed.runInInjectionContext(() =>
      injectHotkeys(
        shortcuts.map((hotkey) => ({ hotkey, callback: () => {} })),
      ),
    )
    TestBed.flushEffects()
    expect(count()).toBe(2)
  })
})

/** Presses Ctrl+S on the body and reports what happened to the event. */
function pressCtrlS() {
  let reachedWindow = false
  const listener = () => (reachedWindow = true)
  window.addEventListener('keydown', listener)
  const event = new KeyboardEvent('keydown', {
    key: 's',
    code: 'KeyS',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  })
  document.body.dispatchEvent(event)
  window.removeEventListener('keydown', listener)
  return { defaultPrevented: event.defaultPrevented, reachedWindow }
}

describe('unset options', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
    HotkeyManager.resetInstance()
  })

  function register(providers: Array<unknown> = []) {
    HotkeyManager.resetInstance()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...(providers as [])],
    })
    TestBed.runInInjectionContext(() =>
      injectHotkey('Control+S', () => {}, {
        platform: 'windows',
        preventDefault: undefined,
        stopPropagation: undefined,
      }),
    )
    TestBed.flushEffects()
  }

  it('keep their defaults', () => {
    register()
    expect(pressCtrlS()).toEqual({
      defaultPrevented: true,
      reachedWindow: false,
    })
  })

  it('keep the provider defaults', () => {
    register([
      provideHotkeys({ defaultOptions: { hotkey: { preventDefault: false } } }),
    ])
    expect(pressCtrlS().defaultPrevented).toBe(false)
  })
})
