import { createHotkeyBindings } from '@tanstack/hotkeys/adapter'
import { HOTKEY_DEFAULT_OPTIONS } from '../constants'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type {
  HotkeyCallback,
  HotkeyOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * A Lit ReactiveController that registers a keyboard hotkey when the host
 * element is connected and unregisters it when the host is disconnected.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   private hotkey = new HotkeyController(this, 'Mod+S', () => this.save())
 *
 *   constructor() {
 *     super()
 *     this.addController(this.hotkey)
 *   }
 * }
 * ```
 */
export class HotkeyController implements ReactiveController {
  private _bindings = createHotkeyBindings()
  private _connected = false
  private _boundCallback: HotkeyCallback

  /**
   * @param _host - The Lit component that owns this controller. Add the controller with `addController()`.
   * @param _hotkey - The shortcut to register.
   * @param callback - Called with the host as `this`.
   * @param _options - Options or a getter. Property getters are read on connection and after host updates.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _hotkey: RegisterableHotkey,
    callback: HotkeyCallback,
    private _options:
      HotkeyOptions | (() => HotkeyOptions) = HOTKEY_DEFAULT_OPTIONS,
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
      { hotkey: this._hotkey, callback: this._boundCallback, options },
    ])
  }

  /** Releases registrations when the host disconnects. */
  public hostDisconnected(): void {
    this._connected = false
    this._bindings.destroy()
  }
}
