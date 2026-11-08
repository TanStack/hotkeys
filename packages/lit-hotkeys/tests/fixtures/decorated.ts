// Real `@hotkey` syntax. decorators.test.ts compiles this file with legacy
// and standard decorators, type-checks it, and runs it.
import { LitElement } from 'lit'
import { hotkey } from '../../src/decorators/hotkey'
import type {
  HotkeyCallbackContext,
  HotkeyChordCallbackContext,
  HotkeySequenceCallbackContext,
} from '@tanstack/hotkeys'

export class DecoratedBase extends LitElement {
  calls: Array<string> = []

  @hotkey('K')
  onK() {
    this.calls.push('base')
  }

  @hotkey(['G', 'H'])
  goHome(_event: KeyboardEvent, context: HotkeySequenceCallbackContext) {
    this.calls.push(context.hotkey.join(' '))
  }

  @hotkey('Control+S')
  save(_event: KeyboardEvent, context: HotkeyChordCallbackContext) {
    this.calls.push(`${context.parsedChord.key}`)
  }

  @hotkey('Mod+E')
  either(_event: KeyboardEvent, _context: HotkeyCallbackContext) {}

  // @ts-expect-error a sequence's context has no parsedChord
  @hotkey(['G', 'J'])
  wrongKind(_event: KeyboardEvent, _context: HotkeyChordCallbackContext) {}
}

export class DecoratedSub extends DecoratedBase {
  override onK() {
    this.calls.push('sub')
  }
}

// Re-decorating an override replaces the parent's hotkey for that method.
export class DecoratedSameKey extends DecoratedBase {
  @hotkey('K')
  override onK() {
    this.calls.push('same key')
  }
}

export class DecoratedNewKey extends DecoratedBase {
  @hotkey('J')
  override onK() {
    this.calls.push('new key')
  }
}

// An undecorated override keeps the nearest decorated hotkey.
export class DecoratedGrandchild extends DecoratedNewKey {
  override onK() {
    this.calls.push('grandchild')
  }
}

export class DecoratedStacked extends LitElement {
  calls: Array<string> = []

  @hotkey('A')
  @hotkey('B')
  both() {
    this.calls.push('both')
  }
}

export class DecoratedRestacked extends DecoratedStacked {
  @hotkey('C')
  @hotkey('D')
  override both() {
    this.calls.push('restacked')
  }
}
