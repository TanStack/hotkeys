import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'
import './index.css'

class App {
  private hotkeysScope = createHotkeysScope()

  usage0 =
    "const shift = scope.createKeyHold('Shift')\n\n// <span x-text=\"shift.value ? 'Shift is pressed!' : 'Press Shift'\"></span>\n// Release the subscription when x-data is destroyed.\nscope.destroy()"
  isShiftHeldState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createKeyHold']
  >
  isControlHeldState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createKeyHold']
  >
  isAltHeldState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createKeyHold']
  >
  isMetaHeldState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createKeyHold']
  >
  isSpaceHeldState!: ReturnType<
    ReturnType<typeof createHotkeysScope>['createKeyHold']
  >
  get isShiftHeld() {
    return this.isShiftHeldState.value
  }
  get isControlHeld() {
    return this.isControlHeldState.value
  }
  get isAltHeld() {
    return this.isAltHeldState.value
  }
  get isMetaHeld() {
    return this.isMetaHeldState.value
  }
  get isSpaceHeld() {
    return this.isSpaceHeldState.value
  }

  init() {
    this.isShiftHeldState = this.hotkeysScope.createKeyHold(() => 'Shift')
    this.isControlHeldState = this.hotkeysScope.createKeyHold(() => 'Control')
    this.isAltHeldState = this.hotkeysScope.createKeyHold(() => 'Alt')
    this.isMetaHeldState = this.hotkeysScope.createKeyHold(() => 'Meta')
    this.isSpaceHeldState = this.hotkeysScope.createKeyHold(() => 'Space')
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.start()
