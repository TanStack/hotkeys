// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  KeyStateTracker,
  getKeyStateTracker,
} from '@tanstack/hotkeys'
import { KeyHoldController } from '../src/controllers/key-hold'
import type { IndividualKey } from '@tanstack/hotkeys'

function createHost() {
  return {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  }
}

function press(key: string, code: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, code }))
}

describe('KeyHoldController', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  it('follows a getter key after the next host update, with no key event', () => {
    const host = createHost()
    let key: IndividualKey = 'Shift'
    const hold = new KeyHoldController(host, () => key)
    hold.hostConnected()

    press('Shift', 'ShiftLeft')
    expect(hold.value).toBe(true)

    key = 'Control'
    hold.hostUpdate()
    expect(hold.value).toBe(false)

    key = 'Shift'
    hold.hostUpdate()
    expect(hold.value).toBe(true)
    hold.hostDisconnected()
  })

  it('reads a key that is already held when it connects', () => {
    getKeyStateTracker()
    press('Shift', 'ShiftLeft')
    const host = createHost()
    const hold = new KeyHoldController(host, 'Shift')
    hold.hostConnected()
    expect(hold.value).toBe(true)
    hold.hostDisconnected()
  })
})
