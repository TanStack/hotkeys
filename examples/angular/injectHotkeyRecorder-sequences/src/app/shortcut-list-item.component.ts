import { Component, input, output } from '@angular/core'
import {
  formatForDisplay,
  formatKeyForDisplay,
  injectHeldKeys,
  type Hotkey,
  type HotkeySequence,
} from '@tanstack/angular-hotkeys'

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
  readonly formatForDisplay = formatForDisplay
  readonly formatKeyForDisplay = formatKeyForDisplay
}
