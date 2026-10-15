import { createContext } from 'preact'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'
import { AppHotkeysStore, publishAppHotkeysStore } from '@tanstack/hotkeys'
import type { ComponentChildren } from 'preact'
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
  appHotkeysStore: AppHotkeysStore | null
  defaultOptions: HotkeysProviderOptions
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export interface HotkeysProviderProps<T extends AppHotkeys = AppHotkeys> {
  children: ComponentChildren
  /**
   * Every app hotkey, from `defineAppHotkeys`. Listed by `useAppHotkeyList`
   * whether or not their components have mounted.
   */
  appHotkeys?: T
  /**
   * Starting custom hotkeys, such as saved data. Read once; the provider owns
   * the state afterwards. Invalid entries are ignored with a warning.
   */
  customHotkeys?: CustomHotkeys<T> | null
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys<T>) => void
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
export function HotkeysProvider<T extends AppHotkeys = AppHotkeys>({
  children,
  appHotkeys,
  customHotkeys,
  onCustomHotkeysChange,
  defaultOptions = DEFAULT_OPTIONS,
}: HotkeysProviderProps<T>) {
  const [store] = useState(() =>
    appHotkeys
      ? new AppHotkeysStore<T>(appHotkeys, {
          customHotkeys,
          onCustomHotkeysChange,
        })
      : null,
  )

  // Keep the latest callback and declarations without resetting custom hotkeys.
  useEffect(() => {
    store?.setOptions({ onCustomHotkeysChange })
  }, [store, onCustomHotkeysChange])
  useEffect(() => {
    if (appHotkeys) store?.setAppHotkeys(appHotkeys)
  }, [store, appHotkeys])

  // Publish the store so devtools can list declared hotkeys.
  useEffect(() => {
    if (!store) return
    return publishAppHotkeysStore(store)
  }, [store])

  const contextValue: HotkeysContextValue = useMemo(
    () => ({
      appHotkeysStore: store,
      defaultOptions,
    }),
    [store, defaultOptions],
  )

  return (
    <HotkeysContext.Provider value={contextValue}>
      {children}
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
