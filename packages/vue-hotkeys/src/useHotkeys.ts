import { onScopeDispose, toValue, watch } from 'vue'
import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
} from '@tanstack/hotkeys/adapter'
import {
  useAppHotkeysStoreSource,
  useDefaultHotkeysOptionsSource,
} from './defaultOptions'
import type { MaybeRefOrGetter } from 'vue'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
  RegisterableHotkeyChord,
  RegisterableHotkeySequence,
} from '@tanstack/hotkeys'
import type {
  AdapterCommonOptions,
  AdapterHotkeyDefinition,
} from '@tanstack/hotkeys/adapter'
import type {
  UseAppHotkeyOptions,
  UseHotkeyChordOptions,
  UseHotkeyCommonOptions,
  UseHotkeyOptions,
  UseHotkeySequenceOptions,
  UseHotkeyTarget,
} from './useHotkey'

/**
 * One hotkey for `useHotkeys`. The hotkey and options may be refs or getters.
 * Chords accept `requireReset`; sequences accept `timeout`; hotkeys of unknown
 * kind accept only shared options.
 */
export type UseHotkeyDefinition =
  | {
      /** A chord string such as `'Mod+S'`, or a chord object */
      hotkey: MaybeRefOrGetter<RegisterableHotkeyChord>
      /** The function to call when the hotkey is pressed */
      callback: HotkeyCallback
      /** Per-hotkey options (merged on top of commonOptions) */
      options?: MaybeRefOrGetter<UseHotkeyChordOptions>
    }
  | {
      /** A sequence such as `['G', 'G']`, with each step a string or an object */
      hotkey: MaybeRefOrGetter<RegisterableHotkeySequence>
      callback: HotkeyCallback
      options?: MaybeRefOrGetter<UseHotkeySequenceOptions>
    }
  | {
      /** An app hotkey from `defineAppHotkeys` */
      hotkey: MaybeRefOrGetter<AppHotkey>
      callback: HotkeyCallback
      options?: MaybeRefOrGetter<UseAppHotkeyOptions>
    }
  | {
      /**
       * A hotkey whose kind is not known statically. Accepts only shared
       * options. `undefined`, `null`, or `''` registers nothing.
       */
      hotkey: MaybeRefOrGetter<RegisterableHotkey | null | undefined>
      callback: HotkeyCallback
      options?: MaybeRefOrGetter<UseHotkeyOptions>
    }

/** Resolves a ref or getter `enabled` so the core sees a boolean. */
function resolveEnabled<T extends { enabled?: MaybeRefOrGetter<boolean> }>(
  options: T | undefined,
): AdapterCommonOptions<UseHotkeyTarget> | undefined {
  if (!options) return options
  const { enabled, ...rest } = options
  return enabled === undefined ? rest : { ...rest, enabled: toValue(enabled) }
}

/**
 * Vue composable for registering several hotkeys at once: chords, sequences,
 * and app hotkeys. The list, each hotkey, and options may be refs or getters.
 *
 * Options merge in this order: provider defaults, app hotkey declaration,
 * commonOptions, per-hotkey options. Each option applies only to the kinds
 * that support it. Unbound app hotkeys, empty sequences, and `undefined`,
 * `null`, or `''` hotkeys register nothing.
 * A target that resolves to `null` skips registration until it is set.
 *
 * @example
 * ```ts
 * useHotkeys([
 *   { hotkey: 'Mod+S', callback: () => save() },
 *   { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
 * ])
 * ```
 */
export function useHotkeys(
  hotkeys: MaybeRefOrGetter<ReadonlyArray<UseHotkeyDefinition>>,
  commonOptions: MaybeRefOrGetter<UseHotkeyCommonOptions> = {},
): void {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const appHotkeys = useAppHotkeysStoreSource()
  const bindings = createHotkeyBindings()

  const stopWatcher = watch(
    () => {
      // Track app hotkeys so registrations move with custom hotkeys.
      void appHotkeys.state.value
      const definitions: Array<AdapterHotkeyDefinition<UseHotkeyTarget>> =
        toValue(hotkeys).map(
          (definition) =>
            ({
              hotkey: toValue(definition.hotkey),
              callback: definition.callback,
              options: resolveEnabled(toValue(definition.options)),
            }) as AdapterHotkeyDefinition<UseHotkeyTarget>,
        )
      return prepareHotkeyDefinitions(definitions, {
        appHotkeysStore: appHotkeys.store,
        defaults: resolveEnabled(defaultOptions().hotkey),
        commonOptions: resolveEnabled(toValue(commonOptions)),
        // A target that resolves to null skips registration until it is set.
        resolveTarget: (target) => toValue(target),
      })
    },
    (definitions) => bindings.update(definitions),
    { immediate: true },
  )

  onScopeDispose(() => {
    stopWatcher()
    bindings.destroy()
  })
}
