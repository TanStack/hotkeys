import {
  HeldKeysController,
  HotkeyController,
  HotkeyRecorderController,
  KeyHoldController,
  detectPlatform,
  getHotkeyManager,
} from '@tanstack/lit-hotkeys'
import { LitElement, html } from 'lit'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import type { Hotkey } from '@tanstack/lit-hotkeys'

// Rendered only while shown, so removing it disconnects its controller.
class HotkeyHost extends LitElement {
  static override properties = {
    hotkey: { type: String },
    enabled: { type: Boolean },
  }

  declare hotkey: string
  declare enabled: boolean

  constructor() {
    super()
    this.hotkey = 'K'
    this.enabled = true
    new HotkeyController(
      this,
      () => this.hotkey as Hotkey,
      () => logCall('hotkey'),
      () => ({ enabled: this.enabled }),
    )
  }

  // Light DOM, so `#hotkey-host` is visible to document queries
  protected override createRenderRoot() {
    return this
  }

  override render() {
    return html`<div id="hotkey-host"></div>`
  }
}
customElements.define('hotkey-host', HotkeyHost)

class FixtureApp extends LitElement {
  static override properties = {
    shown: { state: true },
    enabled: { state: true },
    hotkey: { state: true },
  }

  declare shown: boolean
  declare enabled: boolean
  declare hotkey: string

  recorder = new HotkeyRecorderController(this, { onRecord: setRecorded })
  shiftHeld = new KeyHoldController(this, 'Shift')
  heldKeys = new HeldKeysController(this)

  constructor() {
    super()
    this.shown = true
    this.enabled = true
    this.hotkey = 'K'
    new HotkeyController(this, ['G', 'G'], () => logCall('sequence'))
  }

  protected override createRenderRoot() {
    return this
  }

  override firstUpdated() {
    exposeFixture(
      { getHotkeyManager, detectPlatform },
      {
        setShown: (shown) => (this.shown = shown),
        setEnabled: (enabled) => (this.enabled = enabled),
        setHotkey: (hotkey) => (this.hotkey = hotkey),
        startRecording: () => this.recorder.startRecording(),
      },
    )
  }

  override render() {
    return html`
      ${
        this.shown
          ? html`<hotkey-host
              .hotkey=${this.hotkey}
              .enabled=${this.enabled}
            ></hotkey-host>`
          : null
      }
      <div id="recording">${this.recorder.isRecording ? 'yes' : 'no'}</div>
      <div id="shift-held">${this.shiftHeld.value ? 'held' : 'released'}</div>
      <div id="held-keys">${this.heldKeys.value.join('+')}</div>
    `
  }
}
customElements.define('fixture-app', FixtureApp)
