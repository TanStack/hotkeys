import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { KeyStateTracker } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * A Lit ReactiveController that tracks all currently held key names to their physical `event.code` values.
 *
 * Subscribes to the global KeyStateTracker and triggers host updates
 * whenever keys are pressed or released.
 *
 * @example
 * ```ts
 * class KeyDisplay extends LitElement {
 *   private heldKeyCodes = new HeldKeyCodesController(this)
 *
 *   render() {
 *     const heldCodes = Object.entries(this.heldKeyCodes.value).map(([key, code]) => `${key}: ${code}`).join(' + ')
 *     return html`
 *       <div>
 *         Currently pressed: ${heldCodes || 'None'}
 *       </div>
 *     `
 *   }
 * }
 * ```
 */
export class HeldKeyCodesController implements ReactiveController {
  /** The unsubscribe function to unsubscribe from the tracker store. */
  private _unsubscribe: (() => void) | undefined
  /** The currently held key names to their physical `event.code` values. */
  private _value: Record<string, string> = {}

  /** Map of currently held key names to their physical `event.code` values. */
  public get value(): Record<string, string> {
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
    this._value = tracker.store.state.heldCodes
    this._host.requestUpdate()

    const subscription = tracker.store.subscribe(() => {
      const { heldCodes } = tracker.store.state

      this._value = heldCodes
      this._host.requestUpdate()
    })

    this._unsubscribe = () => subscription.unsubscribe()
  }

  /** Unsubscribes from the tracker store and stops tracking the held key codes. */
  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
    this._value = {}
  }
}
