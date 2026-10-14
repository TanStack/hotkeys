import Helper from '@ember/component/helper'
import { createOwnedBindings } from './bindings'
import type { EmberHotkeyCommonOptions, EmberHotkeyDefinition } from './types'

/** Registers a reactive list of hotkeys with the helper's template lifecycle. */
export class UseHotkeys extends Helper<{
  Args: {
    Positional: [ReadonlyArray<EmberHotkeyDefinition>]
    Named: EmberHotkeyCommonOptions
  }
  Return: void
}> {
  private bindings = createOwnedBindings(this)

  compute(
    [definitions]: [ReadonlyArray<EmberHotkeyDefinition>],
    options: EmberHotkeyCommonOptions,
  ): void {
    this.bindings.set(definitions, options)
  }
}
