import { getHotkeyManager } from './hotkey-manager'
import {
  getAppHotkeyRegistrationOptions,
  isAppHotkey,
  resolveAppHotkey,
} from './app-hotkeys'
import { isHotkeySequence, normalizeHotkey } from './parse'
import { defaultHotkeyOptions } from './_registration'
import { detectPlatform } from './platform'
import type { AppHotkey, AppHotkeysStore } from './app-hotkeys'
import type {
  HotkeyCallback,
  HotkeyChord,
  HotkeySequence,
  RegisterableHotkey,
  RegisterableHotkeyChord,
  RegisterableHotkeySequence,
} from './hotkey.types'
import type {
  ActivateHotkeyScopeOptions,
  HotkeyChordOptions,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  HotkeySequenceOptions,
  Target,
} from './hotkey-manager'

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

/** Options shared by every definition. Each option applies only to the kinds that support it. */
export type HotkeyBindingsCommonOptions = HotkeyChordOptions &
  HotkeySequenceOptions

type ResolvedOptions = HotkeyChordOptions & HotkeySequenceOptions

/** Reconciles adapter registrations while retaining handles for option updates. */
export function createHotkeyBindings() {
  const registrations = new Map<
    string,
    {
      handle: HotkeyRegistrationHandle
      target: ResolvedOptions['target']
      platform: ResolvedOptions['platform']
      options: ResolvedOptions
    }
  >()

  return {
    /**
     * Registers new definitions, updates existing ones in place, and removes
     * stale ones. Definitions with an empty sequence or a null target are skipped.
     */
    update(
      definitions: ReadonlyArray<HotkeyDefinition>,
      commonOptions: HotkeyBindingsCommonOptions = {},
    ) {
      const prepared: Array<{
        key: string
        callback: HotkeyCallback
        options: ResolvedOptions
        register: () => HotkeyRegistrationHandle
      }> = []
      definitions.forEach((definition, index) => {
        const merged: ResolvedOptions = {
          ...commonOptions,
          ...definition.options,
        }
        const options: ResolvedOptions = {
          ...defaultHotkeyOptions,
          ...merged,
          ignoreInputs: merged.ignoreInputs ?? 'auto',
          target:
            'target' in merged
              ? (merged.target ?? null)
              : typeof document === 'undefined'
                ? null
                : document,
          platform: merged.platform ?? detectPlatform(),
        }
        if (
          !options.target ||
          (isHotkeySequence(definition.hotkey) &&
            definition.hotkey.length === 0)
        ) {
          return
        }
        const hotkey = normalizeHotkey(definition.hotkey, options.platform)
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
  'target' | 'appHotkeyId'
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
       * `Hotkey`. Accepts only shared options.
       */
      hotkey: RegisterableHotkey
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
   * Resolves a framework target, such as a ref. Return `undefined` for the
   * document or `null` to skip registration until the target exists.
   * Without it, targets pass through and `null` means document.
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
    const { target, ...merged } = {
      ...options.defaults,
      ...declared,
      ...options.commonOptions,
      ...definition.options,
    } as AdapterCommonOptions<TTarget>
    const resolved =
      target === undefined
        ? undefined
        : options.resolveTarget
          ? options.resolveTarget(target)
          : ((target as Target | null) ?? undefined)
    return {
      hotkey,
      callback: definition.callback,
      options:
        resolved === undefined ? merged : { ...merged, target: resolved },
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
 * Merges a provider's default options over its parent's. A provider with a
 * `scope` sets `hotkey.scope`, so hotkeys registered inside it use that scope.
 */
export function mergeHotkeysProviderDefaults<
  T extends { hotkey?: object; hotkeyRecorder?: object },
>(parent: T | undefined, own: T | undefined, scope: string | undefined): T {
  return {
    hotkey: { ...parent?.hotkey, ...own?.hotkey, ...(scope && { scope }) },
    hotkeyRecorder: { ...parent?.hotkeyRecorder, ...own?.hotkeyRecorder },
  } as T
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
