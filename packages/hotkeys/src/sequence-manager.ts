import { Store } from '@tanstack/store'
import { formatHotkeySequence } from './format'
import { detectPlatform, normalizeKeyName } from './constants'
import { isModifierKey, parseHotkey } from './parse'
import { matchesKeyboardEvent } from './match'
import {
  defaultHotkeyOptions,
  getDefaultIgnoreInputs,
  handleConflict,
  isEventForTarget,
  isInputElement,
} from './manager.utils'
import type { HotkeyOptions } from './hotkey-manager'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  ParsedHotkey,
} from './hotkey'

type Target = HTMLElement | Document | Window

/**
 * Options for hotkey sequence matching.
 * Extends HotkeyOptions but excludes requireReset (not applicable to sequences).
 */
export interface SequenceOptions extends Omit<HotkeyOptions, 'requireReset'> {
  /** Timeout between keys in milliseconds. Default: 1000 */
  timeout?: number
}

/**
 * A sequence of hotkeys for Vim-style shortcuts.
 *
 * Each element is one step (a `Hotkey` string). Steps may include modifiers;
 * the same modifier can appear on consecutive steps (e.g. `Shift+R` then
 * `Shift+T`). Modifier-only key events do not advance or reset matching—see
 * `SequenceManager`.
 *
 * @example
 * ```ts
 * const gotoTop: HotkeySequence = ['G', 'G']  // gg
 * const deleteLine: HotkeySequence = ['D', 'D']  // dd
 * const deleteWord: HotkeySequence = ['D', 'I', 'W']  // diw
 * const chainedShift: HotkeySequence = ['Shift+R', 'Shift+T']
 * ```
 */
export type HotkeySequence = Array<Hotkey>

/**
 * Default timeout between keys in a sequence (in milliseconds).
 * Exported for consumers that display sequence state (e.g. devtools).
 */
export const DEFAULT_SEQUENCE_TIMEOUT = 1000

let sequenceIdCounter = 0

/**
 * Generates a unique ID for sequence registrations.
 */
function generateSequenceId(): string {
  return `sequence_${++sequenceIdCounter}`
}

/**
 * Returns a canonical string for sequence conflict comparison.
 */
function sequenceKey(sequence: HotkeySequence): string {
  return sequence.join('|')
}

/**
 * View of a sequence registration for devtools display.
 * Progress fields reflect an in-progress match (between first key and completion or timeout).
 */
export interface SequenceRegistrationView {
  id: string
  sequence: HotkeySequence
  options: SequenceOptions
  target: Target
  triggerCount: number
  /** Steps matched in the current attempt (0 when idle or just completed). */
  matchedStepCount: number
  /** `Date.now()` when the last step in the current attempt matched; 0 if none. */
  partialMatchLastKeyTime: number
}

/**
 * Internal representation of a sequence registration.
 */
interface SequenceRegistration {
  id: string
  sequence: HotkeySequence
  parsedSequence: Array<ParsedHotkey>
  callback: HotkeyCallback
  options: SequenceOptions
  target: Target
  currentIndex: number
  lastKeyTime: number
  triggerCount: number
}

/**
 * A handle returned from SequenceManager.register() that allows updating
 * the callback and options without re-registering the sequence.
 *
 * @example
 * ```ts
 * const handle = manager.register(['G', 'G'], callback, options)
 *
 * handle.callback = newCallback
 * handle.setOptions({ timeout: 500 })
 * handle.unregister()
 * ```
 */
export interface SequenceRegistrationHandle {
  readonly id: string
  readonly isActive: boolean
  callback: HotkeyCallback
  setOptions: (options: Partial<SequenceOptions>) => void
  unregister: () => void
}

/**
 * Manages keyboard sequence matching for Vim-style shortcuts.
 *
 * This class allows registering multi-key sequences like 'g g' or 'd d'
 * that trigger callbacks when the full sequence is pressed within
 * a configurable timeout.
 *
 * Modifier-only `keydown` / `keyup` events (Shift, Control, Alt, or Meta
 * alone) are not processed: they neither match a step nor reset progress.
 * That supports chained modifier chords (e.g. `Shift+R` then `Shift+T`) when
 * the user presses a modifier alone between steps.
 *
 * @example
 * ```ts
 * const matcher = SequenceManager.getInstance()
 *
 * // Register 'g g' to go to top
 * const unregister = matcher.register(['G', 'G'], (event, context) => {
 *   scrollToTop()
 * }, { timeout: 500 })
 *
 * // Later, to unregister:
 * unregister()
 * ```
 */
/**
 * Builds a devtools view from an internal registration.
 */
