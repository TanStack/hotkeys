import {
  bindCustomHotkeyActions,
  requireAppHotkeysStore,
} from '@tanstack/hotkeys/adapter'
import { createMemo } from 'solid-js'
import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import { useAppHotkeysStoreSource } from './defaultOptions'
import type {
  CustomHotkeyActions,
  CustomHotkeys,
  RegisteredAppHotkeyListItem,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function useRequiredStore(name: string) {
  const source = useAppHotkeysStoreSource()
  const message = `${name} requires a HotkeysProvider with an appHotkeys prop`
  const initial = requireAppHotkeysStore(source.store, message)
  return {
    // The nearest provider's store, which changes if a nested provider gets
    // its app hotkeys later.
    store: () => requireAppHotkeysStore(source.store ?? initial, message),
    state: source.state,
  }
}

/**
 * Returns an accessor for the effective app hotkeys from `HotkeysProvider`,
 * typed by `Register`: each declaration with the user's custom hotkey applied.
 *
 * @example
 * ```tsx
 * const appHotkeys = useAppHotkeys()
 * createHotkey(() => appHotkeys()['doc.save'], () => save())
 * ```
 */
export function useAppHotkeys(): () => RegisteredAppHotkeys {
  const { store, state } = useRequiredStore('useAppHotkeys')
  return createMemo(() => {
    state()
    return store().appHotkeys
  })
}

/**
 * Lists every app hotkey with its live status, in declaration order, for
 * cheat sheets and settings screens. App hotkeys whose components have not
 * mounted are `'inactive'`; those without a hotkey are `'unbound'`.
 */
export function createAppHotkeyList(): () => Array<RegisteredAppHotkeyListItem> {
  const { store, state } = useRequiredStore('createAppHotkeyList')
  const registrations = createHotkeyRegistrations()
  return createMemo(() => {
    state()
    return store().getList(registrations())
  })
}

/** Custom hotkey state and actions returned by `useCustomHotkeys`. */
export interface UseCustomHotkeysResult extends CustomHotkeyActions {
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: () => CustomHotkeys
}

/**
 * Reads and changes the user's custom hotkeys. Changes apply to every
 * registered app hotkey immediately and are passed to the provider's
 * `onCustomHotkeysChange`, ready to save.
 */
export function useCustomHotkeys(): UseCustomHotkeysResult {
  const { store, state } = useRequiredStore('useCustomHotkeys')
  return {
    customHotkeys: createMemo(() => {
      state()
      return store().customHotkeys
    }),
    ...bindCustomHotkeyActions(store),
  }
}
