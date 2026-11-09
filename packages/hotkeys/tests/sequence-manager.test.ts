import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, toHotkeyRegistrationView } from '../src/hotkey-manager'
import { createSequenceMatcher } from '../src/match'
import type { HotkeySequenceRegistrationView } from '../src/hotkey-manager'
import type { HotkeySequenceOptions as SequenceOptions } from '../src/hotkey-manager'
import type { HotkeyChord, HotkeySequence } from '../src/hotkey.types'

/** Reads a sequence registration's public view, including match progress. */
function sequenceView(id: string): HotkeySequenceRegistrationView {
  const registration = HotkeyManager.getInstance().registrations.state.get(id)
  return toHotkeyRegistrationView(
    registration!,
  ) as HotkeySequenceRegistrationView
}

/**
 * Helper to create and dispatch a KeyboardEvent
 */
function dispatchKey(
  key: string,
  options: { eventType?: 'keydown' | 'keyup' } = {},
): KeyboardEvent {
  const eventType = options.eventType ?? 'keydown'
  const event = new KeyboardEvent(eventType, { key, bubbles: true })
  document.dispatchEvent(event)
  return event
}

/**
 * Helper to dispatch a keyboard event from a specific element.
 * Focuses the element first to set document.activeElement, then dispatches
 * on the element so listeners attached to it receive the event.
 */
function dispatchKeyFromElement(
  element: HTMLElement,
  key: string,
  options: {
    eventType?: 'keydown' | 'keyup'
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
  } = {},
): KeyboardEvent {
  // Focus the element so document.activeElement is set
  element.focus()

  const eventType = options.eventType ?? 'keydown'
  const event = new KeyboardEvent(eventType, {
    key,
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    bubbles: true,
  })
  element.dispatchEvent(event)
  return event
}

