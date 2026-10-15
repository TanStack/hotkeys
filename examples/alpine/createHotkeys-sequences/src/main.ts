import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import type { HotkeyRegistrationsResult } from '@tanstack/alpine-hotkeys'
import './index.css'

class App {
  private hotkeysScope = createHotkeysScope()

  usage0 =
    "scope.createHotkeys([\n  { hotkey: ['G', 'G'], callback: scrollToTop,\n    options: { meta: { name: 'Go to top' } } },\n  { hotkey: ['C', 'I', 'W'], callback: changeInnerWord,\n    options: { meta: { name: 'Change inner word' } } },\n])\nconst registrations = scope.createHotkeyRegistrations()"
  lastSequence: string | null = null
  history: Array<string> = []
  helloSequenceEnabled = true
  addToHistory(action: string) {
    this.lastSequence = action
    this.history = [...this.history.slice(-9), action]
  }

  init() {
    this.addToHistory = this.addToHistory.bind(this)
    this.hotkeysScope.createHotkeys(() => [
      {
        hotkey: ['G', 'G'],
        callback: () => this.addToHistory('gg → Go to top'),
        options: {
          meta: {
            name: 'Go to top',
            description: 'Scroll to the beginning of the document',
          },
        },
      },
      {
        hotkey: ['Shift+G'],
        callback: () => this.addToHistory('G → Go to bottom'),
        options: {
          meta: {
            name: 'Go to bottom',
            description: 'Scroll to the end of the document',
          },
        },
      },
      {
        hotkey: ['D', 'D'],
        callback: () => this.addToHistory('dd → Delete line'),
        options: {
          meta: { name: 'Delete line', description: 'Delete the current line' },
        },
      },
      {
        hotkey: ['Y', 'Y'],
        callback: () => this.addToHistory('yy → Yank (copy) line'),
        options: {
          meta: {
            name: 'Yank line',
            description: 'Copy the current line to clipboard',
          },
        },
      },
      {
        hotkey: ['D', 'W'],
        callback: () => this.addToHistory('dw → Delete word'),
        options: {
          meta: {
            name: 'Delete word',
            description: 'Delete from cursor to end of word',
          },
        },
      },
      {
        hotkey: ['C', 'I', 'W'],
        callback: () => this.addToHistory('ciw → Change inner word'),
        options: {
          meta: {
            name: 'Change inner word',
            description: 'Delete word under cursor and enter insert mode',
          },
        },
      },
      {
        hotkey: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
        callback: () => this.addToHistory('↑↑↓↓ → Konami code (partial)'),
        options: {
          timeout: 1500,
          meta: {
            name: 'Konami code',
            description: 'Partial Konami code using arrow keys',
          },
        },
      },
      {
        hotkey: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
        callback: () => this.addToHistory('←→←→ → Side to side!'),
        options: {
          timeout: 1500,
          meta: {
            name: 'Side to side',
            description: 'Left-right-left-right arrow pattern',
          },
        },
      },
      {
        hotkey: ['H', 'E', 'L', 'L', 'O'],
        callback: () => this.addToHistory('hello → Hello World!'),
        options: {
          enabled: this.helloSequenceEnabled,
          meta: { name: 'Hello', description: 'Spell out hello to trigger' },
        },
      },
      {
        hotkey: ['Shift+R', 'Shift+T'],
        callback: () =>
          this.addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
        options: {
          meta: {
            name: 'Chained Shift',
            description: 'Two consecutive Shift+letter chords',
          },
        },
      },
    ])
    this.hotkeysScope.createHotkey('Escape', () => {
      this.lastSequence = null
      this.history = []
    })
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}

class RegistrationsViewer {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  registrationState0!: HotkeyRegistrationsResult
  get hotkeys() {
    return this.registrationState0.hotkeys
  }
  init() {
    this.registrationState0 = this.hotkeysScope.createHotkeyRegistrations()
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.data('registrationsViewer', () => new RegistrationsViewer())
Alpine.start()
