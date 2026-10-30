import {
  createComponent,
  createContext,
  createEffect,
  createMemo,
  onSettled,
  untrack,
  useContext,
} from 'solid-js'
import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import {
  activateHotkeysProviderScope,
  createAppHotkeysStore,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '@tanstack/hotkeys/adapter'
import type { Element, ParentComponent } from 'solid-js'
import type {
  AppHotkeys,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
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
  /** Merged with every ancestor provider's defaults, including `hotkey.scope`. */
  readonly defaultOptions: HotkeysProviderOptions
  /** Whether this provider and every ancestor are enabled. */
  readonly enabled: boolean
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export interface HotkeysProviderProps extends HotkeysProviderScopeProps {
  children: Element
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
  // `appHotkeys` and `customHotkeys` are read once, when the provider is created.
  const store = untrack(() =>
    props.appHotkeys
      ? createAppHotkeysStore(props.appHotkeys, {
          customHotkeys: props.customHotkeys,
          onCustomHotkeysChange: (custom) =>
            props.onCustomHotkeysChange?.(custom),
        })
      : null,
  )

  // Keep declarations current (for example after hot module replacement).
  createEffect(
    () => props.appHotkeys,
    (appHotkeys) => {
      if (appHotkeys) store?.setAppHotkeys(appHotkeys)
    },
  )

  // Publish the store so devtools can list declared hotkeys.
  onSettled(() => (store ? publishAppHotkeysStore(store) : undefined))

  const active = () => (parent?.enabled ?? true) && props.enabled !== false
  const defaultOptions = createMemo(() =>
    mergeHotkeysProviderDefaults(
      parent?.defaultOptions,
      props.defaultOptions,
      props.scope,
    ),
  )
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
  createEffect(scopeKey, (key) =>
    key ? activateHotkeysProviderScope(key) : undefined,
  )

  const contextValue: HotkeysContextValue = {
    appHotkeysStore: store ?? parent?.appHotkeysStore ?? null,
    get defaultOptions() {
      return defaultOptions()
    },
    get enabled() {
      return active()
    },
  }

  // Built without JSX so the adapter only depends on `solid-js`, not on the
  // `@solidjs/web` renderer that compiled JSX imports from.
  return createComponent(HotkeysContext, {
    value: contextValue,
    get children() {
      return props.children
    },
  })
}

export function useHotkeysContext() {
  return useContext(HotkeysContext)
}

export function useDefaultHotkeysOptions() {
  const context = useContext(HotkeysContext)
  return context?.defaultOptions ?? DEFAULT_OPTIONS
}
