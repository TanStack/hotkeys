import { createScope } from './scope'
import { createHotkey } from './createHotkey'
import { createHotkeys } from './createHotkeys'
import { createHotkeySequence } from './createHotkeySequence'
import { createHotkeySequences } from './createHotkeySequences'
import { createHeldKeys } from './createHeldKeys'
import { createHeldKeyCodes } from './createHeldKeyCodes'
import { createKeyHold } from './createKeyHold'
import { createHotkeyHint } from './createHotkeyHint'
import { createHotkeyRegistrations } from './createHotkeyRegistrations'
import { createHotkeyRecorder } from './createHotkeyRecorder'
import { createHotkeySequenceRecorder } from './createHotkeySequenceRecorder'
import type { AlpineHotkeys, DefaultHotkeysOptions, MaybeGetter } from './types'

export type { AlpineHotkeys, DefaultHotkeysOptions, MaybeGetter } from './types'

/** Owns Alpine effects and Store subscriptions, with optional shared defaults. Call destroy from x-data's destroy hook. */
export function createHotkeysScope(
  defaultOptions: MaybeGetter<DefaultHotkeysOptions> = {},
): AlpineHotkeys {
  const scope = createScope(defaultOptions)
  return {
    createHotkey: (...args) => createHotkey(scope, ...args),
    createHotkeys: (...args) => createHotkeys(scope, ...args),
    createHotkeySequence: (...args) => createHotkeySequence(scope, ...args),
    createHotkeySequences: (...args) => createHotkeySequences(scope, ...args),
    createHeldKeys: (...args) => createHeldKeys(scope, ...args),
    createHeldKeyCodes: (...args) => createHeldKeyCodes(scope, ...args),
    createKeyHold: (...args) => createKeyHold(scope, ...args),
    createHotkeyHint: (...args) => createHotkeyHint(scope, ...args),
    createHotkeyRegistrations: (...args) =>
      createHotkeyRegistrations(scope, ...args),
    createHotkeyRecorder: (...args) => createHotkeyRecorder(scope, ...args),
    createHotkeySequenceRecorder: (...args) =>
      createHotkeySequenceRecorder(scope, ...args),
    destroy: scope.destroy,
  }
}
