import { computed } from '@angular/core'
import { injectHotkeysContext } from './hotkeys-provider'
import { injectHotkeyRegistrations } from './injectHotkeyRegistrations'
import type { Signal } from '@angular/core'
import type {
  AppHotkey,
  AppHotkeyListItem,
  AppHotkeysStore,
  CustomHotkeys,
  Hotkey,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function injectRequiredStore(name: string) {
  const context = injectHotkeysContext()
  if (!context.appHotkeysStore) {
    throw new Error(`${name} requires provideHotkeys with appHotkeys`)
  }
  return {
    store:
      context.appHotkeysStore as unknown as AppHotkeysStore<RegisteredAppHotkeys>,
    state: context.appHotkeysState,
  }
}

/**
 * Returns a signal of the effective app hotkeys from `provideHotkeys`, typed
 * by `Register`: each declaration with the user's custom hotkey applied.
 *
 * @example
 * ```ts
 * appHotkeys = injectAppHotkeys()
 * constructor() {
 *   injectHotkey(() => this.appHotkeys()['doc.save'], () => this.save())
 * }
 * ```
 */
export function injectAppHotkeys(): Signal<RegisteredAppHotkeys> {
  const { store, state } = injectRequiredStore('injectAppHotkeys')
  return computed(() => {
    state()
    return store.appHotkeys
  })
}

/**
 * Lists every app hotkey with its live status, in declaration order, for
 * cheat sheets and settings screens. App hotkeys whose components have not
 * mounted are `'inactive'`; those without a hotkey are `'unbound'`.
 */
export function injectAppHotkeyList(): Signal<
  Array<AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>>
> {
  const { store, state } = injectRequiredStore('injectAppHotkeyList')
  const registrations = injectHotkeyRegistrations()
  return computed(() => {
    state()
    return store.getList(registrations())
  })
}

/** Custom hotkey state and actions returned by `injectCustomHotkeys`. */
export interface InjectCustomHotkeysResult {
  /** The user's hotkeys that differ from the defaults. */
  readonly customHotkeys: Signal<CustomHotkeys>
  /**
   * Sets the user's hotkey for an app hotkey. `null` unbinds it.
   * Returns conflicting app hotkeys; when any exist, nothing changes.
   */
  readonly setCustomHotkey: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey | null,
  ) => Array<AppHotkey>
  /** Restores the default hotkey for an app hotkey. */
  readonly resetCustomHotkey: (id: keyof RegisteredAppHotkeys & string) => void
  /** Restores every default hotkey. */
  readonly resetCustomHotkeys: () => void
  /** Other app hotkeys that would collide if `id` used `hotkey`. */
  readonly findConflicts: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey,
  ) => Array<AppHotkey>
}

/**
 * Reads and changes the user's custom hotkeys. Changes apply to every
 * registered app hotkey immediately and are passed to `onCustomHotkeysChange`
 * from `provideHotkeys`, ready to save.
 */
export function injectCustomHotkeys(): InjectCustomHotkeysResult {
  const { store, state } = injectRequiredStore('injectCustomHotkeys')
  return {
    customHotkeys: computed(() => {
      state()
      return store.customHotkeys
    }),
    setCustomHotkey: (id, hotkey) => store.setCustomHotkey(id, hotkey),
    resetCustomHotkey: (id) => store.resetCustomHotkey(id),
    resetCustomHotkeys: () => store.resetCustomHotkeys(),
    findConflicts: (id, hotkey) => store.findConflicts(id, hotkey),
  }
}
