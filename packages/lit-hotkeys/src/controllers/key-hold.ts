import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { isServer } from './_server'
import type { IndividualKey, MaybeGetter } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that tracks whether a specific key is currently held.
 *
 * Subscribes to the global KeyStateTracker and triggers host updates
 * when the held state of the specified key changes. Pass a getter to track a
 * key that changes, such as a reactive property; it is read again on each
 * host update.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   private shiftHold = new KeyHoldController(this, 'Shift')
 *
 *   render() {
 *     return html`
 *       <div style="opacity: ${this.shiftHold.value ? 1 : 0.5}">
 *         ${this.shiftHold.value ? 'Shift is pressed!' : 'Press Shift'}
 *       </div>
 *     `
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * class ModifierIndicators extends LitElement {
 *   private ctrl = new KeyHoldController(this, 'Control')
 *   private shift = new KeyHoldController(this, 'Shift')
 *   private alt = new KeyHoldController(this, 'Alt')
 *
 *   render() {
 *     return html`
 *       <span style="opacity: ${this.ctrl.value ? 1 : 0.3}">Ctrl</span>
 *       <span style="opacity: ${this.shift.value ? 1 : 0.3}">Shift</span>
 *       <span style="opacity: ${this.alt.value ? 1 : 0.3}">Alt</span>
 *     `
 *   }
 * }
 * ```
 */
export class KeyHoldController implements ReactiveController {
  /** The unsubscribe function to unsubscribe from the tracker store. */
  private _unsubscribe: (() => void) | undefined
  /** Whether the tracked key is currently held down. */
  private _value = false

  /** Whether the tracked key is currently held down. */
  public get value(): boolean {
    return this._value
  }

  /**
   * @param _host - The Lit component that owns this controller.
   * @param _key - The key to track (e.g. 'Shift', 'Control', 'A'), or a getter.
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _key: MaybeGetter<IndividualKey>,
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
    this._value = false
  }

  /**
   * Releases the controller now and removes it from its host. Use it to
   * remove a controller early: Lit's `removeController` alone leaves it active.
   */
  public dispose(): void {
    this.hostDisconnected()
    this._host.removeController(this)
  }

  /** Recomputes the held state and reports whether it changed. */
  private _refresh(): boolean {
    const next = getKeyStateTracker().isKeyHeld(resolveMaybeGetter(this._key))
    const changed = next !== this._value
    this._value = next
    return changed
  }
}
