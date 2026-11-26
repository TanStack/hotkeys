import { Component, computed, input, output } from '@angular/core'
import {
  injectFormatForDisplay,
  injectHeldKeys,
  type Hotkey,
  type HotkeySequence,
} from '@tanstack/angular-hotkeys'

const MODIFIER_ORDER = ['Control', 'Alt', 'Shift', 'Meta']

@Component({
  selector: 'app-shortcut-list-item',
  standalone: true,
  templateUrl: './shortcut-list-item.component.html',
  styleUrl: './shortcut-list-item.component.css',
})
export class ShortcutListItemComponent {
  actionName = input.required<string>()
  hotkey = input.required<Hotkey>()
  disabled = input.required<boolean>()
  liveSteps = input.required<HotkeySequence>()
  isRecording = input.required<boolean>()
  edit = output<void>()
  cancel = output<void>()

  heldKeys = injectHeldKeys()
  // Held modifiers in chord order, with platform labels: ⌃ ⌥ ⇧ ⌘ on macOS,
  // Ctrl Alt Shift Win elsewhere. The next other key ends the step.
  readonly heldModifiers = computed(() =>
    this.heldKeys()
      .filter((key) => MODIFIER_ORDER.includes(key))
      .sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b)),
  )
  readonly formatForDisplay = injectFormatForDisplay()
}
