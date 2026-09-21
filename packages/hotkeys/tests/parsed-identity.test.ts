import { afterEach, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  SequenceManager,
  createHotkeyHandler,
  formatHotkey,
  hasNonModifierKey,
  normalizeHotkeyFromParsed,
  parseHotkey,
  parseKeyboardEvent,
  rawHotkeyToParsedHotkey,
} from '../src'
import type {
  HotkeyRecorderOptions,
  ParsedHotkey,
  ParsedModifiers,
} from '../src'

const modifiers: ParsedModifiers = {
  ctrl: false,
  shift: false,
  alt: true,
  meta: false,
  modifiers: ['Alt'],
}
// Type-level regressions: neither ambiguous nor missing identity is a parsed binding.
// @ts-expect-error key and code are mutually exclusive
const both: ParsedHotkey = { ...modifiers, key: 'S', code: 'KeyS' }
// @ts-expect-error one identity must be supplied
const neither: ParsedHotkey = { ...modifiers }
void both
void neither

afterEach(() => {
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
})

it('constructs exclusive identities from strings, raw bindings, and events', () => {
  for (const parsed of [
    parseHotkey('Alt+[KeyS]'),
    rawHotkeyToParsedHotkey({ code: 'KeyS', alt: true }),
  ]) {
    expect(parsed).toEqual({ ...modifiers, code: 'KeyS' })
    expect(parsed).not.toHaveProperty('key')
    expect(formatHotkey(parsed)).toBe('Alt+[KeyS]')
    expect(normalizeHotkeyFromParsed(parsed)).toBe('Alt+[KeyS]')
  }
  for (const parsed of [
    parseHotkey('Alt+S'),
    rawHotkeyToParsedHotkey({ key: 'S', alt: true }),
    parseKeyboardEvent(
      new KeyboardEvent('keydown', { key: 's', code: 'KeyQ', altKey: true }),
      'mac',
    ),
  ]) {
    expect(parsed).toEqual({ ...modifiers, key: 'S' })
    expect(parsed).not.toHaveProperty('code')
  }
})
it('passes only physical identity to recorder validation', () => {
  const validate = vi.fn<NonNullable<HotkeyRecorderOptions['validate']>>(
    () => true,
  )
  const recorder = new HotkeyRecorder({
    platform: 'mac',
    validate,
    onRecord: vi.fn(),
  })
  try {
    recorder.start()
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ß', code: 'KeyS', altKey: true }),
    )
    expect(validate.mock.calls[0]?.[1]).toEqual({
      event: expect.any(KeyboardEvent),
      parsedHotkey: { ...modifiers, code: 'KeyS' },
    })
  } finally {
    recorder.destroy()
  }
})
it('keeps physical identity in standalone handler context', () => {
  const callback = vi.fn()
  createHotkeyHandler({ ...modifiers, code: 'KeyS' }, callback, {
    platform: 'mac',
  })(new KeyboardEvent('keydown', { key: 'ß', code: 'KeyS', altKey: true }))
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    hotkey: 'Alt+[KeyS]',
    parsedHotkey: { ...modifiers, code: 'KeyS' },
  })
})
it('synthesizes code rather than inventing a character when triggering registrations', () => {
  const single = vi.fn(),
    sequence = vi.fn()
  const manager = HotkeyManager.getInstance(),
    sequences = SequenceManager.getInstance()
  const handle = manager.register('Alt+[KeyS]', single)
  const seq = sequences.register(['[KeyG]', 'Alt+[KeyS]'], sequence)
  manager.triggerRegistration(handle.id)
  sequences.triggerSequence(seq.id)
  for (const callback of [single, sequence]) {
    expect(callback.mock.calls[0]![0].code).toBe('KeyS')
    expect(callback.mock.calls[0]![0].key).toBe('')
    expect(callback.mock.calls[0]![1].parsedHotkey).not.toHaveProperty('key')
  }
})
it('recognizes physical action keys and preserves Escape input defaults', () => {
  expect(hasNonModifierKey('[KeyS]')).toBe(true)
  expect(hasNonModifierKey('[ShiftLeft]')).toBe(false)
  expect(hasNonModifierKey('[AltRight]')).toBe(false)
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('[Escape]', vi.fn())
  expect(manager.registrations.state.get(handle.id)?.options.ignoreInputs).toBe(
    false,
  )
})
