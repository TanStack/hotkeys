import { computed } from '@angular/core'
import {
  bindCustomHotkeyActions,
  requireAppHotkeysStore,
} from '@tanstack/hotkeys/adapter'
import { injectHotkeysContext } from './hotkeys-provider'
import { injectHotkeyRegistrations } from './injectHotkeyRegistrations'
import type { Signal } from '@angular/core'
import type {
  CustomHotkeyActions,
  CustomHotkeys,
  RegisteredAppHotkeyListItem,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function injectRequiredStore(name: string) {
  const context = injectHotkeysContext()
  return {
    store: requireAppHotkeysStore(
      context.appHotkeysStore,
      `${name} requires provideHotkeys with appHotkeys`,
    ),
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
  Array<RegisteredAppHotkeyListItem>
> {
  const { store, state } = injectRequiredStore('injectAppHotkeyList')
  const registrations = injectHotkeyRegistrations()
  return computed(() => {
    state()
    return store.getList(registrations())
  })
}

/** Custom hotkey state and actions returned by `injectCustomHotkeys`. */
export interface InjectCustomHotkeysResult extends Readonly<CustomHotkeyActions> {
  /** The user's hotkeys that differ from the defaults. */
  readonly customHotkeys: Signal<CustomHotkeys>
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
    ...bindCustomHotkeyActions(() => store),
  }
}
