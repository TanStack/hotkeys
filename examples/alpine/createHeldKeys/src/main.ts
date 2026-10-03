import Alpine from 'alpinejs'
import {
  createHotkeysScope,
  formatForDisplay,
  getKeyStateTracker,
} from '@tanstack/alpine-hotkeys'
import './index.css'

class App {
  private hotkeysScope = createHotkeysScope()
  private cleanups: Array<() => void> = []
  formatForDisplay = formatForDisplay
  usage0 =
    "const heldKeys = scope.createHeldKeys()\nconst heldCodes = scope.createHeldKeyCodes()\n\n// Read .value from Alpine templates.\n// <span x-text=\"heldKeys.value.join(' + ') || 'None'\"></span>\n// Release subscriptions in the component's destroy() hook.\nscope.destroy()"
  heldKeysState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHeldKeys']
  >
  heldCodesState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createHeldKeyCodes']
  >
  history: Array<string> = []
  get heldKeys() {
    return this.heldKeysState.value
  }
  get heldCodes() {
    return this.heldCodesState.value
  }

  init() {
    this.heldKeysState = this.hotkeysScope.createHeldKeys()
    this.heldCodesState = this.hotkeysScope.createHeldKeyCodes()
    const subscription = getKeyStateTracker().store.subscribe(() => {
      if (this.heldKeys.length > 0) {
        const combo = this.heldKeys
          .map((k) => formatForDisplay(k, { useSymbols: true }))
          .join(' + ')
        this.history = (() => {
          if (this.history[this.history.length - 1] !== combo) {
            return [...this.history.slice(-9), combo]
          }
          return this.history
        })()
      }
    })
    this.cleanups.push(() => subscription.unsubscribe())
  }
  destroy() {
    for (const cleanup of this.cleanups) cleanup()
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.start()