function toRegistrationView(
  reg: SequenceRegistration,
): SequenceRegistrationView {
  const len = reg.parsedSequence.length
  const inProgress = reg.currentIndex > 0 && reg.currentIndex < len
  return {
    id: reg.id,
    sequence: reg.sequence,
    options: reg.options,
    target: reg.target,
    triggerCount: reg.triggerCount,
    matchedStepCount: inProgress ? reg.currentIndex : 0,
    partialMatchLastKeyTime: inProgress ? reg.lastKeyTime : 0,
  }
}

export class SequenceManager {
  static #instance: SequenceManager | null = null

  /**
   * The TanStack Store containing sequence registration views for devtools.
   * Subscribe to this to observe registration changes.
   */
  readonly registrations: Store<Map<string, SequenceRegistrationView>> =
    new Store(new Map())

  #registrations: Map<string, SequenceRegistration> = new Map()
  #targetListeners: Map<
    Target,
    {
      keydown: (event: KeyboardEvent) => void
      keyup: (event: KeyboardEvent) => void
    }
  > = new Map()
  #targetRegistrations: Map<Target, Set<string>> = new Map()
  #platform: 'mac' | 'windows' | 'linux'

  private constructor() {
    this.#platform = detectPlatform()
  }

  /**
   * Gets the singleton instance of SequenceManager.
   */
  static getInstance(): SequenceManager {
    if (!SequenceManager.#instance) {
      SequenceManager.#instance = new SequenceManager()
    }
    return SequenceManager.#instance
  }

  /**
   * Resets the singleton instance. Useful for testing.
   */
  static resetInstance(): void {
    if (SequenceManager.#instance) {
      SequenceManager.#instance.destroy()
      SequenceManager.#instance = null
    }
  }

