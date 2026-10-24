import { createScope } from './scope'
import { createHotkey } from './createHotkey'
import { createHotkeys } from './createHotkeys'
import { createHeldKeys } from './createHeldKeys'
import { createHeldKeyCodes } from './createHeldKeyCodes'
import { createKeyHold } from './createKeyHold'
import { createHotkeyHint } from './createHotkeyHint'
import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import { createHotkeyScopesState } from './createHotkeyScopesState'
import { createHotkeyRecorder } from './createHotkeyRecorder'
import {
  createAppHotkeyList,
  createAppHotkeys,
  createCustomHotkeys,
} from './createAppHotkeys'
import type {
  AlpineCreateHotkeyRecorder,
  AlpineHotkeys,
  DefaultHotkeysOptions,
  MaybeGetter,
} from './types'

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
  return {
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
    createHotkeyRecorder: ((options) =>
      createHotkeyRecorder(scope, options)) as AlpineCreateHotkeyRecorder,
    createAppHotkeys: () => createAppHotkeys(scope),
    createAppHotkeyList: () => createAppHotkeyList(scope),
    createCustomHotkeys: () => createCustomHotkeys(scope),
    destroy: scope.destroy,
  }
}
