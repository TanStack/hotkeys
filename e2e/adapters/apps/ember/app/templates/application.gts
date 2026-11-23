import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import {
  detectPlatform,
  getHotkeyManager,
  useHeldKeys,
  useHotkey,
  useHotkeyRecorder,
  useKeyHold,
} from '@tanstack/ember-hotkeys'
import { exposeFixture, logCall, setRecorded } from '../../../../shared/fixture'
import type { Hotkey } from '@tanstack/ember-hotkeys'

interface HotkeyHostSignature {
  Args: { hotkey: Hotkey; enabled: boolean }
}

class HotkeyHost extends Component<HotkeyHostSignature> {
  onHotkey = () => logCall('hotkey')

  <template>
    {{useHotkey @hotkey this.onHotkey enabled=@enabled}}
    <div id='hotkey-host'></div>
  </template>
}

class App extends Component {
  @tracked shown = true
  @tracked enabled = true
  @tracked hotkey: Hotkey = 'K'

  sequence = ['G', 'G'] as const
  onSequence = () => logCall('sequence')
  recorder = useHotkeyRecorder(this, { onRecord: setRecorded })
  shiftHeld = useKeyHold(this, 'Shift')
  heldKeys = useHeldKeys(this)

  constructor(owner: unknown, args: object) {
    super(owner, args)
    exposeFixture(
      { getHotkeyManager, detectPlatform },
      {
        setShown: (shown) => (this.shown = shown),
        setEnabled: (enabled) => (this.enabled = enabled),
        setHotkey: (hotkey) => (this.hotkey = hotkey as Hotkey),
        startRecording: () => this.recorder.startRecording(),
      },
    )
  }

  get heldKeysText() {
    return this.heldKeys.value.join('+')
  }

  <template>
    {{useHotkey this.sequence this.onSequence}}
    {{#if this.shown}}
      <HotkeyHost @hotkey={{this.hotkey}} @enabled={{this.enabled}} />
    {{/if}}
    <div id='recording'>{{if this.recorder.isRecording 'yes' 'no'}}</div>
    <div id='shift-held'>{{if this.shiftHeld.value 'held' 'released'}}</div>
    <div id='held-keys'>{{this.heldKeysText}}</div>
  </template>
}

export default App
