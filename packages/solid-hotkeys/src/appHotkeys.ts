import { createMemo } from 'solid-js'
import { useAppHotkeysStoreSource } from './defaultOptions'
import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import type {
  AppHotkey,
  AppHotkeyListItem,
  AppHotkeysStore,
  CustomHotkeys,
  Hotkey,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function useRequiredStore(name: string) {
  const source = useAppHotkeysStoreSource()
  if (!source.store) {
    throw new Error(
      `${name} requires a HotkeysProvider with an appHotkeys prop`,
    )
  }
  return {
    store: source.store as unknown as AppHotkeysStore<RegisteredAppHotkeys>,
    state: source.state,
  }
}

/**
 * Returns an accessor for the effective app hotkeys from `HotkeysProvider`,
 * typed by `Register`: each declaration with the user's custom hotkey applied.
 *
 * @example
 * ```tsx
 * const hotkeys = useAppHotkeys()
 * createHotkey(() => hotkeys()['doc.save'], () => save())
 * ```
 */
export function useAppHotkeys(): () => RegisteredAppHotkeys {
  const { store, state } = useRequiredStore('useAppHotkeys')
  return createMemo(() => {
    state()
    return store.appHotkeys
  })
}

/**
 * Lists every app hotkey with its live status, in declaration order, for
 * cheat sheets and settings screens. App hotkeys whose components have not
 * mounted are `'inactive'`; those without a hotkey are `'unbound'`.
 */
export function createAppHotkeyList(): () => Array<
  AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>
> {
  const { store, state } = useRequiredStore('createAppHotkeyList')
  const registrations = createHotkeyRegistrations()
  return createMemo(() => {
    state()
    return store.getList(registrations())
  })
}

/** Custom hotkey state and actions returned by `useCustomHotkeys`. */
export interface UseCustomHotkeysResult {
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: () => CustomHotkeys
  /**
   * Sets the user's hotkey for an app hotkey. `null` unbinds it.
   * Returns conflicting app hotkeys; when any exist, nothing changes.
   */
  setCustomHotkey: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey | null,
  ) => Array<AppHotkey>
  /** Restores the default hotkey for an app hotkey. */
  resetCustomHotkey: (id: keyof RegisteredAppHotkeys & string) => void
  /** Restores every default hotkey. */
  resetCustomHotkeys: () => void
  /** Other app hotkeys that would collide if `id` used `hotkey`. */
  findConflicts: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey,
  ) => Array<AppHotkey>
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
      return store.customHotkeys
    }),
    setCustomHotkey: (id, hotkey) => store.setCustomHotkey(id, hotkey),
    resetCustomHotkey: (id) => store.resetCustomHotkey(id),
    resetCustomHotkeys: () => store.resetCustomHotkeys(),
    findConflicts: (id, hotkey) => store.findConflicts(id, hotkey),
  }
}
