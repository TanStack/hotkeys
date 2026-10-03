import { createHotkeySequenceBindings } from '@tanstack/hotkeys/adapter'
import { HOTKEY_SEQUENCE_DEFAULT_OPTIONS } from '../constants'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
} from '@tanstack/hotkeys'

/**
 * A Lit ReactiveController that registers a keyboard sequence (e.g. Vim-style)
 * when the host element is connected and unregisters it when the host is disconnected.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   private seq = new HotkeySequenceController(this, ['G', 'G'], () => this.goToTop())
 *
 *   constructor() {
 *     super()
 *     this.addController(this.seq)
 *   }
 * }
 * ```
 */
export class HotkeySequenceController implements ReactiveController {
  private _bindings = createHotkeySequenceBindings()
  private _connected = false
  private _boundCallback: HotkeyCallback

  /**
   * @param _host - The Lit component that owns this controller. Add the controller with `addController()`.
   * @param _sequence - The sequence to register.
   * @param callback - Called with the host as `this`.
   * @param _options - Options or a getter. Property getters are read on connection and after host updates.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _sequence: HotkeySequence,
    callback: HotkeyCallback,
    private _options:
      | SequenceOptions
      | (() => SequenceOptions) = HOTKEY_SEQUENCE_DEFAULT_OPTIONS,
  ) {
    this._boundCallback = callback.bind(this._host)
  }

  /** Registers when connected and a target is available. */
  public hostConnected(): void {
    this._connected = true
    this._sync()
  }

  /** Refreshes options after rendering, when scoped targets are available. */
  public hostUpdated(): void {
    if (this._connected) this._sync()
  }

  private _sync(): void {
    const options =
      typeof this._options === 'function' ? this._options() : this._options
    this._bindings.update([
      { sequence: this._sequence, callback: this._boundCallback, options },
    ])
  }

  /** Releases registrations when the host disconnects. */
  public hostDisconnected(): void {
    this._connected = false
    this._bindings.destroy()
  }
}
