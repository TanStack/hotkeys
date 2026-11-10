import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  activateHotkeysProviderScope,
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import { createContext } from 'preact'
import { useContext, useLayoutEffect, useMemo, useRef } from 'preact/hooks'
import type {
  AppHotkeys,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeyPlatform,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
import type { ComponentChildren } from 'preact'
import type { UseHotkeyCommonOptions } from './useHotkey'

export interface HotkeysProviderOptions {
  /**
   * The user's platform, for labels from `useFormatForDisplay`, hotkeys,
   * recorders, and app hotkey checks such as conflicts. Defaults to detection.
   * When server rendering, set it from the request with
   * `detectPlatform(userAgent)`.
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
  appHotkeysStore: AppHotkeysStore | null
  /** Merged with every ancestor provider's defaults, including `hotkey.scope`. */
  defaultOptions: HotkeysProviderOptions
  /** Whether this provider and every ancestor are enabled. */
  enabled: boolean
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export interface HotkeysProviderProps<
  T extends AppHotkeys = AppHotkeys,
> extends HotkeysProviderScopeProps {
  children: ComponentChildren
  /**
   * Every app hotkey, from `defineAppHotkeys`. Listed by `useAppHotkeyList`
   * whether or not their components have mounted. It can start as `undefined`
   * and arrive later, such as from a lazy import.
   */
  appHotkeys?: T
  /**
   * The user's saved custom hotkeys. When the value changes, such as after
   * saved data loads or the user signs in, it replaces the current custom
   * hotkeys. `undefined` leaves them unchanged; `null` clears them. Unknown
   * ids and invalid entries are ignored.
   */
  customHotkeys?: CustomHotkeys<T> | null
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys<T>) => void
  /** Merged with the parent provider's defaults. */
  defaultOptions?: HotkeysProviderOptions
}

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}
const NO_PARENT: HotkeysContextValue = {
  appHotkeysStore: null,
  defaultOptions: DEFAULT_OPTIONS,
  enabled: true,
}

/**
 * Provides default options, app hotkeys, and the user's custom hotkeys.
 *
 * Nest providers to create hotkey scopes. A nested provider inherits app
 * hotkeys and merges default options. With `scope`, its hotkeys fire only
 * while it is mounted and enabled; with `exclusive`, only its hotkeys fire.
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
 *
 * @example
 * ```tsx
 * function EditDialog() {
 *   return (
 *     <HotkeysProvider scope="edit-dialog" exclusive={{ allow: ['global'] }}>
 *       <DialogBody />
 *     </HotkeysProvider>
 *   )
 * }
 * ```
 */
export function HotkeysProvider<T extends AppHotkeys = AppHotkeys>({
  children,
  appHotkeys,
  customHotkeys,
  onCustomHotkeysChange,
  defaultOptions = DEFAULT_OPTIONS,
  scope,
  exclusive = false,
  enabled = true,
}: HotkeysProviderProps<T>) {
  const parent = useContext(HotkeysContext) ?? NO_PARENT
  // App hotkeys compare hotkeys, such as for conflicts, on this platform.
  const platform = defaultOptions.platform ?? parent.defaultOptions.platform
  // Created on the first render that has app hotkeys. That can be a later
  // render, such as after a lazy import loads the declarations.
  const storeRef = useRef<AppHotkeysStore | null>(null)
  if (!storeRef.current && appHotkeys) {
    storeRef.current = createAppHotkeysStore(appHotkeys, {
      customHotkeys,
      onCustomHotkeysChange,
      platform,
    })
  }
  const store = storeRef.current
  const active = parent.enabled && enabled
  // Compared by value, so an inline `exclusive` object does not reactivate
  // the scope, and lose its precedence, on every render.
  const scopeKey = getHotkeysProviderScopeKey({
    scope,
    exclusive,
    active,
    parent: parent.defaultOptions.hotkey?.scope,
  })

  // Activate this provider's scope while mounted and enabled. Layout effects
  // run in the commit; Preact runs plain effects after paint.
  useLayoutEffect(() => {
    return scopeKey ? activateHotkeysProviderScope(scopeKey) : undefined
  }, [scopeKey])

  // Keep the latest callback, platform, and saved custom hotkeys. Saved data
  // with the same value, such as an inline JSON.parse, keeps the user's
  // changes.
  useLayoutEffect(() => {
    store?.setOptions({ customHotkeys, onCustomHotkeysChange, platform })
  }, [store, customHotkeys, onCustomHotkeysChange, platform])
  useLayoutEffect(() => {
    if (appHotkeys) store?.setAppHotkeys(appHotkeys)
  }, [store, appHotkeys])

  // Publish the store so devtools can list declared hotkeys.
  useLayoutEffect(() => {
    if (!store) return
    return publishAppHotkeysStore(store)
  }, [store])

  const contextValue: HotkeysContextValue = useMemo(
    () => ({
      appHotkeysStore: store ?? parent.appHotkeysStore,
      defaultOptions: mergeHotkeysProviderDefaults(
        parent.defaultOptions,
        defaultOptions,
        scope,
      ),
      enabled: active,
    }),
    [store, parent, defaultOptions, scope, active],
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
