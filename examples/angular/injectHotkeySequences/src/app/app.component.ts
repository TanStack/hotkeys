import { Component, signal } from '@angular/core'
import {
  formatForDisplay,
  injectHotkey,
  injectHotkeyRegistrations,
  injectHotkeySequences,
} from '@tanstack/angular-hotkeys'
import type { Hotkey } from '@tanstack/angular-hotkeys'

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

  formatForDisplay = formatForDisplay
  readonly registrations = injectHotkeyRegistrations()

  constructor() {
    const addToHistory = (action: string) => {
      this.lastSequence.set(action)
      this.history.update((h) => [...h.slice(-9), action])
    }

    injectHotkeySequences([
      {
        sequence: ['G', 'G'],
        callback: () => addToHistory('gg → Go to top'),
        options: {
          meta: {
            name: 'Go to top',
            description: 'Scroll to the beginning of the document',
          },
        },
      },
      {
        sequence: ['Shift+G'],
        callback: () => addToHistory('G → Go to bottom'),
        options: {
          meta: {
            name: 'Go to bottom',
            description: 'Scroll to the end of the document',
          },
        },
      },
      {
        sequence: ['D', 'D'],
        callback: () => addToHistory('dd → Delete line'),
        options: {
          meta: {
            name: 'Delete line',
            description: 'Delete the current line',
          },
        },
      },
      {
        sequence: ['Y', 'Y'],
        callback: () => addToHistory('yy → Yank (copy) line'),
        options: {
          meta: {
            name: 'Yank line',
            description: 'Copy the current line to clipboard',
          },
        },
      },
      {
        sequence: ['D', 'W'],
        callback: () => addToHistory('dw → Delete word'),
        options: {
          meta: {
            name: 'Delete word',
            description: 'Delete from cursor to end of word',
          },
        },
      },
      {
        sequence: ['C', 'I', 'W'],
        callback: () => addToHistory('ciw → Change inner word'),
        options: {
          meta: {
            name: 'Change inner word',
            description: 'Delete word under cursor and enter insert mode',
          },
        },
      },
      {
        sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
        callback: () => addToHistory('↑↑↓↓ → Konami code (partial)'),
        options: {
          timeout: 1500,
          meta: {
            name: 'Konami code',
            description: 'Partial Konami code using arrow keys',
          },
        },
      },
      {
        sequence: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
        callback: () => addToHistory('←→←→ → Side to side!'),
        options: {
          timeout: 1500,
          meta: {
            name: 'Side to side',
            description: 'Left-right-left-right arrow pattern',
          },
        },
      },
      {
        sequence: ['H', 'E', 'L', 'L', 'O'],
        callback: () => addToHistory('hello → Hello World!'),
        options: () => ({
          enabled: this.helloSequenceEnabled(),
          meta: {
            name: 'Hello',
            description: 'Spell out hello to trigger',
          },
        }),
      },
      {
        sequence: ['Shift+R', 'Shift+T'],
        callback: () => addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
        options: {
          meta: {
            name: 'Chained Shift',
            description: 'Two consecutive Shift+letter chords',
          },
        },
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

  formatSeq(seq: Array<string>): string {
    return seq.map((h) => formatForDisplay(h as Hotkey)).join(' ')
  }
}
