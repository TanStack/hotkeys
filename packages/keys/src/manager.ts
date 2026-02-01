import { detectPlatform } from './constants'
import { parseHotkey } from './parse'
import { matchesKeyboardEvent } from './match'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  HotkeyOptions,
  HotkeyRegistration,
} from './types'

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
  private static instance: HotkeyManager | null = null

  private registrations: Map<string, HotkeyRegistration> = new Map()
  private keydownListener: ((event: KeyboardEvent) => void) | null = null
  private keyupListener: ((event: KeyboardEvent) => void) | null = null
  private platform: 'mac' | 'windows' | 'linux'

  private constructor() {
    this.platform = detectPlatform()
  }

  /**
   * Gets the singleton instance of HotkeyManager.
   */
  static getInstance(): HotkeyManager {
    if (!HotkeyManager.instance) {
      HotkeyManager.instance = new HotkeyManager()
    }
    return HotkeyManager.instance
  }

  /**
   * Resets the singleton instance. Useful for testing.
   */
  static resetInstance(): void {
    if (HotkeyManager.instance) {
      HotkeyManager.instance.destroy()
      HotkeyManager.instance = null
    }
  }

  /**
   * Registers a hotkey handler.
   *
   * @param hotkey - The hotkey string to listen for
   * @param callback - The function to call when the hotkey is pressed
   * @param options - Options for the hotkey behavior
   * @returns A function to unregister the hotkey
   */
  register(
    hotkey: Hotkey,
    callback: HotkeyCallback,
    options: HotkeyOptions = {},
  ): () => void {
    const id = generateId()
    const platform = options.platform ?? this.platform
    const parsedHotkey = parseHotkey(hotkey, platform)

    const registration: HotkeyRegistration = {
      id,
      hotkey,
      parsedHotkey,
      callback,
      options: {
        preventDefault: false,
        stopPropagation: false,
        eventType: 'keydown',
        requireReset: false,
        enabled: true,
        ...options,
        platform,
      },
      hasFired: false,
    }

    this.registrations.set(id, registration)
    this.ensureListeners()

    return () => {
      this.unregister(id)
    }
  }

  /**
   * Unregisters a hotkey by its registration ID.
   */
  private unregister(id: string): void {
    this.registrations.delete(id)

    // Remove listeners if no more registrations
    if (this.registrations.size === 0) {
      this.removeListeners()
    }
  }

  /**
   * Ensures event listeners are attached.
   */
  private ensureListeners(): void {
    if (typeof document === 'undefined') {
      return // SSR safety
    }

    if (!this.keydownListener) {
      this.keydownListener = this.handleKeyDown.bind(this)
      document.addEventListener('keydown', this.keydownListener)
    }

    if (!this.keyupListener) {
      this.keyupListener = this.handleKeyUp.bind(this)
      document.addEventListener('keyup', this.keyupListener)
    }
  }

  /**
   * Removes event listeners.
   */
  private removeListeners(): void {
    if (typeof document === 'undefined') {
      return
    }

    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener)
      this.keydownListener = null
    }

    if (this.keyupListener) {
      document.removeEventListener('keyup', this.keyupListener)
      this.keyupListener = null
    }
  }

  /**
   * Handles keydown events.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    for (const registration of this.registrations.values()) {
      if (!registration.options.enabled) {
        continue
      }

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

        // Mark as fired if requireReset is enabled
        if (registration.options.requireReset) {
          registration.hasFired = true
        }
      }
    }
  }

  /**
   * Handles keyup events.
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Handle keyup registrations
    for (const registration of this.registrations.values()) {
      if (!registration.options.enabled) {
        continue
      }

      if (registration.options.eventType === 'keyup') {
        if (
          matchesKeyboardEvent(
            event,
            registration.parsedHotkey,
            registration.options.platform,
          )
        ) {
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
      }

      // Reset hasFired when any key in the hotkey is released
      if (registration.options.requireReset && registration.hasFired) {
        if (this.shouldResetRegistration(registration, event)) {
          registration.hasFired = false
        }
      }
    }
  }

  /**
   * Determines if a registration should be reset based on the keyup event.
   */
  private shouldResetRegistration(
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
    return this.registrations.size
  }

  /**
   * Checks if a specific hotkey is registered.
   */
  isRegistered(hotkey: Hotkey): boolean {
    for (const registration of this.registrations.values()) {
      if (registration.hotkey === hotkey) {
        return true
      }
    }
    return false
  }

  /**
   * Destroys the manager and removes all listeners.
   */
  destroy(): void {
    this.removeListeners()
    this.registrations.clear()
  }
}

/**
 * Gets the singleton HotkeyManager instance.
 * Convenience function for accessing the manager.
 */
export function getHotkeyManager(): HotkeyManager {
  return HotkeyManager.getInstance()
}
