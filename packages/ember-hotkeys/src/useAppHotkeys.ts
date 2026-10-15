import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import { trackPublishedAppHotkeys } from './utils'
import type { AppHotkeysStore, RegisteredAppHotkeys } from '@tanstack/hotkeys'
import type {
  EmberAppHotkeyList,
  EmberCustomHotkeys,
  EmberHotkeyState,
} from './types'

function requireStore(
  store: () => AppHotkeysStore | null,
): AppHotkeysStore<RegisteredAppHotkeys> {
  const current = store()
  if (!current) throw new Error('App hotkeys require provideAppHotkeys()')
  return current
}

/** Reads the effective app hotkeys from `provideAppHotkeys`, typed by `Register`. */
export function useAppHotkeys(
  owner: object,
): EmberHotkeyState<RegisteredAppHotkeys> {
  const store = trackPublishedAppHotkeys(owner)
  return {
    get value() {
      return requireStore(store).appHotkeys
    },
  }
}

/**
 * Lists every app hotkey with its live status, for cheat sheets and settings
 * screens. App hotkeys whose components have not rendered are `'inactive'`;
 * those without a hotkey are `'unbound'`.
 */
export function useAppHotkeyList(owner: object): EmberAppHotkeyList {
  const store = trackPublishedAppHotkeys(owner)
  const registrations = useHotkeyRegistrations(owner)
  return {
    get value() {
      return requireStore(store).getList(registrations.hotkeys)
    },
  }
}

/**
 * Reads and changes the user's custom hotkeys. Changes apply to every
 * registered app hotkey immediately and are passed to
 * `onCustomHotkeysChange`, ready to save.
 */
export function useCustomHotkeys(owner: object): EmberCustomHotkeys {
  const store = trackPublishedAppHotkeys(owner)
  return {
    get value() {
      return requireStore(store).customHotkeys
    },
    setCustomHotkey: (id, hotkey) =>
      requireStore(store).setCustomHotkey(id, hotkey),
    resetCustomHotkey: (id) => requireStore(store).resetCustomHotkey(id),
    resetCustomHotkeys: () => requireStore(store).resetCustomHotkeys(),
    findConflicts: (id, hotkey) =>
      requireStore(store).findConflicts(id, hotkey),
  }
}
