import { createContext, onMount } from 'svelte'
import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import { activateScopeWhileMounted } from './internal.svelte.js'
import type {
  AppHotkeys,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeyPlatform,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
import type { CreateHotkeyCommonOptions } from './createHotkey.svelte.js'
import type { Snippet } from 'svelte'

export interface HotkeysProviderOptions {
  /**
   * The user's platform, for labels from `getFormatForDisplay`, hotkeys, and
   * recorders. On a server, set it from the request with
   * `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
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

/** Options for `setHotkeysContext` and props for `HotkeysProvider`. */
export interface HotkeysContextOptions extends HotkeysProviderScopeProps {
  /** Merged with the parent context's defaults. */
  defaultOptions?: HotkeysProviderOptions
  /**
   * Every app hotkey, from `defineAppHotkeys`. Read when the context is set;
   * listed by `getAppHotkeyList` whether or not they are registered.
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

export interface HotkeysProviderProps extends HotkeysContextOptions {
  children: Snippet
}

export const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

interface HotkeysContextValue {
  readonly appHotkeysStore: AppHotkeysStore | null
  /** Merged with every ancestor's defaults, including `hotkey.scope`. */
  readonly defaultOptions: HotkeysProviderOptions
  /** Whether this context and every ancestor are enabled. */
  readonly enabled: boolean
}

const [useHotkeysContext, setHotkeysContextValue] =
  createContext<HotkeysContextValue | null>()

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
): HotkeysContextValue {
  return setHotkeysContextSource(() => options)
}

/** Sets the context from a getter, so default options stay reactive. */
export function setHotkeysContextSource(
  source: () => HotkeysContextOptions,
): HotkeysContextValue {
  const parent = getHotkeysContext()
  const { appHotkeys, customHotkeys } = source()
  const store = appHotkeys
    ? createAppHotkeysStore(appHotkeys, {
        customHotkeys,
        onCustomHotkeysChange: (custom) =>
          source().onCustomHotkeysChange?.(custom),
      })
    : null
  // Publish the store so devtools can list declared hotkeys.
  if (store) onMount(() => publishAppHotkeysStore(store))
  const context = setHotkeysContextValue({
    appHotkeysStore: store ?? parent?.appHotkeysStore ?? null,
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

export function getHotkeysContext(): HotkeysContextValue | null {
  try {
    return useHotkeysContext()
  } catch {
    return null
  }
}

export function getDefaultHotkeysOptions(): HotkeysProviderOptions {
  return getHotkeysContext()?.defaultOptions ?? DEFAULT_OPTIONS
}
