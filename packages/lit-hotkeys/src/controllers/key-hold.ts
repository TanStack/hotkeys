import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type { IndividualKey, KeyStateTracker } from '@tanstack/hotkeys'

/**
 * A Lit ReactiveController that tracks whether a specific key is currently held.
 *
 * Subscribes to the global KeyStateTracker and triggers host updates
 * when the held state of the specified key changes.
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
   * @param host - The Lit component that owns this controller.
   * @param key - The key to track (e.g. 'Shift', 'Control', 'A').
   */
  constructor(
    private _host: ReactiveControllerHost,
    private _key: IndividualKey,
  ) {
    this._host.addController(this)
  }

  public hostConnected(): void {
    const tracker: KeyStateTracker = getKeyStateTracker()
    const normalizedKey: string = this._key.toLowerCase()

    const subscription = tracker.store.subscribe(() => {
      const isHeld: boolean = tracker.store.state.heldKeys.some(
        (heldKey: string) => heldKey.toLowerCase() === normalizedKey,
      )

      if (isHeld !== this._value) {
        this._value = isHeld
        this._host.requestUpdate()
      }
    })

    this._unsubscribe = () => subscription.unsubscribe()
  }

  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
    this._value = false
  }
}
