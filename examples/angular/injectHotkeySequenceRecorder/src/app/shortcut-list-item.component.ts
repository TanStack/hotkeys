import { Component, input, output } from '@angular/core'
import {
  formatForDisplay,
  injectHeldKeys,
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
  sequence = input.required<HotkeySequence>()
  disabled = input.required<boolean>()
  liveSteps = input.required<HotkeySequence>()
  isRecording = input.required<boolean>()
  edit = output<void>()
  cancel = output<void>()

  heldKeys = injectHeldKeys()
  readonly formatForDisplay = formatForDisplay

  formatSeq(seq: HotkeySequence): string {
    return seq.map((h) => formatForDisplay(h)).join(' ')
  }
}
