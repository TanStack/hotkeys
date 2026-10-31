import { createScope, ownerScopes } from './scope'
import { createHotkey } from './createHotkey'
import { createHotkeys } from './createHotkeys'
import { createHeldKeys } from './createHeldKeys'
import { createHeldKeyCodes } from './createHeldKeyCodes'
import { createKeyHold } from './createKeyHold'
import { createHotkeyHint } from './createHotkeyHint'
import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import { createHotkeyScopesState } from './createHotkeyScopesState'
import {
  createAppHotkeyList,
  createAppHotkeys,
  createCustomHotkeys,
} from './createAppHotkeys'
import type { AlpineHotkeys, DefaultHotkeysOptions, MaybeGetter } from './types'

export type { AlpineHotkeys, DefaultHotkeysOptions, MaybeGetter } from './types'

/**
 * Owns Alpine effects and Store subscriptions, with optional shared defaults.
 * App hotkeys come from `provideAppHotkeys`. Call destroy from x-data's
 * destroy hook.
 */
export function createHotkeysScope(
  defaultOptions: MaybeGetter<DefaultHotkeysOptions> = {},
): AlpineHotkeys {
  const scope = createScope(defaultOptions)
  const owner: AlpineHotkeys = {
    createHotkey: (
      ...args: Parameters<typeof createHotkey> extends [unknown, ...infer TArgs]
        ? TArgs
        : never
    ) => createHotkey(scope, ...args),
    createHotkeys: (...args) => createHotkeys(scope, ...args),
    createHeldKeys: (...args) => createHeldKeys(scope, ...args),
    createHeldKeyCodes: (...args) => createHeldKeyCodes(scope, ...args),
    createKeyHold: (...args) => createKeyHold(scope, ...args),
    createHotkeyHint: (...args) => createHotkeyHint(scope, ...args),
    createHotkeyRegistrations: (...args) =>
      createHotkeyRegistrations(scope, ...args),
    createHotkeyScopesState: () => createHotkeyScopesState(scope),
    createAppHotkeys: () => createAppHotkeys(scope),
    createAppHotkeyList: () => createAppHotkeyList(scope),
    createCustomHotkeys: () => createCustomHotkeys(scope),
    destroy: scope.destroy,
  }
  ownerScopes.set(owner, scope)
  return owner
}
