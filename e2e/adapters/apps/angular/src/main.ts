import '@angular/compiler'
import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import {
  detectPlatform,
  getHotkeyManager,
  injectHeldKeys,
  injectHotkey,
  injectHotkeyRecorder,
  injectKeyHold,
} from '@tanstack/angular-hotkeys'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import type { Hotkey } from '@tanstack/angular-hotkeys'

// JIT without decorator syntax: Component() is applied as a plain function.
const state = {
  enabled: signal(true),
  hotkey: signal('K'),
}

const HotkeyHost = Component({
  selector: 'hotkey-host',
  template: '<div id="hotkey-host"></div>',
})(
  class HotkeyHost {
    constructor() {
      injectHotkey(
        () => state.hotkey() as Hotkey,
        () => logCall('hotkey'),
        () => ({ enabled: state.enabled() }),
      )
    }
  },
)

const App = Component({
  selector: 'app-root',
  imports: [HotkeyHost],
  template: `
    @if (shown()) {
      <hotkey-host />
    }
    <div id="recording">{{ recorder.isRecording() ? 'yes' : 'no' }}</div>
    <div id="shift-held">{{ shiftHeld() ? 'held' : 'released' }}</div>
    <div id="held-keys">{{ heldKeys().join('+') }}</div>
  `,
})(
  class App {
    shown = signal(true)
    recorder = injectHotkeyRecorder({ onRecord: setRecorded })
    shiftHeld = injectKeyHold('Shift')
    heldKeys = injectHeldKeys()

    constructor() {
      injectHotkey(['G', 'G'], () => logCall('sequence'))
    }
  },
)

const ref = await bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
})
const app = ref.components[0].instance as InstanceType<typeof App>
exposeFixture(
  { getHotkeyManager, detectPlatform },
  {
    setShown: (shown) => app.shown.set(shown),
    setEnabled: (enabled) => state.enabled.set(enabled),
    setHotkey: (hotkey) => state.hotkey.set(hotkey),
    startRecording: () => app.recorder.startRecording(),
  },
)
