import {
  DestroyRef,
  InjectionToken,
  Injector,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core'
import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  activateHotkeysProviderScope,
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import type { Provider, Signal } from '@angular/core'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
import type {
  AppHotkeys,
  AppHotkeysState,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { InjectHotkeyCommonOptions } from './injectHotkey'

export interface HotkeysProviderOptions {
  /**
   * Defaults for every hotkey registered by `injectHotkey` and `injectHotkeys`.
   * `requireReset` applies to chords and `timeout` applies to sequences.
   */
  hotkey?: InjectHotkeyCommonOptions
  /** Defaults for every `injectHotkeyRecorder`. */
  hotkeyRecorder?: Partial<
    Omit<
      HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions,
      'maxSteps' | 'onRecord' | 'validate'
    >
  >
}

/** Options for `provideHotkeys`. */
export interface ProvideHotkeysOptions {
  /** Merged with the parent provider's defaults. */
  defaultOptions?: HotkeysProviderOptions
  /**
   * See `HotkeysProviderScopeProps['scope']`. Getters, here and for
   * `exclusive` and `enabled`, run in the provider's injection context, so
   * they can `inject()` the component that provides them and read its
   * signals.
   */
  scope?: MaybeGetter<HotkeysProviderScopeProps['scope']>
  /** See `HotkeysProviderScopeProps['exclusive']`. */
  exclusive?: MaybeGetter<HotkeysProviderScopeProps['exclusive']>
  /** See `HotkeysProviderScopeProps['enabled']`. */
  enabled?: MaybeGetter<HotkeysProviderScopeProps['enabled']>
  /**
   * Every app hotkey, from `defineAppHotkeys`. Listed by
   * `injectAppHotkeyList` whether or not they are registered.
   */
  appHotkeys?: AppHotkeys
  /**
   * The user's saved custom hotkeys. When the value changes, such as after
   * saved data loads or the user signs in, it replaces the current custom
   * hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
   * entries are ignored with a warning.
   */
  customHotkeys?: MaybeGetter<CustomHotkeys | null | undefined>
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys) => void
}

export interface HotkeysContextValue {
  /** Merged with every ancestor provider's defaults, including `hotkey.scope`. */
  readonly defaultOptions: HotkeysProviderOptions
  /** Whether this provider and every ancestor are enabled. */
  readonly enabled: Signal<boolean>
  readonly appHotkeysStore: AppHotkeysStore | null
  /** Tracks app hotkeys and custom hotkeys so signals and effects re-run. */
  readonly appHotkeysState: Signal<AppHotkeysState | null>
}

const NO_APP_HOTKEYS = signal<AppHotkeysState | null>(null).asReadonly()
const ROOT_CONTEXT: HotkeysContextValue = {
  defaultOptions: {},
  enabled: signal(true).asReadonly(),
  appHotkeysStore: null,
  appHotkeysState: NO_APP_HOTKEYS,
}

export const HOTKEYS_INJECTION_TOKEN = new InjectionToken<HotkeysContextValue>(
  'HOTKEYS_INJECTION_TOKEN',
  {
    providedIn: 'root',
    factory: () => ROOT_CONTEXT,
  },
)

/** A value, or a signal or getter that returns it. */
export type MaybeGetter<T> = T | (() => T)

/** Creates a provider's context. Runs in an injection context. */
function createHotkeysContext(
  options: ProvideHotkeysOptions,
): HotkeysContextValue {
  const injector = inject(Injector)
  const read = <T>(value: MaybeGetter<T>): T =>
    typeof value === 'function'
      ? runInInjectionContext(injector, value as () => T)
      : value
  const parent =
    inject(HOTKEYS_INJECTION_TOKEN, { skipSelf: true, optional: true }) ??
    ROOT_CONTEXT
  const destroyRef = inject(DestroyRef)
  const { appHotkeys, customHotkeys, onCustomHotkeysChange } = options

  let store: AppHotkeysStore | null = null
  let appHotkeysState = parent.appHotkeysState
  if (appHotkeys) {
    const owned = createAppHotkeysStore(appHotkeys, {
      customHotkeys: read(customHotkeys),
      onCustomHotkeysChange,
    })
    store = owned
    // Apply saved custom hotkeys whose value changes, such as data that
    // loads after the app starts.
    if (typeof customHotkeys === 'function') {
      effect(() => {
        const next = read(customHotkeys)
        untracked(() => owned.setOptions({ customHotkeys: next }))
      })
    }
    const state = signal<AppHotkeysState | null>(store.store.state)
    const subscription = store.store.subscribe(() =>
      state.set(store!.store.state),
    )
    destroyRef.onDestroy(() => subscription.unsubscribe())
    // Publish the store so devtools can list declared hotkeys.
    if (typeof document !== 'undefined') {
      destroyRef.onDestroy(publishAppHotkeysStore(store))
    }
    appHotkeysState = state.asReadonly()
  }

  const enabled = computed(
    () => parent.enabled() && read(options.enabled) !== false,
  )
  const defaultOptions = computed(() =>
    mergeHotkeysProviderDefaults(
      parent.defaultOptions,
      options.defaultOptions,
      read(options.scope),
    ),
  )
  // Compared by value, so a new `exclusive` object does not reactivate the
  // scope and lose its precedence.
  const scopeKey = computed(() =>
    getHotkeysProviderScopeKey({
      scope: read(options.scope),
      exclusive: read(options.exclusive),
      active: enabled(),
      parent: parent.defaultOptions.hotkey?.scope,
    }),
  )

  // Activate the scope while this injector lives and the provider is enabled.
  if (typeof document !== 'undefined') {
    effect((onCleanup) => {
      const key = scopeKey()
      if (key) onCleanup(activateHotkeysProviderScope(key))
    })
  }

  return {
    get defaultOptions() {
      return defaultOptions()
    },
    enabled,
    appHotkeysStore: store ?? parent.appHotkeysStore,
    appHotkeysState,
  }
}

/**
 * Provides default options, app hotkeys, and the user's custom hotkeys to an
 * injector, such as the application or a component.
 *
 * Provide it in a component to create a hotkey scope. A nested provider
 * inherits app hotkeys and merges default options. With `scope`, hotkeys
 * injected in the component and its children fire only while it exists and
 * is enabled; with `exclusive`, only they fire. The scope activates when the
 * first hotkey in it is injected. Angular creates the provider lazily, so a
 * component with no hotkeys of its own calls `injectHotkeysContext()` to
 * activate its scope.
 *
 * @example
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHotkeys({
 *       appHotkeys,
 *       customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
 *       onCustomHotkeysChange: (custom) =>
 *         localStorage.setItem('hotkeys', JSON.stringify(custom)),
 *     }),
 *   ],
 * })
 * ```
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-edit-dialog',
 *   providers: [provideHotkeys({ scope: 'edit-dialog', exclusive: true })],
 *   template: `...`,
 * })
 * export class EditDialog {
 *   constructor() {
 *     injectHotkey('Escape', () => this.close())
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // An overlay with no hotkeys that suspends the page's hotkeys.
 * @Component({
 *   selector: 'app-loading-overlay',
 *   providers: [provideHotkeys({ scope: 'loading', exclusive: true })],
 *   template: `...`,
 * })
 * export class LoadingOverlay {
 *   constructor() {
 *     injectHotkeysContext()
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // A scope that follows the providing component's input.
 * @Component({
 *   selector: 'app-folder',
 *   providers: [
 *     provideHotkeys({
 *       scope: () => inject(Folder).name(),
 *       enabled: () => inject(Folder).current(),
 *     }),
 *   ],
 *   template: `...`,
 * })
 * export class Folder {
 *   readonly name = input.required<string>()
 *   readonly current = input(false)
 * }
 * ```
 */
export function provideHotkeys(options: ProvideHotkeysOptions = {}): Provider {
  return {
    provide: HOTKEYS_INJECTION_TOKEN,
    useFactory: () => createHotkeysContext(options),
  }
}

/**
 * Returns the nearest provider's context. Injecting it activates that
 * provider's scope.
 */
export function injectHotkeysContext(): HotkeysContextValue {
  return inject(HOTKEYS_INJECTION_TOKEN)
}

export function injectDefaultHotkeysOptions(): HotkeysProviderOptions {
  return injectHotkeysContext().defaultOptions
}
