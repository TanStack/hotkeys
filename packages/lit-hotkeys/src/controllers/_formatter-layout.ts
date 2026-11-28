import { KeyboardLayoutController } from './keyboard-layout'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'
import type { ReactiveControllerHost } from 'lit'

/**
 * The keyboard layout for a formatter controller's host. `sync` adds a
 * layout controller to the host, or removes it when `enabled` returns false.
 */
export class FormatterLayout {
  private _layout: KeyboardLayoutController | undefined

  constructor(
    private _host: ReactiveControllerHost,
    private _enabled: () => boolean,
  ) {}

  /** The loaded layout, or null when there is none or it is turned off. */
  public get value(): KeyboardLayoutMap | null {
    return (this._enabled() && this._layout?.value) || null
  }

  /** Follows the `enabled` option: starts or stops reading the layout. */
  public sync(): void {
    if (!this._enabled()) {
      this.dispose()
      return
    }
    // The layout controller joins the host, which connects and disconnects
    // it. It loads the layout only while the host is connected.
    this._layout ??= new KeyboardLayoutController(this._host)
  }

  /** Releases the layout controller and removes it from the host. */
  public dispose(): void {
    this._layout?.dispose()
    this._layout = undefined
  }
}
