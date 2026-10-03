import { UseHotkey } from './useHotkey'
import { UseHotkeys } from './useHotkeys'
import { UseHotkeySequence } from './useHotkeySequence'
import { UseHotkeySequences } from './useHotkeySequences'
import { useHotkeyRecorder } from './useHotkeyRecorder'
import { useHotkeySequenceRecorder } from './useHotkeySequenceRecorder'
import { read } from './utils'
import type { DefaultHotkeysOptions } from './types'
import type { MaybeGetter } from './utils'

/** Helpers and recorder factories with shared defaults. Owners retain their own cleanup. */
export interface EmberHotkeysScope {
  useHotkey: typeof UseHotkey
  useHotkeys: typeof UseHotkeys
  useHotkeySequence: typeof UseHotkeySequence
  useHotkeySequences: typeof UseHotkeySequences
  useHotkeyRecorder: typeof useHotkeyRecorder
  useHotkeySequenceRecorder: typeof useHotkeySequenceRecorder
}

/**
 * Creates contextual helpers and recorders with shared, optionally reactive defaults.
 * Pass the scope to child components through arguments to share configuration.
 */
export function createHotkeysScope(
  defaultOptions: MaybeGetter<DefaultHotkeysOptions> = {},
): EmberHotkeysScope {
  return {
    useHotkey: class extends UseHotkey {
      override compute(...[args, options]: Parameters<UseHotkey['compute']>) {
        super.compute(args, { ...read(defaultOptions).hotkey, ...options })
      }
    },
    useHotkeys: class extends UseHotkeys {
      override compute(...[args, options]: Parameters<UseHotkeys['compute']>) {
        super.compute(args, { ...read(defaultOptions).hotkey, ...options })
      }
    },
    useHotkeySequence: class extends UseHotkeySequence {
      override compute(
        ...[args, options]: Parameters<UseHotkeySequence['compute']>
      ) {
        super.compute(args, {
          ...read(defaultOptions).hotkeySequence,
          ...options,
        })
      }
    },
    useHotkeySequences: class extends UseHotkeySequences {
      override compute(
        ...[args, options]: Parameters<UseHotkeySequences['compute']>
      ) {
        super.compute(args, {
          ...read(defaultOptions).hotkeySequence,
          ...options,
        })
      }
    },
    useHotkeyRecorder: (owner, options) =>
      useHotkeyRecorder(owner, () => ({
        ...read(defaultOptions).hotkeyRecorder,
        ...read(options),
      })),
    useHotkeySequenceRecorder: (owner, options) =>
      useHotkeySequenceRecorder(owner, () => ({
        ...read(defaultOptions).hotkeySequenceRecorder,
        ...read(options),
      })),
  }
}
