import {
  createContext,
  createEffect,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { AppHotkeysStore, publishAppHotkeysStore } from '@tanstack/hotkeys'
import type { JSX, ParentComponent } from 'solid-js'
import type {
  AppHotkeys,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { CreateHotkeyCommonOptions } from './createHotkey'

export interface HotkeysProviderOptions {
  /**
   * Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
   * `requireReset` applies to chords and `timeout` applies to sequences.
   */
  hotkey?: CreateHotkeyCommonOptions
  /** Defaults for every `createHotkeyRecorder`. */
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

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export interface HotkeysProviderProps {
  children: JSX.Element
  /**
   * Every app hotkey, from `defineAppHotkeys`. Read when the provider is
   * created; listed by `createAppHotkeyList` whether or not they are registered.
   */
  appHotkeys?: AppHotkeys
  /**
   * Starting custom hotkeys, such as saved data. Read once; the provider owns
   * the state afterwards. Invalid entries are ignored with a warning.
   */
  customHotkeys?: CustomHotkeys | null
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys) => void
  defaultOptions?: HotkeysProviderOptions
}

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

/**
 * Provides default options, app hotkeys, and the user's custom hotkeys.
 *
 * @example
 * ```tsx
 * <HotkeysProvider
 *   appHotkeys={appHotkeys}
 *   customHotkeys={JSON.parse(localStorage.getItem('hotkeys') ?? '{}')}
 *   onCustomHotkeysChange={(custom) =>
 *     localStorage.setItem('hotkeys', JSON.stringify(custom))
 *   }
 * >
 *   <App />
 * </HotkeysProvider>
 * ```
 */
export const HotkeysProvider: ParentComponent<HotkeysProviderProps> = (
  props,
) => {
  const store = props.appHotkeys
    ? new AppHotkeysStore(props.appHotkeys, {
        customHotkeys: props.customHotkeys,
        onCustomHotkeysChange: (custom) =>
          props.onCustomHotkeysChange?.(custom),
      })
    : null

  // Keep declarations current (for example after hot module replacement).
  createEffect(() => {
    if (props.appHotkeys) store?.setAppHotkeys(props.appHotkeys)
  })

  // Publish the store so devtools can list declared hotkeys.
  onMount(() => {
    if (store) onCleanup(publishAppHotkeysStore(store))
  })

  const contextValue: HotkeysContextValue = {
    appHotkeysStore: store,
    get defaultOptions() {
      return props.defaultOptions ?? DEFAULT_OPTIONS
    },
  }

  return (
    <HotkeysContext.Provider value={contextValue}>
      {props.children}
    </HotkeysContext.Provider>
  )
}

export function useHotkeysContext() {
  return useContext(HotkeysContext)
}

export function useDefaultHotkeysOptions() {
  const context = useContext(HotkeysContext)
  return context?.defaultOptions ?? DEFAULT_OPTIONS
}
