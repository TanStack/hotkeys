import { Component, signal } from '@angular/core'
import { injectHotkey, injectHotkeySequences } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  lastSequence = signal<string | null>(null)
  history = signal<Array<string>>([])
  readonly helloSequenceEnabled = signal(true)

  constructor() {
    const addToHistory = (action: string) => {
      this.lastSequence.set(action)
      this.history.update((h) => [...h.slice(-9), action])
    }

    injectHotkeySequences([
      {
        sequence: ['G', 'G'],
        callback: () => addToHistory('gg → Go to top'),
      },
      {
        sequence: ['Shift+G'],
        callback: () => addToHistory('G → Go to bottom'),
      },
      {
        sequence: ['D', 'D'],
        callback: () => addToHistory('dd → Delete line'),
      },
      {
        sequence: ['Y', 'Y'],
        callback: () => addToHistory('yy → Yank (copy) line'),
      },
      {
        sequence: ['D', 'W'],
        callback: () => addToHistory('dw → Delete word'),
      },
      {
        sequence: ['C', 'I', 'W'],
        callback: () => addToHistory('ciw → Change inner word'),
      },
      {
        sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
        callback: () => addToHistory('↑↑↓↓ → Konami code (partial)'),
        options: { timeout: 1500 },
      },
      {
        sequence: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
        callback: () => addToHistory('←→←→ → Side to side!'),
        options: { timeout: 1500 },
      },
      {
        sequence: ['H', 'E', 'L', 'L', 'O'],
        callback: () => addToHistory('hello → Hello World!'),
        options: () => ({ enabled: this.helloSequenceEnabled() }),
      },
      {
        sequence: ['Shift+R', 'Shift+T'],
        callback: () => addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
      },
    ])

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