describe('HotkeyManager', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    vi.useFakeTimers()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
    vi.useRealTimers()
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = HotkeyManager.getInstance()
      const instance2 = HotkeyManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('sequence registration', () => {
    it('should register a sequence', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      expect(manager.getRegistrationCount()).toBe(1)
    })

    it('should unregister a sequence', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const handle = manager.register(['G', 'G'], callback)
      expect(manager.getRegistrationCount()).toBe(1)

      handle.unregister()
      expect(manager.getRegistrationCount()).toBe(0)
    })

    it('should keep registration when disabled and skip callback until re-enabled', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const handle = manager.register(['G', 'G'], callback, { enabled: false })

      expect(manager.getRegistrationCount()).toBe(1)
      expect(
        [...manager.registrations.state.values()][0]?.options.enabled,
      ).toBe(false)

      dispatchKey('g')
      dispatchKey('g')
      expect(callback).not.toHaveBeenCalled()

      handle.setOptions({ enabled: true })
      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should return handle with callback and setOptions', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const handle = manager.register(['G', 'G'], callback1)

      expect(handle.id).toBeDefined()
      expect(handle.isActive).toBe(true)

      handle.callback = callback2
      dispatchKey('g')
      dispatchKey('g')
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(callback1).not.toHaveBeenCalled()

      handle.setOptions({ timeout: 2000 })
      handle.unregister()
      expect(handle.isActive).toBe(false)
    })

    it('should register nothing for an empty sequence', () => {
      const manager = HotkeyManager.getInstance()
      const handle = manager.register([], vi.fn())
      expect(handle.isActive).toBe(false)
      expect(manager.registrations.state.size).toBe(0)
    })
  })

  describe('sequence matching', () => {
    it('should trigger callback when sequence is completed', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      dispatchKey('g')
      expect(callback).not.toHaveBeenCalled()

      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should expose partial match progress on the registrations store', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()
      const handle = manager.register(['G', 'G'], callback)
      const id = handle.id

      dispatchKey('g')
      expect(callback).not.toHaveBeenCalled()
      expect(sequenceView(id).matchedStepCount).toBe(1)
      expect(sequenceView(id).partialMatchLastKeyTime).toBeGreaterThan(0)

      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)
      expect(sequenceView(id).matchedStepCount).toBe(0)
    })

    it('should increment triggerCount on the registrations store when a sequence completes', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()
      const handle = manager.register(['G', 'G'], callback)
      const id = handle.id

      expect(manager.registrations.state.get(id)?.triggerCount).toBe(0)

      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)
      expect(manager.registrations.state.get(id)?.triggerCount).toBe(1)

      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(2)
      expect(manager.registrations.state.get(id)?.triggerCount).toBe(2)
    })

    it('should pass context to callback', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['D', 'D'], callback)

      dispatchKey('d')
      dispatchKey('d')

      expect(callback).toHaveBeenCalledWith(
        expect.any(KeyboardEvent),
        expect.objectContaining({
          hotkey: ['D', 'D'],
        }),
      )
    })

    it('should reset on wrong key', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      dispatchKey('g')
      dispatchKey('x') // Wrong key
      dispatchKey('g') // Start over
      expect(callback).not.toHaveBeenCalled()

      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should restart sequence if first key of sequence is pressed', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)

      // Press g g again
      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  describe('timeout', () => {
    it('should reset sequence after timeout', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback, { timeout: 500 })

      dispatchKey('g')
      vi.advanceTimersByTime(600) // Exceed timeout
      dispatchKey('g')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should complete sequence within timeout', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback, { timeout: 500 })

      dispatchKey('g')
      vi.advanceTimersByTime(400) // Within timeout
      dispatchKey('g')

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('ignoreInputs option', () => {
    it('should ignore single-key sequences in input elements by default', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      const input = document.createElement('input')
      document.body.appendChild(input)

      dispatchKeyFromElement(input, 'g')
      dispatchKeyFromElement(input, 'g')

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should ignore single-key sequences in textarea elements by default', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      dispatchKeyFromElement(textarea, 'g')
      dispatchKeyFromElement(textarea, 'g')

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('should ignore single-key sequences in a shadow-dom textarea by default', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      const host = document.createElement('div')
      const shadowRoot = host.attachShadow({ mode: 'open' })
      const textarea = document.createElement('textarea')
      shadowRoot.appendChild(textarea)
      document.body.appendChild(host)

      textarea.focus()
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'g',
          bubbles: true,
          composed: true,
        }),
      )
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'g',
          bubbles: true,
          composed: true,
        }),
      )

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(host)
    })

    it('should ignore single-key sequences in contenteditable elements by default', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      const div = document.createElement('div')
      div.contentEditable = 'true'
      document.body.appendChild(div)

      dispatchKeyFromElement(div, 'g')
      dispatchKeyFromElement(div, 'g')

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('should fire sequences starting with Mod key in inputs by default', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['Mod+K', 'S'], callback, { platform: 'mac' })

      const input = document.createElement('input')
      document.body.appendChild(input)

      dispatchKeyFromElement(input, 'k', { metaKey: true })
      dispatchKeyFromElement(input, 's')

      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('should respect explicit ignoreInputs: true even for Mod sequences', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['Mod+K', 'S'], callback, {
        platform: 'mac',
        ignoreInputs: true,
      })

      const input = document.createElement('input')
      document.body.appendChild(input)

      dispatchKeyFromElement(input, 'k', { metaKey: true })
      dispatchKeyFromElement(input, 's')

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should respect explicit ignoreInputs: false for single-key sequences', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback, { ignoreInputs: false })

      const input = document.createElement('input')
      document.body.appendChild(input)

      dispatchKeyFromElement(input, 'g')
      dispatchKeyFromElement(input, 'g')

      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('should fire single-key sequences outside of input elements', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      // dispatch from a non-input element
      dispatchKey('g')
      dispatchKey('g')

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should not ignore button-type inputs', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      const button = document.createElement('input')
      button.type = 'button'
      document.body.appendChild(button)

      dispatchKeyFromElement(button, 'g')
      dispatchKeyFromElement(button, 'g')

      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(button)
    })

    it('should fire sequence when target is the input element itself', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const input = document.createElement('input')
      document.body.appendChild(input)

      manager.register(['G', 'G'], callback, { target: input })

      dispatchKeyFromElement(input, 'g')
      dispatchKeyFromElement(input, 'g')

      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('should ignore sequences when activeElement is an input but event.target is different (React Aria pattern)', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)

      const input = document.createElement('input')
      input.type = 'text'
      const listItem = document.createElement('li')
      document.body.appendChild(input)
      document.body.appendChild(listItem)

      input.focus()

      for (let i = 0; i < 2; i++) {
        const event = new KeyboardEvent('keydown', {
          key: 'g',
          bubbles: true,
        })
        Object.defineProperty(event, 'target', {
          value: listItem,
          writable: false,
          configurable: true,
        })
        Object.defineProperty(event, 'currentTarget', {
          value: document,
          writable: false,
          configurable: true,
        })
        document.dispatchEvent(event)
      }

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(input)
      document.body.removeChild(listItem)
    })

    it('should fire Mod sequences when activeElement is an input but event.target is different (React Aria pattern)', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['Mod+K', 'S'], callback, { platform: 'mac' })

      const input = document.createElement('input')
      input.type = 'text'
      const listItem = document.createElement('li')
      document.body.appendChild(input)
      document.body.appendChild(listItem)

      input.focus()

      const event1 = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      })
      Object.defineProperty(event1, 'target', {
        value: listItem,
        writable: false,
        configurable: true,
      })
      Object.defineProperty(event1, 'currentTarget', {
        value: document,
        writable: false,
        configurable: true,
      })
      document.dispatchEvent(event1)

      const event2 = new KeyboardEvent('keydown', {
        key: 's',
        bubbles: true,
      })
      Object.defineProperty(event2, 'target', {
        value: listItem,
        writable: false,
        configurable: true,
      })
      Object.defineProperty(event2, 'currentTarget', {
        value: document,
        writable: false,
        configurable: true,
      })
      document.dispatchEvent(event2)

      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
      document.body.removeChild(listItem)
    })

    it('should ignore sequences when listener target is inside an iframe and focus is in an input there', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()
      const iframe = document.createElement('iframe')
      document.body.appendChild(iframe)
      const idoc = iframe.contentDocument
      expect(idoc).toBeTruthy()
      if (!idoc) {
        document.body.removeChild(iframe)
        return
      }

      const container = idoc.createElement('div')
      const input = idoc.createElement('input')
      input.type = 'text'
      container.appendChild(input)
      idoc.body.appendChild(container)

      const handle = manager.register(['G', 'G'], callback, {
        target: container,
      })

      input.focus()
      for (let i = 0; i < 2; i++) {
        const event = new KeyboardEvent('keydown', { key: 'g', bubbles: true })
        Object.defineProperty(event, 'currentTarget', {
          value: container,
          writable: false,
          configurable: true,
        })
        container.dispatchEvent(event)
      }

      expect(callback).not.toHaveBeenCalled()

      handle.unregister()
      document.body.removeChild(iframe)
    })
  })

  describe('target option', () => {
    it('should fire sequence only for events inside target element', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const div = document.createElement('div')
      document.body.appendChild(div)

      manager.register(['G', 'G'], callback, { target: div })

      dispatchKeyFromElement(div, 'g')
      dispatchKeyFromElement(div, 'g')

      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(div)
    })

    it('should not fire sequence for events outside target element', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const divA = document.createElement('div')
      const divB = document.createElement('div')
      document.body.appendChild(divA)
      document.body.appendChild(divB)

      manager.register(['G', 'G'], callback, { target: divA })

      dispatchKeyFromElement(divB, 'g')
      dispatchKeyFromElement(divB, 'g')

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(divA)
      document.body.removeChild(divB)
    })
  })

  describe('eventType option', () => {
    it('should support eventType keyup sequences', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback, { eventType: 'keyup' })

      dispatchKey('g', { eventType: 'keydown' })
      dispatchKey('g', { eventType: 'keyup' })
      expect(callback).not.toHaveBeenCalled()

      dispatchKey('g', { eventType: 'keydown' })
      dispatchKey('g', { eventType: 'keyup' })
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('conflictBehavior option', () => {
    it('should warn by default when same sequence is registered twice', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      manager.register(['G', 'G'], callback1)
      manager.register(['G', 'G'], callback2)

      dispatchKey('g')
      dispatchKey('g')

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(warnSpy).toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('should throw with conflictBehavior error', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['G', 'G'], callback)
      expect(() =>
        manager.register(['G', 'G'], callback, { conflictBehavior: 'error' }),
      ).toThrow(/already registered/)

      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should replace with conflictBehavior replace', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.register(['G', 'G'], callback1, { conflictBehavior: 'replace' })
      manager.register(['G', 'G'], callback2, { conflictBehavior: 'replace' })

      dispatchKey('g')
      dispatchKey('g')

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledTimes(1)
    })

    it('should allow multiple with conflictBehavior allow', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      manager.register(['G', 'G'], callback1, { conflictBehavior: 'allow' })
      manager.register(['G', 'G'], callback2, { conflictBehavior: 'allow' })

      dispatchKey('g')
      dispatchKey('g')

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })

  describe('SequenceOptions type', () => {
    it('should not include requireReset (compile-time check)', () => {
      // requireReset is excluded from SequenceOptions - this should type-error if someone adds it back
      const options: SequenceOptions = {
        timeout: 500,
        // @ts-expect-error - requireReset is not in SequenceOptions
        requireReset: true,
      }
      expect(options.timeout).toBe(500)
    })
  })

  describe('longer sequences', () => {
    it('should match three-key sequences', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['D', 'I', 'W'], callback)

      dispatchKey('d')
      dispatchKey('i')
      expect(callback).not.toHaveBeenCalled()

      dispatchKey('w')
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('modifier key handling', () => {
    it('should not reset sequence when modifier key is pressed between steps', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['Z', 'Shift+C'], callback)

      dispatchKey('z')
      // Pressing Shift before Shift+C should not reset the sequence
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }),
      )
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'c',
          shiftKey: true,
          bubbles: true,
        }),
      )

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should reset sequence when a wrong non-modifier key is pressed between steps', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register(['Z', 'Shift+C'], callback)

      dispatchKey('z')
      dispatchKey('x') // Wrong key resets the sequence
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'c',
          shiftKey: true,
          bubbles: true,
        }),
      )

      expect(callback).not.toHaveBeenCalled()
    })
  })
})

