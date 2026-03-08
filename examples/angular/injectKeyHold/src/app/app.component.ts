import { Component } from '@angular/core'
import { injectKeyHold } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  isShiftHeld = injectKeyHold('Shift')
  isControlHeld = injectKeyHold('Control')
  isAltHeld = injectKeyHold('Alt')
  isMetaHeld = injectKeyHold('Meta')
  isSpaceHeld = injectKeyHold('Space')
}
