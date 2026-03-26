import { Component, input, output } from '@angular/core'
import { formatForDisplay, injectHeldKeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-list-item',
  standalone: true,
  templateUrl: './shortcut-list-item.component.html',
  styleUrl: './shortcut-list-item.component.css',
})
export class ShortcutListItemComponent {
  actionName = input.required<string>()
  hotkey = input.required<string>()
  isRecording = input.required<boolean>()
  edit = output<void>()
  cancel = output<void>()

  heldKeys = injectHeldKeys()
  readonly formatForDisplay = formatForDisplay
}
