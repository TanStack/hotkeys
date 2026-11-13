// Import shared state by package name, not by path. A CDN such as jsDelivr
// bundles each entry on its own, and a relative import would give this entry
// a second HotkeyManager and app hotkeys factory.
import {
  detectPlatform,
  formatForDisplay,
  getAppHotkeyRegistrationOptions,
  getHotkeyManager,
  getKeyboardLayoutStore,
  isAppHotkey,
  isHotkeySequence,
  loadKeyboardLayout,
  matchesHeldModifiers,
  normalizeHotkey,
  parseHotkey,
  resolveAppHotkey,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
// Stateless once loaded, apart from a collator created on first use, so a
// copy per entry is fine.
import { chordHasKey } from './_chord'
import { canWarn } from './_dev'
import { defaultHotkeyOptions, definedOptions } from './_registration'
// Stateless apart from a once-only dev warning, so a copy per entry is fine.
import { warnServerPlatform } from './_server'
import type {
  AppHotkey,
  AppHotkeysStore,
  CustomHotkeyActions,
  RegisteredAppHotkeys,
} from './app-hotkeys'
import type { DisplayHotkey, FormatDisplayOptions } from './format'
import type { HeldModifierOptions } from './hint'
import type {
  ActivateHotkeyScopeOptions,
  HotkeyChordOptions,
  HotkeyCommonOptions,
  HotkeyOptions,
  HotkeyRegistration,
  HotkeyRegistrationHandle,
  HotkeyRegistrationView,
  HotkeySequenceOptions,
} from './hotkey-manager'
import type {
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from './hotkey-recorder'
import type {
  HotkeyCallback,
  HotkeyChord,
  HotkeySequence,
  RegisterableHotkey,
  RegisterableHotkeyChord,
  RegisterableHotkeySequence,
  Target,
} from './hotkey.types'
import type { KeyboardLayoutMap } from './keyboard-layout'
import type { HotkeyPlatform } from './platform'

export { createAppHotkeysStore } from '@tanstack/hotkeys'
export { resolveMaybeGetter } from './_getter'
export { createStore } from './_store'
export { definedOptions, withDefaults } from './_registration'
export type { Store } from './_store'

/**
 * A hotkey and its callback, with optional per-binding options. Chords accept
 * `requireReset`; sequences accept `timeout`.
 */
export type HotkeyDefinition =
  | {
      hotkey: RegisterableHotkeyChord
      callback: HotkeyCallback
      options?: HotkeyChordOptions
    }
  | {
      hotkey: RegisterableHotkeySequence
      callback: HotkeyCallback
      options?: HotkeySequenceOptions
    }
  | {
      /** No hotkey. Registers nothing. */
      hotkey: null | undefined
      callback: HotkeyCallback
      options?: HotkeyCommonOptions
    }

/** Options shared by every definition. Each option applies only to the kinds that support it. */
export type HotkeyBindingsCommonOptions = HotkeyCommonOptions

/**
 * Reconciles adapter registrations while retaining handles for option updates.
 * Adapters for frameworks that delegate key events, such as React, pass
 * `{ afterDelegatedHandlers: true }`.
 */
export function createHotkeyBindings(
  adapterOptions: Pick<HotkeyOptions, 'afterDelegatedHandlers'> = {},
) {
  const registrations = new Map<
    string,
    {
      handle: HotkeyRegistrationHandle
      target: HotkeyCommonOptions['target']
      platform: HotkeyCommonOptions['platform']
      options: HotkeyCommonOptions
    }
  >()

  // Invalid hotkeys already warned about, in development only
  let warned: Set<string> | undefined

  return {
    /**
     * Registers new definitions, updates existing ones in place, and removes
     * stale ones. Definitions with no hotkey (undefined, null, empty string, or
     * empty sequence) or a null target are skipped.
     */
    update(
      definitions: ReadonlyArray<HotkeyDefinition>,
      commonOptions: HotkeyBindingsCommonOptions = {},
    ) {
      const prepared: Array<{
        key: string
        callback: HotkeyCallback
        options: HotkeyCommonOptions
        register: () => HotkeyRegistrationHandle
      }> = []
      definitions.forEach((definition, index) => {
        // `undefined` means "not set", so it keeps the default.
        const merged = definedOptions<HotkeyCommonOptions>(
          commonOptions,
          definition.options,
        )
        const options: HotkeyCommonOptions = {
          ...defaultHotkeyOptions,
          ...merged,
          ...adapterOptions,
          target:
            'target' in merged
              ? (merged.target ?? null)
              : typeof document === 'undefined'
                ? null
                : document,
          platform: merged.platform ?? detectPlatform(),
        }
        // Only a hotkey registers: not undefined, null, '', or [].
        if (
          !options.target ||
          !definition.hotkey ||
          (isHotkeySequence(definition.hotkey) &&
            definition.hotkey.length === 0)
        ) {
          return
        }
        // A step without a usable key, such as '', { key: '', ctrl: true },
        // 'Shift', or 'Ctl+K', registers nothing.
        const parsed = parseHotkey(definition.hotkey, options.platform)
        if (!(Array.isArray(parsed) ? parsed : [parsed]).every(chordHasKey)) {
          // Dev-only guard: see `canWarn`. Hooks call `update` on every
          // render, so each hotkey warns once.
          if (canWarn && process.env.NODE_ENV !== 'production') {
            const text = JSON.stringify(definition.hotkey)
            if (!(warned ??= new Set()).has(text)) {
              warned.add(text)
              console.warn(
                `[hotkeys] Invalid hotkey ${text} was not registered`,
              )
            }
          }
          return
        }
        const hotkey = normalizeHotkey(parsed, options.platform)
        if (isHotkeySequence(hotkey)) delete options.requireReset
        else delete options.timeout
        prepared.push({
          key: `${index}:${isHotkeySequence(hotkey) ? hotkey.join(' ') : hotkey}`,
          callback: definition.callback,
          options,
          register: () =>
            getHotkeyManager().register(hotkey, definition.callback, options),
        })
      })

      const keys = new Set(prepared.map((binding) => binding.key))
      // Remove stale entries before registering replacements to avoid conflicts.
      for (const [key, registration] of registrations) {
        if (!keys.has(key)) {
          registration.handle.unregister()
          registrations.delete(key)
        }
      }
      for (const binding of prepared) {
        const previous = registrations.get(binding.key)
        const { target, platform } = binding.options
        if (
          previous?.handle.isActive &&
          previous.target === target &&
          previous.platform === platform
        ) {
          previous.handle.callback = binding.callback
          // setOptions merges, so explicitly reset options removed by the caller.
          const reset = Object.fromEntries(
            Object.keys(previous.options).map((key) => [key, undefined]),
          )
          previous.handle.setOptions({ ...reset, ...binding.options })
          previous.options = binding.options
        } else {
          previous?.handle.unregister()
          registrations.set(binding.key, {
            handle: binding.register(),
            target,
            platform,
            options: binding.options,
          })
        }
      }
    },
    destroy() {
      for (const { handle } of registrations.values()) handle.unregister()
      registrations.clear()
    },
  }
}

/** Options with a framework-specific target, such as a ref. */
export type WithTarget<TOptions, TTarget> = Omit<
  TOptions,
  'target' | 'appHotkeyId' | 'afterDelegatedHandlers'
> & {
  /** The element to listen on. Defaults to document. */
  target?: TTarget
}

/** Options shared by chords and sequences, with a framework target. */
export type AdapterHotkeyOptions<TTarget> = WithTarget<HotkeyOptions, TTarget>

/** Options for a chord such as `'Mod+S'`, with a framework target. */
export type AdapterChordOptions<TTarget> = WithTarget<
  HotkeyChordOptions,
  TTarget
>

/** Options for a sequence such as `['G', 'G']`, with a framework target. */
export type AdapterSequenceOptions<TTarget> = WithTarget<
  HotkeySequenceOptions,
  TTarget
>

/** Options applied to every hotkey, such as defaults. Each applies to the kinds that support it. */
export type AdapterCommonOptions<TTarget> = AdapterChordOptions<TTarget> &
  AdapterSequenceOptions<TTarget>

/** Chord options for chords, sequence options for sequences. */
export type AdapterOptionsFor<T extends RegisterableHotkey, TTarget> = [
  T,
] extends [never]
  ? AdapterCommonOptions<TTarget>
  : T extends readonly [unknown]
    ? AdapterChordOptions<TTarget>
    : T extends ReadonlyArray<unknown>
      ? AdapterSequenceOptions<TTarget>
      : AdapterChordOptions<TTarget>

/**
 * Call-site options for an app hotkey. `meta` comes from the declaration.
 * Kind-specific options follow the declared default: `requireReset` for a
 * chord, `timeout` for a sequence, both for an app hotkey without a default.
 * If the user rebinds it to the other kind, options for the old kind no
 * longer apply.
 */
export type AdapterAppHotkeyOptions<T extends AppHotkey, TTarget> = Omit<
  [T['defaultHotkey']] extends [HotkeySequence]
    ? AdapterSequenceOptions<TTarget>
    : [T['defaultHotkey']] extends [HotkeyChord]
      ? AdapterChordOptions<TTarget>
      : AdapterCommonOptions<TTarget>,
  'meta'
>

/**
 * One hotkey and its callback for adapter APIs such as `useHotkeys`. Chords
 * accept `requireReset`; sequences accept `timeout`; hotkeys of unknown kind
 * accept only shared options.
 */
export type AdapterHotkeyDefinition<TTarget> =
  | {
      /** A chord string such as `'Mod+S'`, or a chord object */
      hotkey: RegisterableHotkeyChord
      /** The function to call when the hotkey is pressed */
      callback: HotkeyCallback
      /** Per-hotkey options (merged on top of common options) */
      options?: AdapterChordOptions<TTarget>
    }
  | {
      /** A sequence such as `['G', 'G']`, with each step a string or an object */
      hotkey: RegisterableHotkeySequence
      callback: HotkeyCallback
      options?: AdapterSequenceOptions<TTarget>
    }
  | {
      /**
       * An app hotkey from `defineAppHotkeys`. Kind-specific options apply
       * only while its effective hotkey has that kind.
       */
      hotkey: AppHotkey
      callback: HotkeyCallback
      options?: Omit<AdapterCommonOptions<TTarget>, 'meta'>
    }
  | {
      /**
       * A hotkey whose kind is not known statically, such as user data typed
       * `Hotkey`. Accepts only shared options. `undefined`, `null`, and `''`
       * register nothing, for an optional shortcut.
       */
      hotkey: RegisterableHotkey | null | undefined
      callback: HotkeyCallback
      options?: AdapterHotkeyOptions<TTarget>
    }

/** Context for `prepareHotkeyDefinitions`. */
export interface PrepareHotkeyDefinitionsOptions<TTarget> {
  /** The provider's app hotkeys store, so app hotkeys use custom hotkeys. */
  appHotkeysStore?: AppHotkeysStore | null
  /** Provider defaults, applied first. */
  defaults?: AdapterCommonOptions<TTarget>
  /** Options for every definition, applied after app hotkey declarations. */
  commonOptions?: AdapterCommonOptions<TTarget>
  /**
   * Resolves a framework target, such as a ref. Return `null` or `undefined`
   * to skip registration until the target exists. Without it, targets pass
   * through. Only an omitted `target` listens on the document; a `target` set
   * to `null` or `undefined` waits.
   */
  resolveTarget?: (target: TTarget) => Target | null | undefined
}

/**
 * Converts adapter definitions into `createHotkeyBindings` definitions.
 * Options merge in this order: defaults, app hotkey declaration, common
 * options, per-definition options. App hotkeys resolve their effective hotkey
 * from the store, and an unbound app hotkey keeps its position but registers
 * nothing.
 */
export function prepareHotkeyDefinitions<TTarget>(
  definitions: ReadonlyArray<AdapterHotkeyDefinition<TTarget>>,
  options: PrepareHotkeyDefinitionsOptions<TTarget> = {},
): Array<HotkeyDefinition> {
  return definitions.map((definition) => {
    let hotkey = definition.hotkey
    let declared = {}
    if (isAppHotkey(hotkey)) {
      const appHotkey = resolveAppHotkey(hotkey, options.appHotkeysStore)
      declared = getAppHotkeyRegistrationOptions(appHotkey)
      hotkey = appHotkey.hotkey ?? []
    }
    const layers = [
      options.defaults,
      declared,
      options.commonOptions,
      definition.options,
    ]
    // `undefined` means "not set", so it keeps the earlier layer's value.
    const { target, ...merged } = definedOptions<AdapterCommonOptions<TTarget>>(
      ...layers,
    )
    // Only an omitted `target` means the document. A target that is set but
    // not there yet, such as an unmounted ref, waits like `null`.
    const resolved =
      target === undefined
        ? null
        : options.resolveTarget
          ? options.resolveTarget(target)
          : (target as Target | null)
    return {
      hotkey,
      callback: definition.callback,
      options: layers.some((layer) => layer && Object.hasOwn(layer, 'target'))
        ? { ...merged, target: resolved ?? null }
        : merged,
    } as HotkeyDefinition
  })
}

/**
 * Calls `onChange` when the store published with `publishAppHotkeysStore` or
 * `provideAppHotkeys` changes, or when its app hotkeys or custom hotkeys
 * change. For adapters that resolve app hotkeys without a provider. Returns an
 * unsubscribe function.
 */
export function subscribePublishedAppHotkeys(onChange: () => void): () => void {
  const slot = getHotkeyManager().appHotkeys
  let inner: { unsubscribe: () => void } | undefined
  const follow = () => {
    inner?.unsubscribe()
    inner = slot.state?.store.subscribe(onChange)
  }
  follow()
  const outer = slot.subscribe(() => {
    follow()
    onChange()
  })
  return () => {
    outer.unsubscribe()
    inner?.unsubscribe()
  }
}

/** Scope props shared by framework providers. */
export interface HotkeysProviderScopeProps {
  /**
   * Scope for hotkeys registered inside this provider, active while it is
   * mounted and enabled. Defaults to the parent provider's scope, or
   * `'global'` at the root. App hotkeys that declare a scope keep it.
   */
  scope?: string
  /**
   * While mounted and enabled, suspend hotkeys in every other scope,
   * including `'global'`, except scopes of nested providers. Pass
   * `{ allow: [...] }` to keep other scopes active, such as `'global'`. Use
   * with `scope`, for dialogs and other overlays.
   */
  exclusive?: ActivateHotkeyScopeOptions['exclusive']
  /**
   * Set false to deactivate this provider's scope, and the scopes of
   * providers nested in it, without unmounting. Defaults to true.
   */
  enabled?: boolean
}

/**
 * Provider defaults for every recorder. Each recorder sets its own
 * `maxSteps`, `onRecord`, and `validate`.
 */
export type HotkeyRecorderDefaults = Partial<
  Omit<
    HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions,
    'maxSteps' | 'onRecord' | 'validate'
  >
>

/**
 * The shape of a provider's default options. Adapters declare their own
 * interface, documented with their API names, that satisfies this one.
 */
export interface HotkeysDefaultOptions<
  THotkeyOptions = object,
  TRecorderOptions = HotkeyRecorderDefaults,
> {
  platform?: HotkeyPlatform
  keyboardLayout?: boolean
  hotkey?: THotkeyOptions
  hotkeyRecorder?: TRecorderOptions
}

/** The value a framework provider passes down to its hotkeys and labels. */
export interface HotkeysContextValue<TDefaults> {
  appHotkeysStore: AppHotkeysStore | null
  /** Merged with every ancestor provider's defaults, including `hotkey.scope`. */
  defaultOptions: TDefaults
  /** Whether this provider and every ancestor are enabled. */
  enabled: boolean
}

/**
 * Merges a provider's default options over its parent's. A provider with a
 * `scope` sets `hotkey.scope`, so hotkeys registered inside it use that scope.
 * A provider's `platform` is inherited, and is the default platform for its
 * hotkeys and recorders; `hotkey.platform` and `hotkeyRecorder.platform` win.
 * `keyboardLayout` is inherited too.
 */
export function mergeHotkeysProviderDefaults<
  T extends HotkeysDefaultOptions<object, object>,
>(parent: T | undefined, own: T | undefined, scope: string | undefined): T {
  const parentPlatform = { platform: parent?.platform }
  const ownPlatform = { platform: own?.platform }
  return {
    ...definedOptions(
      { keyboardLayout: parent?.keyboardLayout },
      { keyboardLayout: own?.keyboardLayout },
    ),
    ...definedOptions(parentPlatform, ownPlatform),
    hotkey: {
      ...definedOptions(
        parentPlatform,
        parent?.hotkey,
        ownPlatform,
        own?.hotkey,
      ),
      ...(scope && { scope }),
    },
    hotkeyRecorder: definedOptions(
      parentPlatform,
      parent?.hotkeyRecorder,
      ownPlatform,
      own?.hotkeyRecorder,
    ),
  }
}

/**
 * The platform to render with during server rendering and hydration when no
 * provider sets one, for a `useSyncExternalStore` server snapshot. Warns once
 * in development on the server.
 */
export function getServerPlatformSnapshot(): HotkeyPlatform {
  warnServerPlatform()
  return 'linux'
}

/**
 * A key for a provider's scope activation, or `null` when the scope should not
 * be active. Equal keys mean the same activation, so adapters reactivate only
 * when the key changes, not when an inline `exclusive` object is recreated.
 */
export function getHotkeysProviderScopeKey(options: {
  scope: string | undefined
  exclusive: ActivateHotkeyScopeOptions['exclusive']
  /** Whether this provider and every ancestor are enabled. */
  active: boolean
  /** The parent provider's scope. */
  parent: string | undefined
}): string | null {
  const { scope, exclusive, active, parent } = options
  if (!scope || !active) return null
  return JSON.stringify([
    scope,
    typeof exclusive === 'object' ? exclusive.allow : !!exclusive,
    parent ?? null,
  ])
}

/**
 * Activates the scope described by a key from `getHotkeysProviderScopeKey`.
 * Returns a function that releases the activation.
 */
export function activateHotkeysProviderScope(key: string): () => void {
  const [scope, exclusive, parent] = JSON.parse(key) as [
    string,
    boolean | Array<string>,
    string | null,
  ]
  return getHotkeyManager().activateScope(scope, {
    exclusive: Array.isArray(exclusive) ? { allow: exclusive } : exclusive,
    parent: parent ?? undefined,
  })
}

/**
 * Whether a hotkey to display names a physical position, such as `[KeyQ]` or
 * `{ code: 'KeyQ' }`. Only those labels follow the keyboard layout. A label
 * primitive that reads the layout reactively checks this first, so a label
 * such as `Mod+S` doesn't render again when the layout loads.
 */
export function namesPhysicalKey(hotkey: DisplayHotkey): boolean {
  // `Mod+[` names the character, not a position.
  if (typeof hotkey === 'string') return /\[\w+\]/.test(hotkey)
  if (Array.isArray(hotkey)) return hotkey.some(namesPhysicalKey)
  return (hotkey as { code?: unknown }).code !== undefined
}

/**
 * The app hotkeys store, typed by `Register`, or throws when there is none.
 * `message` says which API needs it and how to provide one.
 */
export function requireAppHotkeysStore(
  store: AppHotkeysStore | null | undefined,
  message: string,
): AppHotkeysStore<RegisteredAppHotkeys> {
  if (!store) throw new Error(`[hotkeys] ${message}`)
  // Not a no-op once apps augment `Register`.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return store as unknown as AppHotkeysStore<RegisteredAppHotkeys>
}

/**
 * The store published with `publishAppHotkeysStore` or `provideAppHotkeys`,
 * or `null`. For adapters that resolve app hotkeys without a provider.
 */
export function getPublishedAppHotkeysStore(): AppHotkeysStore | null {
  return getHotkeyManager().appHotkeys.state
}

/**
 * Custom hotkey actions that call the store from `getStore` each time, so they
 * follow a store that changes.
 */
export function bindCustomHotkeyActions(
  getStore: () => AppHotkeysStore<RegisteredAppHotkeys>,
): CustomHotkeyActions {
  return {
    setCustomHotkey: (id, hotkey, recordedWith) =>
      getStore().setCustomHotkey(id, hotkey, recordedWith),
    resetCustomHotkey: (id) => getStore().resetCustomHotkey(id),
    resetCustomHotkeys: () => getStore().resetCustomHotkeys(),
    findConflicts: (id, hotkey, recordedWith) =>
      getStore().findConflicts(id, hotkey, recordedWith),
  }
}

/** Views of every registration, chords and sequences, for registration lists. */
export function getHotkeyRegistrationViews(
  registrations: ReadonlyMap<string, HotkeyRegistration> = getHotkeyManager()
    .registrations.state,
): Array<HotkeyRegistrationView> {
  return Array.from(registrations.values()).map(toHotkeyRegistrationView)
}

/**
 * Whether a hotkey's hint shows: its modifiers are held and a registration
 * that can fire exists. App hotkeys resolve through `appHotkeysStore`.
 * Adapters read the held keys and registrations reactively, then call this.
 */
export function isHotkeyHintVisible(
  hotkey: RegisterableHotkey | AppHotkey | null | undefined,
  heldKeys: ReadonlyArray<string>,
  options: HeldModifierOptions = {},
  appHotkeysStore?: AppHotkeysStore | null,
): boolean {
  const resolved = isAppHotkey(hotkey)
    ? resolveAppHotkey(hotkey, appHotkeysStore).hotkey
    : hotkey
  return (
    resolved !== null &&
    matchesHeldModifiers(resolved, heldKeys, options) &&
    getHotkeyManager().hasActiveRegistration(hotkey)
  )
}

/**
 * A `formatForDisplay` that uses a provider's platform and keyboard layout
 * when the call doesn't pass them. Only a label that names a physical key
 * reads `getLayoutMap`, so other labels don't depend on the layout.
 */
export function createFormatForDisplay(
  getPlatform: () => HotkeyPlatform | undefined,
  getLayoutMap: () => KeyboardLayoutMap | null | undefined,
): typeof formatForDisplay {
  return ((hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? getPlatform(),
      layoutMap:
        options?.layoutMap ??
        (namesPhysicalKey(hotkey) ? (getLayoutMap() ?? undefined) : undefined),
    })) as typeof formatForDisplay
}

/**
 * Loads the browser's keyboard layout and calls `onChange` when it changes.
 * Pass `load` to run the load differently, such as outside Angular's zone.
 * Returns a function that stops following and releases the load.
 */
export function followKeyboardLayout(
  onChange: (layoutMap: KeyboardLayoutMap | null) => void,
  load: () => () => void = loadKeyboardLayout,
): () => void {
  const stop = load()
  const { unsubscribe } = getKeyboardLayoutStore().subscribe(onChange)
  return () => {
    unsubscribe()
    stop()
  }
}

/**
 * A framework ref, element, document, or window to listen on. A `null` or
 * `undefined` target, or a ref that is still unset, waits for the element.
 */
export type RefTarget<TRef = { current: HTMLElement | null | undefined }> =
  | TRef
  | Target
  | null

/**
 * Resolves a ref object to its current element; other targets pass through.
 * An unset ref resolves to `null` or `undefined`, so registration waits.
 */
export function resolveRefTarget(
  target: RefTarget<{ current: HTMLElement | null | undefined }>,
): Target | null | undefined {
  return target !== null && typeof target === 'object' && 'current' in target
    ? target.current
    : target
}
