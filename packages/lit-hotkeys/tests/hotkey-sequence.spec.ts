// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SequenceManager } from '@tanstack/hotkeys'
import { HotkeySequenceController } from '../src/controllers/hotkey-sequence'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

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

describe('HotkeySequenceController', () => {
  beforeEach(() => {
    SequenceManager.resetInstance()
  })

  afterEach(() => {
    SequenceManager.resetInstance()
  })

  it('should register a sequence listener on connect', () => {
    const callback = vi.fn()
    const addSpy = vi.spyOn(document, 'addEventListener')

    const host = createMockHost()
    const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
    host.addController(ctrl)
    ctrl.hostConnected()

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function), false)

    ctrl.hostDisconnected()
    addSpy.mockRestore()
  })

  it('should call callback when full sequence is pressed', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 'g' })
    expect(callback).not.toHaveBeenCalled()

    dispatchKeydown(document, { key: 'g' })
    expect(callback).toHaveBeenCalledTimes(1)

    ctrl.hostDisconnected()
  })

  it('should not call callback on partial sequence', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeySequenceController(host, ['D', 'I', 'W'], callback)
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 'd' })
    dispatchKeydown(document, { key: 'i' })

    expect(callback).not.toHaveBeenCalled()

    ctrl.hostDisconnected()
  })

  it('should call callback for a three-key sequence', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeySequenceController(host, ['D', 'I', 'W'], callback)
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 'd' })
    dispatchKeydown(document, { key: 'i' })
    dispatchKeydown(document, { key: 'w' })

    expect(callback).toHaveBeenCalledTimes(1)

    ctrl.hostDisconnected()
  })

  it('should not call callback when wrong key is pressed', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 'g' })
    dispatchKeydown(document, { key: 'x' })

    expect(callback).not.toHaveBeenCalled()

    ctrl.hostDisconnected()
  })

  it('should not fire when enabled is false', () => {
    const callback = vi.fn()

    const host = createMockHost()
    const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback, {
      enabled: false,
    })
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 'g' })
    dispatchKeydown(document, { key: 'g' })

    expect(callback).not.toHaveBeenCalled()

    ctrl.hostDisconnected()
  })

  it('should bind callback with host as this', () => {
    let capturedThis: unknown

    const host = createMockHost()
    const ctrl = new HotkeySequenceController(host, ['G', 'G'], function (
      this: unknown,
    ) {
      capturedThis = this
    })
    host.addController(ctrl)
    ctrl.hostConnected()

    dispatchKeydown(document, { key: 'g' })
    dispatchKeydown(document, { key: 'g' })

    expect(capturedThis).toBe(host)

    ctrl.hostDisconnected()
  })

  describe('target handling', () => {
    it('should skip registration when target is null', () => {
      const callback = vi.fn()
      const addSpy = vi.spyOn(document, 'addEventListener')
      const callsBefore = addSpy.mock.calls.length

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback, {
        target: null,
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
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback, {
        target: targetEl,
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })
      expect(callback).not.toHaveBeenCalled()

      dispatchKeydown(targetEl, { key: 'g' })
      dispatchKeydown(targetEl, { key: 'g' })
      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()
      targetEl.remove()
    })

    it('should default to document when target is not specified', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })

      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()
    })
  })

  describe('lifecycle', () => {
    it('should not fire after disconnect', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })
      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should re-register on reconnect', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
      host.addController(ctrl)

      ctrl.hostConnected()
      ctrl.hostDisconnected()
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })
      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()
    })

    it('should handle multiple connect/disconnect cycles', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
      host.addController(ctrl)

      for (let i = 0; i < 3; i++) {
        ctrl.hostConnected()
        dispatchKeydown(document, { key: 'g' })
        dispatchKeydown(document, { key: 'g' })
        ctrl.hostDisconnected()
      }

      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('should be safe to call hostDisconnected when not connected', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
      host.addController(ctrl)

      expect(() => ctrl.hostDisconnected()).not.toThrow()
    })

    it('should be safe to call hostDisconnected twice', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
      host.addController(ctrl)
      ctrl.hostConnected()

      expect(() => {
        ctrl.hostDisconnected()
        ctrl.hostDisconnected()
      }).not.toThrow()
    })
  })

  describe('sequence timeout', () => {
    it('should reset sequence after timeout', () => {
      vi.useFakeTimers()
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback, {
        timeout: 500,
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })

      vi.advanceTimersByTime(600)

      dispatchKeydown(document, { key: 'g' })

      expect(callback).not.toHaveBeenCalled()

      ctrl.hostDisconnected()
      vi.useRealTimers()
    })

    it('should complete sequence within timeout', () => {
      vi.useFakeTimers()
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback, {
        timeout: 500,
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })

      vi.advanceTimersByTime(400)

      dispatchKeydown(document, { key: 'g' })

      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()
      vi.useRealTimers()
    })
  })

  describe('keyup event type', () => {
    it('should support keyup event type', () => {
      const callback = vi.fn()
      const addSpy = vi.spyOn(document, 'addEventListener')

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback, {
        eventType: 'keyup',
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function), false)

      dispatchKeyup(document, { key: 'g' })
      dispatchKeyup(document, { key: 'g' })
      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()
      addSpy.mockRestore()
    })

    it('should not trigger on keydown when configured for keyup', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback, {
        eventType: 'keyup',
      })
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })

      expect(callback).not.toHaveBeenCalled()

      ctrl.hostDisconnected()
    })
  })

  describe('modifier sequences', () => {
    it('should support sequences with modifier keys', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(
        host,
        ['Control+K', 'Control+S'],
        callback,
        { platform: 'windows' },
      )
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'k', ctrlKey: true })
      dispatchKeydown(document, { key: 's', ctrlKey: true })

      expect(callback).toHaveBeenCalledTimes(1)

      ctrl.hostDisconnected()
    })
  })

  describe('repeated triggers', () => {
    it('should allow the same sequence to be triggered multiple times', () => {
      const callback = vi.fn()

      const host = createMockHost()
      const ctrl = new HotkeySequenceController(host, ['G', 'G'], callback)
      host.addController(ctrl)
      ctrl.hostConnected()

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })
      expect(callback).toHaveBeenCalledTimes(1)

      dispatchKeydown(document, { key: 'g' })
      dispatchKeydown(document, { key: 'g' })
      expect(callback).toHaveBeenCalledTimes(2)

      ctrl.hostDisconnected()
    })
  })
})
