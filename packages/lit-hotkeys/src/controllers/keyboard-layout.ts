import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import { isServer } from './_server'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that reads the browser's keyboard layout, or `null`
 * until it loads and in browsers that don't report one. The layout maps each
 * physical code to the character it types, such as `KeyQ` to `a` on a French
 * AZERTY keyboard. Only Chromium browsers report one. Triggers host updates
 * when the layout loads or changes.
 *
 * Creating the controller is what loads the layout: it loads when the first
 * host connects, and is read again when the window regains focus while a host
 * is connected. `FormatForDisplayController` uses this controller, so you
 * only need it for labels you draw yourself. To never ask the browser for the
 * layout, don't create the controller.
 *
 * `value` is `null` on the server and for the host's first render, so a
 * server-rendered element hydrates unchanged.
 *
 * @example
 * ```ts
 * class MoveKeys extends LitElement {
 *   private layout = new KeyboardLayoutController(this)
 *
 *   render() {
 *     const label = (code: string) =>
 *       (this.layout.value?.get(code) ?? code).toUpperCase()
 *     return html`<kbd>${label('KeyW')}</kbd>`
 *   }
 * }
 * ```
 */
export class KeyboardLayoutController implements ReactiveController {
  /** Unsubscribes from the layout store and ends this host's interest in it. */
  private _release: (() => void) | undefined
  /** Whether the host has finished the first update after it connected. */
  private _rendered = false

  /** The loaded keyboard layout, or `null`. */
  public get value(): KeyboardLayoutMap | null {
    return this._rendered ? getKeyboardLayoutStore().state : null
  }

  /**
   * @param _host - The Lit component that owns this controller.
   */
  constructor(private _host: ReactiveControllerHost) {
    this._host.addController(this)
  }

  /**
   * Loads the layout, subscribes to the layout store, and updates the host
   * when the layout changes. Connecting requests an update too, since the
   * layout may have changed while disconnected.
   */
  public hostConnected(): void {
    // Adding the controller again while connected calls this twice.
    if (this._release) return
    this._host.requestUpdate()
    if (isServer()) return
    const store = getKeyboardLayoutStore()
    const subscription = store.subscribe(() => this._host.requestUpdate())
    const stop = loadKeyboardLayout()
    this._release = () => {
      subscription.unsubscribe()
      stop()
    }
    if (this._rendered) return
    // Server HTML never has a layout, so a hydrating host must render once
    // without one. A layout that has already loaded shows in a second update.
    const show = () => {
      this._rendered = true
      if (store.state) this._host.requestUpdate()
    }
    this._host.updateComplete.then(show, show)
  }

  /**
   * Unsubscribes from the layout store and ends this host's interest in the
   * layout. The loaded layout stays for other hosts.
   */
  public hostDisconnected(): void {
    this._release?.()
    this._release = undefined
  }

  /**
   * Releases the controller now and removes it from its host. Use it to
   * remove a controller early: Lit's `removeController` alone leaves it active.
   */
  public dispose(): void {
    this.hostDisconnected()
    this._host.removeController(this)
  }
}
