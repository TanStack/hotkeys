import {
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import { createContext } from 'svelte'
import {
  activateScopeWhileMounted,
  syncAppHotkeysStore,
} from './internal.svelte.js'
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
import type { Snippet } from 'svelte'
import type { CreateHotkeyCommonOptions } from './createHotkey.svelte.js'

export interface HotkeysProviderOptions {
  /**
   * The user's platform, for labels from `getFormatForDisplay`, hotkeys,
   * recorders, and app hotkey checks such as conflicts. On a server, set it
   * from the request with `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
  /**
   * Whether labels from `getFormatForDisplay` follow the user's keyboard
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

/** Options for `setHotkeysContext` and props for `HotkeysProvider`. */
export interface HotkeysContextOptions extends HotkeysProviderScopeProps {
  /** Merged with the parent context's defaults. */
  defaultOptions?: HotkeysProviderOptions
  /**
   * Every app hotkey, from `defineAppHotkeys`. Listed by `getAppHotkeyList`
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
}

export interface HotkeysProviderProps extends HotkeysContextOptions {
  children: Snippet
}

export const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

const [useHotkeysContext, setHotkeysContextValue] =
  createContext<HotkeysContextValue<HotkeysProviderOptions> | null>()

/**
 * Sets the hotkeys context for descendants. `HotkeysProvider` calls this; call
 * it directly in a component's script instead of rendering the provider.
 *
 * Nest contexts to create hotkey scopes. A nested context inherits app
 * hotkeys and merges default options. With `scope`, its hotkeys fire only
 * while the component is mounted and enabled; with `exclusive`, only its
 * hotkeys fire.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   setHotkeysContext({
 *     appHotkeys,
 *     customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
 *     onCustomHotkeysChange: (custom) =>
 *       localStorage.setItem('hotkeys', JSON.stringify(custom)),
 *   })
 * </script>
 * ```
 */
export function setHotkeysContext(
  options: HotkeysContextOptions = {},
): HotkeysContextValue<HotkeysProviderOptions> {
  return setHotkeysContextSource(() => options)
}

/** Sets the context from a getter, so default options stay reactive. */
export function setHotkeysContextSource(
  source: () => HotkeysContextOptions,
): HotkeysContextValue<HotkeysProviderOptions> {
  const parent = getHotkeysContext()
  let store: AppHotkeysStore | null = null
  // Created when app hotkeys first arrive. That can be after the context is
  // set, such as when a lazy import loads the declarations. A reactive reader
  // tracks the options through `source()`, so it re-runs when they arrive.
  const ownStore = () => {
    const { appHotkeys, customHotkeys, defaultOptions } = source()
    if (!store && appHotkeys) {
      store = createAppHotkeysStore(appHotkeys, {
        customHotkeys,
        // App hotkeys compare hotkeys, such as for conflicts, on this
        // platform.
        platform: defaultOptions?.platform ?? parent?.defaultOptions.platform,
        onCustomHotkeysChange: (custom) =>
          source().onCustomHotkeysChange?.(custom),
      })
    }
    return store
  }
  const context = setHotkeysContextValue({
    get appHotkeysStore() {
      return ownStore() ?? parent?.appHotkeysStore ?? null
    },
    get defaultOptions() {
      const { defaultOptions, scope } = source()
      return mergeHotkeysProviderDefaults(
        parent?.defaultOptions,
        defaultOptions,
        scope,
      )
    },
    get enabled() {
      return (parent?.enabled ?? true) && source().enabled !== false
    },
  })!
  // Only this context's own store: a nested context without app hotkeys
  // reads its parent's store and never changes it.
  syncAppHotkeysStore(ownStore, () => ({
    appHotkeys: source().appHotkeys,
    customHotkeys: source().customHotkeys,
    platform: context.defaultOptions.platform,
  }))
  // Compared by value, so a new `exclusive` object does not reactivate the
  // scope and lose its precedence.
  activateScopeWhileMounted(() => {
    const { scope, exclusive } = source()
    return getHotkeysProviderScopeKey({
      scope,
      exclusive,
      active: context.enabled,
      parent: parent?.defaultOptions.hotkey?.scope,
    })
  })
  return context
}

export function getHotkeysContext(): HotkeysContextValue<HotkeysProviderOptions> | null {
  try {
    return useHotkeysContext()
  } catch {
    return null
  }
}

export function getDefaultHotkeysOptions(): HotkeysProviderOptions {
  return getHotkeysContext()?.defaultOptions ?? DEFAULT_OPTIONS
}
