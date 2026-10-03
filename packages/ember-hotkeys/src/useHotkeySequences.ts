import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createHotkeySequenceBindings } from '@tanstack/hotkeys/adapter'
import type { SequenceOptions } from '@tanstack/hotkeys'
import type { HotkeySequenceDefinition } from '@tanstack/hotkeys/adapter'

/** Registers a reactive list of sequences with the helper's template lifecycle. */
export class UseHotkeySequences extends Helper<{
  Args: {
    Positional: [Array<HotkeySequenceDefinition>]
    Named: SequenceOptions
  }
  Return: void
}> {
  private bindings = createHotkeySequenceBindings()
  private definitions: Array<HotkeySequenceDefinition> = []
  private options: SequenceOptions = {}
  private cleanup = registerDestructor(this, () => this.bindings.destroy())

  compute(
    [definitions]: [Array<HotkeySequenceDefinition>],
    options: SequenceOptions,
  ): void {
    void this.cleanup
    // Read getters while Ember tracks this helper, before scheduling mutations.
    this.definitions = definitions.map((definition) => ({
      ...definition,
      sequence: [...definition.sequence],
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
