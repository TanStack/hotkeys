import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import type {
  HotkeyRegistrationView,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that tracks all hotkey and sequence registrations.
 *
 * Subscribes to the singleton HotkeyManager and SequenceManager stores and
 * triggers host updates whenever registrations change.
 *
 * @example
 * ```ts
 * class ShortcutPalette extends LitElement {
 *   private registrations = new HotkeyRegistrationsController(this)
 *
 *   render() {
 *     return html`
 *       <ul>
 *         ${this.registrations.hotkeys.map(
 *           (reg) => html`<li>${reg.options.meta?.name ?? reg.hotkey}</li>`,
 *         )}
 *       </ul>
 *     `
 *   }
 * }
 * ```
 */
export class HotkeyRegistrationsController implements ReactiveController {
  private _unsubscribeHotkeys: (() => void) | undefined
  private _unsubscribeSequences: (() => void) | undefined
  private _hotkeys: Array<HotkeyRegistrationView> = []
  private _sequences: Array<SequenceRegistrationView> = []

  /** All registered hotkeys (public view, no callbacks). */
  public get hotkeys(): Array<HotkeyRegistrationView> {
    return this._hotkeys
  }

  /** All registered sequences. */
  public get sequences(): Array<SequenceRegistrationView> {
    return this._sequences
  }

  constructor(private _host: ReactiveControllerHost) {
    this._host.addController(this)
  }

  public hostConnected(): void {
    const hotkeyManager = getHotkeyManager()
    const sequenceManager = getSequenceManager()

    const hotkeysSub = hotkeyManager.registrations.subscribe(() => {
      this._hotkeys = Array.from(
        hotkeyManager.registrations.state.values(),
      ).map(toHotkeyRegistrationView)
      this._host.requestUpdate()
    })

    const sequencesSub = sequenceManager.registrations.subscribe(() => {
      this._sequences = Array.from(sequenceManager.registrations.state.values())
      this._host.requestUpdate()
    })

    this._unsubscribeHotkeys = () => hotkeysSub.unsubscribe()
    this._unsubscribeSequences = () => sequencesSub.unsubscribe()

    // Sync initial state
    this._hotkeys = Array.from(hotkeyManager.registrations.state.values()).map(
      toHotkeyRegistrationView,
    )
    this._sequences = Array.from(sequenceManager.registrations.state.values())
  }

  public hostDisconnected(): void {
    this._unsubscribeHotkeys?.()
    this._unsubscribeSequences?.()
    this._unsubscribeHotkeys = undefined
    this._unsubscribeSequences = undefined
    this._hotkeys = []
    this._sequences = []
  }
}
