import { createStore } from './_store'
import { TargetListeners } from './_target-listeners'
import { managerRef } from './_manager-ref'
import { isRecordingEvent } from './_recording-guard'
import { DEFAULT_SEQUENCE_TIMEOUT, areHotkeysEqual } from './match'
import { detectPlatform } from './platform'
import { normalizeKeyName } from './constants'
import { formatHotkey } from './format'
import {
  isHotkeySequence,
  isModifierKey,
  parseHotkey,
  simplifyHotkey,
} from './parse'
import { matchKeyboardEvent, parsedChordsEqual } from './_match'
import {
  isKeyNameShape,
  keysEqual,
  normalizeKeyboardEvent,
} from './_keyboard-event'
import {
  GLOBAL_SCOPE,
  chordHasKey,
  defaultHotkeyOptions,
  definedOptions,
  getDefaultIgnoreInputs,
  handleConflict,
  optionsEqual,
} from './_registration'
import {
  getTargetDocument,
  isDocumentLevel,
  shouldIgnoreInputEvent,
  targetHasFocus,
} from './_event-target'
import type { Store } from './_store'
import type { KeyboardEventMatch } from './match'
import type { AppHotkey, AppHotkeysStore } from './app-hotkeys'
import type { CanonicalModifier } from './key.types'
import type {
  ConflictBehavior,
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  HotkeyCallbackContextFor,
  HotkeyChord,
  HotkeyMeta,
  HotkeySequence,
  ParsedHotkeyChord,
  RegisterableHotkey,
  RegisterableHotkeyChord,
  RegisterableHotkeySequence,
} from './hotkey.types'

export type { ConflictBehavior }

/** An element, document, or window that hotkeys can listen on. */
export type Target = HTMLElement | Document | Window

/**
 * Options shared by chords and sequences.
 */
export interface HotkeyOptions {
  /**
   * Listen during capture, before descendant listeners. Defaults to `false` (bubble).
   * With `stopPropagation: true`, a match on an ancestor prevents the event from
   * reaching descendant widgets. Other listeners on the same target still run.
   * Applies to both `keydown` and `keyup`, for chords and sequences.
   * Changing this option preserves held-key reset state and sequence progress.
   */
  capture?: boolean
  /** Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn' */
  conflictBehavior?: ConflictBehavior
  /**
   * Soft-disable: when `false`, the callback does not run but the registration
   * stays in `HotkeyManager` (and in devtools). Toggling this should update the
   * existing handle via `setOptions` rather than unregistering. Defaults to `true`.
   */
  enabled?: boolean
  /**
   * The event type to listen for. Defaults to 'keydown'. A 'keyup' chord fires
   * when its key or one of its modifiers is released, whichever comes first,
   * unless another key was pressed in between. `preventDefault` applies to
   * its keydown too.
   */
  eventType?: 'keydown' | 'keyup'
  /**
   * Skip a key press that a listener outside TanStack Hotkeys already handled
   * by calling `preventDefault()`, such as a component library's dialog that
   * closes on Escape. Defaults to `false`.
   */
  ignoreDefaultPrevented?: boolean
  /**
   * Skip keys that a focused control inside the target uses itself: typing in
   * text inputs, textarea, select, and contenteditable; Enter/Space on buttons
   * and summary elements; Enter on links; and navigation keys in ARIA widgets
   * such as menus, listboxes, tabs, and grids. A hotkey targeted at the control
   * itself still receives them. Defaults to `'auto'`, which chooses from the
   * hotkey (the first step of a sequence): true for single keys and Shift/Alt
   * combos; false for Ctrl/Meta shortcuts and Escape. Set false to handle keys
   * even in these controls.
   */
  ignoreInputs?: boolean | 'auto'
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
  /**
   * Prevent the default browser action when the hotkey matches. For a
   * sequence, every step that advances it does. Defaults to true.
   *
   * `'always'` also prevents it while a chord can't fire because it is
   * disabled or its scope is inactive or suspended, unless another hotkey
   * handles the key. It never stops propagation for such a chord. Sequences
   * treat `'always'` as `true`.
   */
  preventDefault?: boolean | 'always'
  /**
   * Stop event propagation when the hotkey matches. For a sequence, only the
   * last step does, so earlier steps reach other listeners. Defaults to true
   */
  stopPropagation?: boolean
  /** The DOM element to attach the event listener to. Defaults to document. */
  target?: Target | null
  /** Optional metadata (name, description, custom fields via declaration merging) */
  meta?: HotkeyMeta
  /**
   * Scope this hotkey belongs to. Defaults to `'global'`, which is always
   * active. Other scopes are active while activated with
   * `HotkeyManager.activateScope`, which framework providers do while
   * mounted. While an exclusive scope is active, only its hotkeys, those of
   * scopes nested in it, and those of scopes it allows fire.
   * When active scopes share a hotkey on the same target, the most recently
   * activated scope handles it.
   */
  scope?: string
  /** Id of the app hotkey this registration implements. Adapters set this when registering an app hotkey from `defineAppHotkeys`. */
  appHotkeyId?: string
  /**
   * Run after key handlers that a framework calls from one listener on its
   * root or the document, such as React's `onKeyDown`, so handlers inside the
   * target run first and can stop the hotkey. An element target then listens
   * on its document, or on its closed shadow root, instead of the element. A
   * stop by an earlier listener there skips the hotkey. Applies only to the
   * bubble phase.
   * Adapters for frameworks that delegate key events set this.
   */
  afterDelegatedHandlers?: boolean
}

/** Options for a single chord such as `'Mod+S'`. */
export interface HotkeyChordOptions extends HotkeyOptions {
  /** If true, only trigger once until all keys are released. Default: false */
  requireReset?: boolean
}

/** Options for a sequence such as `['G', 'G']`. */
export interface HotkeySequenceOptions extends HotkeyOptions {
  /** Maximum time between steps in milliseconds. Default: 1000 */
  timeout?: number
}

/**
 * The options type for a hotkey: chord options for chords (including one-step
 * tuples), sequence options for sequences.
 */
export type HotkeyOptionsFor<T extends RegisterableHotkey> = [T] extends [never]
  ? HotkeyChordOptions & HotkeySequenceOptions
  : T extends readonly [RegisterableHotkeyChord]
    ? HotkeyChordOptions
    : T extends RegisterableHotkeySequence
      ? HotkeySequenceOptions
      : HotkeyChordOptions

interface RegistrationBase<TOptions extends HotkeyOptions> {
  /** Unique identifier for this registration */
  id: string
  /** The callback to invoke */
  callback: HotkeyCallback
  /** Resolved options for this registration */
  options: TOptions
  /** The resolved target element for this registration */
  target: Target
  /** How many times this registration's callback has been triggered */
  triggerCount: number
  /** Whether this registration has fired (and, for requireReset chords, needs a reset) */
  hasFired: boolean
}

/** A registered chord in the HotkeyManager. */
export interface HotkeyChordRegistration extends RegistrationBase<HotkeyChordOptions> {
  kind: 'chord'
  hotkey: HotkeyChord
  parsedChord: ParsedHotkeyChord
  /** The concrete key/code that activated a requireReset registration. */
  activeMatch?: { key: string; code: string }
}

