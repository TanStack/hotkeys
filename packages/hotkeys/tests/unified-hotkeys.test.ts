import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  HotkeyManager,
  areHotkeysEqual,
  formatForDisplay,
  isHotkeySequence,
  matchesHeldModifiers,
  normalizeRegisterableHotkey,
  simplifyHotkey,
  toHotkeyRegistrationView,
  validateHotkey,
} from '../src'
import type {
  HotkeyChordOptions,
  HotkeyOptionsFor,
  HotkeySequenceOptions,
} from '../src'

function press(key: string, init: KeyboardEventInit = {}) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, bubbles: true, ...init }),
  )
}

afterEach(() => {
  HotkeyManager.resetInstance()
})

describe('one manager for chords and sequences', () => {
  it('registers both kinds in one store with kind-specific views', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', () => {}, { platform: 'mac' })
    manager.register(['G', 'H'], () => {}, { timeout: 300 })
    const views = [...manager.registrations.state.values()].map(
      toHotkeyRegistrationView,
    )
    expect(views.map((view) => [view.kind, view.hotkey])).toEqual([
      ['chord', 'Mod+S'],
      ['sequence', ['G', 'H']],
    ])
    expect(views[1]!.options).toMatchObject({ timeout: 300 })
    expect(views[0]!.options).not.toHaveProperty('timeout')
  })

  it('registers a one-step sequence as its chord', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()
    manager.register(['Escape'], callback)
    const [registration] = manager.registrations.state.values()
    expect(registration).toMatchObject({ kind: 'chord', hotkey: 'Escape' })
    press('Escape')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('fires a chord and a sequence that share a key independently', () => {
    const manager = HotkeyManager.getInstance()
    const chord = vi.fn()
    const sequence = vi.fn()
    manager.register('G', chord)
    manager.register(['G', 'G'], sequence)
    press('g')
    press('g')
    expect(chord).toHaveBeenCalledTimes(2)
    expect(sequence).toHaveBeenCalledOnce()
    expect(sequence.mock.calls[0]![1]).toMatchObject({ hotkey: ['G', 'G'] })
  })

  it('drops options for the other kind on register and setOptions', () => {
    const manager = HotkeyManager.getInstance()
    const options = { requireReset: true, timeout: 200 }
    const chord = manager.register('A' as never, () => {}, options)
    const sequence = manager.register(['B', 'C'] as never, () => {}, options)
    sequence.setOptions({ requireReset: true } as never)
    const [chordReg, sequenceReg] = manager.registrations.state.values()
    expect(chordReg!.options).toMatchObject({ requireReset: true })
    expect(chordReg!.options).not.toHaveProperty('timeout')
    expect(sequenceReg!.options).toMatchObject({ timeout: 200 })
    expect(sequenceReg!.options).not.toHaveProperty('requireReset')
    chord.unregister()
  })

  it('types options by hotkey kind', () => {
    expectTypeOf<
      HotkeyOptionsFor<'Mod+S'>
    >().toEqualTypeOf<HotkeyChordOptions>()
    expectTypeOf<
      HotkeyOptionsFor<Array<'G'>>
    >().toEqualTypeOf<HotkeySequenceOptions>()
    expectTypeOf<
      HotkeyOptionsFor<readonly ['G']>
    >().toEqualTypeOf<HotkeyChordOptions>()
    const manager = HotkeyManager.getInstance()
    // @ts-expect-error timeout applies only to sequences
    manager.register('Mod+S', () => {}, { timeout: 1 })
    // @ts-expect-error requireReset applies only to chords
    manager.register(['G', 'G'], () => {}, { requireReset: true })
  })
})

describe('hotkey utilities accept sequences', () => {
  it('simplifyHotkey and isHotkeySequence', () => {
    expect(simplifyHotkey(['Mod+S'])).toBe('Mod+S')
    expect(simplifyHotkey(['G', 'H'])).toEqual(['G', 'H'])
    expect(isHotkeySequence(['G'])).toBe(true)
    expect(isHotkeySequence('G')).toBe(false)
  })

  it('normalizeRegisterableHotkey normalizes each step', () => {
    expect(
      normalizeRegisterableHotkey(['meta+s', 'esc'] as never, 'mac'),
    ).toEqual(['Mod+S', 'Escape'])
    expect(normalizeRegisterableHotkey(['ctrl+s'] as never, 'windows')).toBe(
      'Mod+S',
    )
  })

  it('areHotkeysEqual compares sequences step by step', () => {
    expect(areHotkeysEqual(['Mod+S', 'G'], ['Meta+S', 'G'], 'mac')).toBe(true)
    expect(areHotkeysEqual(['G', 'G'], ['G'])).toBe(false)
    expect(areHotkeysEqual(['Escape'], 'Escape')).toBe(true)
  })

  it('validateHotkey names the failing step', () => {
    expect(validateHotkey(['G', 'H']).valid).toBe(true)
    expect(validateHotkey([])).toMatchObject({ valid: false })
    expect(validateHotkey(['G', 'Hyper+H']).errors[0]).toMatch(/^Step 2: /)
  })

  it('formatForDisplay and matchesHeldModifiers accept sequences', () => {
    expect(formatForDisplay(['Mod+K', 'S'], { platform: 'windows' })).toBe(
      'Ctrl+K S',
    )
    expect(matchesHeldModifiers(['Alt+K', 'S'], ['Alt'])).toBe(true)
    expect(matchesHeldModifiers(['K', 'Alt+S'], ['Alt'])).toBe(false)
  })
})
