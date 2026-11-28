import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isCharacterKeyShortcut } from '../src/_registration'
import { HotkeyManager, toHotkeyRegistrationView } from '../src/hotkey-manager'
import { parseHotkey } from '../src/parse'
import type { RegisterableHotkey } from '../src/hotkey.types'

const options = { platform: 'windows' as const }

function press(key: string, code: string, init: KeyboardEventInit = {}) {
  keydown({ key, code, target: document.body, ...init })
  keyup({ key, code, target: document.body })
}

function isCharacter(hotkey: string | Array<string>) {
  const steps = parseHotkey(hotkey as RegisterableHotkey, 'windows')
  return isCharacterKeyShortcut(Array.isArray(steps) ? steps : [steps])
}

describe('isCharacterKeyShortcut', () => {
  it('counts keys that type a character, with or without Shift', () => {
    for (const hotkey of ['K', '?', '/', '1', 'Shift+K', 'Shift+/', 'Space']) {
      expect(isCharacter(hotkey), hotkey).toBe(true)
    }
  })

  it('counts physical keys at character positions', () => {
    for (const hotkey of [
      '[NumpadEqual]',
      '[NumpadStar]',
      '[NumpadParenLeft]',

      '[KeyK]',
      '[Digit1]',
      '[Slash]',
      '[IntlBackslash]',
      '[Numpad5]',
      '[Space]',
    ]) {
      expect(isCharacter(hotkey), hotkey).toBe(true)
    }
  })

  it('does not count Control, Alt, or Meta chords', () => {
    for (const hotkey of [
      'Mod+K',
      'Control+K',
      'Alt+K',
      'Meta+K',
      'Alt+[KeyK]',
    ]) {
      expect(isCharacter(hotkey), hotkey).toBe(false)
    }
  })

  it('does not count keys that type nothing', () => {
    for (const hotkey of [
      'Escape',
      'Enter',
      'Tab',
      'ArrowUp',
      'F1',
      'Shift+F10',
      '[Enter]',
      '[NumpadEnter]',
      'MediaPlayPause',
    ]) {
      expect(isCharacter(hotkey), hotkey).toBe(false)
    }
  })

  it('counts a sequence only when every step is a character key', () => {
    expect(isCharacter(['G', 'H'])).toBe(true)
    expect(isCharacter(['Mod+K', 'C'])).toBe(false)
    expect(isCharacter(['G', 'Escape'])).toBe(false)
  })
})

describe('suspendCharacterKeys', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
    vi.restoreAllMocks()
  })

  it('stops character-key hotkeys and keeps the others', () => {
    const manager = HotkeyManager.getInstance()
    const k = vi.fn()
    const save = vi.fn()
    const escape = vi.fn()
    manager.register('K', k, options)
    manager.register('Mod+S', save, options)
    manager.register('Escape', escape, options)

    const release = manager.suspendCharacterKeys()
    press('k', 'KeyK')
    press('s', 'KeyS', { ctrlKey: true })
    press('Escape', 'Escape')
    expect([
      k.mock.calls.length,
      save.mock.calls.length,
      escape.mock.calls.length,
    ]).toEqual([0, 1, 1])

    release()
    press('k', 'KeyK')
    expect(k).toHaveBeenCalledTimes(1)
  })

  it('reports suspended character-key hotkeys as suspended', () => {
    const manager = HotkeyManager.getInstance()
    const handle = manager.register('K', () => {}, options)
    const status = () =>
      toHotkeyRegistrationView(manager.registrations.state.get(handle.id)!)
        .status
    expect(status()).toBe('active')
    expect(manager.hasActiveRegistration('K')).toBe(true)

    const release = manager.suspendCharacterKeys()
    expect(status()).toBe('suspended')
    expect(manager.hasActiveRegistration('K')).toBe(false)
    expect(manager.scopes.state.characterKeysSuspended).toBe(true)

    release()
    expect(status()).toBe('active')
    expect(manager.scopes.state.characterKeysSuspended).toBe(false)
  })

  it('keeps disabled hotkeys disabled', () => {
    const manager = HotkeyManager.getInstance()
    const handle = manager.register('K', () => {}, {
      ...options,
      enabled: false,
    })
    manager.suspendCharacterKeys()
    expect(
      toHotkeyRegistrationView(manager.registrations.state.get(handle.id)!)
        .status,
    ).toBe('disabled')
  })

  it('stays suspended until every suspension is released', () => {
    const manager = HotkeyManager.getInstance()
    const k = vi.fn()
    manager.register('K', k, options)
    const first = manager.suspendCharacterKeys()
    const second = manager.suspendCharacterKeys()
    first()
    // Releasing twice does nothing.
    first()
    press('k', 'KeyK')
    expect(k).not.toHaveBeenCalled()
    second()
    press('k', 'KeyK')
    expect(k).toHaveBeenCalledTimes(1)
  })

  it('stops character-key sequences', () => {
    const manager = HotkeyManager.getInstance()
    const home = vi.fn()
    manager.register(['G', 'H'], home, options)
    manager.suspendCharacterKeys()
    press('g', 'KeyG')
    press('h', 'KeyH')
    expect(home).not.toHaveBeenCalled()
  })

  it('keeps hotkeys on an element, which fire only while it has focus', () => {
    const manager = HotkeyManager.getInstance()
    const element = document.createElement('div')
    element.tabIndex = 0
    document.body.append(element)
    const k = vi.fn()
    manager.register('K', k, { ...options, target: element })
    manager.suspendCharacterKeys()
    element.focus()
    keydown({ key: 'k', code: 'KeyK', target: element })
    keyup({ key: 'k', code: 'KeyK', target: element })
    expect(k).toHaveBeenCalledTimes(1)
    element.remove()
  })

  it('does not fire on the press that resumes character keys', () => {
    const manager = HotkeyManager.getInstance()
    const k = vi.fn()
    manager.register('K', k, options)
    const resume = manager.suspendCharacterKeys()
    const toggle = document.createElement('button')
    document.body.append(toggle)
    // A settings control that turns the shortcuts back on during the press.
    toggle.addEventListener('keydown', () => resume(), { once: true })
    keydown({ key: 'k', code: 'KeyK', target: toggle })
    keyup({ key: 'k', code: 'KeyK', target: toggle })
    expect(k).not.toHaveBeenCalled()
    press('k', 'KeyK')
    expect(k).toHaveBeenCalledTimes(1)
    toggle.remove()
  })

  it('suspends hotkeys on the body, which fire anywhere on the page', () => {
    const manager = HotkeyManager.getInstance()
    const k = vi.fn()
    manager.register('K', k, { ...options, target: document.body })
    manager.suspendCharacterKeys()
    press('k', 'KeyK')
    expect(k).not.toHaveBeenCalled()
  })

  it('notifies registration subscribers when suspension changes', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('K', () => {}, options)
    const listener = vi.fn()
    const { unsubscribe } = manager.registrations.subscribe(listener)
    const release = manager.suspendCharacterKeys()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    release()
    expect(listener).toHaveBeenCalled()
    unsubscribe()
  })
})
