import { getHotkeyManager } from './hotkey-manager'
import { areHotkeysEqual } from './match'
import { detectPlatform } from './platform'
import { isHotkeySequence, simplifyHotkey } from './parse'
import { validateHotkey } from './validate'
import { GLOBAL_SCOPE } from './_registration'
import { setAppHotkeysStoreFactory } from './_app-hotkeys-factory'
import { createStore } from './_store'
import type { Store } from './_store'
import type {
  Hotkey,
  HotkeyChord,
  HotkeyMeta,
  HotkeySequence,
} from './hotkey.types'
import type {
  HotkeyChordOptions,
  HotkeyRegistrationStatus,
  HotkeyRegistrationView,
  HotkeySequenceOptions,
} from './hotkey-manager'

type Platform = 'mac' | 'windows' | 'linux'

type DeclaredOptionKeys =
  | 'capture'
  | 'conflictBehavior'
  | 'eventType'
  | 'ignoreInputs'
  | 'preventDefault'
  | 'stopPropagation'

/** Declared options for an app hotkey whose default is a chord. */
export type AppHotkeyChordOptions = Pick<
  HotkeyChordOptions,
  DeclaredOptionKeys | 'requireReset'
>

/** Declared options for an app hotkey whose default is a sequence. */
export type AppHotkeySequenceOptions = Pick<
  HotkeySequenceOptions,
  DeclaredOptionKeys | 'timeout'
>

/** Every declared option. Kind-specific options apply only while the effective hotkey has that kind. */
export type AppHotkeyOptions = AppHotkeyChordOptions & AppHotkeySequenceOptions

/** One declaration passed to `defineAppHotkeys`. */
export interface AppHotkeyInput {
  /** Default hotkey: a chord, a sequence, or `null` for an action without a default. */
  hotkey: Hotkey | null
  /** Display metadata for cheat sheets and settings screens. */
  meta?: HotkeyMeta
  /**
   * Scope this hotkey fires in, such as `'editor'`. Overrides the scope of the
   * provider it registers under. App hotkeys in different scopes may share a
   * hotkey; one in the `'global'` scope conflicts with any app hotkey that
   * shares its hotkey.
   */
  scope?: string
  /**
   * Options that describe the hotkey itself. Chord defaults accept
   * `requireReset`; sequence defaults accept `timeout`.
   */
  options?: AppHotkeyOptions
}

/**
 * A declared app hotkey. It never holds a callback: register it with
 * `useHotkey(appHotkey, callback)` or the equivalent adapter API.
 *
 * `TDefault` is the kind of the declared default (`HotkeyChord`,
 * `HotkeySequence`, or `null`). Adapters use it to type kind-specific options.
 */
export interface AppHotkey<
  TId extends string = string,
  TDefault extends HotkeyChord | HotkeySequence | null =
    HotkeyChord | HotkeySequence | null,
> {
  /** Brand that distinguishes app hotkeys from raw hotkey objects. */
  readonly '~appHotkey': true
  /** Stable id. Saved custom hotkeys are keyed by this value. */
  readonly id: TId
  /** Effective hotkey: the user's custom hotkey, or the default. `null` means unbound. */
  readonly hotkey: Hotkey | null
  /** Hotkey declared in `defineAppHotkeys`. */
  readonly defaultHotkey: TDefault
  readonly meta?: HotkeyMeta
  readonly scope?: string
  readonly options?: AppHotkeyOptions
}

/** A map of app hotkeys keyed by id. */
export type AppHotkeys = Readonly<Record<string, AppHotkey>>

type AllowedOptions<THotkey> = THotkey extends HotkeySequence
  ? AppHotkeySequenceOptions
  : THotkey extends null
    ? AppHotkeyOptions
    : AppHotkeyChordOptions

type StrictOptions<TOptions, TAllowed> = TOptions extends object
  ? { [P in Exclude<keyof TOptions, keyof TAllowed>]: never } & TAllowed
  : TAllowed

/** Rejects options that do not apply to each declaration's default kind. */
type ValidatedAppHotkeyInputs<T> = {
  [K in keyof T]: T[K] extends { hotkey: infer THotkey }
    ? Omit<T[K], 'options'> & {
        options?: StrictOptions<
          T[K] extends { options: infer TOptions } ? TOptions : {},
          AllowedOptions<THotkey>
        >
      }
    : never
}