  #syncRegistrationView(registration: SequenceRegistration): void {
    this.registrations.setState((prev) =>
      new Map(prev).set(registration.id, toRegistrationView(registration)),
    )
  }

  /**
   * Registers a hotkey sequence handler.
   *
   * @param sequence - Array of hotkey strings that form the sequence
   * @param callback - Function to call when the sequence is completed
   * @param options - Options for the sequence behavior
   * @returns A handle to update or unregister the sequence
   */
  register(
    sequence: HotkeySequence,
    callback: HotkeyCallback,
    options: SequenceOptions = {},
  ): SequenceRegistrationHandle {
    if (sequence.length === 0) {
      throw new Error('Sequence must contain at least one hotkey')
    }

    const id = generateSequenceId()
    const platform = options.platform ?? this.#platform
    const parsedSequence = sequence.map((hotkey) =>
      parseHotkey(hotkey, platform),
    )

    // Resolve target: default to document if not provided or null
    const target: Target =
      options.target ??
      (typeof document !== 'undefined' ? document : ({} as Document))

    // Resolve conflict behavior
    const conflictBehavior = options.conflictBehavior ?? 'warn'

    // Check for existing registrations with the same sequence and target
    const conflictingRegistration = this.#findConflictingSequence(
      sequence,
      target,
    )

    if (conflictingRegistration) {
      handleConflict(
        conflictingRegistration.id,
        formatHotkeySequence(sequence),
        conflictBehavior,
        (regId) => this.#unregister(regId),
      )
    }

    const firstStep = parsedSequence[0]!
    const resolvedIgnoreInputs =
      options.ignoreInputs ?? getDefaultIgnoreInputs(firstStep)

    const baseOptions = {
      ...defaultHotkeyOptions,
      timeout: DEFAULT_SEQUENCE_TIMEOUT,
      ...options,
      platform,
      ignoreInputs: resolvedIgnoreInputs,
    }

    const registration: SequenceRegistration = {
      id,
      sequence,
      parsedSequence,
      callback,
      options: baseOptions,
      target,
      currentIndex: 0,
      lastKeyTime: 0,
      triggerCount: 0,
    }

    this.#registrations.set(id, registration)
    this.registrations.setState((prev) =>
      new Map(prev).set(id, toRegistrationView(registration)),
    )

    // Track registration for this target
    if (!this.#targetRegistrations.has(target)) {
      this.#targetRegistrations.set(target, new Set())
    }
    this.#targetRegistrations.get(target)!.add(id)

    // Ensure listeners are attached for this target
    this.#ensureListenersForTarget(target)

    const manager = this
    const handle: SequenceRegistrationHandle = {
      get id() {
        return id
      },
      get isActive() {
        return manager.#registrations.has(id)
      },
      get callback() {
        const reg = manager.#registrations.get(id)
        return reg?.callback ?? callback
      },
      set callback(newCallback: HotkeyCallback) {
        const reg = manager.#registrations.get(id)
        if (reg) {
          reg.callback = newCallback
        }
      },
      setOptions: (newOptions: Partial<SequenceOptions>) => {
        const reg = manager.#registrations.get(id)
        if (reg) {
          reg.options = { ...reg.options, ...newOptions }
          manager.registrations.setState((prev) =>
            new Map(prev).set(id, toRegistrationView(reg)),
          )
        }
      },
      unregister: () => {
        manager.#unregister(id)
      },
    }

    return handle
  }

  /**
   * Unregisters a sequence by its registration ID.
   */
  #unregister(id: string): void {
    const registration = this.#registrations.get(id)
    if (!registration) {
      return
    }

    const target = registration.target

    this.#registrations.delete(id)
    this.registrations.setState((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })

    // Remove from target registrations tracking
    const targetRegs = this.#targetRegistrations.get(target)
    if (targetRegs) {
      targetRegs.delete(id)
      if (targetRegs.size === 0) {
        this.#removeListenersForTarget(target)
      }
    }
  }

  /**
   * Ensures event listeners are attached for a specific target.
   */
  #ensureListenersForTarget(target: Target): void {
    if (typeof document === 'undefined') {
      return // SSR safety
    }

    if (this.#targetListeners.has(target)) {
      return
    }

    const keydownHandler = this.#createTargetKeyDownHandler(target)
    const keyupHandler = this.#createTargetKeyUpHandler(target)

    target.addEventListener('keydown', keydownHandler as EventListener)
    target.addEventListener('keyup', keyupHandler as EventListener)

    this.#targetListeners.set(target, {
      keydown: keydownHandler,
      keyup: keyupHandler,
    })
  }

  /**
   * Removes event listeners for a specific target.
   */
  #removeListenersForTarget(target: Target): void {
    if (typeof document === 'undefined') {
      return
    }

    const listeners = this.#targetListeners.get(target)
    if (!listeners) {
      return
    }

    target.removeEventListener('keydown', listeners.keydown as EventListener)
    target.removeEventListener('keyup', listeners.keyup as EventListener)

    this.#targetListeners.delete(target)
    this.#targetRegistrations.delete(target)
  }

  /**
   * Creates a keydown handler for a specific target.
   */
  #createTargetKeyDownHandler(target: Target): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      this.#processTargetEvent(event, target, 'keydown')
    }
  }

  /**
   * Creates a keyup handler for a specific target.
   */
  #createTargetKeyUpHandler(target: Target): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      this.#processTargetEvent(event, target, 'keyup')
    }
  }

  /**
   * Processes keyboard events for a specific target and event type.
   */
  #processTargetEvent(
    event: KeyboardEvent,
    target: Target,
    eventType: 'keydown' | 'keyup',
  ): void {
    // Skip modifier-only events so pressing e.g. Shift before Shift+C does not reset the sequence.
    if (isModifierKey(normalizeKeyName(event.key))) {
      return
    }

    const targetRegs = this.#targetRegistrations.get(target)
    if (!targetRegs) {
      return
    }

    const now = Date.now()

    for (const id of targetRegs) {
      const registration = this.#registrations.get(id)
      if (!registration) {
        continue
      }

      if (!isEventForTarget(event, target)) {
        continue
      }

      if (!registration.options.enabled) {
        continue
      }

      // Check if we should ignore input elements (defaults to true)
      if (registration.options.ignoreInputs !== false) {
        if (isInputElement(event.target)) {
          // Don't ignore if the sequence is explicitly scoped to this input element
          if (event.target !== registration.target) {
            continue
          }
        }
      }

      // Only process registrations that listen for this event type
      if (registration.options.eventType !== eventType) {
        continue
      }

      const timeout = registration.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT

      // Check if sequence has timed out
      if (
        registration.currentIndex > 0 &&
        now - registration.lastKeyTime > timeout
      ) {
        registration.currentIndex = 0
        this.#syncRegistrationView(registration)
      }

      const expectedHotkey =
        registration.parsedSequence[registration.currentIndex]
      if (!expectedHotkey) {
        continue
      }

      if (
        matchesKeyboardEvent(
          event,
          expectedHotkey,
          registration.options.platform,
        )
      ) {
        registration.lastKeyTime = now
        registration.currentIndex++

        if (registration.currentIndex >= registration.parsedSequence.length) {
          if (registration.options.preventDefault) {
            event.preventDefault()
          }
          if (registration.options.stopPropagation) {
            event.stopPropagation()
          }

          const context: HotkeyCallbackContext = {
            hotkey: registration.sequence.join(' ') as Hotkey,
            parsedHotkey:
              registration.parsedSequence[
                registration.parsedSequence.length - 1
              ]!,
          }

          registration.triggerCount++
          registration.currentIndex = 0

          this.#syncRegistrationView(registration)

          registration.callback(event, context)
        } else {
          this.#syncRegistrationView(registration)
        }
      } else if (registration.currentIndex > 0) {
        const firstHotkey = registration.parsedSequence[0]!
        if (
          matchesKeyboardEvent(
            event,
            firstHotkey,
            registration.options.platform,
          )
        ) {
          registration.currentIndex = 1
          registration.lastKeyTime = now
        } else {
          registration.currentIndex = 0
        }
        this.#syncRegistrationView(registration)
      }
    }
  }

  /**
   * Finds an existing registration with the same sequence and target.
   */
  #findConflictingSequence(
    sequence: HotkeySequence,
    target: Target,
  ): SequenceRegistration | null {
    const key = sequenceKey(sequence)
    for (const registration of this.#registrations.values()) {
      if (
        sequenceKey(registration.sequence) === key &&
        registration.target === target
      ) {
        return registration
      }
    }
    return null
  }

  /**
   * Resets all sequence progress.
   */
  resetAll(): void {
    for (const registration of this.#registrations.values()) {
      registration.currentIndex = 0
      registration.lastKeyTime = 0
      this.#syncRegistrationView(registration)
    }
  }

  /**
   * Triggers a sequence's callback programmatically from devtools.
   * Creates a synthetic KeyboardEvent from the last key in the sequence.
   *
   * @param id - The registration ID to trigger
   * @returns True if the registration was found and triggered
   */
  triggerSequence(id: string): boolean {
    const registration = this.#registrations.get(id)
    if (!registration) {
      return false
    }

    const lastParsed =
      registration.parsedSequence[registration.parsedSequence.length - 1]
    if (!lastParsed) {
      return false
    }

    const syntheticEvent = new KeyboardEvent(
      registration.options.eventType ?? 'keydown',
      {
        key: lastParsed.key,
        ctrlKey: lastParsed.ctrl,
        shiftKey: lastParsed.shift,
        altKey: lastParsed.alt,
        metaKey: lastParsed.meta,
        bubbles: true,
        cancelable: true,
      },
    )

    registration.triggerCount++

    this.#syncRegistrationView(registration)

    const context: HotkeyCallbackContext = {
      hotkey: registration.sequence.join(' ') as Hotkey,
      parsedHotkey: lastParsed,
    }

    registration.callback(syntheticEvent, context)

    return true
  }

  /**
   * Gets the number of registered sequences.
   */
  getRegistrationCount(): number {
    return this.#registrations.size
  }

  /**
   * Destroys the manager and removes all listeners.
   */
  destroy(): void {
    for (const target of this.#targetListeners.keys()) {
      this.#removeListenersForTarget(target)
    }
    this.#registrations.clear()
    this.registrations.setState(() => new Map())
  }
}

