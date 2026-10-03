import { HotkeyRecorder } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type { Hotkey, HotkeyRecorderOptions } from '@tanstack/hotkeys'

/**
 * A Lit ReactiveController that records keyboard shortcuts.
 *
 * Wraps the framework-agnostic `HotkeyRecorder` class, managing all the
 * complexity of capturing keyboard events, converting them to hotkey strings,
 * and handling edge cases like Escape to cancel or Backspace/Delete to clear.
 *
 * @example
 * ```ts
 * class ShortcutSettings extends LitElement {
 *   private recorder = new HotkeyRecorderController(this, {
 *     onRecord: (hotkey) => {
 *       this.shortcut = hotkey
 *       this.requestUpdate()
 *     },
 *     onCancel: () => {
 *       console.log('Recording cancelled')
 *     },
 *   })
 *
 *   private shortcut: Hotkey | null = null
 *
 *   render() {
 *     return html`
 *       <button @click=${() => this.recorder.startRecording()}>
 *         ${this.recorder.isRecording ? 'Recording...' : 'Edit Shortcut'}
 *       </button>
 *       ${this.recorder.recordedHotkey
 *         ? html`<div>Recording: ${this.recorder.recordedHotkey}</div>`
 *         : nothing}
 *     `
 *   }
 * }
 * ```
 */
export class HotkeyRecorderController implements ReactiveController {
  /** The recorder instance. */
  private _recorder: HotkeyRecorder
  private _optionOverrides: Partial<HotkeyRecorderOptions> = {}
  /** The unsubscribe function to unsubscribe from the recorder store. */
  private _unsubscribe: (() => void) | undefined
  /** Whether recording is currently active. */
  private _isRecording = false
  /** The currently recorded hotkey (for live preview). */
  private _recordedHotkey: Hotkey | null = null

  /** Whether recording is currently active. */
  public get isRecording(): boolean {
    return this._isRecording
  }

  /** The currently recorded hotkey (for live preview). */
  public get recordedHotkey(): Hotkey | null {
    return this._recordedHotkey
  }

  /**
   * @param _host - The Lit component that owns this controller.
   * @param _options - Options or a getter, read during recording.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _options: HotkeyRecorderOptions | (() => HotkeyRecorderOptions),
  ) {
    this._recorder = new HotkeyRecorder(() => ({
      ...(typeof this._options === 'function'
        ? this._options()
        : this._options),
      ...this._optionOverrides,
    }))
    this._host.addController(this)
  }

  /** Subscribes to the recorder store and updates the internal state when changes occur. */
  public hostConnected(): void {
    const subscription = this._recorder.store.subscribe(() => {
      const { isRecording, recordedHotkey } = this._recorder.store.state

      const hasChanged: boolean =
        isRecording !== this._isRecording ||
        recordedHotkey !== this._recordedHotkey

      if (hasChanged) {
        this._isRecording = isRecording
        this._recordedHotkey = recordedHotkey
        this._host.requestUpdate()
      }
    })

    this._unsubscribe = () => subscription.unsubscribe()
  }

  /** Unsubscribes from the recorder store and destroys the recorder instance to prevent memory leaks. */
  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
    this._recorder.stop()
    this._isRecording = false
    this._recordedHotkey = null
  }

  /** Updates the recorder options (e.g. callbacks). */
  public setOptions(options: Partial<HotkeyRecorderOptions>): void {
    this._optionOverrides = { ...this._optionOverrides, ...options }
  }

  /** Start recording a new hotkey. */
  public startRecording(): void {
    this._recorder.start()
  }

  /** Stop recording (same as cancel but without calling onCancel). */
  public stopRecording(): void {
    this._recorder.stop()
  }

  /** Cancel recording without saving. */
  public cancelRecording(): void {
    this._recorder.cancel()
  }
}
