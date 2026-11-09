import {
  createHotkeyRecorder,
  createHotkeysScope,
  detectPlatform,
  getHotkeyManager,
  hotkeysPlugin,
} from '@tanstack/alpine-hotkeys'
import Alpine from 'alpinejs'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import type { AlpineHotkeys, Hotkey } from '@tanstack/alpine-hotkeys'

Alpine.plugin(hotkeysPlugin)

interface AppData {
  shown: boolean
  enabled: boolean
  hotkey: string
}

Alpine.data('app', () => {
  const scope = createHotkeysScope()
  return {
    shown: true,
    enabled: true,
    hotkey: 'K',
    recorder: createHotkeyRecorder(scope, { onRecord: setRecorded }),
    shiftHeld: scope.createKeyHold('Shift'),
    heldKeys: scope.createHeldKeys(),
    init(this: AppData) {
      scope.createHotkey(['G', 'G'], () => logCall('sequence'))
      exposeFixture(
        { getHotkeyManager, detectPlatform },
        {
          setShown: (shown) => (this.shown = shown),
          setEnabled: (enabled) => (this.enabled = enabled),
          setHotkey: (hotkey) => (this.hotkey = hotkey),
          startRecording: () => this.recorder.startRecording(),
        },
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})

// Inside `x-if`: `$hotkeys` belongs to this element, so removing it releases
// the registration. `this` also reads the parent's data.
Alpine.data('hotkeyHost', () => ({
  init(this: AppData & { $hotkeys: AlpineHotkeys }) {
    this.$hotkeys.createHotkey(
      () => this.hotkey as Hotkey,
      () => logCall('hotkey'),
      () => ({ enabled: this.enabled }),
    )
  },
}))

Alpine.start()
