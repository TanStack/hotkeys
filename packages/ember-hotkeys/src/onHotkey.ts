import Modifier from 'ember-modifier'
import { createOwnedBindings } from './bindings'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { ElementHotkeyOptions } from './onHotkeys'

/** Attaches a hotkey (chord, sequence, or app hotkey) to the element that owns the modifier. */
export class OnHotkey extends Modifier<{
  Element: HTMLElement
  Args: {
    Positional: [RegisterableHotkey | AppHotkey, HotkeyCallback]
    Named: ElementHotkeyOptions
  }
}> {
  private bindings = createOwnedBindings(this)

  override modify(
    element: HTMLElement,
    [hotkey, callback]: [RegisterableHotkey | AppHotkey, HotkeyCallback],
    options: ElementHotkeyOptions,
  ): void {
    this.bindings.set([{ hotkey, callback, options } as never], {}, element)
  }
}
