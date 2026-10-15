import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { getAppHotkeysStore, subscribeAppHotkeys } from './_app-hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type {
  AppHotkey,
  AppHotkeyListItem,
  AppHotkeysStore,
  CustomHotkeys,
  Hotkey,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function requireStore(): AppHotkeysStore<RegisteredAppHotkeys> {
  const store = getAppHotkeysStore()
  if (!store) {
    throw new Error('AppHotkeysController requires provideAppHotkeys()')
  }
  return store
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
export class AppHotkeysController implements ReactiveController {
  private _unsubscribe: (() => void) | undefined

  constructor(private _host: ReactiveControllerHost) {
    this._host.addController(this)
  }

  /** Effective app hotkeys, typed by `Register`. */
  public get appHotkeys(): RegisteredAppHotkeys {
    return requireStore().appHotkeys
  }

  /** Every app hotkey with its live status, in declaration order. */
  public get list(): Array<
    AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>
  > {
    return requireStore().getList(
      Array.from(getHotkeyManager().registrations.state.values()).map(
        toHotkeyRegistrationView,
      ),
    )
  }

  /** The user's hotkeys that differ from the defaults. */
  public get customHotkeys(): CustomHotkeys {
    return requireStore().customHotkeys
  }

  /**
   * Sets the user's hotkey for an app hotkey. `null` unbinds it.
   * Returns conflicting app hotkeys; when any exist, nothing changes.
   */
  public setCustomHotkey(
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey | null,
  ): Array<AppHotkey> {
    return requireStore().setCustomHotkey(id, hotkey)
  }

  /** Restores the default hotkey for an app hotkey. */
  public resetCustomHotkey(id: keyof RegisteredAppHotkeys & string): void {
    requireStore().resetCustomHotkey(id)
  }

  /** Restores every default hotkey. */
  public resetCustomHotkeys(): void {
    requireStore().resetCustomHotkeys()
  }

  /** Other app hotkeys that would collide if `id` used `hotkey`. */
  public findConflicts(
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey,
  ): Array<AppHotkey> {
    return requireStore().findConflicts(id, hotkey)
  }

  public hostConnected(): void {
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
}
