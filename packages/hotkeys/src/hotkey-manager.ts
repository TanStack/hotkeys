import { Store } from '@tanstack/store'
import { detectPlatform, normalizeKeyName } from './constants'
import { formatHotkey } from './format'
import { parseHotkey, rawHotkeyToParsedHotkey } from './parse'
import { matchesKeyboardEvent } from './match'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  ParsedHotkey,
  RegisterableHotkey,
} from './hotkey'

/**
 * Behavior when registering a hotkey that conflicts with an existing registration.
 *
 * - `'warn'` - Log a warning to the console but allow both registrations (default)
 * - `'error'` - Throw an error and prevent the new registration
 * - `'replace'` - Unregister the existing hotkey and register the new one
 * - `'allow'` - Allow multiple registrations of the same hotkey without warning
 */
export type ConflictBehavior = 'warn' | 'error' | 'replace' | 'allow'

/**
 * Options for registering a hotkey.
 */
export interface HotkeyOptions {
  /** Behavior when this hotkey conflicts with an existing registration on the same target. Defaults to 'warn' */
  conflictBehavior?: ConflictBehavior
  /** Whether the hotkey is enabled. Defaults to true */
  enabled?: boolean
  /** The event type to listen for. Defaults to 'keydown' */
  eventType?: 'keydown' | 'keyup'
  /** Whether to ignore hotkeys when keyboard events originate from input-like elements (text inputs, textarea, select, contenteditable — button-type inputs like type=button/submit/reset are not ignored). Defaults based on hotkey: true for single keys and Shift/Alt combos; false for Ctrl/Meta shortcuts and Escape */
  ignoreInputs?: boolean
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
  /** Prevent the default browser action when the hotkey matches. Defaults to true */
  preventDefault?: boolean
  /** If true, only trigger once until all keys are released. Default: false */
  requireReset?: boolean
  /** Stop event propagation when the hotkey matches. Defaults to true */
  stopPropagation?: boolean
  /** The DOM element to attach the event listener to. Defaults to document. */
  target?: HTMLElement | Document | Window | null
}

/**
 * A registered hotkey handler in the HotkeyManager.
 */
