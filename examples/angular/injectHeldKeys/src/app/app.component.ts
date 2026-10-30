import { Component, effect, signal } from '@angular/core'
import {
  formatKeyForDisplay,
  injectHeldKeys,
  injectHeldKeyCodes,
} from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  heldKeys = injectHeldKeys()
  heldCodes = injectHeldKeyCodes()
  history = signal<string[]>([])
  readonly formatKeyForDisplay = formatKeyForDisplay

  constructor() {
    effect(() => {
      const keys = this.heldKeys()
      if (keys.length > 0) {
        const combo = keys
          .map((k) => formatKeyForDisplay(k, { useSymbols: true }))
          .join(' + ')
        this.history.update((h) => {
          if (h[h.length - 1] !== combo) {
            return [...h.slice(-9), combo]
          }
          return h
        })
      }
    })
  }

  clearHistory(): void {
    this.history.set([])
  }
}
