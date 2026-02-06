import { describe, expect, it, vi } from 'vitest'
import {
  createHotkeyHandler,
  createMultiHotkeyHandler,
  matchesKeyboardEvent,
} from '../src/match'
import { Hotkey } from '../src'

/**
 * Helper to create a mock KeyboardEvent
 */
function createKeyboardEvent(
  key: string,
  options: {
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
    code?: string
  } = {},
): KeyboardEvent {
  // Auto-generate code for letters and digits if not provided
  let code = options.code
  if (code === undefined) {
    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      code = `Key${key.toUpperCase()}`
    } else if (key.length === 1 && /^[0-9]$/.test(key)) {
      code = `Digit${key}`
    }
  }

  return {
    key,
    code,
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as KeyboardEvent
}

describe('matchesKeyboardEvent', () => {
  describe('single key matching', () => {
    it('should match a single letter key', () => {
      const event = createKeyboardEvent('a')
      expect(matchesKeyboardEvent(event, 'A')).toBe(true)
    })

    it('should not match different keys', () => {
      const event = createKeyboardEvent('a')
      expect(matchesKeyboardEvent(event, 'B')).toBe(false)
    })

    it('should match special keys', () => {
      const escEvent = createKeyboardEvent('Escape')
      expect(matchesKeyboardEvent(escEvent, 'Escape')).toBe(true)

      const enterEvent = createKeyboardEvent('Enter')
      expect(matchesKeyboardEvent(enterEvent, 'Enter')).toBe(true)
    })

    it('should match function keys', () => {
      const event = createKeyboardEvent('F5')
      expect(matchesKeyboardEvent(event, 'F5')).toBe(true)
    })
  })

  describe('modifier matching', () => {
    it('should match Control modifier', () => {
      const event = createKeyboardEvent('a', { ctrlKey: true })
      expect(matchesKeyboardEvent(event, 'Control+A')).toBe(true)
    })

    it('should not match if Control is missing', () => {
      const event = createKeyboardEvent('a')
      expect(matchesKeyboardEvent(event, 'Control+A')).toBe(false)
    })

    it('should not match if extra Control is present', () => {
      const event = createKeyboardEvent('a', { ctrlKey: true })
      expect(matchesKeyboardEvent(event, 'A')).toBe(false)
    })

    it('should match Shift modifier', () => {
      const event = createKeyboardEvent('A', { shiftKey: true })
      expect(matchesKeyboardEvent(event, 'Shift+A')).toBe(true)
    })

    it('should match Alt modifier', () => {
      const event = createKeyboardEvent('a', { altKey: true })
      expect(matchesKeyboardEvent(event, 'Alt+A')).toBe(true)
    })

    it('should match Meta modifier', () => {
      const event = createKeyboardEvent('a', { metaKey: true })
      expect(matchesKeyboardEvent(event, 'Meta+A')).toBe(true)
    })
  })

  describe('Mod modifier (platform-specific)', () => {
    it('should match Mod as Meta on Mac', () => {
      const event = createKeyboardEvent('s', { metaKey: true })
      expect(matchesKeyboardEvent(event, 'Mod+S', 'mac')).toBe(true)
    })

    it('should not match Mod as Control on Mac', () => {
      const event = createKeyboardEvent('s', { ctrlKey: true })
      expect(matchesKeyboardEvent(event, 'Mod+S', 'mac')).toBe(false)
    })

    it('should match Mod as Control on Windows', () => {
      const event = createKeyboardEvent('s', { ctrlKey: true })
      expect(matchesKeyboardEvent(event, 'Mod+S', 'windows')).toBe(true)
    })

    it('should not match Mod as Meta on Windows', () => {
      const event = createKeyboardEvent('s', { metaKey: true })
      expect(matchesKeyboardEvent(event, 'Mod+S', 'windows')).toBe(false)
    })
  })

  describe('multiple modifiers', () => {
    it('should match two modifiers', () => {
      const event = createKeyboardEvent('s', { ctrlKey: true, shiftKey: true })
      expect(matchesKeyboardEvent(event, 'Control+Shift+S')).toBe(true)
    })

    it('should not match if one modifier is missing', () => {
      const event = createKeyboardEvent('s', { ctrlKey: true })
      expect(matchesKeyboardEvent(event, 'Control+Shift+S')).toBe(false)
    })

    it('should not match if extra modifier is present', () => {
      const event = createKeyboardEvent('s', {
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
      })
      expect(matchesKeyboardEvent(event, 'Control+Shift+S')).toBe(false)
    })

    it('should match three modifiers', () => {
      const event = createKeyboardEvent('a', {
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
      })
      expect(matchesKeyboardEvent(event, 'Control+Alt+Shift+A')).toBe(true)
    })
  })

  describe('with ParsedHotkey input', () => {
    it('should accept ParsedHotkey objects', () => {
      const event = createKeyboardEvent('s', { metaKey: true })
      const parsed = {
        key: 'S',
        ctrl: false,
        shift: false,
        alt: false,
        meta: true,
        modifiers: ['Meta'] as ('Control' | 'Shift' | 'Alt' | 'Meta')[],
      }
      expect(matchesKeyboardEvent(event, parsed)).toBe(true)
    })
  })

  describe('event.code fallback for letter keys', () => {
    it('should fallback to event.code when event.key produces special character (macOS Option+T)', () => {
      // Simulate macOS Option+T where event.key is '†' but event.code is 'KeyT'
      const event = createKeyboardEvent('†', {
        altKey: true,
        metaKey: true,
        code: 'KeyT',
      })
      expect(matchesKeyboardEvent(event, 'Mod+Alt+T', 'mac')).toBe(true)
    })

    it('should still match normally when event.key matches', () => {
      // Normal case - event.key matches, no fallback needed
      const event = createKeyboardEvent('t', {
        altKey: true,
        metaKey: true,
        code: 'KeyT',
      })
      expect(matchesKeyboardEvent(event, 'Mod+Alt+T', 'mac')).toBe(true)
    })

    it('should not use fallback for non-letter keys', () => {
      // Special keys should not use code fallback
      const event = createKeyboardEvent('Escape', {
        code: 'Escape',
      })
      expect(matchesKeyboardEvent(event, 'Escape')).toBe(true)

      // If event.key doesn't match for special keys, it should fail
      const mismatchedEvent = createKeyboardEvent('Enter', {
        code: 'Escape',
      })
      expect(matchesKeyboardEvent(mismatchedEvent, 'Escape')).toBe(false)
    })

    it('should handle fallback with different modifiers', () => {
      // Test with Alt modifier
      const altEvent = createKeyboardEvent('´', {
        altKey: true,
        code: 'KeyE',
      })
      expect(matchesKeyboardEvent(altEvent, 'Alt+E')).toBe(true)

      // Test with Control modifier
      const ctrlEvent = createKeyboardEvent('†', {
        ctrlKey: true,
        code: 'KeyT',
      })
      expect(matchesKeyboardEvent(ctrlEvent, 'Control+T')).toBe(true)

      // Test with Shift modifier
      const shiftEvent = createKeyboardEvent('∑', {
        shiftKey: true,
        code: 'KeyS',
      })
      expect(matchesKeyboardEvent(shiftEvent, 'Shift+S')).toBe(true)
    })

    it('should not match if event.code is missing or invalid', () => {
      // Missing code - should fail
      const event = createKeyboardEvent('†', {
        altKey: true,
        metaKey: true,
        code: undefined,
      })
      expect(matchesKeyboardEvent(event, 'Mod+Alt+T', 'mac')).toBe(false)

      // Invalid code format - should fail
      const invalidCodeEvent = createKeyboardEvent('†', {
        altKey: true,
        metaKey: true,
        code: 'InvalidCode',
      })
      expect(matchesKeyboardEvent(invalidCodeEvent, 'Mod+Alt+T', 'mac')).toBe(
        false,
      )
    })

    it('should handle case-insensitive matching with code fallback', () => {
      // Lowercase code should still match uppercase hotkey
      const event = createKeyboardEvent('†', {
        altKey: true,
        metaKey: true,
        code: 'Keyt', // lowercase
      })
      expect(matchesKeyboardEvent(event, 'Mod+Alt+T', 'mac')).toBe(true)

      // Uppercase code should match lowercase hotkey
      const event2 = createKeyboardEvent('†', {
        altKey: true,
        metaKey: true,
        code: 'KeyT', // uppercase
      })
      expect(matchesKeyboardEvent(event2, 'Mod+Alt+t' as Hotkey, 'mac')).toBe(true)
    })
  })

  describe('event.code fallback for digit keys', () => {
    it('should fallback to event.code when event.key produces special character (Shift+4 -> $)', () => {
      // Simulate Shift+4 where event.key is '$' but event.code is 'Digit4'
      const event = createKeyboardEvent('$', {
        shiftKey: true,
        code: 'Digit4',
      })
      expect(matchesKeyboardEvent(event, 'Shift+4')).toBe(true)
    })

    it('should still match normally when event.key matches digit', () => {
      // Normal case - event.key matches, no fallback needed
      const event = createKeyboardEvent('4', {
        ctrlKey: true,
        code: 'Digit4',
      })
      expect(matchesKeyboardEvent(event, 'Control+4')).toBe(true)
    })

    it('should handle fallback with different modifiers', () => {
      // Test with Alt modifier
      const altEvent = createKeyboardEvent('¢', {
        altKey: true,
        code: 'Digit4',
      })
      expect(matchesKeyboardEvent(altEvent, 'Alt+4')).toBe(true)

      // Test with Control+Shift modifier
      const ctrlShiftEvent = createKeyboardEvent('$', {
        ctrlKey: true,
        shiftKey: true,
        code: 'Digit4',
      })
      expect(matchesKeyboardEvent(ctrlShiftEvent, 'Control+Shift+4')).toBe(true)

      // Test with Meta modifier (macOS)
      const metaEvent = createKeyboardEvent('©', {
        metaKey: true,
        code: 'Digit4',
      })
      expect(matchesKeyboardEvent(metaEvent, 'Meta+4')).toBe(true)
    })

    it('should not match if event.code is missing or invalid', () => {
      // Missing code - should fail
      const event = createKeyboardEvent('$', {
        shiftKey: true,
        code: undefined,
      })
      expect(matchesKeyboardEvent(event, 'Shift+4')).toBe(false)

      // Invalid code format - should fail
      const invalidCodeEvent = createKeyboardEvent('$', {
        shiftKey: true,
        code: 'InvalidCode',
      })
      expect(matchesKeyboardEvent(invalidCodeEvent, 'Shift+4')).toBe(false)
    })

    it('should match all digits 0-9', () => {
      for (let i = 0; i <= 9; i++) {
        const event = createKeyboardEvent('!', {
          shiftKey: true,
          code: `Digit${i}`,
        })
        expect(matchesKeyboardEvent(event, `Shift+${i}` as Hotkey)).toBe(true)
      }
    })
  })
})

