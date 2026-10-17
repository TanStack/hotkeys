import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  HotkeyManager,
  areHotkeysEqual,
  createSequenceMatcher,
  formatForDisplay,
  formatHotkey,
  isHotkeySequence,
  matchesHeldModifiers,
  normalizeHotkey,
  parseHotkey,
  simplifyHotkey,
  toHotkeyRegistrationView,
  validateHotkey,
} from '../src'
import type {
  Hotkey,
  HotkeyCallbackContext,
  HotkeyCallbackContextFor,
  HotkeyChordCallbackContext,
  HotkeyChordOptions,
  HotkeyOptionsFor,
  HotkeyRegistrationHandle,
  HotkeySequenceCallbackContext,
  HotkeySequence,
  HotkeySequenceOptions,
  RegisterableHotkey,
  RegisterableHotkeySequence,
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

  it('fires a chord on a first step but not on a key the sequence continues', () => {
    const manager = HotkeyManager.getInstance()
    const chord = vi.fn()
    const sequence = vi.fn()
    manager.register('G', chord)
    manager.register(['G', 'G'], sequence)
    press('g')
    press('g')
    expect(chord).toHaveBeenCalledOnce()
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

  it('passes kind-specific callback context', () => {
    const manager = HotkeyManager.getInstance()
    const chord = vi.fn()
    const sequence = vi.fn()
    const oneStep = vi.fn()
    manager.register('Mod+S', chord, { platform: 'mac' })
    manager.register(['G', 'H'], sequence)
    manager.register(['Escape'], oneStep)
    press('s', { metaKey: true })
    press('g')
    press('h')
    press('Escape')
    expect(chord.mock.calls[0]![1]).toEqual({
      kind: 'chord',
      hotkey: 'Mod+S',
      parsedChord: expect.objectContaining({ key: 'S', meta: true }),
    })
    expect(sequence.mock.calls[0]![1]).toEqual({
      kind: 'sequence',
      hotkey: ['G', 'H'],
      parsedSequence: [
        expect.objectContaining({ key: 'G' }),
        expect.objectContaining({ key: 'H' }),
      ],
    })
    expect(oneStep.mock.calls[0]![1]).toMatchObject({
      kind: 'chord',
      hotkey: 'Escape',
    })
  })

  it('types callback context by hotkey kind', () => {
    expectTypeOf<
      HotkeyCallbackContextFor<'Mod+S'>
    >().toEqualTypeOf<HotkeyChordCallbackContext>()
    expectTypeOf<
      HotkeyCallbackContextFor<readonly ['G', 'H']>
    >().toEqualTypeOf<HotkeySequenceCallbackContext>()
    expectTypeOf<
      HotkeyCallbackContextFor<readonly ['G']>
    >().toEqualTypeOf<HotkeyChordCallbackContext>()
    expectTypeOf<
      HotkeyCallbackContextFor<Hotkey>
    >().toEqualTypeOf<HotkeyCallbackContext>()

    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', (_event, context) => {
      expectTypeOf(context).toEqualTypeOf<HotkeyChordCallbackContext>()
    })
    manager.register({ key: 'S', mod: true }, (_event, context) => {
      expectTypeOf(context).toEqualTypeOf<HotkeyChordCallbackContext>()
    })
    manager.register(['G', 'H'], (_event, context) => {
      expectTypeOf(context).toEqualTypeOf<HotkeySequenceCallbackContext>()
    })
    manager.register(['Escape'], (_event, context) => {
      expectTypeOf(context).toEqualTypeOf<HotkeyChordCallbackContext>()
    })
    const loadHotkey = (): Hotkey => 'G'
    manager.register(loadHotkey(), (_event, context) => {
      expectTypeOf(context).toEqualTypeOf<HotkeyCallbackContext>()
    })
    // @ts-expect-error a sequence's context has no parsedChord
    manager.register(['G', 'H'], (_event, context) => context.parsedChord)
    const handle = manager.register('Mod+K', () => {})
    handle.callback = (_event, context) => {
      expectTypeOf(context).toEqualTypeOf<HotkeyCallbackContext>()
    }
    const handles: Array<HotkeyRegistrationHandle> = [
      handle,
      manager.register(['G', 'G'], () => {}),
    ]
    expect(handles).toHaveLength(2)
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

describe('sequence steps written as objects', () => {
  it('registers object steps as strings and passes the parsed steps', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()
    manager.register([{ key: 'K', mod: true }, 'C'], callback, {
      platform: 'mac',
    })
    const [registration] = manager.registrations.state.values()
    expect(registration).toMatchObject({
      kind: 'sequence',
      hotkey: ['Meta+K', 'C'],
    })
    press('k', { metaKey: true })
    press('c')
    expect(callback).toHaveBeenCalledOnce()
    expect(callback.mock.calls[0]![1]).toEqual({
      kind: 'sequence',
      hotkey: ['Meta+K', 'C'],
      parsedSequence: [
        expect.objectContaining({ key: 'K', meta: true }),
        expect.objectContaining({ key: 'C', meta: false }),
      ],
    })
  })

  it('parses, normalizes, formats, compares, and matches object steps', () => {
    const sequence = [{ key: 'K', mod: true }, 'Shift+G'] as const
    expect(parseHotkey(sequence, 'windows')).toEqual([
      expect.objectContaining({ key: 'K', ctrl: true }),
      expect.objectContaining({ key: 'G', shift: true }),
    ])
    expect(normalizeHotkey(sequence, 'windows')).toEqual(['Mod+K', 'Shift+G'])
    expect(formatHotkey(parseHotkey(sequence, 'windows'))).toEqual([
      'Control+K',
      'Shift+G',
    ])
    expect(formatForDisplay(sequence, { platform: 'windows' })).toBe(
      'Ctrl+K Shift+G',
    )
    expect(areHotkeysEqual(sequence, ['Mod+K', 'Shift+G'], 'windows')).toBe(
      true,
    )
    const matcher = createSequenceMatcher([{ key: 'G' }, { key: 'H' }])
    matcher.match(new KeyboardEvent('keydown', { key: 'g' }))
    expect(matcher.match(new KeyboardEvent('keydown', { key: 'h' }))).toBe(true)
  })

  it('types object-step sequences as sequences', () => {
    expectTypeOf<
      HotkeyCallbackContextFor<readonly [{ key: 'K'; mod: true }, 'C']>
    >().toEqualTypeOf<HotkeySequenceCallbackContext>()
    expectTypeOf<
      HotkeyOptionsFor<readonly [{ key: 'K'; mod: true }, 'C']>
    >().toEqualTypeOf<HotkeySequenceOptions>()
    const hotkey = (): RegisterableHotkey => [{ key: 'K', mod: true }, 'C']
    const value = hotkey()
    if (isHotkeySequence(value)) {
      expectTypeOf(value).toEqualTypeOf<RegisterableHotkeySequence>()
    }
    const stored = (): Hotkey => ['G', 'H']
    const storedValue = stored()
    if (isHotkeySequence(storedValue)) {
      expectTypeOf(storedValue).toEqualTypeOf<HotkeySequence>()
    }
    HotkeyManager.getInstance().register(
      [{ key: 'K', mod: true }, 'C'],
      (_event, context) => {
        expectTypeOf(context).toEqualTypeOf<HotkeySequenceCallbackContext>()
      },
      { timeout: 500 },
    )
  })
})

describe('hotkey utilities accept sequences', () => {
  it('simplifyHotkey and isHotkeySequence', () => {
    expect(simplifyHotkey(['Mod+S'])).toBe('Mod+S')
    expect(simplifyHotkey(['G', 'H'])).toEqual(['G', 'H'])
    expect(isHotkeySequence(['G'])).toBe(true)
    expect(isHotkeySequence('G')).toBe(false)
  })

  it('normalizeHotkey normalizes each step', () => {
    expect(normalizeHotkey(['meta+s', 'esc'] as never, 'mac')).toEqual([
      'Mod+S',
      'Escape',
    ])
    expect(normalizeHotkey(['ctrl+s'] as never, 'windows')).toBe('Mod+S')
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
