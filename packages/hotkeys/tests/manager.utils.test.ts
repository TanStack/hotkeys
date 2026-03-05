import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  defaultHotkeyOptions,
  getDefaultIgnoreInputs,
  handleConflict,
  isEventForTarget,
  isInputElement,
} from '../src/manager.utils'

describe('manager.utils', () => {
  describe('isInputElement', () => {
    it('should return false for null', () => {
      expect(isInputElement(null)).toBe(false)
    })

    it('should return true for text input elements', () => {
      const input = document.createElement('input')
      input.type = 'text'
      expect(isInputElement(input)).toBe(true)
    })

    it('should return true for various input types', () => {
      const types = ['text', 'email', 'number', 'password', 'search', 'tel']
      for (const type of types) {
        const input = document.createElement('input')
        input.type = type
        expect(isInputElement(input)).toBe(true)
      }
    })

    it('should return false for button-type inputs', () => {
      const buttonTypes = ['button', 'submit', 'reset']
      for (const type of buttonTypes) {
        const input = document.createElement('input')
        input.type = type
        expect(isInputElement(input)).toBe(false)
      }
    })

    it('should return true for textarea', () => {
      const textarea = document.createElement('textarea')
      expect(isInputElement(textarea)).toBe(true)
    })

    it('should return true for select', () => {
      const select = document.createElement('select')
      expect(isInputElement(select)).toBe(true)
    })

    it('should return true for contenteditable elements', () => {
      const div = document.createElement('div')
      div.contentEditable = 'true'
      expect(isInputElement(div)).toBe(true)
    })

    it('should return true for contenteditable plaintext-only elements', () => {
      const div = document.createElement('div')
      div.contentEditable = 'plaintext-only'
      expect(isInputElement(div)).toBe(true)
    })

    it('should return true for inherited contenteditable', () => {
      const parent = document.createElement('div')
      parent.contentEditable = 'true'
      const child = document.createElement('span')
      parent.appendChild(child)
      document.body.appendChild(parent)
      expect(isInputElement(child)).toBe(true)
      document.body.removeChild(parent)
    })

    it('should return false for contenteditable false', () => {
      const div = document.createElement('div')
      div.contentEditable = 'false'
      expect(isInputElement(div)).toBe(false)
    })

    it('should return false for regular div', () => {
      const div = document.createElement('div')
      expect(isInputElement(div)).toBe(false)
    })
  })

  describe('getDefaultIgnoreInputs', () => {
    it('should return false for Ctrl hotkeys', () => {
      expect(
        getDefaultIgnoreInputs({
          key: 'S',
          ctrl: true,
          shift: false,
          alt: false,
          meta: false,
          modifiers: ['Control'],
        }),
      ).toBe(false)
    })

    it('should return false for Meta hotkeys', () => {
      expect(
        getDefaultIgnoreInputs({
          key: 'S',
          ctrl: false,
          shift: false,
          alt: false,
          meta: true,
          modifiers: ['Meta'],
        }),
      ).toBe(false)
    })

    it('should return false for Escape', () => {
      expect(
        getDefaultIgnoreInputs({
          key: 'Escape',
          ctrl: false,
          shift: false,
          alt: false,
          meta: false,
          modifiers: [],
        }),
      ).toBe(false)
    })

    it('should return true for single keys', () => {
      expect(
        getDefaultIgnoreInputs({
          key: 'G',
          ctrl: false,
          shift: false,
          alt: false,
          meta: false,
          modifiers: [],
        }),
      ).toBe(true)
    })

    it('should return true for Shift combinations', () => {
      expect(
        getDefaultIgnoreInputs({
          key: 'S',
          ctrl: false,
          shift: true,
          alt: false,
          meta: false,
          modifiers: ['Shift'],
        }),
      ).toBe(true)
    })

    it('should return true for Alt combinations', () => {
      expect(
        getDefaultIgnoreInputs({
          key: 'A',
          ctrl: false,
          shift: false,
          alt: true,
          meta: false,
          modifiers: ['Alt'],
        }),
      ).toBe(true)
    })
  })

  describe('defaultHotkeyOptions', () => {
    it('should have expected default values', () => {
      expect(defaultHotkeyOptions).toEqual({
        preventDefault: true,
        stopPropagation: true,
        eventType: 'keydown',
        enabled: true,
        ignoreInputs: true,
        conflictBehavior: 'warn',
      })
    })
  })

  describe('isEventForTarget', () => {
    it('should return true when event currentTarget matches document target', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      Object.defineProperty(event, 'currentTarget', {
        value: document,
        writable: false,
        configurable: true,
      })
      document.dispatchEvent(event)
      expect(isEventForTarget(event, document)).toBe(true)
    })

    it('should return true when event currentTarget matches window target', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      Object.defineProperty(event, 'currentTarget', {
        value: window,
        writable: false,
        configurable: true,
      })
      expect(isEventForTarget(event, window)).toBe(true)
    })

    it('should return true when target contains event target', () => {
      const div = document.createElement('div')
      const span = document.createElement('span')
      div.appendChild(span)
      document.body.appendChild(div)

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      span.dispatchEvent(event)
      Object.defineProperty(event, 'target', {
        value: span,
        writable: false,
        configurable: true,
      })
      Object.defineProperty(event, 'currentTarget', {
        value: div,
        writable: false,
        configurable: true,
      })

      expect(isEventForTarget(event, div)).toBe(true)

      document.body.removeChild(div)
    })

    it('should return true when currentTarget matches element target', () => {
      const div = document.createElement('div')
      document.body.appendChild(div)

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      Object.defineProperty(event, 'target', {
        value: div,
        writable: false,
        configurable: true,
      })
      Object.defineProperty(event, 'currentTarget', {
        value: div,
        writable: false,
        configurable: true,
      })

      expect(isEventForTarget(event, div)).toBe(true)

      document.body.removeChild(div)
    })
  })

  describe('handleConflict', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should do nothing when conflictBehavior is allow', () => {
      const unregister = vi.fn()
      expect(() =>
        handleConflict('id-1', 'Mod+S', 'allow', unregister),
      ).not.toThrow()
      expect(unregister).not.toHaveBeenCalled()
    })

    it('should warn when conflictBehavior is warn', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const unregister = vi.fn()

      handleConflict('id-1', 'Mod+S', 'warn', unregister)

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('already registered'),
      )
      expect(unregister).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('should throw when conflictBehavior is error', () => {
      const unregister = vi.fn()

      expect(() =>
        handleConflict('id-1', 'Mod+S', 'error', unregister),
      ).toThrow(/already registered/)
      expect(unregister).not.toHaveBeenCalled()
    })

    it('should call unregister when conflictBehavior is replace', () => {
      const unregister = vi.fn()

      handleConflict('id-1', 'Mod+S', 'replace', unregister)

      expect(unregister).toHaveBeenCalledWith('id-1')
    })
  })
})
