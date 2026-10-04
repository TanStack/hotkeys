import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import { SequenceManager } from '../src/sequence-manager'
import { HotkeyRecorder } from '../src/hotkey-recorder'
import { KeyStateTracker } from '../src/key-state-tracker'
import type { HotkeyOptions } from '../src/hotkey-manager'

const recorders: Array<HotkeyRecorder> = []
afterEach(() => {
  recorders.splice(0).forEach((recorder) => recorder.destroy())
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  KeyStateTracker.resetInstance()
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

function press(target: EventTarget, type = 'keydown', key = 's') {
  const event = new KeyboardEvent(type, {
    key,
    code: `Key${key.toUpperCase()}`,
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  })
  // Vitest exposes a window proxy; Happy DOM's currentTarget is the underlying window.
  const currentTarget = Object.getOwnPropertyDescriptor(
    Event.prototype,
    'currentTarget',
  )!.get!
  Object.defineProperty(event, 'currentTarget', {
    get() {
      const current = currentTarget.call(event)
      return current?.document === document ? window : current
    },
  })
  target.dispatchEvent(event)
  return event
}

function widget() {
  const parent = document.createElement('div')
  const child = document.createElement('button')
  parent.append(child)
  document.body.append(parent)
  return { parent, child }
}

for (const kind of ['hotkey', 'sequence'] as const) {
  describe(`${kind} capture`, () => {
    const manager = () =>
      kind === 'hotkey'
        ? HotkeyManager.getInstance()
        : SequenceManager.getInstance()
    const register = (callback: () => void, options: HotkeyOptions = {}) =>
      kind === 'hotkey'
        ? HotkeyManager.getInstance().register('Control+S', callback, options)
        : SequenceManager.getInstance().register(
            ['Control+S'],
            callback,
            options,
          )

    it.each(['keydown', 'keyup'] as const)(
      'intercepts a widget during %s while the default bubbles',
      (eventType) => {
        const { child } = widget()
        const consumed = vi.fn((event: Event) => event.stopPropagation())
        child.addEventListener(eventType, consumed)
        const bubble = vi.fn()
        register(bubble, { eventType })
        press(child, eventType)
        expect(consumed).toHaveBeenCalledOnce()
        expect(bubble).not.toHaveBeenCalled()
        const capture = vi.fn()
        register(capture, {
          capture: true,
          eventType,
          conflictBehavior: 'allow',
        })
        const event = press(child, eventType)
        expect(capture).toHaveBeenCalledOnce()
        expect(consumed).toHaveBeenCalledOnce()
        expect(bubble).not.toHaveBeenCalled()
        expect(event.defaultPrevented).toBe(true)
      },
    )

    it.each(['element', 'document', 'window'] as const)(
      'keeps phases independent on %s targets',
      (targetKind) => {
        const { parent, child } = widget()
        const target =
          targetKind === 'element'
            ? parent
            : targetKind === 'document'
              ? document
              : window
        const calls: Array<string> = []
        register(() => calls.push('bubble'), { target, stopPropagation: false })
        register(() => calls.push('capture'), {
          target,
          capture: true,
          stopPropagation: false,
          preventDefault: false,
          conflictBehavior: 'allow',
        })
        child.addEventListener('keydown', () => calls.push('widget'))
        press(child)
        expect(calls).toEqual(['capture', 'widget', 'bubble'])
      },
    )

    it('updates phases without replacing the registration or processing an event twice', () => {
      const { child } = widget()
      const bubble = register(vi.fn(), { stopPropagation: false })
      const callback = vi.fn(() => handle.setOptions({ capture: false }))
      const handle = register(callback, {
        capture: true,
        stopPropagation: false,
        conflictBehavior: 'allow',
      })
      const id = handle.id
      press(child)
      expect(callback).toHaveBeenCalledOnce()
      expect(manager().registrations.state.get(id)?.triggerCount).toBe(1)
      press(child)
      expect(callback).toHaveBeenCalledTimes(2)
      handle.setOptions({ capture: true })
      bubble.unregister()
      press(child)
      expect(callback).toHaveBeenCalledTimes(3)
      expect(handle.id).toBe(id)
      expect(handle.isActive).toBe(true)
    })

    it('skips a sibling moved out of the active phase by a callback', () => {
      const { child } = widget()
      register(() => sibling.setOptions({ capture: false }), {
        capture: true,
        stopPropagation: false,
      })
      const callback = vi.fn()
      const sibling = register(callback, {
        capture: true,
        stopPropagation: false,
        conflictBehavior: 'allow',
      })
      press(child)
      expect(callback).not.toHaveBeenCalled()
      press(child)
      expect(callback).toHaveBeenCalledOnce()
    })

    it('shares listeners and removes only the empty phase', () => {
      const add = vi.spyOn(document, 'addEventListener')
      const remove = vi.spyOn(document, 'removeEventListener')
      const one = register(vi.fn(), { capture: true })
      const two = register(vi.fn(), {
        capture: true,
        conflictBehavior: 'allow',
      })
      const bubble = vi.fn()
      register(bubble, { conflictBehavior: 'allow' })
      expect(
        add.mock.calls.filter(([type]) => type === 'keydown'),
      ).toHaveLength(2)
      one.unregister()
      expect(remove).not.toHaveBeenCalled()
      two.unregister()
      expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function), true)
      press(document)
      expect(bubble).toHaveBeenCalledOnce()
      manager().destroy()
      expect(remove).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
        false,
      )
      press(document)
      expect(bubble).toHaveBeenCalledOnce()
    })

    it('retains conflict policy across phases', () => {
      const first = register(vi.fn())
      expect(() =>
        register(vi.fn(), { capture: true, conflictBehavior: 'error' }),
      ).toThrow('already registered')
      register(vi.fn(), { capture: true, conflictBehavior: 'replace' })
      expect(first.isActive).toBe(false)
      expect(manager().getRegistrationCount()).toBe(1)
    })

    it('respects enabled, input filtering, and preventDefault', () => {
      const input = document.createElement('input')
      document.body.append(input)
      const callback = vi.fn()
      const handle = register(callback, {
        capture: true,
        enabled: false,
        ignoreInputs: true,
        preventDefault: false,
      })
      press(input)
      handle.setOptions({ enabled: true })
      press(input)
      expect(callback).not.toHaveBeenCalled()
      handle.setOptions({ ignoreInputs: false })
      expect(press(input).defaultPrevented).toBe(false)
      expect(callback).toHaveBeenCalledOnce()
    })

    for (const targetKind of ['document', 'window'] as const) {
      it.each([true, false])(
        `suppresses recording and the recorded release on ${targetKind}, recorder first: %s`,
        (recorderFirst) => {
          const { child } = widget()
          const recorder = new HotkeyRecorder({ onRecord: vi.fn() })
          recorders.push(recorder)
          if (recorderFirst) recorder.start()
          const down = vi.fn()
          const up = vi.fn()
          const target = targetKind === 'window' ? window : document
          register(down, { capture: true, target })
          register(up, {
            capture: true,
            target,
            eventType: 'keyup',
            conflictBehavior: 'allow',
          })
          if (!recorderFirst) recorder.start()
          press(child)
          press(child, 'keyup')
          expect(down).not.toHaveBeenCalled()
          expect(up).not.toHaveBeenCalled()
          press(child)
          press(child, 'keyup')
          expect(down).toHaveBeenCalledOnce()
          expect(up).toHaveBeenCalledOnce()
        },
      )
    }
  })
}

