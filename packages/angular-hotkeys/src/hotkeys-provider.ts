import { DestroyRef, InjectionToken, inject, signal } from '@angular/core'
import { AppHotkeysStore, publishAppHotkeysStore } from '@tanstack/hotkeys'
import type { Provider, Signal } from '@angular/core'
import type {
  AppHotkeys,
  AppHotkeysState,
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
  defaultOptions?: HotkeysProviderOptions
  /**
   * Every app hotkey, from `defineAppHotkeys`. Listed by
   * `injectAppHotkeyList` whether or not they are registered.
   */
  appHotkeys?: AppHotkeys
  /**
   * Starting custom hotkeys, such as saved data. Read once; the provider owns
   * the state afterwards. Invalid entries are ignored with a warning.
   */
  customHotkeys?: CustomHotkeys | null
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys) => void
}

export interface HotkeysContextValue {
  readonly defaultOptions: HotkeysProviderOptions
  readonly appHotkeysStore: AppHotkeysStore | null
  /** Tracks app hotkeys and custom hotkeys so signals and effects re-run. */
  readonly appHotkeysState: Signal<AppHotkeysState | null>
}

const NO_APP_HOTKEYS = signal<AppHotkeysState | null>(null).asReadonly()

export const HOTKEYS_INJECTION_TOKEN = new InjectionToken<HotkeysContextValue>(
  'HOTKEYS_INJECTION_TOKEN',
  {
    providedIn: 'root',
    factory: () => ({
      defaultOptions: {},
      appHotkeysStore: null,
      appHotkeysState: NO_APP_HOTKEYS,
    }),
  },
)

/**
 * Provides default options, app hotkeys, and the user's custom hotkeys to an
 * injector, such as the application or a component.
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
 */
export function provideHotkeys(options: ProvideHotkeysOptions = {}): Provider {
  return {
    provide: HOTKEYS_INJECTION_TOKEN,
    useFactory: (): HotkeysContextValue => {
      const defaultOptions = options.defaultOptions ?? {}
      if (!options.appHotkeys) {
        return {
          defaultOptions,
          appHotkeysStore: null,
          appHotkeysState: NO_APP_HOTKEYS,
        }
      }
      const store = new AppHotkeysStore(options.appHotkeys, {
        customHotkeys: options.customHotkeys,
        onCustomHotkeysChange: options.onCustomHotkeysChange,
      })
      const state = signal<AppHotkeysState | null>(store.store.state)
      const subscription = store.store.subscribe(() =>
        state.set(store.store.state),
      )
      const destroyRef = inject(DestroyRef)
      destroyRef.onDestroy(() => subscription.unsubscribe())
      // Publish the store so devtools can list declared hotkeys.
      if (typeof document !== 'undefined') {
        destroyRef.onDestroy(publishAppHotkeysStore(store))
      }
      return {
        defaultOptions,
        appHotkeysStore: store,
        appHotkeysState: state.asReadonly(),
      }
    },
  }
}

export function injectHotkeysContext(): HotkeysContextValue {
  return inject(HOTKEYS_INJECTION_TOKEN)
}

export function injectDefaultHotkeysOptions(): HotkeysProviderOptions {
  return injectHotkeysContext().defaultOptions
}
