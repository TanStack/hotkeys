import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { isServer } from './_server'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that reads every hotkey registration, chords and
 * sequences, from the singleton HotkeyManager and requests an update when
 * they change. Narrow each view with `kind`.
 *
 * @example
 * ```ts
 * class ShortcutPalette extends LitElement {
 *   private registrations = new HotkeyRegistrationsController(this)
 *
 *   render() {
 *     return html`<ul>
 *       ${this.registrations.hotkeys.map(
 *         (reg) => html`<li>${reg.options.meta?.name}: ${formatForDisplay(reg.hotkey)}</li>`,
 *       )}
 *     </ul>`
 *   }
 * }
 * ```
 */
export class HotkeyRegistrationsController implements ReactiveController {
  private _unsubscribe: (() => void) | undefined
  private _hotkeys: Array<HotkeyRegistrationView> = []

  /** Every registration, chords and sequences (public view, no callbacks). */
  public get hotkeys(): Array<HotkeyRegistrationView> {
    return this._hotkeys
  }

  constructor(private _host: ReactiveControllerHost) {
    this._host.addController(this)
  }

  public hostConnected(): void {
    // Adding the controller again while connected calls this twice.
    if (this._unsubscribe) return
    const manager = getHotkeyManager()
    const read = () =>
      Array.from(manager.registrations.state.values()).map(
        toHotkeyRegistrationView,
      )
    this._hotkeys = read()
    if (isServer()) return
    const subscription = manager.registrations.subscribe(() => {
      this._hotkeys = read()
      this._host.requestUpdate()
    })
    this._unsubscribe = () => subscription.unsubscribe()
  }

  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
    this._hotkeys = []
  }
}