/** A registered sequence in the HotkeyManager. */
export interface HotkeySequenceRegistration extends RegistrationBase<HotkeySequenceOptions> {
  kind: 'sequence'
  hotkey: HotkeySequence
  parsedSequence: Array<ParsedHotkeyChord>
  /** Steps matched in the current attempt */
  currentIndex: number
  /** `Date.now()` when the last step in the current attempt matched */
  lastKeyTime: number
}

/** A registered hotkey in the HotkeyManager. */
export type HotkeyRegistration =
  HotkeyChordRegistration | HotkeySequenceRegistration

/**
 * Whether a registration is on. Focus isn't checked: a registration on an
 * element also needs focus inside that element to fire.
 * - `'active'`: enabled, and its scope is active
 * - `'suspended'`: enabled, but its scope is inactive or suspended by an exclusive scope
 * - `'disabled'`: registered with `enabled: false`
 */
export type HotkeyRegistrationStatus = 'active' | 'suspended' | 'disabled'

interface RegistrationViewBase {
  id: string
  /** Whether the registration is enabled and in an active scope. */
  status: HotkeyRegistrationStatus
  target: Target
  triggerCount: number
  hasFired: boolean
}

/** Public view of a chord registration, without its callback. */
export interface HotkeyChordRegistrationView extends RegistrationViewBase {
  kind: 'chord'
  hotkey: HotkeyChord
  parsedChord: ParsedHotkeyChord
  options: HotkeyChordOptions
}

/** Public view of a sequence registration, without its callback. */
export interface HotkeySequenceRegistrationView extends RegistrationViewBase {
  kind: 'sequence'
  hotkey: HotkeySequence
  parsedSequence: Array<ParsedHotkeyChord>
  options: HotkeySequenceOptions
  /** Steps matched in the current attempt (0 when idle or just completed). */
  matchedStepCount: number
  /** `Date.now()` when the last step in the current attempt matched; 0 if none. */
  partialMatchLastKeyTime: number
}

/**
 * Public view of a hotkey registration for display and introspection.
 * Narrow with `kind` to read chord- or sequence-specific fields.
 */
export type HotkeyRegistrationView =
  HotkeyChordRegistrationView | HotkeySequenceRegistrationView

/** Whether a registration can fire now. Without a manager, scopes don't apply. */
function getRegistrationStatus(
  options: HotkeyOptions,
  manager: HotkeyManager | null,
): HotkeyRegistrationStatus {
  if (options.enabled === false) return 'disabled'
  return manager?.isScopeActive(options.scope) === false
    ? 'suspended'
    : 'active'
}

/** Creates a public view from an internal registration, stripping the callback. */
export function toHotkeyRegistrationView(
  reg: HotkeyRegistration,
): HotkeyRegistrationView {
  const base = {
    id: reg.id,
    status: getRegistrationStatus(reg.options, managerRef.current),
    target: reg.target,
    triggerCount: reg.triggerCount,
    hasFired: reg.hasFired,
  }
  if (reg.kind === 'chord') {
    return {
      ...base,
      kind: 'chord',
      hotkey: reg.hotkey,
      parsedChord: reg.parsedChord,
      options: reg.options,
    }
  }
  const length = reg.parsedSequence.length
  const inProgress = reg.currentIndex > 0 && reg.currentIndex < length
  return {
    ...base,
    kind: 'sequence',
    hotkey: reg.hotkey,
    parsedSequence: reg.parsedSequence,
    options: reg.options,
    matchedStepCount: inProgress ? reg.currentIndex : 0,
    partialMatchLastKeyTime: inProgress ? reg.lastKeyTime : 0,
  }
}

/**
 * A handle returned from HotkeyManager.register() that allows updating
 * the callback and options without re-registering the hotkey.
 *
 * @example
 * ```ts
 * const handle = manager.register('Mod+S', callback, options)
 *
 * // Update callback without re-registering (avoids stale closures)
 * handle.callback = newCallback
 *
 * // Update options without re-registering
 * handle.setOptions({ enabled: false })
 *
 * // Unregister when done
 * handle.unregister()
 * ```
 */
export interface HotkeyRegistrationHandle<
  TOptions extends HotkeyOptions = HotkeyChordOptions | HotkeySequenceOptions,
> {
  /**
   * The callback function. Can be set directly to update without re-registering.
   * This avoids stale closures when the callback references React state.
   */
  callback: HotkeyCallback
  /** Unique identifier for this registration */
  readonly id: string
  /** Check if this registration is still active (not unregistered) */
  readonly isActive: boolean
  /**
   * Update options (merged with existing options).
   * Useful for updating `enabled`, `preventDefault`, etc. without re-registering.
   * Changing `capture` moves the listener phase without clearing `requireReset`
   * state or sequence progress. A registration already processed for an event
   * cannot process it again in another phase.
   */
  setOptions: (options: Partial<TOptions>) => void
  /** Unregister this hotkey */
  unregister: () => void
}

let registrationIdCounter = 0

/** The string a chord registers as: strings as written, objects formatted from their parsed form. */
function chordString(
  chord: RegisterableHotkeyChord,
  parsed: ParsedHotkeyChord,
): HotkeyChord {
  return (
    typeof chord === 'string' ? chord : formatHotkey(parsed)
  ) as HotkeyChord
}

/**
 * Generates a unique ID for hotkey registrations.
 */
function generateId(): string {
  return `hotkey_${++registrationIdCounter}`
}

/** A handle for a registration that listens for nothing. */
function inactiveHandle(callback: HotkeyCallback): HotkeyRegistrationHandle {
  let currentCallback = callback
  return {
    id: generateId(),
    unregister: () => {},
    get callback() {
      return currentCallback
    },
    set callback(newCallback: HotkeyCallback) {
      currentCallback = newCallback
    },
    setOptions: () => {},
    get isActive() {
      return false
    },
  }
}

/** Defaults for a registration of the given kind. */
function registrationDefaults(
  kind: HotkeyRegistration['kind'],
): Partial<HotkeyChordOptions & HotkeySequenceOptions> {
  return {
    ...defaultHotkeyOptions,
    ...(kind === 'sequence'
      ? { timeout: DEFAULT_SEQUENCE_TIMEOUT }
      : { requireReset: false }),
  }
}

/** Drops options that do not apply to a registration's kind. */
function optionsForKind(
  kind: HotkeyRegistration['kind'],
  options: Partial<HotkeyChordOptions & HotkeySequenceOptions>,
): Partial<HotkeyChordOptions & HotkeySequenceOptions> {
  if (kind === 'chord') {
    const { timeout: _timeout, ...rest } = options
    return rest
  }
  const { requireReset: _requireReset, ...rest } = options
  return rest
}

/** A node a registration's listener can attach to. */
type ListenerTarget = Target | ShadowRoot

/**
 * Where a registration listens: its target, or for an element target that
 * runs after delegated handlers in the bubble phase, the node where handlers
 * delegated around it have already run. That is its document, unless the
 * element is in a closed shadow root, which hides it from listeners outside,
 * or in a tree outside any document, which events never leave.
 */
