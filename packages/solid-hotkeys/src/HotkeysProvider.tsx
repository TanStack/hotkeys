import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  activateHotkeysProviderScope,
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import {
  createContext,
  createEffect,
  createMemo,
  onCleanup,
  untrack,
  useContext,
} from 'solid-js'
import type {
  AppHotkeys,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyPlatform,
} from '@tanstack/hotkeys'
import type {
  HotkeyRecorderDefaults,
  HotkeysContextValue,
  HotkeysProviderScopeProps,
} from '@tanstack/hotkeys/adapter'
import type { JSX, ParentComponent } from 'solid-js'
import type { CreateHotkeyCommonOptions } from './createHotkey'

export interface HotkeysProviderOptions {
  /**
   * The user's platform, for labels from `createFormatForDisplay`, hotkeys,
   * recorders, and app hotkey checks such as conflicts. On a server, set it
   * from the request with `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
  /**
   * Whether labels from `createFormatForDisplay` follow the user's keyboard
   * layout, so `[KeyQ]` reads `A` on a French AZERTY keyboard. The layout
   * loads from the browser when the first label mounts. Only Chromium
   * browsers report one. Set `false` to never ask the browser for it.
   * Default: `true`.
   */
  keyboardLayout?: boolean
  /**
   * Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
   * `requireReset` applies to chords and `timeout` applies to sequences.
   */
  hotkey?: CreateHotkeyCommonOptions
  /** Defaults for every `createHotkeyRecorder`. */
  hotkeyRecorder?: HotkeyRecorderDefaults
}

const HotkeysContext =
  createContext<HotkeysContextValue<HotkeysProviderOptions> | null>(null)

export interface HotkeysProviderProps extends HotkeysProviderScopeProps {
  children: JSX.Element
  /**
   * Every app hotkey, from `defineAppHotkeys`. Listed by `createAppHotkeyList`
   * whether or not they are registered. It can start as `undefined` and arrive
   * later, such as from a lazy import.
   */
  appHotkeys?: AppHotkeys
  /**
   * The user's saved custom hotkeys. When the value changes, such as after
   * saved data loads or the user signs in, it replaces the current custom
   * hotkeys. `undefined` leaves them unchanged; `null` clears them. Unknown
   * ids and invalid entries are ignored.
   */
  customHotkeys?: CustomHotkeys | null
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys) => void
  /** Merged with the parent provider's defaults. */
  defaultOptions?: HotkeysProviderOptions
}

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

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
 * <HotkeysProvider scope="edit-dialog" exclusive={{ allow: ['global'] }}>
 *   <DialogBody />
 * </HotkeysProvider>
 * ```
 */
export const HotkeysProvider: ParentComponent<HotkeysProviderProps> = (
  props,
) => {
  const parent = useContext(HotkeysContext)
  // Created when app hotkeys first arrive. That can be after the provider is
  // created, such as when a lazy import loads the declarations.
  const store = createMemo<AppHotkeysStore | null>(
    (created) =>
      created ??
      (props.appHotkeys
        ? untrack(() =>
            createAppHotkeysStore(props.appHotkeys!, {
              customHotkeys: props.customHotkeys,
              onCustomHotkeysChange: (custom) =>
                props.onCustomHotkeysChange?.(custom),
              // App hotkeys compare hotkeys, such as for conflicts, on this
              // platform.
              platform:
                props.defaultOptions?.platform ??
                parent?.defaultOptions.platform,
            }),
          )
        : null),
    null,
  )

  // Keep declarations current (for example after hot module replacement).
  createEffect(() => {
    if (props.appHotkeys) store()?.setAppHotkeys(props.appHotkeys)
  })

  // Publish the store so devtools can list declared hotkeys.
  createEffect(() => {
    const created = store()
    if (created) onCleanup(publishAppHotkeysStore(created))
  })

  const active = () => (parent?.enabled ?? true) && props.enabled !== false
  const defaultOptions = createMemo(() =>
    mergeHotkeysProviderDefaults(
      parent?.defaultOptions,
      props.defaultOptions,
      props.scope,
    ),
  )
  // Apply the platform and saved custom hotkeys whose value changes, such as
  // data that loads after the first render. One call applies both together.
  createEffect(() => {
    const customHotkeys = props.customHotkeys
    const platform = defaultOptions().platform
    store()?.setOptions({ customHotkeys, platform })
  })
  // Compared by value, so a new `exclusive` object does not reactivate the
  // scope and lose its precedence.
  const scopeKey = createMemo(() =>
    getHotkeysProviderScopeKey({
      scope: props.scope,
      exclusive: props.exclusive,
      active: active(),
      parent: parent?.defaultOptions.hotkey?.scope,
    }),
  )

  // Activate this provider's scope while mounted and enabled.
  createEffect(() => {
    const key = scopeKey()
    if (key) onCleanup(activateHotkeysProviderScope(key))
  })

  const contextValue: HotkeysContextValue<HotkeysProviderOptions> = {
    get appHotkeysStore() {
      return store() ?? parent?.appHotkeysStore ?? null
    },
    get defaultOptions() {
      return defaultOptions()
    },
    get enabled() {
      return active()
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
