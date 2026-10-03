import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createHotkeyBindings } from '@tanstack/hotkeys/adapter'
import type {
  HotkeyCallback,
  HotkeyOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { HotkeyDefinition } from '@tanstack/hotkeys/adapter'

/** Use {{useHotkey "Mod+S" this.save enabled=this.enabled}} in a template. */
export class UseHotkey extends Helper<{
  Args: {
    Positional: [RegisterableHotkey, HotkeyCallback]
    Named: HotkeyOptions
  }
  Return: void
}> {
  private bindings = createHotkeyBindings()
  private definition: HotkeyDefinition | undefined
  private cleanup = registerDestructor(this, () => this.bindings.destroy())

  compute(
    [hotkey, callback]: [RegisterableHotkey, HotkeyCallback],
    options: HotkeyOptions,
  ): void {
    void this.cleanup
    this.definition = {
      hotkey: typeof hotkey === 'string' ? hotkey : { ...hotkey },
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