function listenerTarget({
  target,
  options,
}: Pick<HotkeyRegistration, 'target' | 'options'>): ListenerTarget {
  if (
    !options.afterDelegatedHandlers ||
    options.capture ||
    isDocumentLevel(target)
  ) {
    return target
  }
  let root = target.getRootNode() as ListenerTarget
  while ('host' in root && root.mode === 'open') {
    root = root.host.getRootNode() as ListenerTarget
  }
  return root
}

/** Whether a registration's shared listener moves after listeners added before it joins. */
function movesAfterDelegatedHandlers(options: HotkeyOptions): boolean {
  return !!options.afterDelegatedHandlers && !options.capture
}

/** Steps with Mod already resolved for the registration's platform. */
function resolvedSteps(
  registration: HotkeyRegistration,
): ReadonlyArray<ParsedHotkeyChord> {
  return registration.kind === 'chord'
    ? [registration.parsedChord]
    : registration.parsedSequence
}

/** Whether a registration skips keys that focused controls use, resolving `'auto'`. */
function ignoresInputs(registration: HotkeyRegistration): boolean {
  const { ignoreInputs = 'auto' } = registration.options
  return ignoreInputs === 'auto'
    ? getDefaultIgnoreInputs(resolvedSteps(registration)[0]!)
    : ignoreInputs
}

function sameResolvedSteps(
  left: ReadonlyArray<ParsedHotkeyChord>,
  right: ReadonlyArray<ParsedHotkeyChord>,
): boolean {
  return (
    left.length === right.length &&
    left.every((step, index) => parsedChordsEqual(step, right[index]!))
  )
}

function formatForMessage(hotkey: Hotkey): string {
  return isHotkeySequence(hotkey) ? hotkey.join(' ') : hotkey
}

/** Active hotkey scopes, published on `HotkeyManager.scopes`. */
export interface HotkeyScopesState {
  /**
   * Activated scopes, lowest precedence first. `'global'` is always active
   * and not listed.
   */
  active: ReadonlyArray<string>
  /** The exclusive scope that owns the keyboard, or `null` when none is active. */
  exclusive: string | null
  /**
   * Scopes the exclusive scope allows that are active, possibly including
   * `'global'`. Empty when no scope is exclusive.
   */
  allowed: ReadonlyArray<string>
  /**
   * Scopes that are active but cannot fire because another scope is
   * exclusive, possibly including `'global'`.
   */
  suspended: ReadonlyArray<string>
}

/** Options for `HotkeyManager.activateScope`. */
export interface ActivateHotkeyScopeOptions {
  /**
   * Suspend every other scope, including `'global'`, until this activation is
   * released. Scopes nested in this one stay active. Pass `{ allow }` to keep
   * other scopes active too, such as `{ allow: ['global'] }`. An allowed scope
   * still has to be activated, except `'global'`.
   */
  exclusive?: boolean | { allow: ReadonlyArray<string> }
  /**
   * The scope this one is nested in. A nested scope takes precedence over its
   * ancestors even when it was activated first, as nested providers are when
   * their effects run child-first. Defaults to `'global'`.
   */
  parent?: string
}

interface ScopeActivation {
  scope: string
  parent: string
  /** Scopes allowed while exclusive, or `null` when not exclusive. */
  allow: ReadonlyArray<string> | null
  order: number
}

/**
 * Singleton manager for hotkey registrations, including sequences.
 *
 * This class provides a centralized way to register and manage keyboard
 * hotkeys. It shares one keydown and one keyup listener per target and
 * capture phase across registrations.
 *
 * Sequences (Vim-style hotkeys such as `['G', 'G']`) match when every step is
 * pressed within the timeout. Modifier-only events (Shift, Control, Alt, or
 * Meta alone) neither advance nor reset a sequence, so chained modifier chords
 * such as `['Shift+R', 'Shift+T']` work.
 *
 * @example
 * ```ts
 * const manager = HotkeyManager.getInstance()
 *
 * const save = manager.register('Mod+S', (event, context) => {
 *   console.log('Save triggered!')
 * })
 * const top = manager.register(['G', 'G'], () => scrollToTop(), { timeout: 500 })
 *
 * // Later, to unregister:
 * save.unregister()
 * top.unregister()
 * ```
 */
