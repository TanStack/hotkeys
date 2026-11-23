import {
  bindCustomHotkeyActions,
  requireAppHotkeysStore,
} from '@tanstack/hotkeys/adapter'
import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import type { AppHotkeysStore, RegisteredAppHotkeys } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { AlpineCustomHotkeys } from './types'

function requireStore(
  scope: HotkeysScope,
): AppHotkeysStore<RegisteredAppHotkeys> {
  return requireAppHotkeysStore(
    scope.appHotkeys(),
    'App hotkeys require provideAppHotkeys()',
  )
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
    ...bindCustomHotkeyActions(() => requireStore(scope)),
  }
}
