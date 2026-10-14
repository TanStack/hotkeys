import { createContext, onMount } from 'svelte'
import { AppHotkeysStore, publishAppHotkeysStore } from '@tanstack/hotkeys'
import type {
  AppHotkeys,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { CreateHotkeyCommonOptions } from './createHotkey.svelte'
import type { Snippet } from 'svelte'

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

/** Options for `setHotkeysContext` and props for `HotkeysProvider`. */
export interface HotkeysContextOptions {
  defaultOptions?: HotkeysProviderOptions
  /**
   * Every app hotkey, from `defineAppHotkeys`. Read when the context is set;
   * listed by `getAppHotkeyList` whether or not they are registered.
   */
  appHotkeys?: AppHotkeys
  /**
   * Starting custom hotkeys, such as saved data. Read once; the context owns
   * the state afterwards. Invalid entries are ignored with a warning.
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
  readonly defaultOptions: HotkeysProviderOptions
}

const [useHotkeysContext, setHotkeysContextValue] =
  createContext<HotkeysContextValue | null>()

/**
 * Sets the hotkeys context for descendants. `HotkeysProvider` calls this; call
 * it directly in a root component's script instead of rendering the provider.
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
  const { appHotkeys, customHotkeys } = source()
  const store = appHotkeys
    ? new AppHotkeysStore(appHotkeys, {
        customHotkeys,
        onCustomHotkeysChange: (custom) =>
          source().onCustomHotkeysChange?.(custom),
      })
    : null
  // Publish the store so devtools can list declared hotkeys.
  if (store) onMount(() => publishAppHotkeysStore(store))
  return setHotkeysContextValue({
    appHotkeysStore: store,
    get defaultOptions() {
      return source().defaultOptions ?? DEFAULT_OPTIONS
    },
  })!
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
