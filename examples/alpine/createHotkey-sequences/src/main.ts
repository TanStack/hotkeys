import Alpine from 'alpinejs'
import { createHotkeysScope, hotkeysPlugin } from '@tanstack/alpine-hotkeys'
import './index.css'

// Gives every hotkeys scope the app's Alpine instance.
Alpine.plugin(hotkeysPlugin)

class App {
  private hotkeysScope = createHotkeysScope()

  usage0 =
    "scope.createHotkey(['G', 'G'], scrollToTop)\nscope.createHotkey(\n  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],\n  activateCheatMode,\n  { timeout: 1500 },\n)\nscope.createHotkey(['C', 'I', 'W'], changeInnerWord)\nscope.createHotkey(['Shift+[KeyR]', 'Shift+[KeyT]'], runChain)"
  lastSequence: string | null = null
  history: Array<string> = []
  helloSequenceEnabled = true
  addToHistory(action: string) {
    this.lastSequence = action
    this.history = [...this.history.slice(-9), action]
  }

  init() {
    this.addToHistory = this.addToHistory.bind(this)
    this.hotkeysScope.createHotkey(['G', 'G'], () =>
      this.addToHistory('gg → Go to top'),
    )
    this.hotkeysScope.createHotkey(['Shift+G'], () =>
      this.addToHistory('G → Go to bottom'),
    )
    this.hotkeysScope.createHotkey(['D', 'D'], () =>
      this.addToHistory('dd → Delete line'),
    )
    this.hotkeysScope.createHotkey(['Y', 'Y'], () =>
      this.addToHistory('yy → Yank (copy) line'),
    )
    this.hotkeysScope.createHotkey(['D', 'W'], () =>
      this.addToHistory('dw → Delete word'),
    )
    this.hotkeysScope.createHotkey(['C', 'I', 'W'], () =>
      this.addToHistory('ciw → Change inner word'),
    )
    this.hotkeysScope.createHotkey(
      ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
      () => this.addToHistory('↑↑↓↓ → Konami code (partial)'),
      { timeout: 1500 },
    )
    this.hotkeysScope.createHotkey(
      ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
      () => this.addToHistory('←→←→ → Side to side!'),
      { timeout: 1500 },
    )
    this.hotkeysScope.createHotkey(
      ['H', 'E', 'L', 'L', 'O'],
      () => this.addToHistory('hello → Hello World!'),
      () => ({ enabled: this.helloSequenceEnabled }),
    )
    this.hotkeysScope.createHotkey(['Shift+[KeyR]', 'Shift+[KeyT]'], () =>
      this.addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
    )
    this.hotkeysScope.createHotkey('Escape', () => {
      this.lastSequence = null
      this.history = []
    })
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.start()
