import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'

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
    keydown({ key: 'ArrowDown', code: 'ArrowDown', target: widget() })
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
    keydown({ key: 'Escape', code: 'Escape', target: document.body })
    document.removeEventListener('keydown', close, { capture: true })
    expect(callback).not.toHaveBeenCalled()
    keydown({ key: 'Escape', code: 'Escape', target: document.body })
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
    keydown({ key: 'k', code: 'KeyK', target: element })
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
    keydown({ key: 'g', code: 'KeyG', target: element })
    keydown({ key: 'g', code: 'KeyG', target: element })
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
    keydown({ key: 'Escape', code: 'Escape', target: element })
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
    keydown({ key: 'k', code: 'KeyK', target: element })
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
      keydown({ key: 's', code: 'KeyS', ctrlKey: true, target: document.body })
      document.removeEventListener('keydown', prevent, { capture: true })
      keyup({ key, code, ...init, target: document.body })
      expect(callback).not.toHaveBeenCalled()
      keydown({ key: 's', code: 'KeyS', ctrlKey: true, target: document.body })
      keyup({ key: 's', code: 'KeyS', ctrlKey: true, target: document.body })
      expect(callback).toHaveBeenCalledOnce()
    },
  )

  it('ends a keyup chord press when another listener prevents its release', () => {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('Mod+K', callback, {
      platform: 'windows',
      eventType: 'keyup',
      ignoreDefaultPrevented: true,
    })
    const prevent = (event: KeyboardEvent) => event.preventDefault()
    keydown({ key: 'k', code: 'KeyK', ctrlKey: true, target: document.body })
    document.addEventListener('keyup', prevent, { capture: true })
    keyup({ key: 'k', code: 'KeyK', ctrlKey: true, target: document.body })
    document.removeEventListener('keyup', prevent, { capture: true })
    keyup({ key: 'Control', code: 'ControlLeft', target: document.body })
    expect(callback).not.toHaveBeenCalled()
  })

  it('lets a chord have a key that a skipping sequence would continue', () => {
    const manager = HotkeyManager.getInstance()
    const sequence = vi.fn()
    const chord = vi.fn()
    manager.register(['G', 'K'], sequence, { ignoreDefaultPrevented: true })
    manager.register('K', chord)
    keydown({ key: 'g', code: 'KeyG', target: document.body })
    const prevent = (event: KeyboardEvent) => event.preventDefault()
    document.addEventListener('keydown', prevent, { capture: true })
    keydown({ key: 'k', code: 'KeyK', target: document.body })
    document.removeEventListener('keydown', prevent, { capture: true })
    expect(sequence).not.toHaveBeenCalled()
    expect(chord).toHaveBeenCalledOnce()
  })

  it('keeps a cancelled keyup chord press cancelled after an unrelated prevented release', () => {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('Mod+K', callback, {
      platform: 'windows',
      eventType: 'keyup',
      ignoreDefaultPrevented: true,
    })
    const prevent = (event: KeyboardEvent) => event.preventDefault()
    keydown({ key: 'k', code: 'KeyK', ctrlKey: true, target: document.body })
    keydown({ key: 'x', code: 'KeyX', ctrlKey: true, target: document.body })
    document.addEventListener('keyup', prevent, { capture: true })
    keyup({ key: 'x', code: 'KeyX', ctrlKey: true, target: document.body })
    document.removeEventListener('keyup', prevent, { capture: true })
    keyup({ key: 'k', code: 'KeyK', ctrlKey: true, target: document.body })
    expect(callback).not.toHaveBeenCalled()
  })
})