describe('createSequenceMatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should match sequence', () => {
    const matcher = createSequenceMatcher(['G', 'G'])

    const event1 = new KeyboardEvent('keydown', { key: 'g' })
    expect(matcher.match(event1)).toBe(false)
    expect(matcher.getProgress()).toBe(1)

    const event2 = new KeyboardEvent('keydown', { key: 'g' })
    expect(matcher.match(event2)).toBe(true)
    expect(matcher.getProgress()).toBe(0) // Reset after match
  })

  it('should reset on wrong key', () => {
    const matcher = createSequenceMatcher(['G', 'G'])

    matcher.match(new KeyboardEvent('keydown', { key: 'g' }))
    expect(matcher.getProgress()).toBe(1)

    matcher.match(new KeyboardEvent('keydown', { key: 'x' }))
    expect(matcher.getProgress()).toBe(0)
  })

  it('should reset manually', () => {
    const matcher = createSequenceMatcher(['G', 'G'])

    matcher.match(new KeyboardEvent('keydown', { key: 'g' }))
    expect(matcher.getProgress()).toBe(1)

    matcher.reset()
    expect(matcher.getProgress()).toBe(0)
  })

  it('should respect timeout', () => {
    const matcher = createSequenceMatcher(['G', 'G'], { timeout: 500 })

    matcher.match(new KeyboardEvent('keydown', { key: 'g' }))
    vi.advanceTimersByTime(600)

    expect(matcher.match(new KeyboardEvent('keydown', { key: 'g' }))).toBe(
      false,
    )
    expect(matcher.getProgress()).toBe(1) // Started new sequence
  })
})

