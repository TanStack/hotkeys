import {
  createContext,
  createElement,
  useContext,
  useLayoutEffect,
  useRef,
} from 'octane'
import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  activateHotkeysProviderScope,
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import { subSlot } from './internal'
import type {
  AppHotkeys,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeyPlatform,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
import type { UseHotkeyCommonOptions } from './useHotkey'

export interface DefaultHotkeysOptions {
  /**
   * The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
   * recorders. Defaults to detection. When server rendering, set it from the
   * request with `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
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
  /** Merged with every ancestor provider's defaults, including `hotkey.scope`. */
  defaultOptions: DefaultHotkeysOptions
  appHotkeysStore: AppHotkeysStore | null
  /** Whether this provider and every ancestor are enabled. */
  enabled: boolean
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export type HotkeysProviderOptions = DefaultHotkeysOptions

export interface HotkeysProviderProps extends HotkeysProviderScopeProps {
  children?: unknown
  /** Merged with the parent provider's defaults. */
  defaultOptions?: HotkeysProviderOptions
  /**
   * Every app hotkey, from `defineAppHotkeys`. Read when the provider first
   * renders; listed by `useAppHotkeyList` whether or not they are registered.
   */
  appHotkeys?: AppHotkeys
  /**
   * The user's saved custom hotkeys. When the value changes, such as after
   * saved data loads or the user signs in, it replaces the current custom
   * hotkeys. `undefined` leaves them unchanged; `null` clears them. Invalid
   * entries are ignored with a warning.
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

/**
 * Sets defaults, app hotkeys, and custom hotkeys for descendant components.
 *
 * Nest providers to create hotkey scopes. A nested provider inherits app
 * hotkeys and merges default options. With `scope`, its hotkeys fire only
 * while it is mounted and enabled; with `exclusive`, only its hotkeys fire.
 */
export function HotkeysProvider({
  children,
  defaultOptions,
  appHotkeys,
  customHotkeys,
  onCustomHotkeysChange,
  scope,
  exclusive,
  enabled = true,
}: HotkeysProviderProps) {
  const parent = useContext(HotkeysContext)
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
    ? createAppHotkeysStore(appHotkeys, {
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
  // Apply saved custom hotkeys whose value changes, such as data that loads
  // after the first render.
  useLayoutEffect(
    () => {
      store?.setOptions({ customHotkeys })
    },
    [store, customHotkeys],
    subSlot(undefined, 'provider-custom-hotkeys'),
  )
  // Publish the store so devtools can list declared hotkeys.
  useLayoutEffect(
    () => (store ? publishAppHotkeysStore(store) : undefined),
    [store],
    subSlot(undefined, 'provider-publish'),
  )
  const active = (parent?.enabled ?? true) && enabled
  // Compared by value, so an inline `exclusive` object does not reactivate
  // the scope, and lose its precedence, on every render.
  const scopeKey = getHotkeysProviderScopeKey({
    scope,
    exclusive,
    active,
    parent: parent?.defaultOptions.hotkey?.scope,
  })
  // Activate this provider's scope while mounted and enabled.
  useLayoutEffect(
    () => (scopeKey ? activateHotkeysProviderScope(scopeKey) : undefined),
    [scopeKey],
    subSlot(undefined, 'provider-scope'),
  )
  return createElement(HotkeysContext, {
    value: {
      defaultOptions: mergeHotkeysProviderDefaults(
        parent?.defaultOptions,
        defaultOptions,
        scope,
      ),
      appHotkeysStore: store ?? parent?.appHotkeysStore ?? null,
      enabled: active,
    },
    children,
  })
}
