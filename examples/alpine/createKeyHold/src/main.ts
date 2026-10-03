import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'
import type { AlpineHotkeyState } from '@tanstack/alpine-hotkeys'
import './index.css'

class App {
  private hotkeysScope = createHotkeysScope()

  usage0 =
    "const shift = scope.createKeyHold('Shift')\n\n// <span x-text=\"shift.value ? 'Shift is pressed!' : 'Press Shift'\"></span>\n// Release the subscription when x-data is destroyed.\nscope.destroy()"
  isShiftHeld!: AlpineHotkeyState<boolean>
  isControlHeld!: AlpineHotkeyState<boolean>
  isAltHeld!: AlpineHotkeyState<boolean>
  isMetaHeld!: AlpineHotkeyState<boolean>
  isSpaceHeld!: AlpineHotkeyState<boolean>

  init() {
    this.isShiftHeld = this.hotkeysScope.createKeyHold('Shift')
    this.isControlHeld = this.hotkeysScope.createKeyHold('Control')
    this.isAltHeld = this.hotkeysScope.createKeyHold('Alt')
    this.isMetaHeld = this.hotkeysScope.createKeyHold('Meta')
    this.isSpaceHeld = this.hotkeysScope.createKeyHold('Space')
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.start()
