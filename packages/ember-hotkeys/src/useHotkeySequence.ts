import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createHotkeySequenceBindings } from '@tanstack/hotkeys/adapter'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
} from '@tanstack/hotkeys'
import type { HotkeySequenceDefinition } from '@tanstack/hotkeys/adapter'

/** Use {{useHotkeySequence this.sequence this.run}} in a template. */
export class UseHotkeySequence extends Helper<{
  Args: { Positional: [HotkeySequence, HotkeyCallback]; Named: SequenceOptions }
  Return: void
}> {
  private bindings = createHotkeySequenceBindings()
  private definition: HotkeySequenceDefinition | undefined
  private cleanup = registerDestructor(this, () => this.bindings.destroy())

  compute(
    [sequence, callback]: [HotkeySequence, HotkeyCallback],
    options: SequenceOptions,
  ): void {
    void this.cleanup
    this.definition = {
      sequence: [...sequence],
      callback,
      options: { ...options },
    }
    scheduleOnce('afterRender', this, this.update)
  }

  private update(): void {
    if (this.definition && !isDestroying(this) && !isDestroyed(this)) {
      this.bindings.update([this.definition])
    }
  }
}
