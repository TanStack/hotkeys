import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createHotkeyBindings } from '@tanstack/hotkeys/adapter'
import type { HotkeyOptions } from '@tanstack/hotkeys'
import type { HotkeyDefinition } from '@tanstack/hotkeys/adapter'

/** Registers a reactive list of shortcuts with the helper's template lifecycle. */
export class UseHotkeys extends Helper<{
  Args: { Positional: [Array<HotkeyDefinition>]; Named: HotkeyOptions }
  Return: void
}> {
  private bindings = createHotkeyBindings()
  private definitions: Array<HotkeyDefinition> = []
  private options: HotkeyOptions = {}
  private cleanup = registerDestructor(this, () => this.bindings.destroy())

  compute(
    [definitions]: [Array<HotkeyDefinition>],
    options: HotkeyOptions,
  ): void {
    void this.cleanup
    // Read getters while Ember tracks this helper, before scheduling mutations.
    this.definitions = definitions.map((definition) => ({
      ...definition,
      hotkey:
        typeof definition.hotkey === 'string'
          ? definition.hotkey
          : { ...definition.hotkey },
      options: { ...definition.options },
    }))
    this.options = { ...options }
    scheduleOnce('afterRender', this, this.update)
  }

  private update(): void {
    if (!isDestroying(this) && !isDestroyed(this)) {
      this.bindings.update(this.definitions, this.options)
    }
  }
}
