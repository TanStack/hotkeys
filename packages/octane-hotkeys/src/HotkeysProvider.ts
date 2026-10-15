import {
  createContext,
  createElement,
  useContext,
  useLayoutEffect,
  useRef,
} from 'octane'
import { AppHotkeysStore, publishAppHotkeysStore } from '@tanstack/hotkeys'
import { subSlot } from './internal'
import type {
  AppHotkeys,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { UseHotkeyCommonOptions } from './useHotkey'

export interface DefaultHotkeysOptions {
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
  defaultOptions: DefaultHotkeysOptions
  appHotkeysStore: AppHotkeysStore | null
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export type HotkeysProviderOptions = DefaultHotkeysOptions

export interface HotkeysProviderProps {
  children?: unknown
  defaultOptions?: HotkeysProviderOptions
  /**
   * Every app hotkey, from `defineAppHotkeys`. Read when the provider first
   * renders; listed by `useAppHotkeyList` whether or not they are registered.
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

/** Reads the nearest provider, or null outside a provider. */
export function useHotkeysContext(): HotkeysContextValue | null {
  return useContext(HotkeysContext)
}

/** Reads the nearest provider's defaults, or an empty object. */
export function useDefaultHotkeysOptions(): DefaultHotkeysOptions {
  return useContext(HotkeysContext)?.defaultOptions ?? {}
}

/** Sets defaults, app hotkeys, and custom hotkeys for descendant components. */
export function HotkeysProvider({
  children,
  defaultOptions = {},
  appHotkeys,
  customHotkeys,
  onCustomHotkeysChange,
}: HotkeysProviderProps) {
  const callbackRef = useRef(
    onCustomHotkeysChange,
    subSlot(undefined, 'provider-callback'),
  )
  callbackRef.current = onCustomHotkeysChange
  const storeRef = useRef<AppHotkeysStore | null | undefined>(
    undefined,
    subSlot(undefined, 'provider-store'),
  )
  storeRef.current ??= appHotkeys
    ? new AppHotkeysStore(appHotkeys, {
        customHotkeys,
        onCustomHotkeysChange: (custom) => callbackRef.current?.(custom),
      })
    : null
  const store = storeRef.current
  useLayoutEffect(
    () => {
      if (appHotkeys) store?.setAppHotkeys(appHotkeys)
    },
    [store, appHotkeys],
    subSlot(undefined, 'provider-declarations'),
  )
  // Publish the store so devtools can list declared hotkeys.
  useLayoutEffect(
    () => (store ? publishAppHotkeysStore(store) : undefined),
    [store],
    subSlot(undefined, 'provider-publish'),
  )
  return createElement(HotkeysContext, {
    value: { defaultOptions, appHotkeysStore: store },
    children,
  })
}
