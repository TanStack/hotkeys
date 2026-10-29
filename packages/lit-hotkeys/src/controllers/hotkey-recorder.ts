import { HotkeyRecorder } from '@tanstack/hotkeys'
import { isServer } from './_server'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type {
  Hotkey,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

/**
 * A Lit ReactiveController that records keyboard shortcuts.
 *
 * With the default `maxSteps: 1`, the first valid chord is recorded. With a
 * larger `maxSteps`, each chord adds a step; the recording commits on Enter
 * (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
 * `onRecord` receives a chord (one step) or a sequence. Escape cancels;
 * Backspace/Delete removes the last step or clears.
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
  /** The last committed hotkey. */
  private _recordedHotkey: Hotkey | null = null
  /** Chords recorded so far in a multi-step recording. */
  private _steps: HotkeySequence = []

  /** Whether recording is currently active. */
  public get isRecording(): boolean {
    return this._isRecording
  }

  /** The last committed hotkey: a chord, or a sequence of two or more steps. */
  public get recordedHotkey(): Hotkey | null {
    return this._recordedHotkey
  }

  /** Chords recorded so far in a multi-step recording (for live preview). */
  public get steps(): HotkeySequence {
    return this._steps
  }

  /**
   * @param host - The Lit component that owns this controller.
   * @param options - Options or a getter, read during recording.
   */
  constructor(host: ReactiveControllerHost, options: HotkeyChordRecorderOptions)
  constructor(
    host: ReactiveControllerHost,
    options: HotkeySequenceRecorderOptions,
  )
  // Getter overloads list sequences first: TypeScript keeps a lambda's
  // parameter types from the first overload it tries, and sequence types also
  // fit chords.
  constructor(
    host: ReactiveControllerHost,
    options: () => HotkeySequenceRecorderOptions,
  )
  constructor(
    host: ReactiveControllerHost,
    options: () => HotkeyChordRecorderOptions,
  )
  constructor(
    host: ReactiveControllerHost,
    options: () => HotkeyRecorderOptions,
  )
  constructor(
    private _host: ReactiveControllerHost,
    private _options: HotkeyRecorderOptions | (() => HotkeyRecorderOptions),
  ) {
    // Overloads already checked the options; either shape is valid here.
    this._recorder = new HotkeyRecorder(
      () =>
        ({
          ...(typeof this._options === 'function'
            ? this._options()
            : this._options),
          ...this._optionOverrides,
        }) as HotkeySequenceRecorderOptions,
    )
    this._host.addController(this)
  }

  /** Subscribes to the recorder store and updates the internal state when changes occur. */
  public hostConnected(): void {
    if (isServer()) return
    const subscription = this._recorder.store.subscribe(() => {
      const { isRecording, recordedHotkey, steps } = this._recorder.store.state

      const hasChanged: boolean =
        isRecording !== this._isRecording ||
        recordedHotkey !== this._recordedHotkey ||
        steps !== this._steps

      if (hasChanged) {
        this._isRecording = isRecording
        this._recordedHotkey = recordedHotkey
        this._steps = steps
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
    this._steps = []
  }

  /** Updates the recorder options (e.g. callbacks). */
  public setOptions(options: Partial<HotkeyRecorderOptions>): void {
    this._optionOverrides = {
      ...this._optionOverrides,
      ...options,
    } as Partial<HotkeyRecorderOptions>
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

  /** Commit the recorded steps now (multi-step recordings). */
  public commitRecording(): void {
    this._recorder.commit()
  }
}
