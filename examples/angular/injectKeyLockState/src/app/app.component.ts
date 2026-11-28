import { Component } from '@angular/core'
import { injectKeyLockState } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  capsLock = injectKeyLockState('CapsLock')
  numLock = injectKeyLockState('NumLock')
  scrollLock = injectKeyLockState('ScrollLock')

  locks = [
    { name: 'Caps Lock', state: this.capsLock },
    { name: 'Num Lock', state: this.numLock },
    { name: 'Scroll Lock', state: this.scrollLock },
  ]

  describe(state: boolean | null) {
    if (state === null) return 'Unknown'
    return state ? 'On' : 'Off'
  }
}
