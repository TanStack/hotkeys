import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import type { AlpineHotkeyState } from '@tanstack/alpine-hotkeys'
import './index.css'

class App {
  private hotkeysScope = createHotkeysScope()
  formatForDisplay = formatForDisplay
  usage0 =
    "const heldKeys = scope.createHeldKeys()\nconst heldCodes = scope.createHeldKeyCodes()\n\n// Read .value from Alpine templates.\n// <span x-text=\"heldKeys.value.join(' + ') || 'None'\"></span>\n// Release subscriptions in the component's destroy() hook.\nscope.destroy()"
  heldKeys!: AlpineHotkeyState<Array<string>>
  heldCodes!: AlpineHotkeyState<Record<string, string>>
  history: Array<string> = []

  init(this: App & Alpine.Magics<App>) {
    this.heldKeys = this.hotkeysScope.createHeldKeys()
    this.heldCodes = this.hotkeysScope.createHeldKeyCodes()
    this.$watch('heldKeys.value', (keys: Array<string>) => {
      if (keys.length > 0) {
        const combo = keys
          .map((k) => formatForDisplay(k, { useSymbols: true }))
          .join(' + ')
        if (this.history.at(-1) !== combo) {
          this.history = [...this.history.slice(-9), combo]
        }
      }
    })
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.start()
