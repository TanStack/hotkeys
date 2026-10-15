import { Store } from '@tanstack/store'
import { TargetListeners } from './_target-listeners'
import { isRecordingEvent } from './_recording-guard'
import { DEFAULT_SEQUENCE_TIMEOUT, areHotkeysEqual } from './match'
import { detectPlatform } from './platform'
import { normalizeKeyName } from './constants'
import { formatHotkey } from './format'
import {
  isHotkeySequence,
  isModifierKey,
  parseHotkey,
  rawHotkeyToParsedHotkey,
  simplifyHotkey,
} from './parse'
import { matchKeyboardEvent } from './_match'
import { normalizeKeyboardEvent } from './_keyboard-event'
import {
  defaultHotkeyOptions,
  getDefaultIgnoreInputs,
  handleConflict,
  optionsEqual,
} from './_registration'
import { isEventForTarget, shouldIgnoreInputEvent } from './_event-target'
import type { AppHotkeysStore } from './app-hotkeys'
import type {
  ConflictBehavior,
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  HotkeyChord,
  HotkeyMeta,
  HotkeySequence,
  ParsedHotkey,
  RegisterableHotkey,
  RegisterableHotkeyChord,
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
  /** The event type to listen for. Defaults to 'keydown' */
  eventType?: 'keydown' | 'keyup'
  /** Whether to ignore hotkeys when keyboard events originate from input-like elements (text inputs, textarea, select, contenteditable — button-type inputs like type=button/submit/reset are not ignored). Defaults based on the hotkey (the first step of a sequence): true for single keys and Shift/Alt combos; false for Ctrl/Meta shortcuts and Escape */
  ignoreInputs?: boolean
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
  /** Prevent the default browser action when the hotkey matches. Defaults to true */
  preventDefault?: boolean
  /** Stop event propagation when the hotkey matches. Defaults to true */
  stopPropagation?: boolean
  /** The DOM element to attach the event listener to. Defaults to document. */
  target?: Target | null
  /** Optional metadata (name, description, custom fields via declaration merging) */
  meta?: HotkeyMeta
  /** Id of the app hotkey this registration implements. Adapters set this when registering an app hotkey from `defineAppHotkeys`. */
  appHotkeyId?: string
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
    : T extends HotkeySequence
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
  parsedHotkey: ParsedHotkey
  /** The concrete key/code that activated a requireReset registration. */
  activeMatch?: { key: string; code: string }
}

/** A registered sequence in the HotkeyManager. */
export interface HotkeySequenceRegistration extends RegistrationBase<HotkeySequenceOptions> {
  kind: 'sequence'
  hotkey: HotkeySequence
  parsedSequence: Array<ParsedHotkey>
  /** Steps matched in the current attempt */
  currentIndex: number
  /** `Date.now()` when the last step in the current attempt matched */
  lastKeyTime: number
}

/** A registered hotkey in the HotkeyManager. */
export type HotkeyRegistration =
  HotkeyChordRegistration | HotkeySequenceRegistration

interface RegistrationViewBase {
  id: string
  target: Target
  triggerCount: number
  hasFired: boolean
}

/** Public view of a chord registration, without its callback. */
export interface HotkeyChordRegistrationView extends RegistrationViewBase {
  kind: 'chord'
  hotkey: HotkeyChord
  parsedHotkey: ParsedHotkey
  options: HotkeyChordOptions
}

