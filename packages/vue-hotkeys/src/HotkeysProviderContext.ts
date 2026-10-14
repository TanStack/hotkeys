import { inject, onScopeDispose, provide, toValue, watch } from 'vue'
import { AppHotkeysStore, publishAppHotkeysStore } from '@tanstack/hotkeys'
import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import type {
  AppHotkeys,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { UseHotkeyCommonOptions } from './useHotkey'

export interface HotkeysProviderOptions {
  /**
   * Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
   * `requireReset` applies to chords and `timeout` applies to sequences.
   */
  hotkey?: UseHotkeyCommonOptions
  /** Defaults for every `useHotkeyRecorder`. */
  hotkeyRecorder?: Partial<
    Omit<
      HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions,
      'maxSteps' | 'onRecord' | 'validate'
    >
  >
}

interface HotkeysContextValue {
  readonly appHotkeysStore: AppHotkeysStore | null
  readonly defaultOptions: HotkeysProviderOptions
}

const HotkeysContext: InjectionKey<HotkeysContextValue> =
  Symbol('HotkeysContext')

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

/** Options for `provideHotkeysContext`. */
export interface ProvideHotkeysContextOptions {
  defaultOptions?: MaybeRefOrGetter<HotkeysProviderOptions | undefined>
  /**
   * Every app hotkey, from `defineAppHotkeys`. Read when the context is
   * provided; later changes update the declarations.
   */
  appHotkeys?: MaybeRefOrGetter<AppHotkeys | undefined>
  /**
   * Starting custom hotkeys, such as saved data. Read once; the context owns
   * the state afterwards. Invalid entries are ignored with a warning.
   */
  customHotkeys?: CustomHotkeys | null
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys) => void
}

/**
 * Provides default options, app hotkeys, and the user's custom hotkeys to
 * descendants. `HotkeysProvider` calls this; call it directly in a root
 * component's setup instead of rendering the provider.
 *
 * @example
 * ```ts
 * provideHotkeysContext({
 *   appHotkeys,
 *   customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
 *   onCustomHotkeysChange: (custom) =>
 *     localStorage.setItem('hotkeys', JSON.stringify(custom)),
 * })
 * ```
 */
export function provideHotkeysContext(
  options: ProvideHotkeysContextOptions = {},
) {
  const appHotkeys = toValue(options.appHotkeys)
  const store = appHotkeys
    ? new AppHotkeysStore(appHotkeys, {
        customHotkeys: options.customHotkeys,
        onCustomHotkeysChange: (custom) =>
          options.onCustomHotkeysChange?.(custom),
      })
    : null

  if (store) {
    // Keep declarations current (for example after hot module replacement).
    watch(
      () => toValue(options.appHotkeys),
      (next) => {
        if (next) store.setAppHotkeys(next)
      },
    )
    // Publish the store so devtools can list declared hotkeys.
    if (typeof document !== 'undefined') {
      onScopeDispose(publishAppHotkeysStore(store))
    }
  }

  const contextValue: HotkeysContextValue = {
    appHotkeysStore: store,
    get defaultOptions() {
      return toValue(options.defaultOptions) ?? DEFAULT_OPTIONS
    },
  }

  provide(HotkeysContext, contextValue)
}

export function useHotkeysContext() {
  return inject(HotkeysContext, null)
}

export function useDefaultHotkeysOptions() {
  const context = inject(HotkeysContext, null)
  return context?.defaultOptions ?? DEFAULT_OPTIONS
}