describe('HotkeyManager meta option', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    vi.useFakeTimers()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
    vi.useRealTimers()
  })

  it('should store meta in registration view options', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()

    manager.register(['G', 'G'], callback, {
      meta: { name: 'Go to top', description: 'Scroll to the top of the page' },
    })

    const view = Array.from(manager.registrations.state.values())[0]!
    expect(view.options.meta).toEqual({
      name: 'Go to top',
      description: 'Scroll to the top of the page',
    })
  })

  it('should allow registering sequences without meta', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()

    manager.register(['D', 'D'], callback)

    const view = Array.from(manager.registrations.state.values())[0]!
    expect(view.options.meta).toBeUndefined()
  })
})

describe('HotkeyManager hasFired', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    vi.useFakeTimers()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
    vi.useRealTimers()
  })

  it('should start with hasFired as false', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()

    manager.register(['G', 'G'], callback)

    const view = Array.from(manager.registrations.state.values())[0]!
    expect(view.hasFired).toBe(false)
  })

  it('should set hasFired to true after sequence triggers', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()

    manager.register(['G', 'G'], callback)

    dispatchKey('g')
    dispatchKey('g')

    expect(callback).toHaveBeenCalledTimes(1)

    const view = Array.from(manager.registrations.state.values())[0]!
    expect(view.hasFired).toBe(true)
  })

  it('should expose hasFired in the SequenceRegistrationView', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()

    manager.register(['D', 'D'], callback)

    // Before trigger
    let view = Array.from(manager.registrations.state.values())[0]!
    expect(view).toHaveProperty('hasFired')
    expect(view.hasFired).toBe(false)

    // Trigger sequence
    dispatchKey('d')
    dispatchKey('d')

    // After trigger
    view = Array.from(manager.registrations.state.values())[0]!
    expect(view.hasFired).toBe(true)
    expect(view.triggerCount).toBe(1)
  })
})

