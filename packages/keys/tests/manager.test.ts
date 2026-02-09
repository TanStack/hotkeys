import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'

/**
 * Helper to create a mock KeyboardEvent
 */
function createKeyboardEvent(
  type: 'keydown' | 'keyup',
  key: string,
  options: {
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
  } = {},
): KeyboardEvent {
  return new KeyboardEvent(type, {
    key,
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    bubbles: true,
  })
}

describe('HotkeyManager', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = HotkeyManager.getInstance()
      const instance2 = HotkeyManager.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should reset instance correctly', () => {
      const instance1 = HotkeyManager.getInstance()
      HotkeyManager.resetInstance()
      const instance2 = HotkeyManager.getInstance()
      expect(instance1).not.toBe(instance2)
    })
  })

  describe('registration', () => {
    it('should register a hotkey', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      expect(manager.getRegistrationCount()).toBe(1)
      expect(manager.isRegistered('Mod+S')).toBe(true)
    })

    it('should unregister a hotkey', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const handle = manager.register('Mod+S', callback)
      expect(manager.getRegistrationCount()).toBe(1)

      handle.unregister()
      expect(manager.getRegistrationCount()).toBe(0)
      expect(manager.isRegistered('Mod+S')).toBe(false)
    })

    it('should handle multiple registrations', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.register('Mod+S', callback1)
      manager.register('Mod+Z', callback2)

      expect(manager.getRegistrationCount()).toBe(2)
    })
  })

  describe('HotkeyRegistrationHandle', () => {
    it('should return a handle with id', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const handle = manager.register('Mod+S', callback)

      expect(handle.id).toBeDefined()
      expect(typeof handle.id).toBe('string')
    })

    it('should allow updating callback via handle.callback', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const handle = manager.register('Mod+S', callback1, { platform: 'mac' })

      // Trigger with first callback
      const event1 = createKeyboardEvent('keydown', 's', { metaKey: true })
      document.dispatchEvent(event1)
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).not.toHaveBeenCalled()

      // Update callback
      handle.callback = callback2

      // Trigger again - should call new callback
      const event2 = createKeyboardEvent('keydown', 's', { metaKey: true })
      document.dispatchEvent(event2)
      expect(callback1).toHaveBeenCalledTimes(1) // unchanged
      expect(callback2).toHaveBeenCalledTimes(1) // now called
    })

    it('should allow updating options via handle.setOptions', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const handle = manager.register('Mod+S', callback, { platform: 'mac' })

      // Should trigger initially
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      // Disable via setOptions
      handle.setOptions({ enabled: false })

      // Should not trigger when disabled
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(1) // unchanged

      // Re-enable
      handle.setOptions({ enabled: true })

      // Should trigger again
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should report isActive correctly', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const handle = manager.register('Mod+S', callback)

      expect(handle.isActive).toBe(true)

      handle.unregister()

      expect(handle.isActive).toBe(false)
    })

    it('should safely handle operations after unregister', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const handle = manager.register('Mod+S', callback1, { platform: 'mac' })
      handle.unregister()

      // These should not throw
      expect(() => {
        handle.callback = callback2
      }).not.toThrow()
      expect(() => {
        handle.setOptions({ enabled: false })
      }).not.toThrow()
      expect(() => {
        handle.unregister()
      }).not.toThrow()
    })

    it('should get current callback via handle.callback getter', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const handle = manager.register('Mod+S', callback)

      expect(handle.callback).toBe(callback)

      const newCallback = vi.fn()
      handle.callback = newCallback
      expect(handle.callback).toBe(newCallback)
    })
  })

  describe('isRegistered with target', () => {
    it('should check registration with specific target', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()
      const div = document.createElement('div')
      document.body.appendChild(div)

      manager.register('Mod+S', callback, { target: div })

      expect(manager.isRegistered('Mod+S')).toBe(true)
      expect(manager.isRegistered('Mod+S', div)).toBe(true)
      expect(manager.isRegistered('Mod+S', document)).toBe(false)

      document.body.removeChild(div)
    })

    it('should return true without target if any registration exists', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()
      const div = document.createElement('div')
      document.body.appendChild(div)

      manager.register('Mod+S', callback, { target: div })

      // Without target, should return true if hotkey is registered anywhere
      expect(manager.isRegistered('Mod+S')).toBe(true)
      expect(manager.isRegistered('Mod+Z')).toBe(false)

      document.body.removeChild(div)
    })
  })

  describe('event handling', () => {
    it('should call callback when hotkey is pressed', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      const event = createKeyboardEvent('keydown', 's', { metaKey: true })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          hotkey: 'Mod+S',
          parsedHotkey: expect.objectContaining({ key: 'S', meta: true }),
        }),
      )
    })

    it('should not call callback when different hotkey is pressed', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      const event = createKeyboardEvent('keydown', 'z', { metaKey: true })
      document.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should not call callback when disabled', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac', enabled: false })

      const event = createKeyboardEvent('keydown', 's', { metaKey: true })
      document.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle keyup events when configured', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        eventType: 'keyup',
      })

      // keydown should not trigger
      const keydownEvent = createKeyboardEvent('keydown', 's', {
        metaKey: true,
      })
      document.dispatchEvent(keydownEvent)
      expect(callback).not.toHaveBeenCalled()

      // keyup should trigger
      const keyupEvent = createKeyboardEvent('keyup', 's', { metaKey: true })
      document.dispatchEvent(keyupEvent)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('requireReset option', () => {
    it('should only fire once when requireReset is true', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        requireReset: true,
      })

      const event1 = createKeyboardEvent('keydown', 's', { metaKey: true })
      document.dispatchEvent(event1)
      expect(callback).toHaveBeenCalledTimes(1)

      // Second press should not fire (keys still held)
      const event2 = createKeyboardEvent('keydown', 's', { metaKey: true })
      document.dispatchEvent(event2)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should fire again after key is released', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        requireReset: true,
      })

      // First press
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      // Release the key
      document.dispatchEvent(
        createKeyboardEvent('keyup', 's', { metaKey: true }),
      )

      // Second press should fire
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should call preventDefault even when requireReset is active and has already fired', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        preventDefault: true,
        requireReset: true,
      })

      // First keydown - should call preventDefault and callback
      const event1 = createKeyboardEvent('keydown', 's', { metaKey: true })
      const preventDefaultSpy1 = vi.spyOn(event1, 'preventDefault')
      document.dispatchEvent(event1)

      expect(preventDefaultSpy1).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledTimes(1)

      // Second keydown while keys still held - should call preventDefault but NOT callback
      const event2 = createKeyboardEvent('keydown', 's', { metaKey: true })
      const preventDefaultSpy2 = vi.spyOn(event2, 'preventDefault')
      document.dispatchEvent(event2)

      expect(preventDefaultSpy2).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledTimes(1) // Callback should not be called again
    })

    it('should call stopPropagation even when requireReset is active and has already fired', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        stopPropagation: true,
        requireReset: true,
      })

      // First keydown - should call stopPropagation and callback
      const event1 = createKeyboardEvent('keydown', 's', { metaKey: true })
      const stopPropagationSpy1 = vi.spyOn(event1, 'stopPropagation')
      document.dispatchEvent(event1)

      expect(stopPropagationSpy1).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledTimes(1)

      // Second keydown while keys still held - should call stopPropagation but NOT callback
      const event2 = createKeyboardEvent('keydown', 's', { metaKey: true })
      const stopPropagationSpy2 = vi.spyOn(event2, 'stopPropagation')
      document.dispatchEvent(event2)

      expect(stopPropagationSpy2).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledTimes(1) // Callback should not be called again
    })

    it('should reset correctly when modifier key is released on Windows/Linux', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Control+S', callback, {
        platform: 'windows',
        requireReset: true,
      })

      // First press
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { ctrlKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      // Release Control key (using normalized key name 'Control')
      document.dispatchEvent(
        createKeyboardEvent('keyup', 'Control', { ctrlKey: false }),
      )

      // Second press should fire after reset
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { ctrlKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should reset correctly when main key is released', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        requireReset: true,
      })

      // First press
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(1)

      // Release the main key
      document.dispatchEvent(
        createKeyboardEvent('keyup', 's', { metaKey: true }),
      )

      // Second press should fire after reset
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  describe('preventDefault and stopPropagation', () => {
    it('should call preventDefault when option is set', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        preventDefault: true,
      })

      const event = createKeyboardEvent('keydown', 's', { metaKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      document.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should call stopPropagation when option is set', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        stopPropagation: true,
      })

      const event = createKeyboardEvent('keydown', 's', { metaKey: true })
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')

      document.dispatchEvent(event)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe('ignoreInputs option', () => {
    /**
     * Helper to create and dispatch a keyboard event from a specific element
     * The event is dispatched on the target (usually document) but with event.target set to the element
     */
    function dispatchKeyboardEventFromElement(
      target: HTMLElement | Document,
      element: HTMLElement,
      type: 'keydown' | 'keyup',
      key: string,
      options: {
        ctrlKey?: boolean
        shiftKey?: boolean
        altKey?: boolean
        metaKey?: boolean
      } = {},
    ): KeyboardEvent {
      const event = new KeyboardEvent(type, {
        key,
        ctrlKey: options.ctrlKey ?? false,
        shiftKey: options.shiftKey ?? false,
        altKey: options.altKey ?? false,
        metaKey: options.metaKey ?? false,
        bubbles: true,
      })
      // Set the target to the element (where the event originated)
      Object.defineProperty(event, 'target', {
        value: element,
        writable: false,
        configurable: true,
      })
      // Set currentTarget to the target (where the listener is attached)
      Object.defineProperty(event, 'currentTarget', {
        value: target,
        writable: false,
        configurable: true,
      })
      target.dispatchEvent(event)
      return event
    }

    it('should ignore hotkeys when typing in input elements by default', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      const input = document.createElement('input')
      document.body.appendChild(input)

      dispatchKeyboardEventFromElement(document, input, 'keydown', 's', {
        metaKey: true,
      })

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should fire hotkeys when ignoreInputs is false', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, {
        platform: 'mac',
        ignoreInputs: false,
      })

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = dispatchKeyboardEventFromElement(
        document,
        input,
        'keydown',
        's',
        { metaKey: true },
      )

      expect(callback).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          hotkey: 'Mod+S',
        }),
      )

      document.body.removeChild(input)
    })

    it('should ignore hotkeys when typing in textarea elements', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      dispatchKeyboardEventFromElement(document, textarea, 'keydown', 's', {
        metaKey: true,
      })

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('should ignore hotkeys when typing in select elements', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      const select = document.createElement('select')
      document.body.appendChild(select)

      dispatchKeyboardEventFromElement(document, select, 'keydown', 's', {
        metaKey: true,
      })

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(select)
    })

    it('should ignore hotkeys when typing in contenteditable elements', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      const div = document.createElement('div')
      div.contentEditable = 'true'
      document.body.appendChild(div)

      dispatchKeyboardEventFromElement(document, div, 'keydown', 's', {
        metaKey: true,
      })

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('should fire hotkeys scoped to a specific input element', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const input = document.createElement('input')
      document.body.appendChild(input)

      manager.register('Mod+S', callback, {
        platform: 'mac',
        target: input,
      })

      const event = dispatchKeyboardEventFromElement(
        input,
        input,
        'keydown',
        's',
        { metaKey: true },
      )

      expect(callback).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          hotkey: 'Mod+S',
        }),
      )

      document.body.removeChild(input)
    })

    it('should fire hotkeys scoped to a specific textarea element', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      manager.register('Mod+S', callback, {
        platform: 'mac',
        target: textarea,
      })

      const event = dispatchKeyboardEventFromElement(
        textarea,
        textarea,
        'keydown',
        's',
        { metaKey: true },
      )

      expect(callback).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          hotkey: 'Mod+S',
        }),
      )

      document.body.removeChild(textarea)
    })

    it('should ignore hotkeys when scoped to parent element containing input', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const parent = document.createElement('div')
      const input = document.createElement('input')
      parent.appendChild(input)
      document.body.appendChild(parent)

      manager.register('Mod+S', callback, {
        platform: 'mac',
        target: parent,
      })

      // Event originates from input but bubbles to parent
      dispatchKeyboardEventFromElement(parent, input, 'keydown', 's', {
        metaKey: true,
      })

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(parent)
    })

    it('should ignore hotkeys when scoped to document and typing in input', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const input = document.createElement('input')
      document.body.appendChild(input)

      manager.register('Mod+S', callback, {
        platform: 'mac',
        target: document,
      })

      // Event originates from input but bubbles to document
      dispatchKeyboardEventFromElement(document, input, 'keydown', 's', {
        metaKey: true,
      })

      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should fire hotkeys when typing in non-input elements', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      const div = document.createElement('div')
      document.body.appendChild(div)

      manager.register('Mod+S', callback, { platform: 'mac' })

      const event = dispatchKeyboardEventFromElement(
        document,
        div,
        'keydown',
        's',
        { metaKey: true },
      )

      expect(callback).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          hotkey: 'Mod+S',
        }),
      )

      document.body.removeChild(div)
    })

    it('should handle multiple hotkeys with different ignoreInputs settings', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const input = document.createElement('input')
      document.body.appendChild(input)

      // This one should be ignored (default ignoreInputs: true)
      manager.register('Mod+S', callback1, { platform: 'mac' })

      // This one should fire (ignoreInputs: false)
      manager.register('Mod+Z', callback2, {
        platform: 'mac',
        ignoreInputs: false,
      })

      dispatchKeyboardEventFromElement(document, input, 'keydown', 's', {
        metaKey: true,
      })

      const eventZ = dispatchKeyboardEventFromElement(
        document,
        input,
        'keydown',
        'z',
        { metaKey: true },
      )

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith(
        eventZ,
        expect.objectContaining({
          hotkey: 'Mod+Z',
        }),
      )

      document.body.removeChild(input)
    })

    it('should work with different input types (text, number, email)', () => {
      const manager = HotkeyManager.getInstance()
      const callback = vi.fn()

      manager.register('Mod+S', callback, { platform: 'mac' })

      const inputTypes = ['text', 'number', 'email', 'password', 'search']
      for (const type of inputTypes) {
        const input = document.createElement('input')
        input.type = type
        document.body.appendChild(input)

        dispatchKeyboardEventFromElement(document, input, 'keydown', 's', {
          metaKey: true,
        })

        expect(callback).not.toHaveBeenCalled()

        document.body.removeChild(input)
        callback.mockClear()
      }
    })
  })

  describe('conflict detection', () => {
    it('should warn by default when registering a conflicting hotkey', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      manager.register('Mod+S', callback1)
      manager.register('Mod+S', callback2)

      expect(warnSpy).toHaveBeenCalled()
      expect(warnSpy.mock.calls[0]?.[0]).toContain('already registered')
      expect(manager.getRegistrationCount()).toBe(2)

      warnSpy.mockRestore()
    })

    it('should throw error when conflictBehavior is "error"', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.register('Mod+S', callback1)

      expect(() => {
        manager.register('Mod+S', callback2, { conflictBehavior: 'error' })
      }).toThrow('already registered')

      expect(manager.getRegistrationCount()).toBe(1)
    })

    it('should replace existing registration when conflictBehavior is "replace"', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.register('Mod+S', callback1, { platform: 'mac' })
      expect(manager.getRegistrationCount()).toBe(1)

      manager.register('Mod+S', callback2, {
        conflictBehavior: 'replace',
        platform: 'mac',
      })
      expect(manager.getRegistrationCount()).toBe(1)

      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledOnce()
    })

    it('should allow multiple registrations when conflictBehavior is "allow"', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      manager.register('Mod+S', callback1, { platform: 'mac' })
      manager.register('Mod+S', callback2, {
        conflictBehavior: 'allow',
        platform: 'mac',
      })

      expect(warnSpy).not.toHaveBeenCalled()
      expect(manager.getRegistrationCount()).toBe(2)

      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )

      expect(callback1).toHaveBeenCalledOnce()
      expect(callback2).toHaveBeenCalledOnce()

      warnSpy.mockRestore()
    })

    it('should not conflict when same hotkey is registered on different targets', () => {
      const manager = HotkeyManager.getInstance()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const div1 = document.createElement('div')
      const div2 = document.createElement('div')

      manager.register('Mod+S', callback1, { target: div1 })
      manager.register('Mod+S', callback2, { target: div2 })

      expect(warnSpy).not.toHaveBeenCalled()
      expect(manager.getRegistrationCount()).toBe(2)

      warnSpy.mockRestore()
    })
  })
})
