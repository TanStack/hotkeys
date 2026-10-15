// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '@tanstack/hotkeys'
import { HotkeyController } from '../src/controllers/hotkey'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * Minimal host that satisfies ReactiveControllerHost for testing
 * without pulling in the full LitElement rendering pipeline.
 */
function createMockHost(): ReactiveControllerHost & {
  controllers: Array<ReactiveController>
} {
  const controllers: Array<ReactiveController> = []
  return {
    controllers,
    addController(c) {
      controllers.push(c)
    },
    removeController(c) {
      const idx = controllers.indexOf(c)
      if (idx >= 0) controllers.splice(idx, 1)
    },
    requestUpdate() {},
    get updateComplete() {
      return Promise.resolve(true)
    },
  }
}

function dispatchKeydown(
  target: EventTarget,
  init: KeyboardEventInit,
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { ...init, bubbles: true })
  target.dispatchEvent(event)
  return event
}

function dispatchKeyup(
  target: EventTarget,
  init: KeyboardEventInit,
): KeyboardEvent {
  const event = new KeyboardEvent('keyup', { ...init, bubbles: true })
  target.dispatchEvent(event)
  return event
}

describe('HotkeyController', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('should register a keydown listener on connect', () => {
    const callback = vi.fn()
    const addSpy = vi.spyOn(document, 'addEventListener')

    const host = createMockHost()
    const ctrl = new HotkeyController(host, 'Mod+S', callback, {
      platform: 'mac',
    })
    host.addController(ctrl)
    ctrl.hostConnected()

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    ctrl.hostDisconnected()
    addSpy.mockRestore()
  })

  it('should remove listener on disconnect', () => {
    const callback = vi.fn()
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const host = createMockHost()
    const ctrl = new HotkeyController(host, 'Mod+S', callback, {
      platform: 'mac',
    })
    host.addController(ctrl)
    ctrl.hostConnected()
    ctrl.hostDisconnected()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    removeSpy.mockRestore()
  })

  it('should call callback when hotkey matches', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeyController(host, 'Mod+S', callback, {
      platform: 'mac',
    })
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 's', metaKey: true })

    expect(callback).toHaveBeenCalled()

    ctrl.hostDisconnected()
  })

  it('should not call callback when hotkey does not match', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeyController(host, 'Mod+S', callback, {
      platform: 'mac',
    })
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 'a', metaKey: true })

    expect(callback).not.toHaveBeenCalled()

    ctrl.hostDisconnected()
  })

  it('should use keyup event when specified', () => {
    const callback = vi.fn()
    const addSpy = vi.spyOn(document, 'addEventListener')

    const host = createMockHost()
    const ctrl = new HotkeyController(host, 'Escape', callback, {
      eventType: 'keyup',
    })
    host.addController(ctrl)
    ctrl.hostConnected()

    expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function))

    dispatchKeyup(document, { key: 'Escape' })
    expect(callback).toHaveBeenCalled()

    ctrl.hostDisconnected()
    addSpy.mockRestore()
  })

  it('should not fire when enabled is false', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeyController(host, 'Mod+S', callback, {
      platform: 'mac',
      enabled: false,
    })
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 's', metaKey: true })

    expect(callback).not.toHaveBeenCalled()

    ctrl.hostDisconnected()
  })

  it('should bind callback with host as this', () => {
    let capturedThis: unknown

    const host = createMockHost()
    const ctrl = new HotkeyController(
      host,
      'Mod+S',
      function (this: unknown) {
        capturedThis = this
      },
      { platform: 'mac' },
    )
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 's', metaKey: true })

    expect(capturedThis).toBe(host)

    ctrl.hostDisconnected()
  })

  describe('target handling', () => {
    it('should skip registration when target is null', () => {
      const callback = vi.fn()
      const addSpy = vi.spyOn(document, 'addEventListener')
      const callsBefore = addSpy.mock.calls.length

      const host = createMockHost()
      const ctrl = new HotkeyController(host, 'Mod+S', callback, {
        target: null,
        platform: 'mac',
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      expect(addSpy.mock.calls.length).toBe(callsBefore)

      ctrl.hostDisconnected()
      addSpy.mockRestore()
    })

    it('should register on a specific target element', () => {
      const callback = vi.fn()
      const targetEl = document.createElement('div')
      document.body.appendChild(targetEl)

      const host = createMockHost()
      const ctrl = new HotkeyController(host, 'Mod+S', callback, {
        target: targetEl,
        platform: 'mac',
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 's', metaKey: true })
      expect(callback).not.toHaveBeenCalled()

      dispatchKeydown(targetEl, { key: 's', metaKey: true })
      expect(callback).toHaveBeenCalled()

      ctrl.hostDisconnected()
      targetEl.remove()
    })
  })

  describe('lifecycle', () => {
    it('should not fire after disconnect', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeyController(host, 'Mod+S', callback, {
        platform: 'mac',
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 's', metaKey: true })
      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()

      dispatchKeydown(document, { key: 's', metaKey: true })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should re-register on reconnect', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeyController(host, 'Mod+S', callback, {
        platform: 'mac',
      })
      host.addController(ctrl)

      ctrl.hostConnected()
      ctrl.hostDisconnected()
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 's', metaKey: true })
      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()
    })
  })
})
