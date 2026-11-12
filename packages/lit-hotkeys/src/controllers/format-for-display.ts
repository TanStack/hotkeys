import { formatForDisplay } from '@tanstack/hotkeys'
import { KeyboardLayoutController } from './keyboard-layout'
import type {
  DisplayHotkey,
  FormatDisplayOptions,
  HotkeyPlatform,
} from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/** Options for `FormatForDisplayController`. */
export interface FormatForDisplayControllerOptions {
  /**
   * The user's platform, for every label from `format`. Detected when unset.
   * On a server, set it from the request with `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
  /**
   * Whether labels follow the user's keyboard layout, so `[KeyQ]` reads `A`
   * on a French AZERTY keyboard. The layout loads from the browser when the
   * first host connects. Only Chromium browsers report one. Set `false` to
   * never ask the browser for it. Default: `true`.
   */
  keyboardLayout?: boolean
}

/**
 * A Lit ReactiveController whose `format` is `formatForDisplay` with the
 * controller's `platform` option, or the detected platform without one. A
 * `platform` passed to `format` wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user in Chromium browsers, once the keyboard layout has
 * loaded. The host updates when the layout loads or changes. See
 * `KeyboardLayoutController`. A `layoutMap` passed to `format` wins. Labels
 * have no layout on the server and for the host's first render, so a
 * server-rendered element hydrates unchanged. Firefox and Safari report no
 * layout, so labels there keep the key's US character.
 *
 * Lit has no provider, so the options are the only defaults. Pass a getter to
 * read them from host properties. Server-rendered elements should set
 * `platform` from the request with `detectPlatform(userAgent)`, so the server
 * HTML matches the user's platform.
 *
 * @example
 * ```ts
 * class SaveButton extends LitElement {
 *   private formatForDisplay = new FormatForDisplayController(this)
 *
 *   render() {
 *     return html`
 *       <button>Save <kbd>${this.formatForDisplay.format('Mod+S')}</kbd></button>
 *     `
 *   }
 * }
 * ```
 */
export class FormatForDisplayController implements ReactiveController {
  /** Reads the layout for the host, unless `keyboardLayout` is false. */
  private _layout: KeyboardLayoutController | undefined

  /**
   * Formats a hotkey as a label, with the controller's platform and the
   * user's keyboard layout filled in. It takes the same options as
   * `formatForDisplay` and needs no `this`, so it can be passed around.
   */
  public format: typeof formatForDisplay = ((
    hotkey: DisplayHotkey,
    options?: FormatDisplayOptions,
  ) => {
    const { platform, keyboardLayout } = this._read()
    return formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? platform,
      layoutMap:
        options?.layoutMap ??
        ((keyboardLayout !== false && this._layout?.value) || undefined),
    })
  }) as typeof formatForDisplay

  /**
   * @param _host - The Lit component that owns this controller. The controller adds itself to it.
   * @param _options - Options or a getter. `platform` is read for each label. `keyboardLayout` is read on connection and before host updates.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _options:
      | FormatForDisplayControllerOptions
      | (() => FormatForDisplayControllerOptions) = {},
  ) {
    this._host.addController(this)
  }

  /** Starts reading the layout, unless `keyboardLayout` is false. */
  public hostConnected(): void {
    this._sync()
  }

  /** Follows a `keyboardLayout` option that a host property changed. */
  public hostUpdate(): void {
    this._sync()
  }

  /**
   * Releases the controller now and removes it from its host, with the
   * layout controller it added. Use it to remove a controller early: Lit's
   * `removeController` alone leaves it active.
   */
  public dispose(): void {
    this._layout?.dispose()
    this._layout = undefined
    this._host.removeController(this)
  }

  private _read(): FormatForDisplayControllerOptions {
    return typeof this._options === 'function' ? this._options() : this._options
  }

  private _sync(): void {
    if (this._read().keyboardLayout === false) {
      this._layout?.dispose()
      this._layout = undefined
      return
    }
    // The layout controller joins the host, which connects and disconnects
    // it. It loads the layout only while the host is connected.
    this._layout ??= new KeyboardLayoutController(this._host)
  }
}
