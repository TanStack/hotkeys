import { afterEach, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  createHotkeyChordHandler,
  formatHotkey,
  hasNonModifierKey,
  normalizeHotkey,
  parseHotkey,
  parseKeyboardEvent,
} from '../src'
import type {
  HotkeyChordRecorderOptions,
  ParsedHotkeyChord,
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
const both: ParsedHotkeyChord = { ...modifiers, key: 'S', code: 'KeyS' }
// @ts-expect-error one identity must be supplied
const neither: ParsedHotkeyChord = { ...modifiers }
void both
void neither

afterEach(() => {
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
  HotkeyManager.resetInstance()
})

it('constructs exclusive identities from strings, raw bindings, and events', () => {
  for (const parsed of [
    parseHotkey('Alt+[KeyS]'),
    parseHotkey({ code: 'KeyS', alt: true }),
  ]) {
    expect(parsed).toEqual({ ...modifiers, code: 'KeyS' })
    expect(parsed).not.toHaveProperty('key')
    expect(formatHotkey(parsed)).toBe('Alt+[KeyS]')
    expect(normalizeHotkey(parsed)).toBe('Alt+[KeyS]')
  }
  for (const parsed of [
    parseHotkey('Alt+S'),
    parseHotkey({ key: 'S', alt: true }),
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
  const validate = vi.fn<NonNullable<HotkeyChordRecorderOptions['validate']>>(
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
      kind: 'chord',
      event: expect.any(KeyboardEvent),
      parsedChord: { ...modifiers, code: 'KeyS' },
    })
  } finally {
    recorder.destroy()
  }
})
it('keeps physical identity in standalone handler context', () => {
  const callback = vi.fn()
  createHotkeyChordHandler({ ...modifiers, code: 'KeyS' }, callback, {
    platform: 'mac',
  })(new KeyboardEvent('keydown', { key: 'ß', code: 'KeyS', altKey: true }))
  expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), {
    kind: 'chord',
    hotkey: 'Alt+[KeyS]',
    parsedChord: { ...modifiers, code: 'KeyS' },
  })
})
it('recognizes physical action keys and preserves Escape input defaults', () => {
  expect(hasNonModifierKey('[KeyS]')).toBe(true)
  expect(hasNonModifierKey('[ShiftLeft]')).toBe(false)
  expect(hasNonModifierKey('[AltRight]')).toBe(false)
  const manager = HotkeyManager.getInstance()
  const callback = vi.fn()
  const handle = manager.register('[Escape]', callback)
  expect(manager.registrations.state.get(handle.id)?.options.ignoreInputs).toBe(
    'auto',
  )

  const input = document.createElement('input')
  document.body.appendChild(input)
  input.focus()
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
    }),
  )
  expect(callback).toHaveBeenCalledOnce()
  input.remove()
})
