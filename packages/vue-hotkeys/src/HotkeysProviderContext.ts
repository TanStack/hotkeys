import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  activateHotkeysProviderScope,
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import {
  computed,
  hasInjectionContext,
  inject,
  onMounted,
  provide,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import { useLive } from './_useLive'
import type {
  AppHotkeys,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeyPlatform,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import type { UseHotkeyCommonOptions } from './useHotkey'

export interface HotkeysProviderOptions {
  /**
   * The user's platform, for labels from `useFormatForDisplay`, hotkeys,
   * recorders, and app hotkey checks such as conflicts. On a server, set it
   * from the request with `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
  /**
   * Whether labels from `useFormatForDisplay` follow the user's keyboard
   * layout, so `[KeyQ]` reads `A` on a French AZERTY keyboard. The layout
   * loads from the browser when the first label mounts. Only Chromium
   * browsers report one. Set `false` to never ask the browser for it.
   * Default: `true`.
   */
  keyboardLayout?: boolean
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
   * Every app hotkey, from `defineAppHotkeys`. It can start as `undefined` and
   * arrive later, such as from a lazy import. Later changes update the
   * declarations.
   */
  appHotkeys?: MaybeRefOrGetter<AppHotkeys | undefined>
  /**
   * The user's saved custom hotkeys. When the value changes, such as after
   * saved data loads or the user signs in, it replaces the current custom
   * hotkeys. `undefined` leaves them unchanged; `null` clears them. Unknown
   * ids and invalid entries are ignored.
   */
  customHotkeys?: MaybeRefOrGetter<CustomHotkeys | null | undefined>
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
 * while the component is mounted, enabled, and not hidden by `<KeepAlive>`;
 * with `exclusive`, only its hotkeys fire.
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
  const createStore = (appHotkeys: AppHotkeys) =>
    createAppHotkeysStore(appHotkeys, {
      customHotkeys: toValue(options.customHotkeys),
      onCustomHotkeysChange: (custom) =>
        options.onCustomHotkeysChange?.(custom),
      // App hotkeys compare hotkeys, such as for conflicts, on this platform.
      platform:
        toValue(options.defaultOptions)?.platform ??
        parent?.defaultOptions.platform,
    })
  // Created when app hotkeys first arrive. That can be after setup, such as
  // when a lazy import loads the declarations.
  const initial = toValue(options.appHotkeys)
  const store = shallowRef(initial ? createStore(initial) : null)
  // Later values update the declarations, such as after hot module
  // replacement. Sync, so descendants see a new store before they update.
  watch(
    () => toValue(options.appHotkeys),
    (next) => {
      if (!next) return
      if (store.value) store.value.setAppHotkeys(next)
      else store.value = createStore(next)
    },
    { flush: 'sync' },
  )
  // Publish the store so devtools can list declared hotkeys.
  if (typeof document !== 'undefined') {
    watch(
      store,
      (created, _, onCleanup) => {
        if (created) onCleanup(publishAppHotkeysStore(created))
      },
      { immediate: true, flush: 'sync' },
    )
  }

  // A page cached by <KeepAlive> releases its scope while hidden.
  const live = useLive()
  const active = computed(
    () =>
      live.value &&
      (parent?.enabled ?? true) &&
      toValue(options.enabled) !== false,
  )
  const defaultOptions = computed(() =>
    mergeHotkeysProviderDefaults(
      parent?.defaultOptions,
      toValue(options.defaultOptions),
      toValue(options.scope),
    ),
  )
  // Apply the platform and saved custom hotkeys whose value changes, such as
  // data that loads after setup. Deep, so changes made in place are seen too.
  // One call applies both together.
  watch(
    [() => toValue(options.customHotkeys), () => defaultOptions.value.platform],
    ([customHotkeys, platform]) =>
      store.value?.setOptions({ customHotkeys, platform }),
    { deep: true },
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
    get appHotkeysStore() {
      return store.value ?? parent?.appHotkeysStore ?? null
    },
    get defaultOptions() {
      return defaultOptions.value
    },
    get enabled() {
      return active.value
    },
  }

  provide(HotkeysContext, contextValue)
}

/**
 * The nearest context, or `null`. Outside a component, such as in a bare
 * `effectScope`, there is no context to read, so this skips `inject` and its
 * warning.
 */
export function useHotkeysContext() {
  return hasInjectionContext() ? inject(HotkeysContext, null) : null
}

export function useDefaultHotkeysOptions() {
  return useHotkeysContext()?.defaultOptions ?? DEFAULT_OPTIONS
}
