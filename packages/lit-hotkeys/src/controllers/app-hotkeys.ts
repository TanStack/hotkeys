import { getHotkeyManager } from '@tanstack/hotkeys'
import {
  getHotkeyRegistrationViews,
  requireAppHotkeysStore,
} from '@tanstack/hotkeys/adapter'
import { getAppHotkeysStore, subscribeAppHotkeys } from './_app-hotkeys'
import { isServer } from './_server'
import type {
  AppHotkey,
  AppHotkeyId,
  AppHotkeysStore,
  CustomHotkeyActions,
  CustomHotkeys,
  Hotkey,
  RecordedKeyPresses,
  RegisteredAppHotkeyListItem,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

function requireStore(): AppHotkeysStore<RegisteredAppHotkeys> {
  return requireAppHotkeysStore(
    getAppHotkeysStore(),
    'AppHotkeysController requires provideAppHotkeys()',
  )
}

/**
 * A Lit ReactiveController for app hotkeys provided with `provideAppHotkeys`:
 * the effective app hotkeys, a cheat sheet list with live status, and the
 * user's custom hotkeys. Requests an update when any of them change.
 *
 * @example
 * ```ts
 * class CheatSheet extends LitElement {
 *   private app = new AppHotkeysController(this)
 *
 *   render() {
 *     return html`<ul>
 *       ${this.app.list.map(
 *         ({ appHotkey, status }) => html`<li>${appHotkey.meta?.name}: ${status}</li>`,
 *       )}
 *     </ul>`
 *   }
 * }
 * ```
 */
export class AppHotkeysController
  implements ReactiveController, CustomHotkeyActions
{
  private _unsubscribe: (() => void) | undefined

  constructor(private _host: ReactiveControllerHost) {
    this._host.addController(this)
  }

  /** Effective app hotkeys, typed by `Register`. */
  public get appHotkeys(): RegisteredAppHotkeys {
    return requireStore().appHotkeys
  }

  /** Every app hotkey with its live status, in declaration order. */
  public get list(): Array<RegisteredAppHotkeyListItem> {
    return requireStore().getList(getHotkeyRegistrationViews())
  }

  /** The user's hotkeys that differ from the defaults. */
  public get customHotkeys(): CustomHotkeys {
    return requireStore().customHotkeys
  }

  /**
   * Sets the user's hotkey for an app hotkey. `null` unbinds it.
   * Returns conflicting app hotkeys; when any exist, nothing changes. Pass
   * the recorder's `context` for a recorded hotkey, as for `findConflicts`.
   */
  public setCustomHotkey(
    id: AppHotkeyId,
    hotkey: Hotkey | null,
    recordedWith?: RecordedKeyPresses,
  ): Array<AppHotkey> {
    return requireStore().setCustomHotkey(id, hotkey, recordedWith)
  }

  /** Restores the default hotkey for an app hotkey. */
  public resetCustomHotkey(id: AppHotkeyId): void {
    requireStore().resetCustomHotkey(id)
  }

  /** Restores every default hotkey. */
  public resetCustomHotkeys(): void {
    requireStore().resetCustomHotkeys()
  }

  /**
   * Other app hotkeys that would collide if `id` used `hotkey`. Pass the
   * recorder's `context` for a recorded hotkey: it has the key press, which
   * also finds a hotkey written differently that the same press fires.
   */
  public findConflicts(
    id: AppHotkeyId,
    hotkey: Hotkey,
    recordedWith?: RecordedKeyPresses,
  ): Array<AppHotkey> {
    return requireStore().findConflicts(id, hotkey, recordedWith)
  }

  public hostConnected(): void {
    // Adding the controller again while connected calls this twice.
    if (this._unsubscribe) return
    if (isServer()) return
    const update = () => this._host.requestUpdate()
    const unsubscribeAppHotkeys = subscribeAppHotkeys(update)
    const registrations = getHotkeyManager().registrations.subscribe(update)
    this._unsubscribe = () => {
      unsubscribeAppHotkeys()
      registrations.unsubscribe()
    }
  }

  public hostDisconnected(): void {
    this._unsubscribe?.()
    this._unsubscribe = undefined
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
