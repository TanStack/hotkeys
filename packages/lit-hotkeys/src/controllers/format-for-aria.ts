import { formatForAria } from '@tanstack/hotkeys'
import { createFormatter, resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { FormatterLayout } from './_formatter-layout'
import type { HotkeyPlatform, MaybeGetter } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/** Options for `FormatForAriaController`. */
export interface FormatForAriaControllerOptions {
  /**
   * The user's platform, for every value from `format`. Detected when unset.
   * On a server, set it from the request with `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
  /**
   * Whether physical bindings follow the user's keyboard layout, so `[KeyQ]`
   * is `A` on a French AZERTY keyboard. The layout loads from the browser
   * when the first host connects. Only Chromium browsers report one. Set
   * `false` to never ask the browser for it. Default: `true`.
   */
  keyboardLayout?: boolean
}

/**
 * A Lit ReactiveController whose `format` is `formatForAria` with the
 * controller's `platform` option, or the detected platform without one. A
 * `platform` passed to `format` wins. Use its value for `aria-keyshortcuts`
 * with Lit's `ifDefined`, so Lit omits the attribute for a multi-step sequence
 * or no hotkey.
 *
 * Physical bindings such as `[KeyQ]` name the key the user presses in
 * Chromium browsers, once the keyboard layout has loaded. The host updates
 * when the layout loads or changes. A `layoutMap` passed to `format` wins.
 *
 * Lit has no provider, so the options are the only defaults. Pass a getter to
 * read them from host properties.
 *
 * @example
 * ```ts
 * class SearchButton extends LitElement {
 *   private formatForAria = new FormatForAriaController(this)
 *
 *   render() {
 *     return html`
 *       <button aria-keyshortcuts=${ifDefined(this.formatForAria.format('Mod+K'))}>
 *         Search
 *       </button>
 *     `
 *   }
 * }
 * ```
 */
export class FormatForAriaController implements ReactiveController {
  /** Reads the layout for the host, unless `keyboardLayout` is false. */
  private _layout: FormatterLayout

  /**
   * Formats a hotkey for `aria-keyshortcuts`, with the controller's platform
   * and the user's keyboard layout filled in. It takes the same options as
   * `formatForAria` and needs no `this`, so it can be passed around.
   */
  public format: typeof formatForAria = createFormatter(
    formatForAria,
    () => this._read().platform,
    () => this._layout.value,
  )

  /**
   * @param _host - The Lit component that owns this controller. The controller adds itself to it.
   * @param _options - Options or a getter. `platform` is read for each value. `keyboardLayout` is read on connection and before host updates.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _options: MaybeGetter<FormatForAriaControllerOptions> = {},
  ) {
    this._layout = new FormatterLayout(
      _host,
      () => this._read().keyboardLayout !== false,
    )
    this._host.addController(this)
  }

  /** Starts reading the layout, unless `keyboardLayout` is false. */
  public hostConnected(): void {
    this._layout.sync()
  }

  /** Follows a `keyboardLayout` option that a host property changed. */
  public hostUpdate(): void {
    this._layout.sync()
  }

  /**
   * Releases the controller now and removes it from its host, with the
   * layout controller it added. Use this method to remove a controller early,
   * because Lit's `removeController` alone leaves it active.
   */
  public dispose(): void {
    this._layout.dispose()
    this._host.removeController(this)
  }

  private _read(): FormatForAriaControllerOptions {
    return resolveMaybeGetter(this._options)
  }
}
