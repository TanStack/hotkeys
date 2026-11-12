import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import type { AppHotkeysStore, RegisteredAppHotkeys } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { AlpineCustomHotkeys } from './types'

function requireStore(
  scope: HotkeysScope,
): AppHotkeysStore<RegisteredAppHotkeys> {
  const store = scope.appHotkeys()
  if (!store) {
    throw new Error('[hotkeys] App hotkeys require provideAppHotkeys()')
  }
  return store
}

export function createAppHotkeys(scope: HotkeysScope) {
  return {
    get value() {
      return requireStore(scope).appHotkeys
    },
  }
}

export function createAppHotkeyList(scope: HotkeysScope) {
  const registrations = createHotkeyRegistrations(scope)
  return {
    get value() {
      return requireStore(scope).getList(registrations.hotkeys)
    },
  }
}

export function createCustomHotkeys(scope: HotkeysScope): AlpineCustomHotkeys {
  return {
    get value() {
      return requireStore(scope).customHotkeys
    },
    setCustomHotkey: (id, hotkey, recordedWith) =>
      requireStore(scope).setCustomHotkey(id, hotkey, recordedWith),
    resetCustomHotkey: (id) => requireStore(scope).resetCustomHotkey(id),
    resetCustomHotkeys: () => requireStore(scope).resetCustomHotkeys(),
    findConflicts: (id, hotkey, recordedWith) =>
      requireStore(scope).findConflicts(id, hotkey, recordedWith),
  }
}
