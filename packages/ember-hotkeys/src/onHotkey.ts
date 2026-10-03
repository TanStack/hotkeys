import Modifier from 'ember-modifier'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { createHotkeyBindings } from '@tanstack/hotkeys/adapter'
import type { HotkeyCallback, RegisterableHotkey } from '@tanstack/hotkeys'
import type { HotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type { ElementHotkeyOptions } from './onHotkeys'

/** Attaches a shortcut to the element that owns the modifier. */
export class OnHotkey extends Modifier<{
  Element: HTMLElement
  Args: {
    Positional: [RegisterableHotkey, HotkeyCallback]
    Named: ElementHotkeyOptions
  }
}> {
  private bindings = createHotkeyBindings()
  private definition: HotkeyDefinition | undefined
  private cleanup = registerDestructor(this, () => this.bindings.destroy())

  override modify(
    element: HTMLElement,
    [hotkey, callback]: [RegisterableHotkey, HotkeyCallback],
    options: ElementHotkeyOptions,
  ): void {
    void this.cleanup
    this.definition = {
      hotkey: typeof hotkey === 'string' ? hotkey : { ...hotkey },
      callback,
      options: { ...options, target: element },
    }
    scheduleOnce('afterRender', this, this.update)
  }

  private update(): void {
    if (this.definition && !isDestroying(this) && !isDestroyed(this)) {
      this.bindings.update([this.definition])
    }
  }
}
