import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { KeyStateTracker } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that tracks all currently held keyboard keys.
 *
 * Subscribes to the global KeyStateTracker and triggers host updates
 * whenever keys are pressed or released.
 *
 * @example
 * ```ts
 * class KeyDisplay extends LitElement {
 *   private heldKeys = new HeldKeysController(this)
 *
 *   render() {
 *     return html`
 *       <div>
 *         Currently pressed: ${this.heldKeys.value.join(' + ') || 'None'}
 *       </div>
 *     `
 *   }
 * }
 * ```
 */
export class HeldKeysController implements ReactiveController {
  /** The unsubscribe function to unsubscribe from the tracker store. */
  private _unsubscribe: (() => void) | undefined
  /** The currently held key names. */
  private _value: Array<string> = []

  /** Array of currently held key names. */
  public get value(): Array<string> {
    return this._value
  }

  /**
   * @param _host - The Lit component that owns this controller.
   */
  constructor(private _host: ReactiveControllerHost) {
    this._host.addController(this)
  }

  /** Subscribes to the tracker store and updates the internal state when changes occur. */
  public hostConnected(): void {
    const tracker: KeyStateTracker = getKeyStateTracker()

    const subscription = tracker.store.subscribe(() => {
      const { heldKeys } = tracker.store.state

      this._value = heldKeys
      this._host.requestUpdate()
    })

    this._unsubscribe = () => subscription.unsubscribe()
  }

  /** Unsubscribes from the tracker store and stops tracking the held keys. */
  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
    this._value = []
  }
}