/**
 * Gets the singleton SequenceManager instance.
 * Convenience function for accessing the manager.
 */
export function getSequenceManager(): SequenceManager {
  return SequenceManager.getInstance()
}

/**
 * Creates a simple sequence matcher for one-off use.
 *
 * This is a low-level helper that does not support ignoreInputs, target,
 * or other HotkeyOptions. Callers must handle input filtering themselves
 * if attaching to document.
 *
 * @param sequence - The sequence of hotkeys to match
 * @param options - Options including timeout
 * @returns An object with match() and reset() methods
 *
 * @example
 * ```ts
 * const matcher = createSequenceMatcher(['G', 'G'], { timeout: 500 })
 *
 * document.addEventListener('keydown', (event) => {
 *   if (matcher.match(event)) {
 *     console.log('Sequence matched!')
 *   }
 * })
 * ```
 */
export function createSequenceMatcher(
  sequence: HotkeySequence,
  options: { timeout?: number; platform?: 'mac' | 'windows' | 'linux' } = {},
): {
  match: (event: KeyboardEvent) => boolean
  reset: () => void
  getProgress: () => number
} {
  const platform = options.platform ?? detectPlatform()
  const timeout = options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT
  const parsedSequence = sequence.map((hotkey) => parseHotkey(hotkey, platform))

  let currentIndex = 0
  let lastKeyTime = 0

  return {
    match(event: KeyboardEvent): boolean {
      const now = Date.now()

      if (currentIndex > 0 && now - lastKeyTime > timeout) {
        currentIndex = 0
      }

      const expected = parsedSequence[currentIndex]
      if (!expected) {
        return false
      }

      if (matchesKeyboardEvent(event, expected, platform)) {
        lastKeyTime = now
        currentIndex++

        if (currentIndex >= parsedSequence.length) {
          currentIndex = 0
          return true
        }
      } else if (currentIndex > 0) {
        if (matchesKeyboardEvent(event, parsedSequence[0]!, platform)) {
          currentIndex = 1
          lastKeyTime = now
        } else {
          currentIndex = 0
        }
      }

      return false
    },

    reset(): void {
      currentIndex = 0
      lastKeyTime = 0
    },

    getProgress(): number {
      return currentIndex
    },
  }
}
