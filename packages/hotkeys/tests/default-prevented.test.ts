import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'

function press(
  target: EventTarget,
  key: string,
  code: string,
  init: KeyboardEventInit = {},
  type: 'keydown' | 'keyup' = 'keydown',
) {
  const event = new KeyboardEvent(type, {
    key,
    code,
    bubbles: true,
    cancelable: true,
    ...init,
  })
  target.dispatchEvent(event)
  return event
}

function widget() {
  const element = document.createElement('div')
  element.tabIndex = 0
  document.body.append(element)
  // A widget that handles every key without stopping it.
  element.addEventListener('keydown', (event) => event.preventDefault())
  return element
}

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

describe('ignoreDefaultPrevented', () => {
  it('skips a key that another listener prevented', () => {
    const manager = HotkeyManager.getInstance()
    const skips = vi.fn()
    const fires = vi.fn()
    manager.register('ArrowDown', skips, {
      ignoreDefaultPrevented: true,
      stopPropagation: false,
    })
    manager.register('ArrowDown', fires, { conflictBehavior: 'allow' })
    press(widget(), 'ArrowDown', 'ArrowDown')
    expect(skips).not.toHaveBeenCalled()
    expect(fires).toHaveBeenCalledOnce()
  })

  it('skips a key that a document capture listener prevented', () => {
    // Radix UI and Zag.js close a layer on Escape this way.
    const close = (event: KeyboardEvent) => event.preventDefault()
    document.addEventListener('keydown', close, { capture: true })
    const callback = vi.fn()
    HotkeyManager.getInstance().register('Escape', callback, {
      ignoreDefaultPrevented: true,
    })
    press(document.body, 'Escape', 'Escape')
    document.removeEventListener('keydown', close, { capture: true })
    expect(callback).not.toHaveBeenCalled()
    press(document.body, 'Escape', 'Escape')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('does not skip a key that another hotkey prevented', () => {
    const manager = HotkeyManager.getInstance()
    const element = document.createElement('div')
    element.tabIndex = 0
    document.body.append(element)
    const inner = vi.fn()
    const outer = vi.fn()
    manager.register('K', inner, { target: element, stopPropagation: false })
    manager.register('K', outer, { ignoreDefaultPrevented: true })
    press(element, 'k', 'KeyK')
    expect(inner).toHaveBeenCalledOnce()
    expect(outer).toHaveBeenCalledOnce()
  })

  it('does not advance a sequence on a prevented step', () => {
    const manager = HotkeyManager.getInstance()
    const skips = vi.fn()
    const fires = vi.fn()
    manager.register(['G', 'G'], skips, { ignoreDefaultPrevented: true })
    manager.register(['G', 'G'], fires, { conflictBehavior: 'allow' })
    const element = widget()
    press(element, 'g', 'KeyG')
    press(element, 'g', 'KeyG')
    expect(skips).not.toHaveBeenCalled()
    expect(fires).toHaveBeenCalledOnce()
  })

  it('still skips a key another listener prevented after a hotkey also prevents it', () => {
    const manager = HotkeyManager.getInstance()
    const element = widget()
    const inner = vi.fn()
    const outer = vi.fn()
    manager.register('Escape', inner, {
      target: element,
      stopPropagation: false,
    })
    manager.register('Escape', outer, { ignoreDefaultPrevented: true })
    press(element, 'Escape', 'Escape')
    expect(inner).toHaveBeenCalledOnce()
    expect(outer).not.toHaveBeenCalled()
  })

  it('treats a hotkey callback that prevents the key as a hotkey', () => {
    const manager = HotkeyManager.getInstance()
    const element = document.createElement('div')
    element.tabIndex = 0
    document.body.append(element)
    const outer = vi.fn()
    manager.register('K', (event) => event.preventDefault(), {
      target: element,
      preventDefault: false,
      stopPropagation: false,
    })
    manager.register('K', outer, { ignoreDefaultPrevented: true })
    press(element, 'k', 'KeyK')
    expect(outer).toHaveBeenCalledOnce()
  })

  it.each([
    ['the key', 's', 'KeyS', { ctrlKey: true }],
    ['Control', 'Control', 'ControlLeft', {}],
  ])(
    'skips the release of a keyup chord whose keydown was prevented (%s first)',
    (_, key, code, init) => {
      const prevent = (event: KeyboardEvent) => event.preventDefault()
      document.addEventListener('keydown', prevent, { capture: true })
      const callback = vi.fn()
      HotkeyManager.getInstance().register('Mod+S', callback, {
        platform: 'windows',
        eventType: 'keyup',
        ignoreDefaultPrevented: true,
      })
      press(document.body, 's', 'KeyS', { ctrlKey: true })
      document.removeEventListener('keydown', prevent, { capture: true })
      press(document.body, key, code, init, 'keyup')
      expect(callback).not.toHaveBeenCalled()
      press(document.body, 's', 'KeyS', { ctrlKey: true })
      press(document.body, 's', 'KeyS', { ctrlKey: true }, 'keyup')
      expect(callback).toHaveBeenCalledOnce()
    },
  )
})
