import { Component, signal } from '@angular/core'
import { injectHotkey, injectHotkeySequence } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  lastSequence = signal<string | null>(null)
  history = signal<string[]>([])

  constructor() {
    const addToHistory = (action: string) => {
      this.lastSequence.set(action)
      this.history.update((h) => [...h.slice(-9), action])
    }

    injectHotkeySequence(['G', 'G'], () => addToHistory('gg → Go to top'))
    injectHotkeySequence(['Shift+G'], () => addToHistory('G → Go to bottom'))
    injectHotkeySequence(['D', 'D'], () => addToHistory('dd → Delete line'))
    injectHotkeySequence(['Y', 'Y'], () =>
      addToHistory('yy → Yank (copy) line'),
    )
    injectHotkeySequence(['D', 'W'], () => addToHistory('dw → Delete word'))
    injectHotkeySequence(['C', 'I', 'W'], () =>
      addToHistory('ciw → Change inner word'),
    )

    injectHotkeySequence(
      ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
      () => addToHistory('↑↑↓↓ → Konami code (partial)'),
      { timeout: 1500 },
    )

    injectHotkeySequence(
      ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
      () => addToHistory('←→←→ → Side to side!'),
      { timeout: 1500 },
    )

    injectHotkeySequence(['H', 'E', 'L', 'L', 'O'], () =>
      addToHistory('hello → Hello World!'),
    )

    injectHotkey('Escape', () => {
      this.lastSequence.set(null)
      this.history.set([])
    })
  }

  clearHistory(): void {
    this.history.set([])
  }
}
