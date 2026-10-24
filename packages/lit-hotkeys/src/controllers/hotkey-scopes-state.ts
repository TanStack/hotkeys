import { getHotkeyManager } from '@tanstack/hotkeys'
import type { HotkeyScopesState } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that reads the hotkey manager's scope state: the
 * active scopes, the exclusive scope that owns the keyboard, and the scopes it
 * allows or suspends. Triggers host updates when scopes activate or release.
 *
 * @example
 * ```ts
 * class KeyboardOwner extends LitElement {
 *   private scopes = new HotkeyScopesStateController(this)
 *
 *   render() {
 *     const { exclusive } = this.scopes.value
 *     return exclusive ? html`<p>Shortcuts belong to ${exclusive}</p>` : nothing
 *   }
 * }
 * ```
 */
export class HotkeyScopesStateController implements ReactiveController {
  /** The unsubscribe function to unsubscribe from the scopes store. */
  private _unsubscribe: (() => void) | undefined

  /** The current scope state. */
  public get value(): HotkeyScopesState {
    return getHotkeyManager().scopes.state
  }

  /**
   * @param _host - The Lit component that owns this controller.
   */
  constructor(private _host: ReactiveControllerHost) {
    this._host.addController(this)
  }

  /** Subscribes to the scopes store and updates the host when it changes. */
  public hostConnected(): void {
    const subscription = getHotkeyManager().scopes.subscribe(() =>
      this._host.requestUpdate(),
    )
    this._unsubscribe = () => subscription.unsubscribe()
  }

  /** Unsubscribes from the scopes store. */
  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
  }
}
