import Alpine from 'alpinejs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  KeyStateTracker,
  createHotkeysScope,
  getHotkeyManager,
} from '../src'
import type { Hotkey } from '../src'

const scopes: Array<ReturnType<typeof createHotkeysScope>> = []
function scope(defaults?: Parameters<typeof createHotkeysScope>[0]) {
  const value = createHotkeysScope(defaults)
  scopes.push(value)
  return value
}
const count = () => getHotkeyManager().registrations.state.size
const pressK = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
  )

afterEach(() => {
  scopes.splice(0).forEach((value) => value.destroy())
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

describe('nullish hotkeys', () => {
  it('a reactive hotkey that becomes undefined or null unregisters without stopping Alpine', async () => {
    const hotkeys = scope()
    const state = Alpine.reactive({
      hotkey: 'K' as Hotkey | null | undefined,
      label: 'a',
    })
    const callback = vi.fn()
    hotkeys.createHotkey(() => state.hotkey, callback)
    let label = ''
    const runner = Alpine.effect(() => {
      label = state.label
    })
    expect(count()).toBe(1)

    for (const unset of [undefined, null]) {
      state.hotkey = unset
      await Alpine.nextTick()
      expect(count()).toBe(0)
      pressK()
      expect(callback).not.toHaveBeenCalled()
    }

    // Other effects keep running.
    state.label = 'b'
    await Alpine.nextTick()
    expect(label).toBe('b')

    state.hotkey = 'K'
    await Alpine.nextTick()
    expect(count()).toBe(1)
    pressK()
    expect(callback).toHaveBeenCalledOnce()
    Alpine.release(runner)
  })

  it('the hint is false for no hotkey', () => {
    const hotkeys = scope()
    for (const hotkey of [undefined, null, () => undefined]) {
      expect(hotkeys.createHotkeyHint(hotkey).value).toBe(false)
    }
  })

  it('createHotkeys skips nullish definitions', () => {
    const shortcuts: Array<Hotkey | undefined> = ['A', undefined, 'B']
    scope().createHotkeys(
      shortcuts.map((hotkey) => ({ hotkey, callback: () => {} })),
    )
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
  it('keep their defaults', () => {
    scope().createHotkey('Control+S', () => {}, {
      platform: 'windows',
      preventDefault: undefined,
      stopPropagation: undefined,
    })
    expect(pressCtrlS()).toEqual({
      defaultPrevented: true,
      reachedWindow: false,
    })
  })

  it('createHotkeysScope defaults with undefined keep the core defaults', () => {
    scope({
      hotkey: { preventDefault: undefined, stopPropagation: undefined },
    }).createHotkey('Control+S', () => {}, { platform: 'windows' })
    expect(pressCtrlS()).toEqual({
      defaultPrevented: true,
      reachedWindow: false,
    })
  })
})
