import { expect, it } from 'vitest'
import { LitElement } from 'lit'
import { hotkey } from '../src/decorators/hotkey'
import type {
  HotkeyCallbackContext,
  HotkeyChordCallbackContext,
  HotkeySequenceCallbackContext,
} from '@tanstack/hotkeys'

class Host extends LitElement {
  chord(_event: KeyboardEvent, _context: HotkeyChordCallbackContext) {}
  sequence(_event: KeyboardEvent, _context: HotkeySequenceCallbackContext) {}
  either(_event: KeyboardEvent, _context: HotkeyCallbackContext) {}
}

// Only type-checked; decorators.test.ts runs real `@hotkey` syntax.
function typeOnly() {
  const proto = Host.prototype
  const { chord, sequence, either } = proto
  const context = <T extends (this: Host, ...args: Array<any>) => void>(
    _method: T,
  ) => ({}) as ClassMethodDecoratorContext<Host, T>

  // Legacy decorators.
  hotkey('Mod+S')(proto, 'chord', { value: chord })
  hotkey('Mod+S')(proto, 'either', { value: either })
  hotkey(['G', 'H'])(proto, 'sequence', { value: sequence })
  hotkey(['Escape'])(proto, 'chord', { value: chord })
  // @ts-expect-error a sequence's context has no parsedChord
  hotkey(['G', 'H'])(proto, 'chord', { value: chord })
  // @ts-expect-error only Lit elements
  hotkey('Mod+S')({}, 'chord', { value: chord })

  // Standard decorators.
  hotkey('Mod+S')(chord, context(chord))
  hotkey('Mod+S')(either, context(either))
  hotkey(['G', 'H'])(sequence, context(sequence))
  // @ts-expect-error a sequence's context has no parsedChord
  hotkey(['G', 'H'])(chord, context(chord))
}

it('types the decorated method context by hotkey kind', () => {
  expect(typeOnly).toBeTypeOf('function')
})
