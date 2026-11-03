// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { HotkeyController } from '../src/controllers/hotkey'
import { HotkeyHintController } from '../src/controllers/hotkey-hint'
import type { Hotkey } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

function createHost(): ReactiveControllerHost {
  const controllers: Array<ReactiveController> = []
  return {
    addController: (controller) => controllers.push(controller),
    removeController: () => {},
    requestUpdate() {},
    updateComplete: Promise.resolve(true),
  }
}

const count = () => getHotkeyManager().registrations.state.size
const pressK = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
  )

describe('nullish hotkeys', () => {
  beforeEach(() => HotkeyManager.resetInstance())
  afterEach(() => HotkeyManager.resetInstance())

  it('a getter that returns undefined registers nothing, then registers once it returns a hotkey', () => {
    const callback = vi.fn()
    let shortcut: Hotkey | null | undefined = undefined
    const controller = new HotkeyController(
      createHost(),
      () => shortcut,
      callback,
    )
    expect(() => controller.hostConnected()).not.toThrow()
    expect(count()).toBe(0)

    shortcut = 'K'
    controller.hostUpdated()
    expect(count()).toBe(1)

    shortcut = null
    controller.hostUpdated()
    expect(count()).toBe(0)
    pressK()
    expect(callback).not.toHaveBeenCalled()

    shortcut = 'K'
    controller.hostUpdated()
    pressK()
    expect(callback).toHaveBeenCalledOnce()
    controller.hostDisconnected()
  })

  it('the hint is false for no hotkey', () => {
    for (const hotkey of [undefined, null, () => undefined]) {
      const hint = new HotkeyHintController(createHost(), hotkey)
      hint.hostConnected()
      expect(hint.value).toBe(false)
      hint.hostDisconnected()
    }
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
  beforeEach(() => HotkeyManager.resetInstance())
  afterEach(() => HotkeyManager.resetInstance())

  it('keep their defaults', () => {
    const props: { preventDefault?: boolean; stopPropagation?: boolean } = {}
    const controller = new HotkeyController(
      createHost(),
      'Control+S',
      () => {},
      () => ({
        platform: 'windows',
        preventDefault: props.preventDefault,
        stopPropagation: props.stopPropagation,
      }),
    )
    controller.hostConnected()
    expect(pressCtrlS()).toEqual({
      defaultPrevented: true,
      reachedWindow: false,
    })
    controller.hostDisconnected()
  })
})