export interface HotkeyRegistration {
  /** The callback to invoke */
  callback: HotkeyCallback
  /** Whether this registration has fired and needs reset (for requireReset) */
  hasFired: boolean
  /** The original hotkey string */
  hotkey: Hotkey
  /** Unique identifier for this registration */
  id: string
  /** Options for this registration */
  options: HotkeyOptions
  /** The parsed hotkey */
  parsedHotkey: ParsedHotkey
  /** The resolved target element for this registration */
  target: HTMLElement | Document | Window
  /** How many times this registration's callback has been triggered */
  triggerCount: number
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
 * // Check if still active
 * if (handle.isActive) {
 *   // ...
 * }
 *
 * // Unregister when done
 * handle.unregister()
 * ```
 */
export interface HotkeyRegistrationHandle {
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
   */
  setOptions: (options: Partial<HotkeyOptions>) => void
  /** Unregister this hotkey */
  unregister: () => void
}

/**
 * Default options for hotkey registration.
 */
const defaultHotkeyOptions: Omit<
  Required<HotkeyOptions>,
  'platform' | 'target'
> = {
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  enabled: true,
  ignoreInputs: true,
  conflictBehavior: 'warn',
}

let registrationIdCounter = 0

/**
 * Generates a unique ID for hotkey registrations.
 */
function generateId(): string {
  return `hotkey_${++registrationIdCounter}`
}

/**
 * Computes the default ignoreInputs value based on the hotkey.
 * Ctrl/Meta shortcuts and Escape fire in inputs; single keys and Shift/Alt combos are ignored.
 */
function getDefaultIgnoreInputs(parsedHotkey: ParsedHotkey): boolean {
  if (parsedHotkey.ctrl || parsedHotkey.meta) return false // Mod+S, Ctrl+C, etc.
  if (parsedHotkey.key === 'Escape') return false // Close modal, etc.
  return true // Single keys, Shift+key, Alt+key
}

/**
 * Singleton manager for hotkey registrations.
 *
 * This class provides a centralized way to register and manage keyboard hotkeys.
 * It uses a single event listener for efficiency, regardless of how many hotkeys
 * are registered.
 *
 * @example
 * ```ts
 * const manager = HotkeyManager.getInstance()
 *
 * const unregister = manager.register('Mod+S', (event, context) => {
 *   console.log('Save triggered!')
 * })
 *
 * // Later, to unregister:
 * unregister()
 * ```
 */
export class HotkeyManager {
  static #instance: HotkeyManager | null = null

  /**
   * The TanStack Store containing all hotkey registrations.
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
  #platform: 'mac' | 'windows' | 'linux'
  #targetListeners: Map<
    HTMLElement | Document | Window,
    {
      keydown: (event: KeyboardEvent) => void
      keyup: (event: KeyboardEvent) => void
    }
  > = new Map()
  #targetRegistrations: Map<HTMLElement | Document | Window, Set<string>> =
    new Map()

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

  /**
   * Registers a hotkey handler and returns a handle for updating the registration.
   *
   * The returned handle allows updating the callback and options without
   * re-registering, which is useful for avoiding stale closures in React.
   *
   * @param hotkey - The hotkey string (e.g., 'Mod+S') or RawHotkey object
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
  register(
    hotkey: RegisterableHotkey,
    callback: HotkeyCallback,
    options: HotkeyOptions = {},
  ): HotkeyRegistrationHandle {
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
    const parsedHotkey =
      typeof hotkey === 'string'
        ? parseHotkey(hotkey, platform)
        : rawHotkeyToParsedHotkey(hotkey, platform)
    const hotkeyStr = (
      typeof hotkey === 'string' ? hotkey : formatHotkey(parsedHotkey)
    ) as Hotkey

    // Resolve target: default to document if not provided
    // Note: SSR case without explicit target is handled above
    const target = options.target ?? document

    // Resolve conflict behavior
    const conflictBehavior = options.conflictBehavior ?? 'warn'

    // Check for existing registrations with the same hotkey and target
    const conflictingRegistration = this.#findConflictingRegistration(
      hotkeyStr,
      target,
    )

    if (conflictingRegistration) {
      this.#handleConflict(conflictingRegistration, hotkeyStr, conflictBehavior)
    }

    const resolvedIgnoreInputs =
      options.ignoreInputs ?? getDefaultIgnoreInputs(parsedHotkey)

    const baseOptions = {
      ...defaultHotkeyOptions,
      ...options,
      platform,
    }

    const registration: HotkeyRegistration = {
      id,
      hotkey: hotkeyStr,
      parsedHotkey,
      callback,
      options: { ...baseOptions, ignoreInputs: resolvedIgnoreInputs },
      hasFired: false,
      triggerCount: 0,
      target,
    }

    this.registrations.setState((prev) => new Map(prev).set(id, registration))

    // Track registration for this target
    if (!this.#targetRegistrations.has(target)) {
      this.#targetRegistrations.set(target, new Set())
    }
    this.#targetRegistrations.get(target)!.add(id)

    // Ensure listeners are attached for this target
    this.#ensureListenersForTarget(target)

    // Create and return the handle
    const manager = this
    const handle: HotkeyRegistrationHandle = {
      get id() {
        return id
      },
      unregister: () => {
        manager.#unregister(id)
      },
      get callback() {
        const reg = manager.registrations.state.get(id)
        return reg?.callback ?? callback
      },
      set callback(newCallback: HotkeyCallback) {
        const reg = manager.registrations.state.get(id)
        if (reg) {
          reg.callback = newCallback
        }
      },
      setOptions: (newOptions: Partial<HotkeyOptions>) => {
        manager.registrations.setState((prev) => {
          const reg = prev.get(id)
          if (reg) {
            const next = new Map(prev)
            next.set(id, { ...reg, options: { ...reg.options, ...newOptions } })
            return next
          }
          return prev
        })
      },
      get isActive() {
        return manager.registrations.state.has(id)
      },
    }

    return handle
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

    // Remove from target registrations tracking
    const targetRegs = this.#targetRegistrations.get(target)
    if (targetRegs) {
      targetRegs.delete(id)
      // If no more registrations for this target, remove listeners
      if (targetRegs.size === 0) {
        this.#removeListenersForTarget(target)
      }
    }
  }

  /**
   * Ensures event listeners are attached for a specific target.
   */
  #ensureListenersForTarget(target: HTMLElement | Document | Window): void {
    if (typeof document === 'undefined') {
      return // SSR safety
    }

    // Skip if listeners already exist for this target
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
  #removeListenersForTarget(target: HTMLElement | Document | Window): void {
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
   * Processes keyboard events for a specific target and event type.
   */
  #processTargetEvent(
    event: KeyboardEvent,
    target: HTMLElement | Document | Window,
    eventType: 'keydown' | 'keyup',
  ): void {
    const targetRegs = this.#targetRegistrations.get(target)
    if (!targetRegs) {
      return
    }

    for (const id of targetRegs) {
      const registration = this.registrations.state.get(id)
      if (!registration) {
        continue
      }

      // Check if event originated from or bubbled to this target
      if (!this.#isEventForTarget(event, target)) {
        continue
      }

      if (!registration.options.enabled) {
        continue
      }

      // Check if we should ignore input elements (defaults to true)
      if (registration.options.ignoreInputs !== false) {
        if (this.#isInputElement(event.target)) {
          // Don't ignore if the hotkey is explicitly scoped to this input element
          if (event.target !== registration.target) {
            continue
          }
        }
      }

      // Handle keydown events
      if (eventType === 'keydown') {
        if (registration.options.eventType !== 'keydown') {
          continue
        }

        // Check if the hotkey matches first
        const matches = matchesKeyboardEvent(
          event,
          registration.parsedHotkey,
          registration.options.platform,
        )

        if (matches) {
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
            this.#executeHotkeyCallback(registration, event)

            // Mark as fired if requireReset is enabled
            if (registration.options.requireReset) {
              registration.hasFired = true
            }
          }
        }
      }
      // Handle keyup events
      else {
        if (registration.options.eventType === 'keyup') {
          if (
            matchesKeyboardEvent(
              event,
              registration.parsedHotkey,
              registration.options.platform,
            )
          ) {
            this.#executeHotkeyCallback(registration, event)
          }
        }

        // Reset hasFired when any key in the hotkey is released
        if (registration.options.requireReset && registration.hasFired) {
          if (this.#shouldResetRegistration(registration, event)) {
            registration.hasFired = false
          }
        }
      }
    }
  }

  /**
   * Executes a hotkey callback with proper event handling.
   */
  #executeHotkeyCallback(
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

    // Notify the store so subscribers (e.g. devtools) see the updated count.
    // We create a new Map but keep the same registration reference to preserve
    // identity for mutation-based fields like hasFired.
    this.registrations.setState((prev) => new Map(prev))

    const context: HotkeyCallbackContext = {
      hotkey: registration.hotkey,
      parsedHotkey: registration.parsedHotkey,
    }

    registration.callback(event, context)
  }

  /**
   * Creates a keydown handler for a specific target.
   */
  #createTargetKeyDownHandler(
    target: HTMLElement | Document | Window,
  ): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      this.#processTargetEvent(event, target, 'keydown')
    }
  }

  /**
   * Creates a keyup handler for a specific target.
   */
  #createTargetKeyUpHandler(
    target: HTMLElement | Document | Window,
  ): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      this.#processTargetEvent(event, target, 'keyup')
    }
  }

  /**
   * Checks if an event is for the given target (originated from or bubbled to it).
   */
  #isEventForTarget(
    event: KeyboardEvent,
    target: HTMLElement | Document | Window,
  ): boolean {
    // For Document and Window, verify that our handler was indeed called for this target.
    //
    // Browser compatibility note:
    // Per the DOM spec, event.currentTarget should equal the element the listener was
    // attached to. However, some Chromium-based browsers (notably Brave) exhibit
    // non-standard behavior where event.currentTarget is set to document.documentElement
    // (<html>) instead of document when a listener is attached to document.
    // This may be related to privacy/fingerprinting protections.
    //
    // To ensure cross-browser compatibility, we accept both the expected target
    // and document.documentElement as valid currentTarget values.
    // See: https://dom.spec.whatwg.org/#dom-event-currenttarget
    if (target === document || target === window) {
      return (
        event.currentTarget === target ||
        event.currentTarget === document.documentElement
      )
    }

    // For HTMLElement, check if event originated from or bubbled to the element
    if (target instanceof HTMLElement) {
      // Check if the event's currentTarget is the target (capturing/bubbling)
      if (event.currentTarget === target) {
        return true
      }

      // Check if the event's target is a descendant of our target
      if (event.target instanceof Node && target.contains(event.target)) {
        return true
      }
    }

    return false
  }

  /**
   * Finds an existing registration with the same hotkey and target.
   */
  #findConflictingRegistration(
    hotkey: Hotkey,
    target: HTMLElement | Document | Window,
  ): HotkeyRegistration | null {
    for (const registration of this.registrations.state.values()) {
      if (registration.hotkey === hotkey && registration.target === target) {
        return registration
      }
    }
    return null
  }

  /**
   * Handles conflicts between hotkey registrations based on conflict behavior.
   */
  #handleConflict(
    conflictingRegistration: HotkeyRegistration,
    hotkey: Hotkey,
    conflictBehavior: ConflictBehavior,
  ): void {
    if (conflictBehavior === 'allow') {
      return
    }

    if (conflictBehavior === 'warn') {
      console.warn(
        `Hotkey '${hotkey}' is already registered. Multiple handlers will be triggered. ` +
          `Use conflictBehavior: 'replace' to replace the existing handler, ` +
          `or conflictBehavior: 'allow' to suppress this warning.`,
      )
      return
    }

    if (conflictBehavior === 'error') {
      throw new Error(
        `Hotkey '${hotkey}' is already registered. ` +
          `Use conflictBehavior: 'replace' to replace the existing handler, ` +
          `or conflictBehavior: 'allow' to allow multiple registrations.`,
      )
    }

    // At this point, conflictBehavior must be 'replace'
    this.#unregister(conflictingRegistration.id)
  }

  /**
   * Checks if an element is an input-like element that should be ignored.
   *
   * This includes:
   * - HTMLInputElement (all input types except button, submit, reset)
   * - HTMLTextAreaElement
   * - HTMLSelectElement
   * - Elements with contentEditable enabled
   *
   * Button-type inputs (button, submit, reset) are excluded so hotkeys like
   * Mod+S and Escape fire when the user has tabbed to a form button.
   */
  #isInputElement(element: EventTarget | null): boolean {
    if (!element) {
      return false
    }

    if (element instanceof HTMLInputElement) {
      const type = element.type.toLowerCase()
      if (type === 'button' || type === 'submit' || type === 'reset') {
        return false
      }
      return true
    }

    if (
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      return true
    }

    // Check for contenteditable elements
    if (element instanceof HTMLElement) {
      const contentEditable = element.contentEditable
      if (contentEditable === 'true' || contentEditable === '') {
        return true
      }
    }

    return false
  }

  /**
   * Determines if a registration should be reset based on the keyup event.
   */
  #shouldResetRegistration(
    registration: HotkeyRegistration,
    event: KeyboardEvent,
  ): boolean {
    const parsed = registration.parsedHotkey
    const releasedKey = normalizeKeyName(event.key)

    // Reset if the main key is released
    // Compare case-insensitively for single-letter keys
    const parsedKeyNormalized =
      parsed.key.length === 1 ? parsed.key.toUpperCase() : parsed.key
    const releasedKeyNormalized =
      releasedKey.length === 1 ? releasedKey.toUpperCase() : releasedKey

    if (releasedKeyNormalized === parsedKeyNormalized) {
      return true
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
   * Triggers a registration's callback programmatically from devtools.
   * Creates a synthetic KeyboardEvent and invokes the callback.
   *
   * @param id - The registration ID to trigger
   * @returns True if the registration was found and triggered
   */
  triggerRegistration(id: string): boolean {
    const registration = this.registrations.state.get(id)
    if (!registration) {
      return false
    }

    const parsed = registration.parsedHotkey
    const syntheticEvent = new KeyboardEvent(
      registration.options.eventType ?? 'keydown',
      {
        key: parsed.key,
        ctrlKey: parsed.ctrl,
        shiftKey: parsed.shift,
        altKey: parsed.alt,
        metaKey: parsed.meta,
        bubbles: true,
        cancelable: true,
      },
    )

    registration.triggerCount++

    // Notify the store so subscribers (e.g. devtools) see the updated count
    this.registrations.setState((prev) => new Map(prev))

    registration.callback(syntheticEvent, {
      hotkey: registration.hotkey,
      parsedHotkey: registration.parsedHotkey,
    })

    return true
  }

  /**
   * Gets the number of registered hotkeys.
   */
  getRegistrationCount(): number {
    return this.registrations.state.size
  }

  /**
   * Checks if a specific hotkey is registered.
   *
   * @param hotkey - The hotkey string to check
   * @param target - Optional target element to match (if provided, both hotkey and target must match)
   * @returns True if a matching registration exists
   */
  isRegistered(
    hotkey: Hotkey,
    target?: HTMLElement | Document | Window,
  ): boolean {
    for (const registration of this.registrations.state.values()) {
      if (registration.hotkey === hotkey) {
        // If target is specified, both must match
        if (target === undefined || registration.target === target) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Destroys the manager and removes all listeners.
   */
  destroy(): void {
    // Remove all target listeners
    for (const target of this.#targetListeners.keys()) {
      this.#removeListenersForTarget(target)
    }

    this.registrations.setState(() => new Map())
    this.#targetListeners.clear()
    this.#targetRegistrations.clear()
  }
}

/**
 * Gets the singleton HotkeyManager instance.
 * Convenience function for accessing the manager.
 */
export function getHotkeyManager(): HotkeyManager {
  return HotkeyManager.getInstance()
}
