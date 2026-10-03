import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type {
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

/**
 * A Lit ReactiveController that records multi-chord sequences (Vim-style shortcuts).
 *
 * Wraps the framework-agnostic `HotkeySequenceRecorder` class, managing store
 * subscriptions and host update lifecycle automatically.
 *
 * @example
 * ```ts
 * class ShortcutSettings extends LitElement {
 *   private recorder = new HotkeySequenceRecorderController(this, {
 *     onRecord: (sequence) => {
 *       this.sequence = sequence
 *       this.requestUpdate()
 *     },
 *     onCancel: () => {
 *       console.log('Recording cancelled')
 *     },
 *   })
 *
 *   private sequence: HotkeySequence | null = null
 *
 *   render() {
 *     return html`
 *       <button @click=${() => this.recorder.startRecording()}>
 *         ${this.recorder.isRecording ? 'Recording...' : 'Edit Sequence'}
 *       </button>
 *       ${this.recorder.steps.length
 *         ? html`<div>Steps: ${this.recorder.steps.join(' → ')}</div>`
 *         : nothing}
 *       ${this.recorder.recordedSequence
 *         ? html`<div>Recorded: ${this.recorder.recordedSequence.join(' → ')}</div>`
 *         : nothing}
 *     `
 *   }
 * }
 * ```
 */
export class HotkeySequenceRecorderController implements ReactiveController {
  /** The recorder instance. */
  private _recorder: HotkeySequenceRecorder
  private _optionOverrides: Partial<HotkeySequenceRecorderOptions> = {}
  /** The unsubscribe function. */
  private _unsubscribe: (() => void) | undefined
  /** Whether recording is currently active. */
  private _isRecording = false
  /** Chords captured in the current session. */
  private _steps: HotkeySequence = []
  /** Last committed sequence, or null if none. */
  private _recordedSequence: HotkeySequence | null = null

  /** Whether recording is currently active. */
  public get isRecording(): boolean {
    return this._isRecording
  }

  /** Chords captured in the current session. */
  public get steps(): HotkeySequence {
    return this._steps
  }

  /** Last committed sequence, or null if none. */
  public get recordedSequence(): HotkeySequence | null {
    return this._recordedSequence
  }

  /**
   * @param _host - The Lit component that owns this controller.
   * @param _options - Options or a getter, read during recording.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _options:
      HotkeySequenceRecorderOptions | (() => HotkeySequenceRecorderOptions),
  ) {
    this._recorder = new HotkeySequenceRecorder(() => ({
      ...(typeof this._options === 'function'
        ? this._options()
        : this._options),
      ...this._optionOverrides,
    }))
    this._host.addController(this)
  }

  /** Subscribes to the recorder store and updates internal state when changes occur. */
  public hostConnected(): void {
    const subscription = this._recorder.store.subscribe(() => {
      const { isRecording, steps, recordedSequence } =
        this._recorder.store.state

      const hasChanged: boolean =
        isRecording !== this._isRecording ||
        steps !== this._steps ||
        recordedSequence !== this._recordedSequence

      if (hasChanged) {
        this._isRecording = isRecording
        this._steps = steps
        this._recordedSequence = recordedSequence
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
    this._steps = []
    this._recordedSequence = null
  }

  /** Updates the recorder options. */
  public setOptions(options: Partial<HotkeySequenceRecorderOptions>): void {
    this._optionOverrides = { ...this._optionOverrides, ...options }
  }

  /** Start recording a new sequence. */
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

  /** Commit current steps as a sequence (no-op if empty). */
  public commitRecording(): void {
    this._recorder.commit()
  }
}
