import { expect, it } from 'vitest'
import { hotkey } from '../src/decorators/hotkey'
import type { LitElement } from 'lit'
import type {
  HotkeyCallbackContext,
  HotkeyChordCallbackContext,
  HotkeySequenceCallbackContext,
} from '@tanstack/hotkeys'

it('types the decorated method context by hotkey kind', () => {
  const proto = {} as LitElement
  const chordMethod = (
    _event: KeyboardEvent,
    _context: HotkeyChordCallbackContext,
  ) => {}
  const sequenceMethod = (
    _event: KeyboardEvent,
    _context: HotkeySequenceCallbackContext,
  ) => {}
  const eitherMethod = (
    _event: KeyboardEvent,
    _context: HotkeyCallbackContext,
  ) => {}

  hotkey('Mod+S')(proto, 'save', { value: chordMethod })
  hotkey('Mod+S')(proto, 'saveEither', { value: eitherMethod })
  hotkey(['G', 'H'])(proto, 'goHome', { value: sequenceMethod })
  hotkey(['Escape'])(proto, 'close', { value: chordMethod })
  // @ts-expect-error a sequence's context has no parsedChord
  hotkey(['G', 'H'])(proto, 'wrongKind', { value: chordMethod })

  expect(typeof proto.connectedCallback).toBe('function')
})