/** Public view of a sequence registration, without its callback. */
export interface HotkeySequenceRegistrationView extends RegistrationViewBase {
  kind: 'sequence'
  hotkey: HotkeySequence
  parsedSequence: Array<ParsedHotkey>
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

/** Creates a public view from an internal registration, stripping the callback. */
export function toHotkeyRegistrationView(
  reg: HotkeyRegistration,
): HotkeyRegistrationView {
  const base = {
    id: reg.id,
    target: reg.target,
    triggerCount: reg.triggerCount,
    hasFired: reg.hasFired,
  }
  if (reg.kind === 'chord') {
    return {
      ...base,
      kind: 'chord',
      hotkey: reg.hotkey,
      parsedHotkey: reg.parsedHotkey,
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

/**
 * Generates a unique ID for hotkey registrations.
 */
function generateId(): string {
  return `hotkey_${++registrationIdCounter}`
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

/** Steps with Mod already resolved for the registration's platform. */
function resolvedSteps(
  registration: HotkeyRegistration,
): ReadonlyArray<ParsedHotkey> {
  return registration.kind === 'chord'
    ? [registration.parsedHotkey]
    : registration.parsedSequence
}

function sameResolvedSteps(
  left: ReadonlyArray<ParsedHotkey>,
  right: ReadonlyArray<ParsedHotkey>,
): boolean {
  return (
    left.length === right.length &&
    left.every((step, index) => areHotkeysEqual(step, right[index]!))
  )
}

function formatForMessage(hotkey: Hotkey): string {
  return isHotkeySequence(hotkey) ? hotkey.join(' ') : hotkey
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
  static #instance: HotkeyManager | null = null

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
  readonly registrations: Store<Map<string, HotkeyRegistration>> = new Store(
    new Map(),
  )
  /**
   * The app hotkeys store published by a framework provider, so tools such as
   * devtools can list declared hotkeys that are not registered.
   */
  readonly appHotkeys: Store<AppHotkeysStore | null> =
    new Store<AppHotkeysStore | null>(null)
  #platform: 'mac' | 'windows' | 'linux'
  #listeners = new TargetListeners((...args) =>
    this.#processTargetEvent(...args),
  )

  private constructor() {
    this.#platform = detectPlatform()
  }

  /**
   * Gets the singleton instance of HotkeyManager.
   */
  static getInstance(): HotkeyManager {
    if (!HotkeyManager.#instance) {
      HotkeyManager.#instance = new HotkeyManager()
    }
    return HotkeyManager.#instance
  }

  /**
   * Resets the singleton instance. Useful for testing.
   */
  static resetInstance(): void {
    if (HotkeyManager.#instance) {
      HotkeyManager.#instance.destroy()
      HotkeyManager.#instance = null
    }
  }

  /** Notifies subscribers after in-place updates such as counts and sequence progress. */
  #notify(): void {
    this.registrations.setState((prev) => new Map(prev))
  }

  /**
   * Registers a hotkey handler and returns a handle for updating the registration.
   *
   * Pass a chord (`'Mod+S'` or a RawHotkey object) or a sequence (`['G', 'G']`).
   * A one-step sequence registers as its chord. Chords accept `requireReset`;
   * sequences accept `timeout`.
   *
   * The returned handle allows updating the callback and options without
   * re-registering, which is useful for avoiding stale closures in React.
   *
   * @param hotkey - A chord string, RawHotkey object, or sequence
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
  register<T extends RegisterableHotkey>(
    hotkey: T,
    callback: HotkeyCallback,
    options?: HotkeyOptionsFor<T>,
  ): HotkeyRegistrationHandle<HotkeyOptionsFor<T>>
  register(
    input: RegisterableHotkey,
    callback: HotkeyCallback,
    options: HotkeyChordOptions & HotkeySequenceOptions = {},
  ): HotkeyRegistrationHandle {
    const hotkey = simplifyHotkey(input)
    if (isHotkeySequence(hotkey) && hotkey.length === 0) {
      throw new Error('Sequence must contain at least one hotkey')
    }

    // In SSR environments, return a no-op handle since there's no DOM to attach listeners to
    if (typeof document === 'undefined' && !options.target) {
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

    const id = generateId()
    const platform = options.platform ?? this.#platform
    // Resolve target: default to document if not provided
    // Note: SSR case without explicit target is handled above
    const target = options.target ?? document

    let registration: HotkeyRegistration
    if (isHotkeySequence(hotkey)) {
      const parsedSequence = hotkey.map((step) => parseHotkey(step, platform))
      registration = {
        kind: 'sequence',
        id,
        hotkey,
        parsedSequence,
        callback,
        options: {
          ...defaultHotkeyOptions,
          timeout: DEFAULT_SEQUENCE_TIMEOUT,
          ...optionsForKind('sequence', options),
          platform,
          ignoreInputs:
            options.ignoreInputs ?? getDefaultIgnoreInputs(parsedSequence[0]!),
        },
        target,
        currentIndex: 0,
        lastKeyTime: 0,
        triggerCount: 0,
        hasFired: false,
      }
    } else {
      const parsedHotkey =
        typeof hotkey === 'string'
          ? parseHotkey(hotkey, platform)
          : rawHotkeyToParsedHotkey(hotkey, platform)
      registration = {
        kind: 'chord',
        id,
        hotkey: (typeof hotkey === 'string'
          ? hotkey
          : formatHotkey(parsedHotkey)) as HotkeyChord,
        parsedHotkey,
        callback,
        options: {
          ...defaultHotkeyOptions,
          requireReset: false,
          ...optionsForKind('chord', options),
          platform,
          ignoreInputs:
            options.ignoreInputs ?? getDefaultIgnoreInputs(parsedHotkey),
        },
        target,
        hasFired: false,
        triggerCount: 0,
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

    this.registrations.setState((prev) => new Map(prev).set(id, registration))

    this.#listeners.add(target, !!registration.options.capture, id)

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
          const options = {
            ...reg.options,
            ...optionsForKind(reg.kind, newOptions),
          }
          if (optionsEqual(reg.options, options)) return prev
          const capture = !!reg.options.capture
          if (capture !== !!options.capture) {
            manager.#listeners.remove(reg.target, capture, id)
            manager.#listeners.add(reg.target, !!options.capture, id)
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

    const target = registration.target

    // Remove registration
    this.registrations.setState((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })

    this.#listeners.remove(target, !!registration.options.capture, id)
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
   * Chords and sequences match independently; both may fire for one event.
   */
  #processTargetEvent(
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
    if (isRecordingEvent(event)) return

    const matches = new Map<string, ReturnType<typeof matchKeyboardEvent>>()
    let bestScore = 0

    // Exact logical/explicit-code matches outrank compatibility fallbacks.
    for (const registration of registrations) {
      if (
        !registration.options.enabled ||
        registration.options.eventType !== eventType ||
        !isEventForTarget(event, target) ||
        (registration.options.ignoreInputs !== false &&
          shouldIgnoreInputEvent(event, target, registration.target))
      ) {
        continue
      }
      const result = matchKeyboardEvent(
        event,
        registration.parsedHotkey,
        registration.options.platform,
      )
      if (result.matched) {
        matches.set(registration.id, result)
        bestScore = Math.max(bestScore, result.score)
      }
    }

    for (const snapshot of registrations) {
      const match = matches.get(snapshot.id)
      if (!match?.matched || match.score !== bestScore) {
        continue
      }
      // An earlier callback may have unregistered or moved this registration.
      const registration = this.#currentIn(snapshot, capture)
      if (!registration) continue

      if (eventType === 'keyup') {
        this.#executeCallback(registration, event)
        continue
      }

      // Always apply preventDefault/stopPropagation if the hotkey matches,
      // even when requireReset is active and has already fired
      if (registration.options.preventDefault) {
        event.preventDefault()
      }
      if (registration.options.stopPropagation) {
        event.stopPropagation()
      }

      // Only execute callback if requireReset is not active or hasn't fired yet
      if (!registration.options.requireReset || !registration.hasFired) {
        // Set the latch before callbacks can update options and copy this registration.
        if (registration.options.requireReset) {
          registration.hasFired = true
          registration.activeMatch = match.identity
        }
        this.#executeCallback(registration, event)
      }
    }
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
        !isEventForTarget(event, target) ||
        !registration.options.enabled ||
        (registration.options.ignoreInputs !== false &&
          shouldIgnoreInputEvent(event, target, registration.target)) ||
        registration.options.eventType !== eventType
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
          if (registration.options.preventDefault) {
            event.preventDefault()
          }
          if (registration.options.stopPropagation) {
            event.stopPropagation()
          }
          registration.currentIndex = 0
          completed.push(registration)
        }
      } else if (registration.currentIndex > 0) {
        // A mismatched or weaker candidate cannot carry stale progress forward.
        registration.currentIndex = 0
        changed = true
      }
    }

