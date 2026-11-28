import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { isServer } from './_server'
import type { LockKey, MaybeGetter } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that tracks whether a lock key, such as Caps Lock,
 * is on.
 *
 * Lock keys toggle instead of being held, so this reads the lock state that
 * the browser reports on key and mouse events. Its value is `null` until the
 * user presses a key, clicks, or moves the mouse, after the window loses
 * focus or the page is hidden, and always for Num Lock and Scroll Lock on macOS and iOS. Pass a
 * getter to track a key that changes, such as a reactive property; it is read
 * again on each host update.
 *
 * @example
 * ```ts
 * class PasswordField extends LitElement {
 *   private capsLock = new KeyLockStateController(this, 'CapsLock')
 *
 *   render() {
 *     return html`
 *       <label>
 *         Password
 *         <input type="password" />
 *         ${this.capsLock.value
 *           ? html`<span role="status">Caps Lock is on</span>`
 *           : null}
 *       </label>
 *     `
 *   }
 * }
 * ```
 */
export class KeyLockStateController implements ReactiveController {
  /** The unsubscribe function to unsubscribe from the tracker store. */
  private _unsubscribe: (() => void) | undefined
  /** Whether the tracked lock is on, or `null` when it is unknown. */
  private _value: boolean | null = null

  /**
   * `true` when the lock is on, `false` when it is off, or `null` when the
   * browser has not reported it.
   */
  public get value(): boolean | null {
    return this._value
  }

  /**
   * @param _host - The Lit component that owns this controller.
   * @param _key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'`, or a getter.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _key: MaybeGetter<LockKey>,
  ) {
    this._host.addController(this)
  }

  public hostConnected(): void {
    // Adding the controller again while connected calls this twice.
    if (this._unsubscribe) return
    if (this._refresh()) this._host.requestUpdate()
    if (isServer()) return
    const subscription = getKeyStateTracker().store.subscribe(() => {
      if (this._refresh()) this._host.requestUpdate()
    })
    this._unsubscribe = () => subscription.unsubscribe()
  }

  /** Re-reads a getter key when host properties trigger an update. */
  public hostUpdate(): void {
    this._refresh()
  }

  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
    this._value = null
  }

  /**
   * Releases the controller now and removes it from its host. Use it to
   * remove a controller early: Lit's `removeController` alone leaves it active.
   */
  public dispose(): void {
    this.hostDisconnected()
    this._host.removeController(this)
  }

  /** Recomputes the lock state and reports whether it changed. */
  private _refresh(): boolean {
    const next =
      getKeyStateTracker().store.state.locks[resolveMaybeGetter(this._key)]
    const changed = next !== this._value
    this._value = next
    return changed
  }
}
