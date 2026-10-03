import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'
import './index.css'

class App {
  private hotkeysScope = createHotkeysScope()

  usage0 =
    "scope.createHotkeySequence(['G', 'G'], scrollToTop)\nscope.createHotkeySequence(\n  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],\n  activateCheatMode,\n  { timeout: 1500 },\n)\nscope.createHotkeySequence(['C', 'I', 'W'], changeInnerWord)\nscope.createHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], runChain)"
  lastSequence: string | null = null
  history: Array<string> = []
  helloSequenceEnabled = true
  addToHistory(action: string) {
    this.lastSequence = action
    this.history = [...this.history.slice(-9), action]
  }

  init() {
    this.addToHistory = this.addToHistory.bind(this)
    this.hotkeysScope.createHotkeySequence(['G', 'G'], () =>
      this.addToHistory('gg → Go to top'),
    )
    this.hotkeysScope.createHotkeySequence(['Shift+G'], () =>
      this.addToHistory('G → Go to bottom'),
    )
    this.hotkeysScope.createHotkeySequence(['D', 'D'], () =>
      this.addToHistory('dd → Delete line'),
    )
    this.hotkeysScope.createHotkeySequence(['Y', 'Y'], () =>
      this.addToHistory('yy → Yank (copy) line'),
    )
    this.hotkeysScope.createHotkeySequence(['D', 'W'], () =>
      this.addToHistory('dw → Delete word'),
    )
    this.hotkeysScope.createHotkeySequence(['C', 'I', 'W'], () =>
      this.addToHistory('ciw → Change inner word'),
    )
    this.hotkeysScope.createHotkeySequence(
      ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
      () => this.addToHistory('↑↑↓↓ → Konami code (partial)'),
      { timeout: 1500 },
    )
    this.hotkeysScope.createHotkeySequence(
      ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
      () => this.addToHistory('←→←→ → Side to side!'),
      { timeout: 1500 },
    )
    this.hotkeysScope.createHotkeySequence(
      ['H', 'E', 'L', 'L', 'O'],
      () => this.addToHistory('hello → Hello World!'),
      () => ({ enabled: this.helloSequenceEnabled }),
    )
    this.hotkeysScope.createHotkeySequence(
      ['Shift+[KeyR]', 'Shift+[KeyT]'],
      () => this.addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
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
