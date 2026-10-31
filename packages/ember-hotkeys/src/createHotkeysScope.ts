import { definedOptions, withDefaults } from '@tanstack/hotkeys/adapter'
import { OnHotkey } from './onHotkey'
import { OnHotkeys } from './onHotkeys'
import { UseHotkey } from './useHotkey'
import { UseHotkeys } from './useHotkeys'
import { useHotkeyRecorder } from './useHotkeyRecorder'
import { read } from './utils'
import type { HotkeySequenceRecorderOptions } from '@tanstack/hotkeys'
import type { DefaultHotkeysOptions } from './types'
import type { MaybeGetter } from './utils'

/** Helpers, modifiers, and recorder factories with shared defaults. Owners retain their own cleanup. */
export interface EmberHotkeysScope {
  onHotkey: typeof OnHotkey
  onHotkeys: typeof OnHotkeys
  useHotkey: typeof UseHotkey
  useHotkeys: typeof UseHotkeys
  useHotkeyRecorder: typeof useHotkeyRecorder
}

/**
 * Creates contextual helpers, modifiers, and recorders with shared, optionally reactive defaults.
 * Pass the scope to child components through arguments to share configuration.
 */
export function createHotkeysScope(
  defaultOptions: MaybeGetter<DefaultHotkeysOptions> = {},
): EmberHotkeysScope {
  return {
    onHotkey: class extends OnHotkey {
      override modify(
        ...[element, args, options]: Parameters<OnHotkey['modify']>
      ) {
        super.modify(element, args, {
          ...definedOptions(read(defaultOptions).hotkey, options),
        })
      }
    },
    onHotkeys: class extends OnHotkeys {
      override modify(
        ...[element, args, options]: Parameters<OnHotkeys['modify']>
      ) {
        super.modify(element, args, {
          ...definedOptions(read(defaultOptions).hotkey, options),
        })
      }
    },
    useHotkey: class extends UseHotkey {
      override compute(...[args, options]: Parameters<UseHotkey['compute']>) {
        super.compute(args, {
          ...definedOptions(read(defaultOptions).hotkey, options),
        })
      }
    },
    useHotkeys: class extends UseHotkeys {
      override compute(...[args, options]: Parameters<UseHotkeys['compute']>) {
        super.compute(args, {
          ...definedOptions(read(defaultOptions).hotkey, options),
        })
      }
    },
    useHotkeyRecorder: ((owner: object, options: MaybeGetter<object>) =>
      useHotkeyRecorder(
        owner,
        () =>
          withDefaults(
            read(defaultOptions).hotkeyRecorder,
            read(options),
          ) as HotkeySequenceRecorderOptions,
      )) as typeof useHotkeyRecorder,
  }
}