    if (changed && completed.length === 0) this.#notify()
    for (const snapshot of completed) {
      // An earlier callback may have unregistered or moved this registration.
      const registration = this.#currentIn(snapshot, capture)
      if (registration) this.#executeCallback(registration, event)
    }
  }

  /**
   * Executes a hotkey callback with proper event handling.
   */
  #executeCallback(
    registration: HotkeyRegistration,
    event: KeyboardEvent,
  ): void {
    if (registration.options.preventDefault) {
      event.preventDefault()
    }
    if (registration.options.stopPropagation) {
      event.stopPropagation()
    }

    registration.triggerCount++
    if (registration.kind === 'sequence') registration.hasFired = true

    // Notify the store so subscribers (e.g. devtools) see the updated count.
    // We create a new Map but keep the same registration reference to preserve
    // identity for mutation-based fields like hasFired.
    this.#notify()

    registration.callback(event, this.#callbackContext(registration))
  }

  #callbackContext(registration: HotkeyRegistration): HotkeyCallbackContext {
    return {
      hotkey: registration.hotkey,
      parsedHotkey:
        registration.kind === 'chord'
          ? registration.parsedHotkey
          : registration.parsedSequence[
              registration.parsedSequence.length - 1
            ]!,
    }
  }

  /**
   * Finds an existing registration on the same target whose steps resolve to
   * the same identity. Each side keeps its own platform, so `Mod+S` on macOS
   * and `Mod+S` on Windows are different bindings.
   */
  #findConflictingRegistration(
    candidate: HotkeyRegistration,
  ): HotkeyRegistration | null {
    const steps = resolvedSteps(candidate)
    for (const registration of this.registrations.state.values()) {
      if (
        registration.target === candidate.target &&
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
    const parsed = registration.parsedHotkey
    const releasedKey = normalizeKeyName(event.key)

    if (
      registration.activeMatch?.code &&
      event.code === registration.activeMatch.code
    ) {
      return true
    }

    // Compare the release against the identity this binding actually stores.
    if (parsed.code !== undefined) {
      if (event.code === parsed.code) return true
    } else {
      const parsedKeyNormalized =
        parsed.key.length === 1 ? parsed.key.toUpperCase() : parsed.key
      const releasedKeyNormalized =
        releasedKey.length === 1 ? releasedKey.toUpperCase() : releasedKey
      if (releasedKeyNormalized === parsedKeyNormalized) return true
    }

    // Reset if any required modifier is released
    // Use normalized key names and check against canonical modifier names
    if (parsed.ctrl && releasedKey === 'Control') {
      return true
    }
    if (parsed.shift && releasedKey === 'Shift') {
      return true
    }
    if (parsed.alt && releasedKey === 'Alt') {
      return true
    }
    if (parsed.meta && releasedKey === 'Meta') {
      return true
    }

    return false
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
    this.#notify()
  }

  /**
   * Triggers a registration's callback programmatically from devtools.
   * Creates a synthetic KeyboardEvent from the chord (or a sequence's last step)
   * and invokes the callback.
   *
   * @param id - The registration ID to trigger
   * @returns True if the registration was found and triggered
   */
  triggerRegistration(id: string): boolean {
    const registration = this.registrations.state.get(id)
    if (!registration) {
      return false
    }

    const context = this.#callbackContext(registration)
    const parsed = context.parsedHotkey
    const syntheticEvent = new KeyboardEvent(
      registration.options.eventType ?? 'keydown',
      {
        ...(parsed.code !== undefined
          ? { code: parsed.code }
          : { key: parsed.key }),
        ctrlKey: parsed.ctrl,
        shiftKey: parsed.shift,
        altKey: parsed.alt,
        metaKey: parsed.meta,
        bubbles: true,
        cancelable: true,
      },
    )

    registration.triggerCount++
    if (registration.kind === 'sequence') registration.hasFired = true

    // Notify the store so subscribers (e.g. devtools) see the updated count
    this.#notify()

    registration.callback(syntheticEvent, context)

    return true
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
   * Destroys the manager and removes all listeners.
   */
  destroy(): void {
    this.#listeners.destroy()
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