// A Russian layout types й in the Q position. It matches Й exactly and Q
// through the position fallback, so both candidates compete.
const RUSSIAN_Q = 'Й' as HotkeyChord

describe('sequence matching regressions', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
    vi.useRealTimers()
  })

  describe('sequence match priority', () => {
    it.each([false, true])(
      'prefers exact output regardless of registration order (%s)',
      (reverse) => {
        const manager = HotkeyManager.getInstance()
        const exact = vi.fn()
        const fallback = vi.fn()
        const registrations: Array<[HotkeySequence, typeof exact]> = [
          [['G', RUSSIAN_Q], exact],
          [['G', 'Q'], fallback],
        ]
        for (const [sequence, callback] of reverse
          ? registrations.reverse()
          : registrations)
          manager.register(sequence, callback)
        keydown({ key: 'g', code: 'KeyG', target: document })
        keydown({ key: 'й', code: 'KeyQ', target: document })
        expect(exact).toHaveBeenCalledOnce()
        expect(fallback).not.toHaveBeenCalled()
        // A losing match must not leave progress that can fire on the next key.
        keydown({ key: 'q', code: 'KeyQ', target: document })
        expect(fallback).not.toHaveBeenCalled()
      },
    )

    it('prefers physical matches over logical fallbacks on an intermediate step', () => {
      const manager = HotkeyManager.getInstance()
      const exact = vi.fn()
      const fallback = vi.fn()
      manager.register(['G', '[KeyQ]', 'X'], exact)
      manager.register(['G', 'Q', 'X'], fallback)
      keydown({ key: 'g', code: 'KeyG', target: document })
      keydown({ key: 'й', code: 'KeyQ', target: document })
      keydown({ key: 'x', code: 'KeyX', target: document })
      expect(exact).toHaveBeenCalledOnce()
      expect(fallback).not.toHaveBeenCalled()
    })

    it('keeps equally strong matches and permits fallback when no exact match is eligible', () => {
      const manager = HotkeyManager.getInstance()
      const logical = vi.fn()
      const physical = vi.fn()
      const disabled = vi.fn()
      manager.register(['G', 'Q'], logical)
      manager.register(['G', '[KeyQ]'], physical)
      manager.register(['G', '/'], disabled, { enabled: false })
      keydown({ key: 'g', code: 'KeyG', target: document })
      keydown({ key: 'q', code: 'KeyQ', target: document })
      expect(logical).toHaveBeenCalledOnce()
      expect(physical).toHaveBeenCalledOnce()
      HotkeyManager.resetInstance()
      const nextManager = HotkeyManager.getInstance()
      nextManager.register(['G', 'Q'], logical)
      nextManager.register(['G', RUSSIAN_Q], disabled, {
        enabled: false,
      })
      keydown({ key: 'g', code: 'KeyG', target: document })
      // Russian layout: Q's position types й
      keydown({ key: 'й', code: 'KeyQ', target: document })
      expect(logical).toHaveBeenCalledTimes(2)
      expect(disabled).not.toHaveBeenCalled()
    })
  })

  describe.each(['key', 'code'] as const)(
    'sequence event filtering (%s)',
    (mode) => {
      const g = mode === 'key' ? 'G' : '[KeyG]'
      const c = mode === 'key' ? 'Shift+C' : 'Shift+[KeyC]'

      it.each(['modifier', 'composition'] as const)(
        'standalone matcher ignores %s events without losing progress',
        (kind) => {
          const matcher = createSequenceMatcher([g, c])
          matcher.match(keydown({ key: 'g', code: 'KeyG' }))
          const ignored =
            kind === 'modifier'
              ? keydown({ key: 'Shift', code: 'ShiftLeft', shiftKey: true })
              : keydown({ key: 'Process', code: 'KeyA', isComposing: true })
          expect(matcher.match(ignored)).toBe(false)
          expect(matcher.getProgress()).toBe(1)
          expect(
            matcher.match(keydown({ key: 'C', code: 'KeyC', shiftKey: true })),
          ).toBe(true)
        },
      )

      // Chrome on Linux Wayland reports Ctrl+` as key Unidentified (#229)
      it('treats an Unidentified key as a key press, not composition', () => {
        const step = mode === 'key' ? 'Control+`' : 'Control+[Backquote]'
        const matcher = createSequenceMatcher([g, step], { platform: 'linux' })
        const unidentified = () =>
          keydown({ key: 'Unidentified', code: 'Backquote', ctrlKey: true })
        matcher.match(keydown({ key: 'g', code: 'KeyG' }))
        expect(matcher.match(unidentified())).toBe(true)

        // Without a usable code it tells us nothing, so progress is kept
        matcher.match(keydown({ key: 'g', code: 'KeyG' }))
        expect(matcher.match(keydown({ key: 'Unidentified', code: '' }))).toBe(
          false,
        )
        expect(
          matcher.match(keydown({ key: 'Unidentified', code: 'Unidentified' })),
        ).toBe(false)
        // A modifier key is never a step
        expect(
          matcher.match(
            keydown({
              key: 'Unidentified',
              code: 'ControlLeft',
              ctrlKey: true,
            }),
          ),
        ).toBe(false)
        expect(matcher.getProgress()).toBe(1)

        // On another key it resets progress, like any wrong key
        matcher.match(
          keydown({ key: 'Unidentified', code: 'Minus', ctrlKey: true }),
        )
        expect(matcher.getProgress()).toBe(0)
      })

      it('keeps manager progress across an Unidentified modifier key', () => {
        const step = mode === 'key' ? 'Control+C' : 'Control+[KeyC]'
        const callback = vi.fn()
        HotkeyManager.getInstance().register([g, step], callback, {
          platform: 'linux',
        })
        keydown({ key: 'g', code: 'KeyG', target: document })
        keydown({
          key: 'Unidentified',
          code: 'ControlLeft',
          ctrlKey: true,
          target: document,
        })
        keydown({ key: 'c', code: 'KeyC', ctrlKey: true, target: document })
        expect(callback).toHaveBeenCalledOnce()
      })

      it('ignoring events does not extend the standalone timeout', () => {
        vi.useFakeTimers()
        const matcher = createSequenceMatcher([g, c], { timeout: 100 })
        matcher.match(keydown({ key: 'g', code: 'KeyG' }))
        vi.advanceTimersByTime(90)
        matcher.match(
          keydown({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }),
        )
        vi.advanceTimersByTime(20)
        expect(
          matcher.match(keydown({ key: 'C', code: 'KeyC', shiftKey: true })),
        ).toBe(false)
      })

      it('requires separate presses in the manager and standalone matcher', () => {
        const callback = vi.fn()
        const manager = HotkeyManager.getInstance()
        manager.register([g, g], callback)
        const matcher = createSequenceMatcher([g, g])
        keydown({ key: 'g', code: 'KeyG', target: document })
        matcher.match(keydown({ key: 'g', code: 'KeyG' }))
        keydown({ key: 'g', code: 'KeyG', repeat: true, target: document })
        expect(
          matcher.match(keydown({ key: 'g', code: 'KeyG', repeat: true })),
        ).toBe(false)
        expect(callback).not.toHaveBeenCalled()
        expect(matcher.getProgress()).toBe(1)
        keyup({ key: 'g', code: 'KeyG', target: document })
        keydown({ key: 'g', code: 'KeyG', target: document })
        expect(matcher.match(keydown({ key: 'g', code: 'KeyG' }))).toBe(true)
        expect(callback).toHaveBeenCalledOnce()
      })
    },
  )

  it('applies match priority when restarting a partially matched sequence', () => {
    const manager = HotkeyManager.getInstance()
    const exact = vi.fn()
    const fallback = vi.fn()
    manager.register([RUSSIAN_Q, 'X'], exact)
    manager.register(['Q', 'Y'], fallback)
    keydown({ key: 'q', code: 'KeyQ', target: document })
    keydown({ key: 'й', code: 'KeyQ', target: document })
    keydown({ key: 'y', code: 'KeyY', target: document })
    expect(fallback).not.toHaveBeenCalled()
    keydown({ key: 'й', code: 'KeyQ', target: document })
    keydown({ key: 'x', code: 'KeyX', target: document })
    expect(exact).toHaveBeenCalledOnce()
  })

  it('uses priority for keyup sequences without letting keydown registrations suppress them', () => {
    const manager = HotkeyManager.getInstance()
    const exact = vi.fn()
    const fallback = vi.fn()
    const keydownCallback = vi.fn()
    manager.register(['G', RUSSIAN_Q], exact, { eventType: 'keyup' })
    manager.register(['G', 'Q'], fallback, { eventType: 'keyup' })
    manager.register(['G', '[KeyQ]'], keydownCallback)
    for (const [key, code] of [
      ['g', 'KeyG'],
      ['й', 'KeyQ'],
    ])
      keyup({ key, code, target: document })
    expect(exact).toHaveBeenCalledOnce()
    expect(fallback).not.toHaveBeenCalled()
    expect(keydownCallback).not.toHaveBeenCalled()
  })

  it('repeat events neither begin a sequence nor extend its timeout', () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const manager = HotkeyManager.getInstance()
    manager.register(['[KeyG]', '[KeyG]'], callback, { timeout: 100 })
    const matcher = createSequenceMatcher(['[KeyG]', '[KeyG]'], {
      timeout: 100,
    })
    keydown({ key: 'g', code: 'KeyG', repeat: true, target: document })
    matcher.match(keydown({ key: 'g', code: 'KeyG', repeat: true }))
    expect(matcher.getProgress()).toBe(0)
    keydown({ key: 'g', code: 'KeyG', target: document })
    matcher.match(keydown({ key: 'g', code: 'KeyG' }))
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(90)
    keydown({ key: 'g', code: 'KeyG', repeat: true, target: document })
    matcher.match(keydown({ key: 'g', code: 'KeyG', repeat: true }))
    vi.advanceTimersByTime(20)
    keydown({ key: 'g', code: 'KeyG', target: document })
    expect(matcher.match(keydown({ key: 'g', code: 'KeyG' }))).toBe(false)
    expect(callback).not.toHaveBeenCalled()
  })

  describe('equivalent sequence conflicts', () => {
    it.each([
      [
        ['Control+S', 'Escape'],
        ['Ctrl+S', 'Escape'],
      ],
      [
        ['Ctrl+Shift+S', 'G'],
        ['Shift+Control+S', 'g'],
      ],
      [
        ['Control+[KeyS]', '[Enter]'],
        ['Ctrl+[KeyS]', '[Enter]'],
      ],
    ] as Array<[HotkeySequence, HotkeySequence]>)(
      'rejects equivalent steps %j and %j',
      (original, equivalent) => {
        const manager = HotkeyManager.getInstance()
        manager.register(original, vi.fn())
        expect(() =>
          manager.register(equivalent, vi.fn(), { conflictBehavior: 'error' }),
        ).toThrow(/already registered/)
        expect(manager.getRegistrationCount()).toBe(1)
      },
    )

    it('replaces the old callback while preserving the supplied sequence spelling', () => {
      const manager = HotkeyManager.getInstance()
      const oldCallback = vi.fn()
      const newCallback = vi.fn()
      const oldHandle = manager.register(['Control+S', 'Escape'], oldCallback)
      // Exercise a modifier alias accepted by the parser but omitted from canonical types.
      const sequence = ['Ctrl+S', 'Escape'] as unknown as HotkeySequence
      manager.register(sequence, newCallback, { conflictBehavior: 'replace' })
      expect(oldHandle.isActive).toBe(false)
      expect(manager.getRegistrationCount()).toBe(1)
      expect([...manager.registrations.state.values()][0]?.hotkey).toEqual(
        sequence,
      )
      expect(sequence).toEqual(['Ctrl+S', 'Escape'])
      keydown({ key: 's', code: 'KeyS', ctrlKey: true, target: document })
      keydown({ key: 'Escape', code: 'Escape', target: document })
      expect(oldCallback).not.toHaveBeenCalled()
      expect(newCallback).toHaveBeenCalledOnce()
    })

    it('warns for aliases by default and honors allow', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        const manager = HotkeyManager.getInstance()
        manager.register(['Control+S', 'G'], vi.fn())
        manager.register(['Ctrl+S', 'G'] as HotkeySequence, vi.fn())
        expect(warn).toHaveBeenCalledOnce()
        manager.register(['Ctrl+S', 'G'] as HotkeySequence, vi.fn(), {
          conflictBehavior: 'allow',
        })
        expect(warn).toHaveBeenCalledOnce()
        expect(manager.getRegistrationCount()).toBe(3)
      } finally {
        warn.mockRestore()
      }
    })

    it('compares Mod using each registration’s resolved platform', () => {
      const manager = HotkeyManager.getInstance()
      manager.register(['Mod+S', 'G'], vi.fn(), { platform: 'mac' })
      expect(() =>
        manager.register(['Meta+S', 'G'], vi.fn(), {
          platform: 'windows',
          conflictBehavior: 'error',
        }),
      ).toThrow(/already registered/)
      expect(() =>
        manager.register(['Mod+S', 'G'], vi.fn(), {
          platform: 'windows',
          conflictBehavior: 'error',
        }),
      ).not.toThrow()
    })

    it('keeps different identities, step order, lengths, modifiers, and targets distinct', () => {
      const manager = HotkeyManager.getInstance()
      manager.register(['Ctrl+Enter', 'G'] as HotkeySequence, vi.fn())
      for (const sequence of [
        ['Ctrl+[Enter]', 'G'],
        ['Ctrl+Enter', 'G', 'G'],
        ['G', 'Ctrl+Enter'],
        ['Ctrl+Shift+Enter', 'G'],
      ] as Array<HotkeySequence>) {
        expect(() =>
          manager.register(sequence, vi.fn(), { conflictBehavior: 'error' }),
        ).not.toThrow()
      }
      expect(() =>
        manager.register(['Control+Enter', 'G'], vi.fn(), {
          target: document.createElement('div'),
          conflictBehavior: 'error',
        }),
      ).not.toThrow()
    })
  })

  describe('sequence steps before the last', () => {
    afterEach(() => {
      vi.useRealTimers()
      HotkeyManager.resetInstance()
    })

    it('prevents the default of each step that advances, and stops propagation only on the last', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()
      const outer = vi.fn()
      window.addEventListener('keydown', outer)
      manager.register(['Mod+K', 'Mod+C'], callback, { platform: 'windows' })

      expect(
        keydown({ key: 'k', ctrlKey: true, target: document }).defaultPrevented,
      ).toBe(true)
      expect(outer).toHaveBeenCalledTimes(1)
      expect(
        keydown({ key: 'c', ctrlKey: true, target: document }).defaultPrevented,
      ).toBe(true)
      expect(outer).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledOnce()
      expect(keydown({ key: 'x', target: document }).defaultPrevented).toBe(
        false,
      )
      window.removeEventListener('keydown', outer)
    })

    it('leaves earlier steps alone with preventDefault: false', () => {
      const manager = HotkeyManager.getInstance()
      manager.register(['G', 'H'], () => {}, { preventDefault: false })
      expect(keydown({ key: 'g', target: document }).defaultPrevented).toBe(
        false,
      )
      expect(keydown({ key: 'h', target: document }).defaultPrevented).toBe(
        false,
      )
    })

    it('clears progress and notifies subscribers once the timeout passes', () => {
      vi.useFakeTimers()
      const manager = HotkeyManager.getInstance()
      const handle = manager.register(['G', 'H'], () => {}, { timeout: 500 })
      const progress = () => {
        const registration = manager.registrations.state.get(handle.id)!
        return registration.kind === 'sequence' ? registration.currentIndex : -1
      }
      const listener = vi.fn()
      const subscription = manager.registrations.subscribe(listener)

      keydown({ key: 'g', target: document })
      expect(progress()).toBe(1)
      listener.mockClear()
      vi.advanceTimersByTime(500)
      expect(progress()).toBe(1)
      expect(listener).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(progress()).toBe(0)
      expect(listener).toHaveBeenCalled()

      keydown({ key: 'g', target: document })
      vi.advanceTimersByTime(400)
      keydown({ key: 'h', target: document })
      expect(progress()).toBe(0)
      keydown({ key: 'g', target: document })
      handle.unregister()
      expect(vi.getTimerCount()).toBe(0)
      subscription.unsubscribe()
    })
  })

  describe('a sequence that starts a longer one', () => {
    it('completes without waiting for the longer sequence', () => {
      const manager = HotkeyManager.getInstance()
      const fired: Array<string> = []
      manager.register(['G', 'G'], () => fired.push('G G'))
      manager.register(['G', 'G', 'G'], () => fired.push('G G G'))
      keydown({ key: 'g', code: 'KeyG', target: document })
      keydown({ key: 'g', code: 'KeyG', target: document })
      expect(fired).toEqual(['G G'])
      keydown({ key: 'g', code: 'KeyG', target: document })
      expect(fired).toEqual(['G G', 'G G G'])
      // Each sequence tracks its own progress, so the fourth G completes G G again.
      keydown({ key: 'g', code: 'KeyG', target: document })
      expect(fired).toEqual(['G G', 'G G G', 'G G'])
    })
  })
})
