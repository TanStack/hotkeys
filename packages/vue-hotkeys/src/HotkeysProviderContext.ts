import {
  computed,
  inject,
  onMounted,
  onScopeDispose,
  provide,
  toValue,
  watch,
} from 'vue'
import { AppHotkeysStore, publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  activateHotkeysProviderScope,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import type {
  AppHotkeys,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
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
  /** Merged with every ancestor's defaults, including `hotkey.scope`. */
  readonly defaultOptions: HotkeysProviderOptions
  /** Whether this context and every ancestor are enabled. */
  readonly enabled: boolean
}

const HotkeysContext: InjectionKey<HotkeysContextValue> =
  Symbol('HotkeysContext')

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

/** Options for `provideHotkeysContext`. */
export interface ProvideHotkeysContextOptions {
  /** Merged with the parent context's defaults. */
  defaultOptions?: MaybeRefOrGetter<HotkeysProviderOptions | undefined>
  /** See `HotkeysProviderScopeProps['scope']`. */
  scope?: MaybeRefOrGetter<HotkeysProviderScopeProps['scope']>
  /** See `HotkeysProviderScopeProps['exclusive']`. */
  exclusive?: MaybeRefOrGetter<HotkeysProviderScopeProps['exclusive']>
  /** See `HotkeysProviderScopeProps['enabled']`. */
  enabled?: MaybeRefOrGetter<HotkeysProviderScopeProps['enabled']>
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
 * descendants. `HotkeysProvider` calls this; call it directly in a component's
 * setup instead of rendering the provider.
 *
 * Nest contexts to create hotkey scopes. A nested context inherits app
 * hotkeys and merges default options. With `scope`, its hotkeys fire only
 * while the component is mounted and enabled; with `exclusive`, only its
 * hotkeys fire.
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
  const parent = inject(HotkeysContext, null)
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

  const active = computed(
    () => (parent?.enabled ?? true) && toValue(options.enabled) !== false,
  )
  const defaultOptions = computed(() =>
    mergeHotkeysProviderDefaults(
      parent?.defaultOptions,
      toValue(options.defaultOptions),
      toValue(options.scope),
    ),
  )
  // Compared by value, so a new `exclusive` object does not reactivate the
  // scope and lose its precedence.
  const scopeKey = computed(() =>
    getHotkeysProviderScopeKey({
      scope: toValue(options.scope),
      exclusive: toValue(options.exclusive),
      active: active.value,
      parent: parent?.defaultOptions.hotkey?.scope,
    }),
  )

  // Activate the scope while mounted and enabled. Activating during setup
  // would update registration subscribers in the middle of a render.
  onMounted(() => {
    watch(
      scopeKey,
      (key, _, onCleanup) => {
        if (key) onCleanup(activateHotkeysProviderScope(key))
      },
      { immediate: true },
    )
  })

  const contextValue: HotkeysContextValue = {
    appHotkeysStore: store ?? parent?.appHotkeysStore ?? null,
    get defaultOptions() {
      return defaultOptions.value
    },
    get enabled() {
      return active.value
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
