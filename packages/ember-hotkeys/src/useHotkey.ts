import Helper from '@ember/component/helper'
import { createOwnedBindings } from './bindings'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { EmberHotkeyCommonOptions } from './types'

/**
 * Registers a hotkey for the helper's template lifecycle: a chord such as
 * `"Mod+S"`, a sequence such as `(array "G" "G")`, or an app hotkey.
 *
 * Use `{{useHotkey "Mod+S" this.save enabled=this.enabled}}` in a template.
 * `undefined`, `null`, or `''` registers nothing, for an optional shortcut.
 */
export class UseHotkey extends Helper<{
  Args: {
    Positional: [
      RegisterableHotkey | AppHotkey | null | undefined,
      HotkeyCallback,
    ]
    Named: EmberHotkeyCommonOptions
  }
  Return: void
}> {
  private bindings = createOwnedBindings(this)

  compute(
    [hotkey, callback]: [
      RegisterableHotkey | AppHotkey | null | undefined,
      HotkeyCallback,
    ],
    options: EmberHotkeyCommonOptions,
  ): void {
    this.bindings.set([{ hotkey, callback, options } as never], {})
  }
}
