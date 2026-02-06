import { detectPlatform } from './constants'
import { parseHotkey } from './parse'
import { matchesKeyboardEvent } from './match'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  ParsedHotkey,
} from './hotkey'

/**
 * Options for registering a hotkey.
 */
export interface HotkeyOptions {
  /** Whether the hotkey is enabled. Defaults to true */
  enabled?: boolean
  /** The event type to listen for. Defaults to 'keydown' */
  eventType?: 'keydown' | 'keyup'
  /** Whether to ignore hotkeys when keyboard events originate from input-like elements (input, textarea, select, contenteditable). Defaults to true */
  ignoreInputs?: boolean
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
  /** Prevent the default browser action when the hotkey matches */
  preventDefault?: boolean
  /** If true, only trigger once until all keys are released. Default: false */
  requireReset?: boolean
  /** Stop event propagation when the hotkey matches */
  stopPropagation?: boolean
  /** The DOM element to attach the event listener to. Defaults to document. */
  target?: HTMLElement | Document | Window | null
}

/**
 * A registered hotkey handler in the HotkeyManager.
 */
export interface HotkeyRegistration {
  /** Unique identifier for this registration */
  id: string
  /** The original hotkey string */
  hotkey: Hotkey
  /** The parsed hotkey */
  parsedHotkey: ParsedHotkey
  /** The callback to invoke */
  callback: HotkeyCallback
  /** Options for this registration */
  options: HotkeyOptions
  /** Whether this registration has fired and needs reset (for requireReset) */
  hasFired: boolean
  /** The resolved target element for this registration */
  target: HTMLElement | Document | Window
}

/**
 * A handle returned from HotkeyManager.register() that allows updating
 * the callback and options without re-registering the hotkey.
 *
 * This pattern is similar to TanStack Pacer's Debouncer, where the function
 * and options can be synced on every render to avoid stale closures.
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
  /** Unique identifier for this registration */
  readonly id: string

  /** Unregister this hotkey */
  unregister: () => void

  /**
   * The callback function. Can be set directly to update without re-registering.
   * This avoids stale closures when the callback references React state.
   */
  callback: HotkeyCallback

  /**
   * Update options (merged with existing options).
   * Useful for updating `enabled`, `preventDefault`, etc. without re-registering.
   */
  setOptions: (options: Partial<HotkeyOptions>) => void

  /** Check if this registration is still active (not unregistered) */
  readonly isActive: boolean
}

/**
 * Default options for hotkey registration.
 */
const defaultHotkeyOptions: Omit<
  Required<HotkeyOptions>,
  'platform' | 'target'
> = {
  preventDefault: false,
  stopPropagation: false,
  eventType: 'keydown',
  requireReset: false,
  enabled: true,
  ignoreInputs: true,
}

let registrationIdCounter = 0

/**
 * Generates a unique ID for hotkey registrations.
 */
function generateId(): string {
  return `hotkey_${++registrationIdCounter}`
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
 * }, { preventDefault: true })
 *
 * // Later, to unregister:
 * unregister()
 * ```
 */
export class HotkeyManager {
  static #instance: HotkeyManager | null = null

  #registrations: Map<string, HotkeyRegistration> = new Map()
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
   * @param hotkey - The hotkey string to listen for
   * @param callback - The function to call when the hotkey is pressed
   * @param options - Options for the hotkey behavior
   * @returns A handle for managing the registration
   *
   * @example
   * ```ts
   * const handle = manager.register('Mod+S', callback, { preventDefault: true })
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
    hotkey: Hotkey,
    callback: HotkeyCallback,
    options: HotkeyOptions = {},
  ): HotkeyRegistrationHandle {
    const id = generateId()
    const platform = options.platform ?? this.#platform
    const parsedHotkey = parseHotkey(hotkey, platform)

    // Resolve target: default to document if not provided or null
    const target =
      options.target ??
      (typeof document !== 'undefined' ? document : ({} as Document))

    const registration: HotkeyRegistration = {
      id,
      hotkey,
      parsedHotkey,
      callback,
      options: {
        ...defaultHotkeyOptions,
        ...options,
        platform,
      },
      hasFired: false,
      target,
    }

    this.#registrations.set(id, registration)

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
        const reg = manager.#registrations.get(id)
        return reg?.callback ?? callback
      },
      set callback(newCallback: HotkeyCallback) {
        const reg = manager.#registrations.get(id)
        if (reg) {
          reg.callback = newCallback
        }
      },
      setOptions: (newOptions: Partial<HotkeyOptions>) => {
        const reg = manager.#registrations.get(id)
        if (reg) {
          reg.options = { ...reg.options, ...newOptions }
        }
      },
      get isActive() {
        return manager.#registrations.has(id)
      },
    }

    return handle
  }

  /**
   * Unregisters a hotkey by its registration ID.
   */
  #unregister(id: string): void {
    const registration = this.#registrations.get(id)
    if (!registration) {
      return
    }

    const target = registration.target

    // Remove registration
    this.#registrations.delete(id)

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
      const registration = this.#registrations.get(id)
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

        // Check if requireReset is active and the hotkey has already fired
        if (registration.options.requireReset && registration.hasFired) {
          continue
        }

        if (
          matchesKeyboardEvent(
            event,
            registration.parsedHotkey,
            registration.options.platform,
          )
        ) {
          this.#executeHotkeyCallback(registration, event)

          // Mark as fired if requireReset is enabled
          if (registration.options.requireReset) {
            registration.hasFired = true
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
    // For Document and Window, check if currentTarget matches
    if (target === document || target === window) {
      return event.currentTarget === target
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
   * Checks if an element is an input-like element that should be ignored.
   *
   * This includes:
   * - HTMLInputElement (all input types)
   * - HTMLTextAreaElement
   * - HTMLSelectElement
   * - Elements with contentEditable enabled
   */
  #isInputElement(element: EventTarget | null): boolean {
    if (!element) {
      return false
    }

    // Check for standard input elements
    if (
      element instanceof HTMLInputElement ||
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
    const releasedKey = event.key.toLowerCase()

    // Reset if the main key is released
    if (releasedKey === parsed.key.toLowerCase()) {
      return true
    }

    // Reset if any required modifier is released
    if (parsed.ctrl && (releasedKey === 'control' || releasedKey === 'ctrl')) {
      return true
    }
    if (parsed.shift && releasedKey === 'shift') {
      return true
    }
    if (parsed.alt && (releasedKey === 'alt' || releasedKey === 'option')) {
      return true
    }
    if (parsed.meta && (releasedKey === 'meta' || releasedKey === 'command')) {
      return true
    }

    return false
  }

  /**
   * Gets the number of registered hotkeys.
   */
  getRegistrationCount(): number {
    return this.#registrations.size
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
    for (const registration of this.#registrations.values()) {
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

    this.#registrations.clear()
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
