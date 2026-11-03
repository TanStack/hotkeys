import {
  definedOptions,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import { OnHotkey } from './onHotkey'
import { OnHotkeys } from './onHotkeys'
import { UseHotkey } from './useHotkey'
import { UseHotkeys } from './useHotkeys'
import { read, scopeDefaults } from './utils'
import type { DefaultHotkeysOptions } from './types'
import type { MaybeGetter } from './utils'

/**
 * Helpers and modifiers with shared defaults. Owners retain their own cleanup.
 * Pass the scope to `useHotkeyRecorder` to apply its recorder defaults, and to
 * `useFormatForDisplay` to apply its `platform`.
 */
export interface EmberHotkeysScope {
  onHotkey: typeof OnHotkey
  onHotkeys: typeof OnHotkeys
  useHotkey: typeof UseHotkey
  useHotkeys: typeof UseHotkeys
}

/**
 * Creates contextual helpers and modifiers with shared, optionally reactive defaults.
 * Pass the scope to child components through arguments to share configuration.
 */
export function createHotkeysScope(
  defaultOptions: MaybeGetter<DefaultHotkeysOptions> = {},
): EmberHotkeysScope {
  // Puts `platform` into the hotkey and recorder defaults.
  const defaults = () =>
    mergeHotkeysProviderDefaults(undefined, read(defaultOptions), undefined)
  const scope: EmberHotkeysScope = {
    onHotkey: class extends OnHotkey {
      override modify(
        ...[element, args, options]: Parameters<OnHotkey['modify']>
      ) {
        super.modify(element, args, {
          ...definedOptions(defaults().hotkey, options),
        })
      }
    },
    onHotkeys: class extends OnHotkeys {
      override modify(
        ...[element, args, options]: Parameters<OnHotkeys['modify']>
      ) {
        super.modify(element, args, {
          ...definedOptions(defaults().hotkey, options),
        })
      }
    },
    useHotkey: class extends UseHotkey {
      override compute(...[args, options]: Parameters<UseHotkey['compute']>) {
        super.compute(args, {
          ...definedOptions(defaults().hotkey, options),
        })
      }
    },
    useHotkeys: class extends UseHotkeys {
      override compute(...[args, options]: Parameters<UseHotkeys['compute']>) {
        super.compute(args, {
          ...definedOptions(defaults().hotkey, options),
        })
      }
    },
  }
  scopeDefaults.set(scope, defaults)
  return scope
}