/** The kind of a declared default hotkey; a one-step sequence is a chord. */
export type AppHotkeyDefaultKind<THotkey> = THotkey extends null
  ? null
  : THotkey extends readonly [unknown]
    ? HotkeyChord
    : THotkey extends ReadonlyArray<unknown>
      ? HotkeySequence
      : HotkeyChord

/** The app hotkeys returned by `defineAppHotkeys` for a declaration object. */
export type DefinedAppHotkeys<T extends Record<string, AppHotkeyInput>> = {
  readonly [K in keyof T & string]: AppHotkey<
    K,
    AppHotkeyDefaultKind<T[K]['hotkey']>
  >
}

/**
 * Register your app hotkeys to type `useAppHotkeys()` and `CustomHotkeys`.
 *
 * @example
 * ```ts
 * declare module '@tanstack/react-hotkeys' {
 *   interface Register {
 *     appHotkeys: typeof appHotkeys
 *   }
 * }
 * ```
 */
export interface Register {}

/** The app hotkeys type from `Register`, or a generic map when none is registered. */
export type RegisteredAppHotkeys = Register extends {
  appHotkeys: infer T extends AppHotkeys
}
  ? T
  : AppHotkeys

/** Ids of the registered app hotkeys. */
export type AppHotkeyId = keyof RegisteredAppHotkeys & string

/**
 * The user's hotkeys that differ from the declared defaults, keyed by app
 * hotkey id. This is the shape to save. `null` means the user unbound it.
 */
export type CustomHotkeys<T extends AppHotkeys = RegisteredAppHotkeys> = {
  -readonly [K in keyof T]?: Hotkey | null
}

/**
 * Declares every app hotkey up front, without registering any, so cheat
 * sheets and settings screens can list hotkeys whose components have not
 * mounted. Pass the result to `HotkeysProvider` as `appHotkeys`.
 *
 * @example
 * ```ts
 * export const appHotkeys = defineAppHotkeys({
 *   'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save', group: 'Document' } },
 *   'nav.home': { hotkey: ['G', 'H'], meta: { name: 'Go home' }, options: { timeout: 800 } },
 *   'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
 * })
 * ```
 */
export function defineAppHotkeys<
  const T extends Record<string, AppHotkeyInput>,
>(definitions: T & ValidatedAppHotkeyInputs<T>): DefinedAppHotkeys<T> {
  setAppHotkeysStoreFactory(
    (appHotkeys, options) => new AppHotkeysStore(appHotkeys, options),
  )
  const result: Record<string, AppHotkey> = {}
  for (const [id, input] of Object.entries(definitions as T)) {
    const hotkey = input.hotkey === null ? null : simplifyHotkey(input.hotkey)
    result[id] = {
      '~appHotkey': true,
      id,
      hotkey,
      defaultHotkey: hotkey,
      meta: input.meta,
      scope: input.scope,
      options: input.options,
    }
  }
  return result as DefinedAppHotkeys<T>
}

/** Whether a value is an app hotkey created by `defineAppHotkeys`. */
export function isAppHotkey(value: unknown): value is AppHotkey {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { '~appHotkey'?: unknown })['~appHotkey'] === true
  )
}

function hotkeysEqual(
  left: Hotkey | null,
  right: Hotkey | null,
  platform: Platform,
): boolean {
  if (left === null || right === null) return left === right
  return areHotkeysEqual(left, right, platform)
}

/** Whether an app hotkey's effective hotkey differs from its default. */
export function isCustomHotkey(
  appHotkey: AppHotkey,
  platform: Platform = detectPlatform(),
): boolean {
  return !hotkeysEqual(appHotkey.hotkey, appHotkey.defaultHotkey, platform)
}

/** Parses a saved custom hotkey. Returns `undefined` when it is not a valid hotkey. */
function parseCustomHotkey(value: unknown): Hotkey | null | undefined {
  if (value === null) return null
  const valid =
    (typeof value === 'string' ||
      (Array.isArray(value) &&
        value.every((step) => typeof step === 'string'))) &&
    validateHotkey(value).valid
  return valid ? simplifyHotkey(value as Hotkey) : undefined
}

