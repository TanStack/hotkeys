import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  defaultHotkeyOptions,
  getDefaultIgnoreInputs,
  handleConflict,
} from '../src/_registration'
import { isInputElement } from '../src/_event-target'

describe('registration and event-target helpers', () => {
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

    it('should not rely on current-realm DOM constructors', () => {
      const input = document.createElement('input')
      input.type = 'text'
      const button = document.createElement('input')
      button.type = 'button'
      const textarea = document.createElement('textarea')
      const select = document.createElement('select')
      const editable = document.createElement('div')
      editable.contentEditable = 'true'
      const regular = document.createElement('div')

      vi.stubGlobal('HTMLInputElement', class {})
      vi.stubGlobal('HTMLTextAreaElement', class {})
      vi.stubGlobal('HTMLSelectElement', class {})
      vi.stubGlobal('HTMLElement', class {})

      try {
        expect(input).not.toBeInstanceOf(HTMLInputElement)
        expect(isInputElement(input)).toBe(true)
        expect(isInputElement(button)).toBe(false)
        expect(isInputElement(textarea)).toBe(true)
        expect(isInputElement(select)).toBe(true)
        expect(isInputElement(editable)).toBe(true)
        expect(isInputElement(regular)).toBe(false)
      } finally {
        vi.unstubAllGlobals()
      }
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
        capture: false,
        preventDefault: true,
        stopPropagation: true,
        eventType: 'keydown',
        enabled: true,
        ignoreInputs: 'auto',
        conflictBehavior: 'warn',
        scope: 'global',
      })
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
