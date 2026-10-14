import Modifier from 'ember-modifier'
import { createOwnedBindings } from './bindings'
import type { EmberHotkeyCommonOptions, EmberHotkeyDefinition } from './types'

/** Options for a modifier whose target is always its containing element. */
export type ElementHotkeyOptions = Omit<EmberHotkeyCommonOptions, 'target'>

/** Attach a reactive list of hotkeys directly to an element. */
export class OnHotkeys extends Modifier<{
  Element: HTMLElement
  Args: {
    Positional: [ReadonlyArray<EmberHotkeyDefinition>]
    Named: ElementHotkeyOptions
  }
}> {
  private bindings = createOwnedBindings(this)

  override modify(
    element: HTMLElement,
    [definitions]: [ReadonlyArray<EmberHotkeyDefinition>],
    options: ElementHotkeyOptions,
  ): void {
    this.bindings.set(definitions, options, element)
  }
}
