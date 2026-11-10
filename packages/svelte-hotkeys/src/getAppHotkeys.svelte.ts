import { getHotkeysContext } from './HotkeysCtx.js'
import { getHotkeyRegistrations } from './getHotkeyRegistrations.svelte.js'
import { createAppHotkeysSource } from './internal.svelte.js'
import type {
  AppHotkey,
  AppHotkeyListItem,
  AppHotkeysStore,
  CustomHotkeys,
  Hotkey,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function requireStore(name: string) {
  const source = createAppHotkeysSource(getHotkeysContext())
  const initial = source.store
  if (!initial) {
    throw new Error(
      `[hotkeys] ${name} requires a HotkeysProvider with appHotkeys`,
    )
  }
  return {
    // The nearest provider's store, which changes if a nested provider gets
    // its app hotkeys later.
    store: () =>
      (source.store ??
        initial) as unknown as AppHotkeysStore<RegisteredAppHotkeys>,
    subscribe: source.subscribe,
  }
}

export interface SvelteAppHotkeys {
  /** Effective app hotkeys: each declaration with the user's custom hotkey applied. */
  readonly current: RegisteredAppHotkeys
}

/**
 * Returns reactive access to the effective app hotkeys from `HotkeysProvider`,
 * typed by `Register`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const appHotkeys = getAppHotkeys()
 *   createHotkey(() => appHotkeys.current['doc.save'], () => save())
 * </script>
 * ```
 */
export function getAppHotkeys(): SvelteAppHotkeys {
  const { store, subscribe } = requireStore('getAppHotkeys')
  return {
    get current() {
      subscribe()
      return store().appHotkeys
    },
  }
}

export interface SvelteAppHotkeyList {
  /** Every app hotkey with its live status, in declaration order. */
  readonly current: Array<
    AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>
  >
}

/**
 * Lists every app hotkey with its live status, for cheat sheets and settings
 * screens. App hotkeys whose components have not mounted are `'inactive'`;
 * those without a hotkey are `'unbound'`.
 */
export function getAppHotkeyList(): SvelteAppHotkeyList {
  const { store, subscribe } = requireStore('getAppHotkeyList')
  const registrations = getHotkeyRegistrations()
  return {
    get current() {
      subscribe()
      return store().getList(registrations.hotkeys)
    },
  }
}

export interface SvelteCustomHotkeys {
  /** The user's hotkeys that differ from the defaults. */
  readonly current: CustomHotkeys
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
export function getCustomHotkeys(): SvelteCustomHotkeys {
  const { store, subscribe } = requireStore('getCustomHotkeys')
  return {
    get current() {
      subscribe()
      return store().customHotkeys
    },
    setCustomHotkey: (id, hotkey) => store().setCustomHotkey(id, hotkey),
    resetCustomHotkey: (id) => store().resetCustomHotkey(id),
    resetCustomHotkeys: () => store().resetCustomHotkeys(),
    findConflicts: (id, hotkey) => store().findConflicts(id, hotkey),
  }
}
