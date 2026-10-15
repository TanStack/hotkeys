import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  lastSequence = signal<string | null>(null)
  history = signal<string[]>([])
  readonly helloSequenceEnabled = signal(true)

  constructor() {
    const addToHistory = (action: string) => {
      this.lastSequence.set(action)
      this.history.update((h) => [...h.slice(-9), action])
    }

    injectHotkey(['G', 'G'], () => addToHistory('gg → Go to top'))
    injectHotkey(['Shift+G'], () => addToHistory('G → Go to bottom'))
    injectHotkey(['D', 'D'], () => addToHistory('dd → Delete line'))
    injectHotkey(['Y', 'Y'], () => addToHistory('yy → Yank (copy) line'))
    injectHotkey(['D', 'W'], () => addToHistory('dw → Delete word'))
    injectHotkey(['C', 'I', 'W'], () => addToHistory('ciw → Change inner word'))

    injectHotkey(
      ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
      () => addToHistory('↑↑↓↓ → Konami code (partial)'),
      { timeout: 1500 },
    )

    injectHotkey(
      ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
      () => addToHistory('←→←→ → Side to side!'),
      { timeout: 1500 },
    )

    injectHotkey(
      ['H', 'E', 'L', 'L', 'O'],
      () => addToHistory('hello → Hello World!'),
      () => ({ enabled: this.helloSequenceEnabled() }),
    )

    injectHotkey(['Shift+R', 'Shift+T'], () =>
      addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
    )

    injectHotkey('Escape', () => {
      this.lastSequence.set(null)
      this.history.set([])
    })
  }

  clearHistory(): void {
    this.history.set([])
  }

  toggleHelloSequence(): void {
    this.helloSequenceEnabled.update((enabled) => !enabled)
  }
}
