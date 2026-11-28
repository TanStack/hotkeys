import { createHotkeysScope, hotkeysPlugin } from '@tanstack/alpine-hotkeys'
import Alpine from 'alpinejs'
import type { AlpineHotkeyState } from '@tanstack/alpine-hotkeys'
import './index.css'

// Gives every hotkeys scope the app's Alpine instance.
Alpine.plugin(hotkeysPlugin)

class App {
  private hotkeysScope = createHotkeysScope()

  capsLock!: AlpineHotkeyState<boolean | null>
  numLock!: AlpineHotkeyState<boolean | null>
  scrollLock!: AlpineHotkeyState<boolean | null>

  init() {
    this.capsLock = this.hotkeysScope.createKeyLockState('CapsLock')
    this.numLock = this.hotkeysScope.createKeyLockState('NumLock')
    this.scrollLock = this.hotkeysScope.createKeyLockState('ScrollLock')
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
  describe(state: boolean | null) {
    if (state === null) return 'Unknown'
    return state ? 'On' : 'Off'
  }
}
Alpine.data('app', () => new App())
Alpine.start()
