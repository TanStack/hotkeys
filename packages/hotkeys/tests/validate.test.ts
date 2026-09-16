import { describe, expect, it, vi } from 'vitest'
import { assertValidHotkey, checkHotkey, validateHotkey } from '../src/validate'

describe('validateHotkey', () => {
  describe('valid hotkeys', () => {
    it('should validate simple letter keys', () => {
      const result = validateHotkey('A')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate hotkeys with modifiers', () => {
      expect(validateHotkey('Control+A').valid).toBe(true)
      expect(validateHotkey('Mod+S').valid).toBe(true)
      expect(validateHotkey('Control+Shift+S').valid).toBe(true)
    })

    it('should validate special keys', () => {
      expect(validateHotkey('Escape').valid).toBe(true)
      expect(validateHotkey('Enter').valid).toBe(true)
      expect(validateHotkey('F1').valid).toBe(true)
      expect(validateHotkey('ArrowUp').valid).toBe(true)
    })

    it('should validate key aliases', () => {
      expect(validateHotkey('Esc').valid).toBe(true)
      expect(validateHotkey('Return').valid).toBe(true)
      expect(validateHotkey('Del').valid).toBe(true)
      expect(validateHotkey('Mod+Plus').valid).toBe(true)
    })

    it('should validate plus keys written with a trailing plus delimiter', () => {
      const result = validateHotkey('Mod++')

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('invalid hotkeys', () => {
    it('should reject empty strings', () => {
      const result = validateHotkey('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Hotkey cannot be empty')
    })

    it('should reject whitespace-only strings', () => {
      const result = validateHotkey('   ')
      expect(result.valid).toBe(false)
    })

    it('should report unknown modifiers', () => {
      const result = validateHotkey('Unknown+A')
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Unknown modifier'))).toBe(
        true,
      )
    })
  })

  describe('warnings', () => {
    it('should not warn about safe combinations', () => {
      expect(validateHotkey('Control+A').warnings).toHaveLength(0)
      expect(validateHotkey('Mod+S').warnings).toHaveLength(0)
      expect(validateHotkey('Control+Shift+A').warnings).toHaveLength(0)
      expect(validateHotkey('Escape').warnings).toHaveLength(0)
      // event.code fallback makes these work reliably across layouts
      expect(validateHotkey('Alt+C').warnings).toHaveLength(0)
      expect(validateHotkey('Shift+2').warnings).toHaveLength(0)
      expect(validateHotkey('Alt+Shift+A').warnings).toHaveLength(0)
    })

    it('should warn about unknown keys but still be valid', () => {
      const result = validateHotkey('Control+SomeWeirdKey')
      expect(result.valid).toBe(true) // Unknown keys are warnings, not errors
      expect(result.warnings.some((w) => w.includes('Unknown key'))).toBe(true)
    })
  })
})

describe('assertValidHotkey', () => {
  it('should not throw for valid hotkeys', () => {
    expect(() => assertValidHotkey('Control+A')).not.toThrow()
    expect(() => assertValidHotkey('Mod+S')).not.toThrow()
    expect(() => assertValidHotkey('Escape')).not.toThrow()
  })

  it('should throw for invalid hotkeys', () => {
    expect(() => assertValidHotkey('')).toThrow('Invalid hotkey')
    expect(() => assertValidHotkey('Unknown+A')).toThrow('Invalid hotkey')
  })

  it('should include error message in thrown error', () => {
    expect(() => assertValidHotkey('')).toThrow('Hotkey cannot be empty')
  })
})

describe('checkHotkey', () => {
  it('should return true for valid hotkeys', () => {
    expect(checkHotkey('Control+A')).toBe(true)
  })

  it('should return false for invalid hotkeys', () => {
    // Suppress console output for this test
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(checkHotkey('')).toBe(false)
    errorSpy.mockRestore()
  })

  it('should log warnings to console', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    checkHotkey('Control+SomeWeirdKey')

    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy.mock.calls[0]?.[0]).toContain('Control+SomeWeirdKey')

    warnSpy.mockRestore()
  })

  it('should log errors to console', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    checkHotkey('')

    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