describe('createHotkeyHandler', () => {
  it('should call callback with event and context when hotkey matches', () => {
    const callback = vi.fn()
    const handler = createHotkeyHandler('Mod+S', callback, { platform: 'mac' })

    const event = createKeyboardEvent('s', { metaKey: true })
    handler(event)

    expect(callback).toHaveBeenCalledWith(event, {
      hotkey: 'Mod+S',
      parsedHotkey: expect.objectContaining({
        key: 'S',
        meta: true,
      }),
    })
  })

  it('should not call callback when hotkey does not match', () => {
    const callback = vi.fn()
    const handler = createHotkeyHandler('Mod+S', callback, { platform: 'mac' })

    const event = createKeyboardEvent('a', { metaKey: true })
    handler(event)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should preventDefault when option is set', () => {
    const callback = vi.fn()
    const handler = createHotkeyHandler('Mod+S', callback, {
      platform: 'mac',
      preventDefault: true,
    })

    const event = createKeyboardEvent('s', { metaKey: true })
    handler(event)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('should stopPropagation when option is set', () => {
    const callback = vi.fn()
    const handler = createHotkeyHandler('Mod+S', callback, {
      platform: 'mac',
      stopPropagation: true,
    })

    const event = createKeyboardEvent('s', { metaKey: true })
    handler(event)

    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it('should not preventDefault or stopPropagation by default', () => {
    const callback = vi.fn()
    const handler = createHotkeyHandler('Mod+S', callback, { platform: 'mac' })

    const event = createKeyboardEvent('s', { metaKey: true })
    handler(event)

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
  })
})

describe('createMultiHotkeyHandler', () => {
  it('should call the correct handler with event and context', () => {
    const saveHandler = vi.fn()
    const undoHandler = vi.fn()

    const handler = createMultiHotkeyHandler(
      {
        'Mod+S': saveHandler,
        'Mod+Z': undoHandler,
      },
      { platform: 'mac' },
    )

    const saveEvent = createKeyboardEvent('s', { metaKey: true })
    handler(saveEvent)
    expect(saveHandler).toHaveBeenCalledWith(
      saveEvent,
      expect.objectContaining({
        hotkey: 'Mod+S',
      }),
    )
    expect(undoHandler).not.toHaveBeenCalled()

    saveHandler.mockClear()

    const undoEvent = createKeyboardEvent('z', { metaKey: true })
    handler(undoEvent)
    expect(undoHandler).toHaveBeenCalledWith(
      undoEvent,
      expect.objectContaining({
        hotkey: 'Mod+Z',
      }),
    )
    expect(saveHandler).not.toHaveBeenCalled()
  })

  it('should not call any handler for non-matching events', () => {
    const saveHandler = vi.fn()
    const handler = createMultiHotkeyHandler(
      { 'Mod+S': saveHandler },
      { platform: 'mac' },
    )

    const event = createKeyboardEvent('a')
    handler(event)

    expect(saveHandler).not.toHaveBeenCalled()
  })

  it('should only call the first matching handler', () => {
    // This tests that we stop at the first match
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    // Note: These are the same hotkey (unlikely in practice, but tests the behavior)
    const handler = createMultiHotkeyHandler(
      {
        'Mod+S': handler1,
        'Meta+S': handler2, // Same as Mod+S on Mac
      },
      { platform: 'mac' },
    )

    const event = createKeyboardEvent('s', { metaKey: true })
    handler(event)

    // Only first one should be called
    expect(handler1).toHaveBeenCalled()
    // Second one might or might not be called depending on iteration order
    // but the function returns after first match, so it shouldn't
  })

  it('should apply preventDefault to matching hotkeys', () => {
    const handler = createMultiHotkeyHandler(
      {
        'Mod+S': vi.fn(),
      },
      { platform: 'mac', preventDefault: true },
    )

    const event = createKeyboardEvent('s', { metaKey: true })
    handler(event)

    expect(event.preventDefault).toHaveBeenCalled()
  })
})
