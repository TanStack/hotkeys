import {
  bindCustomHotkeyActions,
  requireAppHotkeysStore,
} from '@tanstack/hotkeys/adapter'
import { getHotkeysContext } from './HotkeysCtx.js'
import { getHotkeyRegistrations } from './getHotkeyRegistrations.svelte.js'
import { createAppHotkeysSource } from './internal.svelte.js'
import type {
  CustomHotkeyActions,
  CustomHotkeys,
  RegisteredAppHotkeyListItem,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

function requireStore(name: string) {
  const source = createAppHotkeysSource(getHotkeysContext())
  const message = `${name} requires a HotkeysProvider with appHotkeys`
  const initial = source.store
  requireAppHotkeysStore(initial, message)
  return {
    // The nearest provider's store, which changes if a nested provider gets
    // its app hotkeys later.
    store: () => requireAppHotkeysStore(source.store ?? initial, message),
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
  readonly current: Array<RegisteredAppHotkeyListItem>
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

export interface SvelteCustomHotkeys extends CustomHotkeyActions {
  /** The user's hotkeys that differ from the defaults. */
  readonly current: CustomHotkeys
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
    ...bindCustomHotkeyActions(store),
  }
}