it('preserves requireReset through phase changes inside callbacks', () => {
  const { child } = widget()
  const callback = vi.fn(() => handle.setOptions({ capture: false }))
  const handle = HotkeyManager.getInstance().register('Control+S', callback, {
    capture: true,
    requireReset: true,
    stopPropagation: false,
  })
  press(child)
  press(child)
  expect(callback).toHaveBeenCalledOnce()
  press(child, 'keyup')
  press(child)
  expect(callback).toHaveBeenCalledTimes(2)
})

it('preserves sequence progress when the phase changes', () => {
  const { child } = widget()
  const callback = vi.fn()
  const manager = SequenceManager.getInstance()
  const handle = manager.register(['Control+S', 'Control+G'], callback, {
    capture: true,
  })
  press(child)
  expect(manager.registrations.state.get(handle.id)?.matchedStepCount).toBe(1)
  handle.setOptions({ capture: false })
  press(child, 'keydown', 'g')
  expect(callback).toHaveBeenCalledOnce()
  expect(manager.registrations.state.get(handle.id)?.triggerCount).toBe(1)
})

it('does not suppress key state tracking on the same capture target', () => {
  const { child } = widget()
  HotkeyManager.getInstance().register('Control+S', vi.fn(), { capture: true })
  const tracker = KeyStateTracker.getInstance()
  press(child)
  expect(tracker.isKeyHeld('S')).toBe(true)
  press(child, 'keyup')
  expect(tracker.isKeyHeld('S')).toBe(false)
})

it.each(['hotkey', 'sequence'] as const)(
  'scores %s matches within each phase',
  (kind) => {
    const exact = vi.fn()
    const fallback = vi.fn()
    const options = { stopPropagation: false, platform: 'windows' as const }
    if (kind === 'hotkey') {
      HotkeyManager.getInstance().register('Control+ф' as never, exact, {
        ...options,
        capture: true,
      })
      HotkeyManager.getInstance().register('Control+A', fallback, options)
    } else {
      SequenceManager.getInstance().register(['Control+ф' as never], exact, {
        ...options,
        capture: true,
      })
      SequenceManager.getInstance().register(['Control+A'], fallback, options)
    }
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ф',
        code: 'KeyA',
        ctrlKey: true,
        bubbles: true,
      }),
    )
    expect(exact).toHaveBeenCalledOnce()
    expect(fallback).toHaveBeenCalledOnce()
  },
)

it('only consumes the final step of a capture sequence', () => {
  const { child } = widget()
  const widgetHandler = vi.fn()
  child.addEventListener('keydown', widgetHandler)
  const callback = vi.fn()
  SequenceManager.getInstance().register(['Control+S', 'Control+G'], callback, {
    capture: true,
  })
  expect(press(child).defaultPrevented).toBe(false)
  expect(widgetHandler).toHaveBeenCalledOnce()
  expect(press(child, 'keydown', 'g').defaultPrevented).toBe(true)
  expect(widgetHandler).toHaveBeenCalledOnce()
  expect(callback).toHaveBeenCalledOnce()
})

it('allows dispatching the same event object again', () => {
  const callback = vi.fn()
  HotkeyManager.getInstance().register('Control+S', callback, {
    stopPropagation: false,
  })
  const event = press(document)
  document.dispatchEvent(event)
  expect(callback).toHaveBeenCalledTimes(2)
})
