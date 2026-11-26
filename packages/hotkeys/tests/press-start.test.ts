import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

/**
 * An element whose own keydown handler registers a hotkey, as a menu item
 * that opens a dialog does. Not a button, which keeps Enter for itself.
 */
function opener(register: () => void): HTMLElement {
  const element = document.createElement('div')
  element.tabIndex = 0
  document.body.append(element)
  element.addEventListener('keydown', register, { once: true })
  return element
}

describe('a hotkey that goes live during a key event', () => {
  it('does not fire on the event that registered it', () => {
    const manager = HotkeyManager.getInstance()
    // Another hotkey is live, as in any app with a global hotkey.
    manager.register('Mod+K', vi.fn())
    const dialogEnter = vi.fn()
    const element = opener(() => manager.register('Enter', dialogEnter))

    const event = keydown({ key: 'Enter', code: 'Enter', target: element })

    expect(dialogEnter).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    keyup({ key: 'Enter', code: 'Enter', target: element })
    keydown({ key: 'Enter', code: 'Enter', target: document })
    expect(dialogEnter).toHaveBeenCalledOnce()
  })

  it('does not fire on the event when it is the first hotkey registered', () => {
    // happy-dom has no `window.event`, which browsers set during dispatch.
    let current: Event | undefined
    Object.defineProperty(window, 'event', {
      configurable: true,
      get: () => current,
    })
    const manager = HotkeyManager.getInstance()
    const dialogEnter = vi.fn()
    const element = opener(() => manager.register('Enter', dialogEnter))
    element.addEventListener('keydown', (event) => (current = event), {
      capture: true,
    })

    try {
      keydown({ key: 'Enter', code: 'Enter', target: element })
    } finally {
      delete (window as { event?: Event }).event
    }

    expect(dialogEnter).not.toHaveBeenCalled()
  })

  it('does not fire on the event that enabled it', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()
    const handle = manager.register('A', callback, { enabled: false })
    const element = opener(() => handle.setOptions({ enabled: true }))

    keydown({ key: 'a', code: 'KeyA', target: element })

    expect(callback).not.toHaveBeenCalled()
    keydown({ key: 'a', code: 'KeyA', target: document })
    expect(callback).toHaveBeenCalledOnce()
  })

  it('fires on the auto-repeats that follow, like a hotkey registered before the press', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const callback = vi.fn()
    const element = opener(() => manager.register('ArrowDown', callback))

    keydown({ key: 'ArrowDown', code: 'ArrowDown', target: element })
    keydown({
      key: 'ArrowDown',
      code: 'ArrowDown',
      repeat: true,
      target: element,
    })

    expect(callback).toHaveBeenCalledOnce()
  })

  it('does not fire a keyup hotkey for the press that registered it', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const onRelease = vi.fn()
    const element = opener(() =>
      manager.register('Enter', onRelease, { eventType: 'keyup' }),
    )

    keydown({ key: 'Enter', code: 'Enter', target: element })
    keyup({ key: 'Enter', code: 'Enter', target: element })

    expect(onRelease).not.toHaveBeenCalled()
  })

  it('does not start a sequence on the event that registered it', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const callback = vi.fn()
    const element = opener(() => manager.register(['G', 'G'], callback))

    keydown({ key: 'g', code: 'KeyG', target: element })
    keydown({ key: 'g', code: 'KeyG', target: document })

    expect(callback).not.toHaveBeenCalled()
    keydown({ key: 'g', code: 'KeyG', target: document })
    expect(callback).toHaveBeenCalledOnce()
  })

  it('does not start a keyup sequence on the release of the press that registered it', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const callback = vi.fn()
    const element = opener(() =>
      manager.register(['Enter', 'Enter'], callback, { eventType: 'keyup' }),
    )
    const tap = (target: EventTarget) => {
      keydown({ key: 'Enter', code: 'Enter', target })
      keyup({ key: 'Enter', code: 'Enter', target })
    }

    tap(element)
    tap(document)
    expect(callback).not.toHaveBeenCalled()
    tap(document)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('does not fire on a key press that a click inside it registered it from', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const dialogEnter = vi.fn()
    const button = document.createElement('div')
    document.body.append(button)
    button.addEventListener('click', () =>
      manager.register('Enter', dialogEnter),
    )
    const element = opener(() => button.click())

    keydown({ key: 'Enter', code: 'Enter', target: element })
    expect(dialogEnter).not.toHaveBeenCalled()
  })

  it('does not fire hotkeys in a scope that the key press activated', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const dialogEnter = vi.fn()
    manager.register('Enter', dialogEnter, { scope: 'dialog' })
    let release = () => {}
    const element = opener(() => {
      release = manager.activateScope('dialog')
    })

    keydown({ key: 'Enter', code: 'Enter', target: element })
    expect(dialogEnter).not.toHaveBeenCalled()
    keyup({ key: 'Enter', code: 'Enter', target: element })
    keydown({ key: 'Enter', code: 'Enter', target: document })
    expect(dialogEnter).toHaveBeenCalledOnce()
    release()
  })

  it('fires a keyup hotkey that its own keydown enabled from another listener', () => {
    const manager = HotkeyManager.getInstance()
    const onRelease = vi.fn()
    const release = manager.register('Space', onRelease, {
      eventType: 'keyup',
      enabled: false,
    })
    manager.register('Space', () => release.setOptions({ enabled: true }), {
      capture: true,
      conflictBehavior: 'allow',
      stopPropagation: false,
    })

    keydown({ key: ' ', code: 'Space', target: document })
    keyup({ key: ' ', code: 'Space', target: document })
    expect(onRelease).toHaveBeenCalledOnce()
  })

  it('fires a hotkey registered outside any key event on the next press', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    keydown({ key: 'k', code: 'KeyK', ctrlKey: true, target: document })
    const later = vi.fn()
    manager.register('Enter', later)

    keydown({ key: 'Enter', code: 'Enter', target: document })
    expect(later).toHaveBeenCalledOnce()
  })

  it('keeps a keyup sequence from starting on its press release after auto-repeats', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const callback = vi.fn()
    const element = opener(() =>
      manager.register(['Enter', 'Enter'], callback, { eventType: 'keyup' }),
    )
    const tap = () => {
      keydown({ key: 'Enter', code: 'Enter', target: document })
      keyup({ key: 'Enter', code: 'Enter', target: document })
    }

    keydown({ key: 'Enter', code: 'Enter', target: element })
    keydown({ key: 'Enter', code: 'Enter', repeat: true, target: element })
    keyup({ key: 'Enter', code: 'Enter', target: element })
    tap()
    expect(callback).not.toHaveBeenCalled()
    tap()
    expect(callback).toHaveBeenCalledOnce()
  })

  it('does not fire on the press when a window capture hotkey registered it', () => {
    const manager = HotkeyManager.getInstance()
    const dialogEnter = vi.fn()
    manager.register(
      'Enter',
      () =>
        manager.register('Enter', dialogEnter, { conflictBehavior: 'allow' }),
      { target: window, capture: true, stopPropagation: false },
    )

    keydown({ key: 'Enter', code: 'Enter', target: document })
    expect(dialogEnter).not.toHaveBeenCalled()
  })

  it('does not fire on the press that moved it into an active scope', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const dialogEnter = vi.fn()
    const handle = manager.register('Enter', dialogEnter, { scope: 'dialog' })
    const element = opener(() => handle.setOptions({ scope: 'global' }))

    keydown({ key: 'Enter', code: 'Enter', target: element })
    expect(dialogEnter).not.toHaveBeenCalled()
    keyup({ key: 'Enter', code: 'Enter', target: element })
    keydown({ key: 'Enter', code: 'Enter', target: document })
    expect(dialogEnter).toHaveBeenCalledOnce()
  })

  it('fires on the same event object dispatched again after another event', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+K', vi.fn())
    const dialogEnter = vi.fn()
    const element = opener(() => manager.register('Enter', dialogEnter))
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true,
      composed: true,
    })

    element.dispatchEvent(event)
    keyup({ key: 'Enter', code: 'Enter', target: document })
    expect(dialogEnter).not.toHaveBeenCalled()
    document.dispatchEvent(event)
    expect(dialogEnter).toHaveBeenCalledOnce()
  })
})
