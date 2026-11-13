import {
  bindCustomHotkeyActions,
  requireAppHotkeysStore,
} from '@tanstack/hotkeys/adapter'
import { computed } from 'vue'
import { useAppHotkeysStoreSource } from './defaultOptions'
import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import type {
  CustomHotkeyActions,
  CustomHotkeys,
  RegisteredAppHotkeyListItem,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'
import type { ComputedRef } from 'vue'

function useRequiredStore(name: string) {
  const source = useAppHotkeysStoreSource()
  const message = `${name} requires a HotkeysProvider with app hotkeys`
  const initial = requireAppHotkeysStore(source.store, message)
  return {
    // The nearest provider's store, which changes if a nested provider gets
    // its app hotkeys later. Typed by `Register`, like `initial`.
    store: () => requireAppHotkeysStore(source.store ?? initial, message),
    state: source.state,
  }
}

/**
 * Returns a computed ref of the effective app hotkeys from `HotkeysProvider`,
 * typed by `Register`: each declaration with the user's custom hotkey applied.
 *
 * @example
 * ```ts
 * const appHotkeys = useAppHotkeys()
 * useHotkey(() => appHotkeys.value['doc.save'], () => save())
 * ```
 */
export function useAppHotkeys(): ComputedRef<RegisteredAppHotkeys> {
  const { store, state } = useRequiredStore('useAppHotkeys')
  return computed(() => {
    void state.value
    return store().appHotkeys
  })
}

/**
 * Lists every app hotkey with its live status, in declaration order, for
 * cheat sheets and settings screens. App hotkeys whose components have not
 * mounted are `'inactive'`; those without a hotkey are `'unbound'`.
 */
export function useAppHotkeyList(): ComputedRef<
  Array<RegisteredAppHotkeyListItem>
> {
  const { store, state } = useRequiredStore('useAppHotkeyList')
  const registrations = useHotkeyRegistrations()
  return computed(() => {
    void state.value
    return store().getList(registrations.value)
  })
}

/** Custom hotkey state and actions returned by `useCustomHotkeys`. */
export interface UseCustomHotkeysResult extends CustomHotkeyActions {
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: ComputedRef<CustomHotkeys>
}

/**
 * Reads and changes the user's custom hotkeys. Changes apply to every
 * registered app hotkey immediately and are emitted by the provider as
 * `custom-hotkeys-change`, ready to save.
 */
export function useCustomHotkeys(): UseCustomHotkeysResult {
  const { store, state } = useRequiredStore('useCustomHotkeys')
  return {
    customHotkeys: computed(() => {
      void state.value
      return store().customHotkeys
    }),
    ...bindCustomHotkeyActions(store),
  }
}
