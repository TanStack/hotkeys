import Modifier from 'ember-modifier'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createHotkeyBindings } from '@tanstack/hotkeys/adapter'
import type { HotkeyOptions } from '@tanstack/hotkeys'
import type { HotkeyDefinition } from '@tanstack/hotkeys/adapter'

/** Options for a modifier whose target is always its containing element. */
export type ElementHotkeyOptions = Omit<HotkeyOptions, 'target'>

/** Attach a reactive list of shortcuts directly to an element. */
export class OnHotkeys extends Modifier<{
  Element: HTMLElement
  Args: {
    Positional: [Array<HotkeyDefinition>]
    Named: ElementHotkeyOptions
  }
}> {
  private bindings = createHotkeyBindings()
  private definitions: Array<HotkeyDefinition> = []
  private options: HotkeyOptions = {}
  private cleanup = registerDestructor(this, () => this.bindings.destroy())

  override modify(
    element: HTMLElement,
    [definitions]: [Array<HotkeyDefinition>],
    options: ElementHotkeyOptions,
  ): void {
    void this.cleanup
    // Consume tracked arguments here; publish registration changes after rendering.
    this.definitions = definitions.map((definition) => ({
      ...definition,
      hotkey:
        typeof definition.hotkey === 'string'
          ? definition.hotkey
          : { ...definition.hotkey },
      options: { ...definition.options, target: element },
    }))
    this.options = { ...options, target: element }
    scheduleOnce('afterRender', this, this.update)
  }

  private update(): void {
    if (!isDestroying(this) && !isDestroyed(this)) {
      this.bindings.update(this.definitions, this.options)
    }
  }
}