export class HotkeyManager {
  /**
   * The TanStack Store containing all hotkey registrations, chords and sequences.
   * Use this to subscribe to registration changes or access current registrations.
   *
   * @example
   * ```ts
   * const manager = HotkeyManager.getInstance()
   *
   * // Subscribe to registration changes
   * const unsubscribe = manager.registrations.subscribe(() => {
   *   console.log('Registrations changed:', manager.registrations.state.size)
   * })
   *
   * // Access current registrations
   * for (const [id, reg] of manager.registrations.state) {
   *   console.log(reg.hotkey, reg.options.enabled)
   * }
   * ```
   */
  readonly registrations: Store<Map<string, HotkeyRegistration>> = createStore(
    new Map(),
  )
  /**
   * The app hotkeys store published by a framework provider, so tools such as
   * devtools can list declared hotkeys that are not registered.
   */
  readonly appHotkeys: Store<AppHotkeysStore | null> =
    createStore<AppHotkeysStore | null>(null)
  /** Active scopes. Subscribe to show which hotkeys are suspended. */
  readonly scopes: Store<HotkeyScopesState> = createStore<HotkeyScopesState>({
    active: [],
    exclusive: null,
    allowed: [],
    suspended: [],
  })
  #platform: 'mac' | 'windows' | 'linux'
  #scopeActivations = new Set<ScopeActivation>()
  #scopeActivationCount = 0
  /** Active scopes, lowest precedence first, derived from activations. */
  #scopeOrder: Array<string> = []
  /** Scopes that can fire while a scope is exclusive, or `null` when none is. */
  #liveScopes: Set<string> | null = null
  #listeners = new TargetListeners((...args) =>
    this.#processTargetEvent(...args),
  )
  /** Where each registration listens, kept so cleanup finds a target that moved documents. */
  #listenerTargets = new Map<string, ListenerTarget>()
  /** Events that continue a sequence in progress, decided before any listener runs. */
  #sequenceOwned = new WeakMap<KeyboardEvent, boolean>()
  /**
   * Keyup chords whose keydown matched. Releasing one of the chord's
   * modifiers fires them, because the key's own keyup may come after the
   * modifier's or, on macOS while Command is held, not at all. `null` marks a
   * press that another key cancelled or that `ignoreDefaultPrevented`
   * skipped, so its release doesn't fire.
   */
  #pendingReleases = new Map<string, KeyboardEventMatch | null>()
  /** Events this manager prevented, so its own prevention never skips a hotkey. */
  #prevented = new WeakSet<KeyboardEvent>()
  /** Physical keys whose keydown a sequence owned, so their repeats and keyup are owned too. */
  #sequenceOwnedKeys = new Set<string>()
  /** Timers that clear a sequence's progress once its timeout passes. */
  #sequenceResetTimers = new Map<string, ReturnType<typeof setTimeout>>()

  private constructor() {
    this.#platform = detectPlatform()
  }

  /**
   * Gets the singleton instance of HotkeyManager.
   */
  static getInstance(): HotkeyManager {
    return (managerRef.current ??= new HotkeyManager())
  }

  /**
   * Resets the singleton instance. Useful for testing.
   */
  static resetInstance(): void {
    managerRef.current?.destroy()
    managerRef.current = null
  }

  /**
   * Activates a scope until the returned function is called. Activations are
   * counted, so a scope stays active until every activation is released.
   * Framework providers call this while mounted.
   *
   * When active scopes share a hotkey, a nested scope takes precedence over
   * its ancestors, and otherwise the most recently activated scope wins. The
   * same order picks the exclusive scope when several are active, and only
   * that scope's `allow` list applies.
   *
   * @example
   * ```ts
   * const release = manager.activateScope('dialog', { exclusive: true })
   * // Only hotkeys with scope 'dialog', or scopes nested in it, fire now.
   * release()
   *
   * manager.activateScope('dialog', { exclusive: { allow: ['global'] } })
   * // Hotkeys with scope 'global' fire too.
   * ```
   */
  activateScope(
    scope: string,
    options: ActivateHotkeyScopeOptions = {},
  ): () => void {
    if (scope === GLOBAL_SCOPE) return () => {}
    const { exclusive } = options
    const allow = exclusive ? (exclusive === true ? [] : exclusive.allow) : null
    if (
      process.env.NODE_ENV !== 'production' &&
      allow &&
      [...this.#scopeActivations].some(
        (other) => other.allow && other.scope === scope,
      )
    ) {
      console.warn(
        `Exclusive hotkey scope '${scope}' is already active. Hotkeys from both activations will fire; give each a unique scope.`,
      )
    }
    const activation: ScopeActivation = {
      scope,
      parent: options.parent ?? GLOBAL_SCOPE,
      allow,
      order: ++this.#scopeActivationCount,
    }
    this.#scopeActivations.add(activation)
    this.#updateScopes()
    return () => {
      if (this.#scopeActivations.delete(activation)) this.#updateScopes()
    }
  }

  /**
   * Whether hotkeys in a scope can fire: the scope is `'global'` or
   * activated, and either no scope is exclusive or this scope is the
   * exclusive one, nested in it, or allowed by it.
   */
  isScopeActive(scope: string = GLOBAL_SCOPE): boolean {
    if (this.#liveScopes) return this.#liveScopes.has(scope)
    return scope === GLOBAL_SCOPE || this.#scopeOrder.includes(scope)
  }

  /** Higher for scopes with higher precedence; `'global'` is 0. */
  #scopeRank(scope: string = GLOBAL_SCOPE): number {
    return this.#scopeOrder.indexOf(scope) + 1
  }

  /** Recomputes scope precedence and publishes it. */
  #updateScopes(): void {
    const parents = new Map<string, string>()
    const latest = new Map<string, number>()
    for (const activation of this.#scopeActivations) {
      // A provider nested in one with the same scope keeps the outer parent.
      if (activation.parent !== activation.scope) {
        parents.set(activation.scope, activation.parent)
      }
      latest.set(
        activation.scope,
        Math.max(latest.get(activation.scope) ?? 0, activation.order),
      )
    }
    const depth = (scope: string): number => {
      let result = 0
      const seen = new Set<string>()
      for (
        let current = parents.get(scope);
        current !== undefined && !seen.has(current);
        current = parents.get(current)
      ) {
        seen.add(current)
        result++
      }
      return result
    }
    // A scope counts as no newer than its descendants, so a nested scope
    // outranks its ancestors even when its effect ran first. Scopes in
    // separate branches keep their activation order.
    const since = new Map<string, number>()
    for (const [scope, order] of latest) {
      const seen = new Set<string>()
      for (
        let current: string | undefined = scope;
        current !== undefined && !seen.has(current);
        current = parents.get(current)
      ) {
        seen.add(current)
        const own = latest.get(current)
        if (own !== undefined) {
          since.set(current, Math.min(since.get(current) ?? own, order))
        }
      }
    }
    const compare = (a: string, b: string) =>
      since.get(a)! - since.get(b)! ||
      depth(a) - depth(b) ||
      latest.get(a)! - latest.get(b)!
    this.#scopeOrder = [...latest.keys()].sort(compare)
    const exclusive = [...this.#scopeActivations]
      .filter((activation) => activation.allow)
      .sort((a, b) => compare(a.scope, b.scope) || a.order - b.order)
      .pop()
    const activated = [GLOBAL_SCOPE, ...this.#scopeOrder]
    let allowed: Array<string> = []
    this.#liveScopes = null
    if (exclusive?.allow) {
      const { allow } = exclusive
      const isNested = (scope: string) => {
        const seen = new Set<string>()
        for (
          let current: string | undefined = scope;
          current !== undefined && !seen.has(current);
          current = parents.get(current)
        ) {
          if (current === exclusive.scope) return true
          seen.add(current)
        }
        return false
      }
      allowed = activated.filter(
        (scope) => !isNested(scope) && allow.includes(scope),
      )
      this.#liveScopes = new Set([...activated.filter(isNested), ...allowed])
    }
    const live = this.#liveScopes
    this.scopes.setState(() => ({
      active: this.#scopeOrder,
      exclusive: exclusive?.scope ?? null,
      allowed,
      suspended: live ? activated.filter((scope) => !live.has(scope)) : [],
    }))
    // Registration subscribers, such as cheat sheets, show suspended hotkeys.
    this.#notify()
  }

  /** Whether a registration can fire now: enabled, in an active scope. */
  #isLive(registration: HotkeyRegistration): boolean {
    return getRegistrationStatus(registration.options, this) === 'active'
  }

  /**
   * Whether a hotkey that can fire would handle this key on any listener the
   * event reaches, including other targets and phases. A sequence counts when
   * the key matches its next step or its first step.
   */
  #handledByLiveHotkey(
    event: KeyboardEvent,
    eventType: 'keydown' | 'keyup',
  ): boolean {
    // The composed path includes targets inside open shadow roots, which
    // `event.target` hides from listeners outside them.
    const path = event.composedPath()
    for (const registration of this.registrations.state.values()) {
      if (
        !this.#isLive(registration) ||
        registration.options.eventType !== eventType ||
        this.#skipsPrevented(registration, event) ||
        !path.includes(registration.target) ||
        (ignoresInputs(registration) &&
          shouldIgnoreInputEvent(event, registration.target))
      ) {
        continue
      }
      const steps =
        registration.kind === 'chord'
          ? [registration.parsedChord]
          : [
              registration.parsedSequence[registration.currentIndex]!,
              registration.parsedSequence[0]!,
            ]
      if (
        steps.some(
          (step) =>
            matchKeyboardEvent(event, step, registration.options.platform)
              .matched,
        )
      ) {
        return true
      }
    }
    return false
  }

  /** Notifies subscribers after in-place updates such as counts and sequence progress. */
  #notify(): void {
    this.registrations.setState((prev) => new Map(prev))
  }

  /**
   * Registers a hotkey handler and returns a handle for updating the registration.
   *
   * Pass a chord (`'Mod+S'` or a RawHotkeyChord object) or a sequence (`['G', 'G']`).
   * A one-step sequence registers as its chord. Chords accept `requireReset`;
   * sequences accept `timeout`.
   *
   * The returned handle allows updating the callback and options without
   * re-registering, which is useful for avoiding stale closures in React.
   *
   * @param hotkey - A chord string, RawHotkeyChord object, or sequence
   * @param callback - The function to call when the hotkey is pressed
   * @param options - Options for the hotkey behavior
   * @returns A handle for managing the registration
   *
   * @example
   * ```ts
   * const handle = manager.register('Mod+S', callback)
   *
   * // Update callback without re-registering (avoids stale closures)
   * handle.callback = newCallback
   *
   * // Update options
   * handle.setOptions({ enabled: false })
   *
   * // Unregister when done
   * handle.unregister()
   * ```
   */
  register<const T extends RegisterableHotkey>(
    hotkey: T,
    callback: HotkeyCallback<HotkeyCallbackContextFor<T>>,
    options?: HotkeyOptionsFor<T>,
  ): HotkeyRegistrationHandle<HotkeyOptionsFor<T>>
  register(
    input: RegisterableHotkey,
    callback: HotkeyCallback,
    options: HotkeyChordOptions & HotkeySequenceOptions = {},
  ): HotkeyRegistrationHandle {
    const hotkey = simplifyHotkey(input)
    // Nothing to listen for: no hotkey, an empty sequence, or no DOM during
    // server rendering. The handle stays inactive.
    if (
      (hotkey as RegisterableHotkey | null | undefined) == null ||
      (isHotkeySequence(hotkey) && hotkey.length === 0) ||
      (typeof document === 'undefined' && !options.target)
    ) {
      return inactiveHandle(callback)
    }

    const id = generateId()
    const platform = options.platform ?? this.#platform
    // Resolve target: default to document if not provided
    // Note: SSR case without explicit target is handled above
    const target = options.target ?? document

    const sequence = isHotkeySequence(hotkey)
    const kind = sequence ? 'sequence' : 'chord'
    // `undefined` means "not set", so it keeps the default.
    const resolvedOptions = {
      ...registrationDefaults(kind),
      ...optionsForKind(kind, definedOptions(options)),
      platform,
    }
    const common = {
      id,
      callback,
      options: resolvedOptions,
      target,
      triggerCount: 0,
      hasFired: false,
    }
    let registration: HotkeyRegistration
    if (sequence) {
      const parsedSequence = parseHotkey(hotkey, platform)
      registration = {
        ...common,
        kind: 'sequence',
        hotkey: hotkey.map((step, index) =>
          chordString(step, parsedSequence[index]!),
        ),
        parsedSequence,
        currentIndex: 0,
        lastKeyTime: 0,
      }
    } else {
      const parsedChord = parseHotkey(hotkey, platform)
      registration = {
        ...common,
        kind: 'chord',
        hotkey: chordString(hotkey, parsedChord),
        parsedChord,
      }
    }

    const steps =
      registration.kind === 'sequence'
        ? registration.parsedSequence
        : [registration.parsedChord]
    // An empty key would match key-less events, such as autofill's, so a
    // hotkey with an empty step registers nothing.
    if (!steps.every(chordHasKey)) return inactiveHandle(callback)

    if (process.env.NODE_ENV !== 'production') {
      for (const { key } of steps) {
        if (key !== undefined && !isKeyNameShape(key)) {
          console.warn(
            `Unknown key '${key}' in '${formatForMessage(registration.hotkey)}'. Key names are case-sensitive, such as 'Escape' and 'F1', so this hotkey may never fire.`,
          )
        }
      }
    }

    // Check for existing registrations with the same hotkey and target
    const conflicting = this.#findConflictingRegistration(registration)
    if (conflicting) {
      handleConflict(
        conflicting.id,
        formatForMessage(registration.hotkey),
        options.conflictBehavior ?? 'warn',
        (conflictId) => this.#unregister(conflictId),
      )
    }

    // Listen first, so a target that can't listen leaves no registration.
    const listenOn = listenerTarget(registration)
    this.#listeners.add(
      listenOn,
      !!registration.options.capture,
      id,
      movesAfterDelegatedHandlers(registration.options),
    )
    this.#listenerTargets.set(id, listenOn)

    this.registrations.setState((prev) => new Map(prev).set(id, registration))

    const manager = this
    return {
      get id() {
        return id
      },
      unregister: () => {
        manager.#unregister(id)
      },
      get callback() {
        return manager.registrations.state.get(id)?.callback ?? callback
      },
      set callback(newCallback: HotkeyCallback) {
        const reg = manager.registrations.state.get(id)
        if (reg) {
          reg.callback = newCallback
        }
      },
      setOptions: (newOptions) => {
        manager.registrations.setState((prev) => {
          const reg = prev.get(id)
          if (!reg) return prev
          // `undefined` resets an option to its default, or removes it when
          // it has none.
          const defaults: Record<string, unknown> = {
            ...registrationDefaults(reg.kind),
            platform: reg.options.platform,
          }
          const options: Record<string, unknown> = { ...reg.options }
          const entries: Array<[string, unknown]> = Object.entries(
            optionsForKind(reg.kind, newOptions),
          )
          for (const [key, value] of entries) {
            if (value !== undefined) options[key] = value
            else if (key in defaults) options[key] = defaults[key]
            else delete options[key]
          }
          if (optionsEqual(reg.options, options)) return prev
          const capture = !!reg.options.capture
          const from = manager.#listenerTargets.get(id) ?? reg.target
          const to = listenerTarget({ target: reg.target, options })
          if (capture !== !!options.capture || from !== to) {
            manager.#listeners.remove(from, capture, id)
            manager.#listeners.add(
              to,
              !!options.capture,
              id,
              movesAfterDelegatedHandlers(options),
            )
            manager.#listenerTargets.set(id, to)
          } else if (
            movesAfterDelegatedHandlers(options) &&
            !movesAfterDelegatedHandlers(reg.options)
          ) {
            manager.#listeners.add(to, capture, id, true)
          }
          return new Map(prev).set(id, { ...reg, options })
        })
      },
      get isActive() {
        return manager.registrations.state.has(id)
      },
    }
  }

  /**
   * Unregisters a hotkey by its registration ID.
   */
  #unregister(id: string): void {
    const registration = this.registrations.state.get(id)
    if (!registration) {
      return
    }

    // Remove registration
    this.registrations.setState((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })

    this.#listeners.remove(
      this.#listenerTargets.get(id) ?? registration.target,
      !!registration.options.capture,
      id,
    )
    this.#listenerTargets.delete(id)
    this.#pendingReleases.delete(id)
    this.#clearSequenceReset(id)
  }

  /**
   * Clears a sequence's progress, and notifies subscribers, once its timeout
   * passes without another step. Key presses check the timeout too, so this
   * only keeps views such as `matchedStepCount` current.
   */
  #scheduleSequenceReset(id: string, delay: number): void {
    this.#clearSequenceReset(id)
    this.#sequenceResetTimers.set(
      id,
      setTimeout(() => {
        this.#sequenceResetTimers.delete(id)
        const registration = this.registrations.state.get(id)
        if (
          registration?.kind !== 'sequence' ||
          registration.currentIndex === 0
        ) {
          return
        }
        const timeout = registration.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT
        const remaining = registration.lastKeyTime + timeout - Date.now()
        if (remaining >= 0) {
          this.#scheduleSequenceReset(id, remaining + 1)
          return
        }
        registration.currentIndex = 0
        registration.lastKeyTime = 0
        this.#notify()
      }, delay),
    )
  }

  #clearSequenceReset(id: string): void {
    const timer = this.#sequenceResetTimers.get(id)
    if (timer === undefined) return
    clearTimeout(timer)
    this.#sequenceResetTimers.delete(id)
  }

  /** Registrations of one kind in the listener phase, in registration order. */
  #registrationsIn<TKind extends HotkeyRegistration['kind']>(
    ids: Set<string>,
    capture: boolean,
    kind: TKind,
  ): Array<Extract<HotkeyRegistration, { kind: TKind }>> {
    const result: Array<Extract<HotkeyRegistration, { kind: TKind }>> = []
    for (const id of ids) {
      const registration = this.registrations.state.get(id)
      if (
        registration?.kind === kind &&
        !!registration.options.capture === capture
      ) {
        result.push(
          registration as Extract<HotkeyRegistration, { kind: TKind }>,
        )
      }
    }
    return result
  }

  /** The live registration, unless it was removed or moved to another phase. */
  #currentIn<T extends HotkeyRegistration>(
    registration: T,
    capture: boolean,
  ): T | undefined {
    const current = this.registrations.state.get(registration.id)
    return current && !!current.options.capture === capture
      ? (current as T)
      : undefined
  }

  /**
   * Processes keyboard events for a specific target and event type.
   * A key that continues a sequence in progress belongs to that sequence, so
   * chords skip it. Chords and first steps of sequences may both fire.
   */
  #processTargetEvent(
    event: KeyboardEvent,
    target: ListenerTarget,
    eventType: 'keydown' | 'keyup',
    capture: boolean,
    ids: Set<string>,
    first: boolean,
  ): void {
    // Decide before the first listener runs: an element's chord can run
    // before the document's sequence advances.
    if (first) {
      this.#sequenceOwned.set(event, this.#isOwnedBySequence(event, eventType))
    }
    if (capture) {
      // Capture listeners are always on the registrations' own target.
      this.#processRound(event, target as Target, eventType, capture, ids)
      return
    }
    // Element targets that run after delegated handlers listen here, usually
    // on their document. Run them as if the event reached each target: inner
    // targets first, each as its own round, then this target's own.
    const rounds = new Map<ListenerTarget, Set<string>>()
    for (const id of ids) {
      const registration = this.registrations.state.get(id)
      if (!registration) continue
      const round = rounds.get(registration.target) ?? new Set()
      rounds.set(registration.target, round.add(id))
    }
    const path =
      rounds.size > 1 || !rounds.has(target) ? event.composedPath() : []
    const order = [...rounds.keys()]
      .filter((other) => other === target || path.includes(other))
      .sort((a, b) =>
        a === target
          ? 1
          : b === target
            ? -1
            : path.indexOf(a) - path.indexOf(b),
      )
    // Registrations that run after delegated handlers skip an event that a
    // listener before them stopped. Others skip only a stop by an inner round.
    const arrivedStopped = event.cancelBubble
    for (const roundTarget of order) {
      const round = new Set<string>()
      for (const id of rounds.get(roundTarget)!) {
        const delegated =
          this.registrations.state.get(id)?.options.afterDelegatedHandlers
        if (!event.cancelBubble || (!delegated && arrivedStopped)) round.add(id)
      }
      // Rounds are keyed by registration targets.
      this.#processRound(
        event,
        roundTarget as Target,
        eventType,
        capture,
        round,
      )
    }
  }

  #processRound(
    event: KeyboardEvent,
    target: Target,
    eventType: 'keydown' | 'keyup',
    capture: boolean,
    ids: Set<string>,
  ): void {
    this.#processChords(
      event,
      target,
      eventType,
      capture,
      this.#registrationsIn(ids, capture, 'chord'),
    )
    this.#processSequences(
      event,
      target,
      eventType,
      capture,
      this.#registrationsIn(ids, capture, 'sequence'),
    )
  }

  #processChords(
    event: KeyboardEvent,
    target: Target,
    eventType: 'keydown' | 'keyup',
    capture: boolean,
    registrations: Array<HotkeyChordRegistration>,
  ): void {
    // Releases clear latches even when focus or enabled state now prevents callbacks.
    if (eventType === 'keyup') {
      for (const registration of registrations) {
        if (
          registration.hasFired &&
          this.#shouldResetRegistration(registration, event)
        ) {
          registration.hasFired = false
          registration.activeMatch = undefined
        }
      }
    }
    // A new press cancels a keyup chord's press in progress, so its release
    // doesn't fire, even when the new press continues a sequence.
    if (eventType === 'keydown' && !event.repeat) {
      for (const { id } of registrations) {
        if (this.#pendingReleases.get(id)) this.#pendingReleases.set(id, null)
      }
    }
    if (isRecordingEvent(event) || this.#sequenceOwned.get(event)) return

    const matches = new Map<string, ReturnType<typeof matchKeyboardEvent>>()
    let bestScore = 0
    // A chord that can't fire but has `preventDefault: 'always'` matched.
    let reserved = false

    const eventKey = normalizeKeyName(event.key)
    // Exact logical/explicit-code matches outrank compatibility fallbacks.
    for (const registration of registrations) {
      const live = this.#isLive(registration)
      const { eventType: firesOn, preventDefault } = registration.options
      // A keyup chord also sees its keydown, to prevent it and await the release.
      const press = eventType === 'keydown' && firesOn === 'keyup'
      const skipped = this.#skipsPrevented(registration, event)
      // A release that another listener handled ends the press too.
      if (skipped && !press) this.#pendingReleases.delete(registration.id)
      if (
        (!live && preventDefault !== 'always') ||
        (firesOn !== eventType && !press) ||
        (skipped && !press) ||
        (ignoresInputs(registration) && shouldIgnoreInputEvent(event, target))
      ) {
        continue
      }
      const { parsedChord } = registration
      let result = matchKeyboardEvent(
        event,
        parsedChord,
        registration.options.platform,
      )
      if (press) {
        if (result.matched) {
          if (skipped) {
            this.#pendingReleases.set(registration.id, null)
          } else {
            if (preventDefault) this.#prevent(event)
            if (live) this.#pendingReleases.set(registration.id, result)
          }
        }
        continue
      }
      if (
        eventType === 'keyup' &&
        live &&
        this.#pendingReleases.has(registration.id) &&
        (result.matched ||
          // The other Control or Shift key may still hold the modifier down.
          (parsedChord.modifiers.includes(eventKey as CanonicalModifier) &&
            !event.getModifierState(eventKey)))
      ) {
        const pending = this.#pendingReleases.get(registration.id)
        this.#pendingReleases.delete(registration.id)
        if (!pending) continue
        if (!result.matched) result = pending
      }
      if (!result.matched) continue
      if (!live) {
        reserved = true
        continue
      }
      matches.set(registration.id, result)
      bestScore = Math.max(bestScore, result.score)
    }

    // A hotkey that fires, on any listener, decides what happens to the event.
    if (
      reserved &&
      matches.size === 0 &&
      !this.#handledByLiveHotkey(event, eventType)
    ) {
      this.#prevent(event)
    }

    // Among the best matches, the most recently activated scope handles the key.
    let bestRank = -1
    for (const registration of registrations) {
      if (matches.get(registration.id)?.score === bestScore) {
        bestRank = Math.max(
          bestRank,
          this.#scopeRank(registration.options.scope),
        )
      }
    }

    for (const snapshot of registrations) {
      const match = matches.get(snapshot.id)
      if (
        !match?.matched ||
        match.score !== bestScore ||
        this.#scopeRank(snapshot.options.scope) !== bestRank
      ) {
        continue
      }
      // An earlier callback may have unregistered or moved this registration.
      const registration = this.#currentIn(snapshot, capture)
      if (!registration) continue

      // Always apply preventDefault/stopPropagation if the hotkey matches,
      // even when requireReset is active and has already fired
      this.#consume(registration, event)
      if (eventType === 'keyup') {
        this.#fire(registration, event)
        continue
      }

      // requireReset skips auto-repeats until release. A keydown that isn't a
      // repeat is a new press, even when the last release was never seen,
      // such as the key's keyup that macOS drops while Command is held.
      if (
        !registration.options.requireReset ||
        !registration.hasFired ||
        !event.repeat
      ) {
        // Set the latch before callbacks can update options and copy this registration.
        if (registration.options.requireReset) {
          registration.hasFired = true
          registration.activeMatch = match.identity
        }
        this.#fire(registration, event)
      }
    }
  }

  /**
   * Whether the event continues or completes a sequence in progress whose
   * target the event reaches. The repeats and keyup of a keydown that a
   * sequence owns belong to the sequence too.
   */
  #isOwnedBySequence(
    event: KeyboardEvent,
    eventType: 'keydown' | 'keyup',
  ): boolean {
    const key = event.code || normalizeKeyName(event.key)
    if (eventType === 'keyup') {
      // Evaluate both: the keyup also clears the owned key
      const ownedKeydown = this.#sequenceOwnedKeys.delete(key)
      return this.#continuesSequence(event, eventType) || ownedKeydown
    }
    if (event.repeat) return this.#sequenceOwnedKeys.has(key)

    const owned = this.#continuesSequence(event, eventType)
    if (owned) this.#sequenceOwnedKeys.add(key)
    else this.#sequenceOwnedKeys.delete(key)
    return owned
  }

  #continuesSequence(
    event: KeyboardEvent,
    eventType: 'keydown' | 'keyup',
  ): boolean {
    if (
      isRecordingEvent(event) ||
      normalizeKeyboardEvent(event).isComposing ||
      isModifierKey(normalizeKeyName(event.key))
    ) {
      return false
    }
    const path = event.composedPath()
    const now = Date.now()
    for (const registration of this.registrations.state.values()) {
      if (
        registration.kind !== 'sequence' ||
        registration.currentIndex === 0 ||
        !this.#isLive(registration) ||
        registration.options.eventType !== eventType ||
        this.#skipsPrevented(registration, event) ||
        now - registration.lastKeyTime >
          (registration.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT)
      ) {
        continue
      }
      const target = registration.target
      // A window or document target is reached through its document
      const reached = path.includes(
        isDocumentLevel(target) ? getTargetDocument(target) : target,
      )
      if (
        reached &&
        !(
          ignoresInputs(registration) && shouldIgnoreInputEvent(event, target)
        ) &&
        matchKeyboardEvent(
          event,
          registration.parsedSequence[registration.currentIndex]!,
          registration.options.platform,
        ).matched
      ) {
        return true
      }
    }
    return false
  }

  #processSequences(
    event: KeyboardEvent,
    target: Target,
    eventType: 'keydown' | 'keyup',
    capture: boolean,
    registrations: Array<HotkeySequenceRegistration>,
  ): void {
    if (registrations.length === 0) return

    if (isRecordingEvent(event)) {
      let changed = false
      for (const registration of registrations) {
        if (registration.currentIndex > 0) {
          registration.currentIndex = 0
          this.#clearSequenceReset(registration.id)
          changed = true
        }
      }
      if (changed) this.#notify()
      return
    }
    if (
      (event.type === 'keydown' && event.repeat) ||
      normalizeKeyboardEvent(event).isComposing
    ) {
      return
    }
    // Skip modifier-only events so pressing e.g. Shift before Shift+C does not reset the sequence.
    if (isModifierKey(normalizeKeyName(event.key))) {
      return
    }

    const now = Date.now()
    let changed = false
    // Score eligible next steps (or restarts) before advancing any sequence.
    const candidates = new Map<string, { score: number; nextIndex: number }>()
    let bestScore = 0

    for (const registration of registrations) {
      if (
        !this.#isLive(registration) ||
        (ignoresInputs(registration) &&
          shouldIgnoreInputEvent(event, target)) ||
        registration.options.eventType !== eventType ||
        this.#skipsPrevented(registration, event)
      ) {
        continue
      }

      const timeout = registration.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT

      // Check if sequence has timed out
      if (
        registration.currentIndex > 0 &&
        now - registration.lastKeyTime > timeout
      ) {
        registration.currentIndex = 0
        changed = true
      }

      const expected = registration.parsedSequence[registration.currentIndex]
      if (!expected) {
        continue
      }

      let match = matchKeyboardEvent(
        event,
        expected,
        registration.options.platform,
      )
      let nextIndex = registration.currentIndex + 1
      if (!match.matched && registration.currentIndex > 0) {
        match = matchKeyboardEvent(
          event,
          registration.parsedSequence[0]!,
          registration.options.platform,
        )
        nextIndex = 1
      }
      candidates.set(registration.id, { score: match.score, nextIndex })
      bestScore = Math.max(bestScore, match.score)
    }

    const completed: Array<HotkeySequenceRegistration> = []
    for (const registration of registrations) {
      const candidate = candidates.get(registration.id)
      if (!candidate) continue
      if (candidate.score > 0 && candidate.score === bestScore) {
        registration.lastKeyTime = now
        registration.currentIndex = candidate.nextIndex
        changed = true

        if (registration.currentIndex >= registration.parsedSequence.length) {
          this.#consume(registration, event)
          registration.currentIndex = 0
          completed.push(registration)
        } else if (registration.options.preventDefault) {
          // Earlier steps keep the browser's action too, such as Ctrl+K in
          // Ctrl+K then Ctrl+C. Propagation stops only on the last step.
          this.#prevent(event)
        }
      } else if (registration.currentIndex > 0) {
        // A mismatched or weaker candidate cannot carry stale progress forward.
        registration.currentIndex = 0
        changed = true
      }
    }

    for (const registration of registrations) {
      if (!candidates.has(registration.id)) continue
      if (registration.currentIndex > 0) {
        const timeout = registration.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT
        this.#scheduleSequenceReset(registration.id, timeout + 1)
      } else {
        this.#clearSequenceReset(registration.id)
      }
    }

    if (changed && completed.length === 0) this.#notify()
    for (const snapshot of completed) {
      // An earlier callback may have unregistered or moved this registration.
      const registration = this.#currentIn(snapshot, capture)
      if (registration) this.#fire(registration, event)
    }
  }

  #prevent(event: KeyboardEvent): void {
    // An event another listener prevented first stays theirs.
    if (!event.defaultPrevented) this.#prevented.add(event)
    event.preventDefault()
  }

  /** Whether another listener prevented the event, and the registration skips such events. */
  #skipsPrevented(
    registration: HotkeyRegistration,
    event: KeyboardEvent,
  ): boolean {
    return (
      !!registration.options.ignoreDefaultPrevented &&
      event.defaultPrevented &&
      !this.#prevented.has(event)
    )
  }

  /** Applies a matched registration's preventDefault and stopPropagation options. */
  #consume(registration: HotkeyRegistration, event: KeyboardEvent): void {
    if (registration.options.preventDefault) {
      this.#prevent(event)
    }
    if (registration.options.stopPropagation) {
      event.stopPropagation()
    }
  }

  /** Counts a trigger, notifies subscribers (such as devtools), and runs the callback. */
  #fire(
    registration: HotkeyRegistration,
    event: KeyboardEvent,
    context = this.#callbackContext(registration),
  ): void {
    registration.triggerCount++
    if (registration.kind === 'sequence') registration.hasFired = true

    // A new Map keeps the same registration reference to preserve identity
    // for mutation-based fields like hasFired.
    this.#notify()

    const prevented: boolean = event.defaultPrevented
    registration.callback(event, context)
    // A callback's own preventDefault counts as the hotkey's.
    if (!prevented && event.defaultPrevented) this.#prevented.add(event)
  }

  #callbackContext(registration: HotkeyRegistration): HotkeyCallbackContext {
    return registration.kind === 'chord'
      ? {
          kind: 'chord',
          hotkey: registration.hotkey,
          parsedChord: registration.parsedChord,
        }
      : {
          kind: 'sequence',
          hotkey: registration.hotkey,
          parsedSequence: registration.parsedSequence,
        }
  }

  /**
   * Finds an existing registration on the same target, scope, and event type whose steps
   * resolve to the same identity. Each side keeps its own platform, so `Mod+S` on macOS
   * and `Mod+S` on Windows are different bindings.
   */
  #findConflictingRegistration(
    candidate: HotkeyRegistration,
  ): HotkeyRegistration | null {
    const steps = resolvedSteps(candidate)
    for (const registration of this.registrations.state.values()) {
      if (
        registration.target === candidate.target &&
        registration.options.scope === candidate.options.scope &&
        registration.options.eventType === candidate.options.eventType &&
        sameResolvedSteps(resolvedSteps(registration), steps)
      ) {
        return registration
      }
    }
    return null
  }

  /**
   * Determines if a registration should be reset based on the keyup event.
   */
  #shouldResetRegistration(
    registration: HotkeyChordRegistration,
    event: KeyboardEvent,
  ): boolean {
    const parsed = registration.parsedChord
    const releasedKey = normalizeKeyName(event.key)

    if (
      registration.activeMatch?.code &&
      event.code === registration.activeMatch.code
    ) {
      return true
    }

    // Compare the release against the identity this binding actually stores,
    // then reset if any required modifier is released.
    return (
      (parsed.code !== undefined
        ? event.code === parsed.code
        : keysEqual(releasedKey, parsed.key)) ||
      parsed.modifiers.includes(releasedKey as CanonicalModifier)
    )
  }

  /**
   * Resets the progress of every in-progress sequence.
   */
  resetSequenceProgress(): void {
    for (const registration of this.registrations.state.values()) {
      if (registration.kind === 'sequence') {
        registration.currentIndex = 0
        registration.lastKeyTime = 0
      }
    }
    for (const timer of this.#sequenceResetTimers.values()) clearTimeout(timer)
    this.#sequenceResetTimers.clear()
    this.#notify()
  }

  /**
   * Gets the number of registered hotkeys, chords and sequences.
   */
  getRegistrationCount(): number {
    return this.registrations.state.size
  }

  /**
   * Checks if a specific hotkey is registered.
   *
   * @param hotkey - The chord or sequence to check
   * @param target - Optional target element to match (if provided, both hotkey and target must match)
   * @returns True if a matching registration exists
   */
  isRegistered(hotkey: RegisterableHotkey, target?: Target): boolean {
    for (const registration of this.registrations.state.values()) {
      if (
        areHotkeysEqual(
          registration.hotkey,
          hotkey,
          registration.options.platform,
        ) &&
        (target === undefined || registration.target === target)
      ) {
        return true
      }
    }
    return false
  }

  /**
   * Checks whether a hotkey can fire now: at least one registration is
   * enabled, in an active scope, and listening where key presses go. A
   * registration on `document` or `window` always is; one on an element is
   * only while focus is inside that element. An app hotkey matches
   * registrations by id, so custom hotkeys apply.
   *
   * @param hotkey - A chord, sequence, or app hotkey. No hotkey
   *   (`undefined`, `null`, or `''`) returns false.
   * @returns True if a registration that can fire exists
   */
  hasActiveRegistration(
    hotkey: RegisterableHotkey | AppHotkey | null | undefined,
  ): boolean {
    if (!hotkey) return false
    // Checks the brand inline; importing `isAppHotkey` would bundle the app hotkeys store.
    const id =
      typeof hotkey === 'object' && '~appHotkey' in hotkey
        ? hotkey.id
        : undefined
    for (const registration of this.registrations.state.values()) {
      if (
        this.#isLive(registration) &&
        targetHasFocus(registration.target) &&
        (id === undefined
          ? areHotkeysEqual(
              registration.hotkey,
              hotkey as RegisterableHotkey,
              registration.options.platform,
            )
          : registration.options.appHotkeyId === id)
      ) {
        return true
      }
    }
    return false
  }

  /**
   * Destroys the manager and removes all listeners.
   */
  destroy(): void {
    for (const timer of this.#sequenceResetTimers.values()) clearTimeout(timer)
    this.#sequenceResetTimers.clear()
    this.#listeners.destroy()
    this.#listenerTargets.clear()
    this.registrations.setState(() => new Map())
    this.appHotkeys.setState(() => null)
  }
}

/**
 * Gets the singleton HotkeyManager instance.
 * Convenience function for accessing the manager.
 */
export function getHotkeyManager(): HotkeyManager {
  return HotkeyManager.getInstance()
}