/** Applies custom hotkeys to declarations. Unchanged entries keep their identity. */
function applyCustomHotkeys<T extends AppHotkeys>(
  appHotkeys: T,
  customHotkeys: CustomHotkeys<T>,
): T {
  const custom = customHotkeys as Record<string, Hotkey | null | undefined>
  const result: Record<string, AppHotkey> = {}
  for (const [id, appHotkey] of Object.entries(appHotkeys)) {
    const hotkey =
      custom[id] === undefined ? appHotkey.defaultHotkey : custom[id]
    result[id] =
      hotkey === appHotkey.hotkey ? appHotkey : { ...appHotkey, hotkey }
  }
  return result as T
}

/** Keeps only valid custom hotkeys for known ids, warning about the rest. */
function sanitizeCustomHotkeys<T extends AppHotkeys>(
  appHotkeys: T,
  saved: unknown,
): CustomHotkeys<T> {
  const result: Record<string, Hotkey | null> = {}
  if (typeof saved !== 'object' || saved === null) return result
  for (const [id, value] of Object.entries(saved)) {
    if (value === undefined) continue
    // Own ids only: saved data can hold names such as toString or __proto__
    if (!Object.hasOwn(appHotkeys, id)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Ignoring custom hotkey for unknown app hotkey '${id}'`)
      }
      continue
    }
    const hotkey = parseCustomHotkey(value)
    if (hotkey === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `Ignoring invalid custom hotkey for app hotkey '${id}':`,
          value,
        )
      }
      continue
    }
    result[id] = hotkey
  }
  return result
}

/** Whether two app hotkeys can apply at the same time. */
function scopesOverlap(a: AppHotkey, b: AppHotkey): boolean {
  const left = a.scope ?? GLOBAL_SCOPE
  const right = b.scope ?? GLOBAL_SCOPE
  return left === GLOBAL_SCOPE || right === GLOBAL_SCOPE || left === right
}

/** Whether two hotkeys collide: equal chords, or one sequence starts with the other. */
function hotkeysOverlap(
  left: Hotkey,
  right: Hotkey,
  platform: Platform,
): boolean {
  const a = isHotkeySequence(left) ? left : [left]
  const b = isHotkeySequence(right) ? right : [right]
  const length = Math.min(a.length, b.length)
  for (let i = 0; i < length; i++) {
    if (!areHotkeysEqual(a[i]!, b[i]!, platform)) return false
  }
  return true
}

/**
 * Status of an app hotkey in the running app.
 * - `'active'`: at least one enabled registration
 * - `'suspended'`: has an enabled registration, but none in an active scope
 * - `'disabled'`: registered, but every registration has `enabled: false`
 * - `'inactive'`: has a hotkey, but nothing has registered it
 * - `'unbound'`: no hotkey assigned
 */
export type AppHotkeyStatus =
  'active' | 'suspended' | 'disabled' | 'inactive' | 'unbound'

/** One row of an app hotkey cheat sheet. */
export interface AppHotkeyListItem<T extends AppHotkey = AppHotkey> {
  appHotkey: T
  status: AppHotkeyStatus
  /** Whether the effective hotkey differs from the declared default. */
  isCustom: boolean
  /** Live registrations of this app hotkey (for example, one per list row). */
  registrations: Array<HotkeyRegistrationView>
}

/** State of an `AppHotkeysStore`. */
export interface AppHotkeysState<T extends AppHotkeys = AppHotkeys> {
  /** Effective app hotkeys: declarations with custom hotkeys applied. */
  appHotkeys: T
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: CustomHotkeys<T>
}

/** Options for `AppHotkeysStore`. */
export interface AppHotkeysStoreOptions<T extends AppHotkeys = AppHotkeys> {
  /** Starting custom hotkeys, such as saved data. Invalid entries are ignored with a warning. */
  customHotkeys?: CustomHotkeys<T> | null
  /** Called with the custom hotkeys after every change, ready to save. */
  onCustomHotkeysChange?: (customHotkeys: CustomHotkeys<T>) => void
  /** Platform used to compare hotkeys. Defaults to detection. */
  platform?: Platform
}

/**
 * Holds declared app hotkeys and the user's custom hotkeys. Framework
 * providers create one and expose it through hooks; devtools read it from
 * `HotkeyManager.appHotkeys`.
 *
 * @example
 * ```ts
 * const store = new AppHotkeysStore(appHotkeys, {
 *   customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
 *   onCustomHotkeysChange: (custom) =>
 *     localStorage.setItem('hotkeys', JSON.stringify(custom)),
 * })
 * store.setCustomHotkey('doc.save', 'Mod+Shift+S')
 * ```
 */
export class AppHotkeysStore<T extends AppHotkeys = AppHotkeys> {
  readonly store: Store<AppHotkeysState<T>>
  #declarations: T
  #options: AppHotkeysStoreOptions<T>

  constructor(appHotkeys: T, options: AppHotkeysStoreOptions<T> = {}) {
    this.#declarations = appHotkeys
    this.#options = options
    const customHotkeys = sanitizeCustomHotkeys(
      appHotkeys,
      options.customHotkeys,
    )
    this.store = createStore<AppHotkeysState<T>>({
      appHotkeys: applyCustomHotkeys(appHotkeys, customHotkeys),
      customHotkeys,
    })
  }

  get #platform(): Platform {
    return this.#options.platform ?? detectPlatform()
  }

  /** Effective app hotkeys. */
  get appHotkeys(): T {
    return this.store.state.appHotkeys
  }

  /** The user's hotkeys that differ from the defaults. */
  get customHotkeys(): CustomHotkeys<T> {
    return this.store.state.customHotkeys
  }

  /** Updates callbacks and other options without resetting custom hotkeys. */
  setOptions(options: Omit<AppHotkeysStoreOptions<T>, 'customHotkeys'>): void {
    this.#options = { ...this.#options, ...options }
  }

  /**
   * Replaces the declarations, for example after hot module replacement.
   * Custom hotkeys for ids that still exist are kept.
   */
  setAppHotkeys(appHotkeys: T): void {
    if (appHotkeys === this.#declarations) return
    this.#declarations = appHotkeys
    const customHotkeys = sanitizeCustomHotkeys(
      appHotkeys,
      this.store.state.customHotkeys,
    )
    this.store.setState(() => ({
      appHotkeys: applyCustomHotkeys(appHotkeys, customHotkeys),
      customHotkeys,
    }))
  }

  /** Effective app hotkey for an id, or `undefined` when it is not declared. */
  get(id: string): AppHotkey | undefined {
    const { appHotkeys } = this.store.state
    return Object.hasOwn(appHotkeys, id) ? appHotkeys[id] : undefined
  }

  /**
   * Other app hotkeys that would collide if `id` used `hotkey`. App hotkeys
   * collide when their scopes match or either is `'global'`, and their
   * hotkeys are equal or one sequence starts with the other.
   */
  findConflicts(id: keyof T & string, hotkey: Hotkey): Array<AppHotkey> {
    const self = this.get(id)
    if (!self) return []
    const candidate = simplifyHotkey(hotkey)
    return Object.values(this.store.state.appHotkeys).filter(
      (other) =>
        other.id !== id &&
        other.hotkey !== null &&
        scopesOverlap(self, other) &&
        hotkeysOverlap(candidate, other.hotkey, this.#platform),
    )
  }

  /**
   * Sets the user's hotkey for an app hotkey. `null` unbinds it. A hotkey
   * equal to the default removes the customization.
   *
   * @returns Conflicting app hotkeys. When any exist, nothing changes.
   */
  setCustomHotkey(
    id: keyof T & string,
    hotkey: Hotkey | null,
  ): Array<AppHotkey> {
    const appHotkey = this.get(id)
    if (!appHotkey) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `Cannot set a custom hotkey for unknown app hotkey '${id}'`,
        )
      }
      return []
    }
    const next = hotkey === null ? null : simplifyHotkey(hotkey)
    if (next !== null) {
      const conflicts = this.findConflicts(id, next)
      if (conflicts.length > 0) return conflicts
    }
    const { [id]: _previous, ...rest } = this.store.state
      .customHotkeys as Record<string, Hotkey | null>
    this.#commit(
      (hotkeysEqual(next, appHotkey.defaultHotkey, this.#platform)
        ? rest
        : { ...rest, [id]: next }) as CustomHotkeys<T>,
    )
    return []
  }

  /** Restores the default hotkey for an app hotkey. */
  resetCustomHotkey(id: keyof T & string): void {
    const { [id]: _previous, ...rest } = this.store.state
      .customHotkeys as Record<string, Hotkey | null>
    this.#commit(rest as CustomHotkeys<T>)
  }

  /** Restores every default hotkey. */
  resetCustomHotkeys(): void {
    this.#commit({})
  }

  #commit(customHotkeys: CustomHotkeys<T>): void {
    this.store.setState(() => ({
      appHotkeys: applyCustomHotkeys(this.#declarations, customHotkeys),
      customHotkeys,
    }))
    this.#options.onCustomHotkeysChange?.(customHotkeys)
  }

  /**
   * Joins app hotkeys with live registrations, in declaration order.
   * Adapters call this with the manager's registration views.
   */
  getList(
    registrations: Iterable<HotkeyRegistrationView>,
  ): Array<AppHotkeyListItem<T[keyof T]>> {
    const byId = new Map<string, Array<HotkeyRegistrationView>>()
    for (const registration of registrations) {
      const id = registration.options.appHotkeyId
      if (id === undefined) continue
      const list = byId.get(id)
      if (list) list.push(registration)
      else byId.set(id, [registration])
    }

    return Object.values(this.store.state.appHotkeys).map((appHotkey) => {
      const registered = byId.get(appHotkey.id) ?? []
      const has = (status: HotkeyRegistrationStatus) =>
        registered.some((r) => r.status === status)
      return {
        appHotkey: appHotkey as T[keyof T],
        status:
          appHotkey.hotkey === null
            ? 'unbound'
            : registered.length === 0
              ? 'inactive'
              : has('active')
                ? 'active'
                : has('suspended')
                  ? 'suspended'
                  : 'disabled',
        isCustom: isCustomHotkey(appHotkey, this.#platform),
        registrations: registered,
      }
    })
  }
}

/**
 * Returns the provider's version of an app hotkey, so custom hotkeys apply
 * even when a component imports the declaration directly. Falls back to the
 * given app hotkey when no store declares it.
 */
export function resolveAppHotkey(
  appHotkey: AppHotkey,
  store: AppHotkeysStore | null | undefined,
): AppHotkey {
  return store?.get(appHotkey.id) ?? appHotkey
}

/**
 * Options that adapters pass to the manager when registering an app hotkey:
 * declared options, scope, meta, and the app hotkey id. The manager drops options
 * that do not apply to the effective hotkey's kind.
 */
export function getAppHotkeyRegistrationOptions(
  appHotkey: AppHotkey,
): AppHotkeyOptions & {
  meta?: HotkeyMeta
  appHotkeyId: string
  scope?: string
} {
  return {
    ...appHotkey.options,
    // Omitted when undeclared, so the provider's scope applies.
    ...(appHotkey.scope !== undefined && { scope: appHotkey.scope }),
    meta: appHotkey.meta,
    appHotkeyId: appHotkey.id,
  }
}

/**
 * Publishes a provider's store on the HotkeyManager so devtools can list
 * declared hotkeys. Returns a cleanup function that unpublishes it if it is
 * still the published store.
 */
export function publishAppHotkeysStore(store: AppHotkeysStore): () => void {
  const manager = getHotkeyManager()
  manager.appHotkeys.setState(() => store)
  return () => {
    if (manager.appHotkeys.state === store) {
      manager.appHotkeys.setState(() => null)
    }
  }
}

/**
 * Creates an app hotkeys store and publishes it on the HotkeyManager, for
 * adapters without a provider component (such as Lit and Alpine). Hotkey
 * APIs in those adapters resolve app hotkeys and custom hotkeys from the
 * published store. Call it once at startup. Returns the store and a function
 * that unpublishes it.
 *
 * @example
 * ```ts
 * provideAppHotkeys(appHotkeys, {
 *   customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
 *   onCustomHotkeysChange: (custom) =>
 *     localStorage.setItem('hotkeys', JSON.stringify(custom)),
 * })
 * ```
 */
export function provideAppHotkeys<T extends AppHotkeys>(
  appHotkeys: T,
  options: AppHotkeysStoreOptions<T> = {},
): { store: AppHotkeysStore<T>; dispose: () => void } {
  const store = new AppHotkeysStore(appHotkeys, options)
  const dispose = publishAppHotkeysStore(store)
  return { store, dispose }
}
