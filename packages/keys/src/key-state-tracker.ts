import { Store } from '@tanstack/store'
import { normalizeKeyName } from './constants'

/**
 * State interface for the KeyStateTracker.
 */
export interface KeyStateTrackerState {
  /**
   * Array of currently held key names.
   */
  heldKeys: Array<string>
}

/**
 * Returns the default state for KeyStateTracker.
 */
function getDefaultKeyStateTrackerState(): KeyStateTrackerState {
  return {
    heldKeys: [],
  }
}

/**
 * Listener function type for key state changes.
 * @deprecated Use `store.subscribe()` or `useStore()` from `@tanstack/react-store` instead.
 */
export type KeyStateListener = (keys: Array<string>) => void

/**
 * Singleton tracker for currently held keyboard keys.
 *
 * This class maintains a list of all keys currently being pressed,
 * which is useful for:
 * - Displaying currently held keys to users
 * - Custom shortcut recording for rebinding
 * - Complex chord detection
 *
 * State Management:
 * - Uses TanStack Store for reactive state management
 * - State can be accessed via `tracker.store.state` when using the class directly
 * - When using framework adapters (React/Solid), use `useStore` hooks for reactive state
 *
 * @example
 * ```ts
 * const tracker = KeyStateTracker.getInstance()
 *
 * // Access state directly
 * console.log(tracker.store.state.heldKeys) // ['Control', 'Shift']
 *
 * // Subscribe to changes with TanStack Store
 * const unsubscribe = tracker.store.subscribe(() => {
 *   console.log('Currently held:', tracker.store.state.heldKeys)
 * })
 *
 * // Check current state
 * console.log(tracker.getHeldKeys()) // ['Control', 'Shift']
 * console.log(tracker.isKeyHeld('Control')) // true
 *
 * // Cleanup
 * unsubscribe()
 * ```
 */
export class KeyStateTracker {
  static #instance: KeyStateTracker | null = null

  /**
   * The TanStack Store instance containing the tracker state.
   * Use this to subscribe to state changes or access current state.
   */
  readonly store: Store<KeyStateTrackerState> = new Store(
    getDefaultKeyStateTrackerState(),
  )

  #heldKeysSet: Set<string> = new Set()
  #keydownListener: ((event: KeyboardEvent) => void) | null = null
  #keyupListener: ((event: KeyboardEvent) => void) | null = null
  #blurListener: (() => void) | null = null

  private constructor() {
    this.#setupListeners()
  }

  /**
   * Gets the singleton instance of KeyStateTracker.
   */
  static getInstance(): KeyStateTracker {
    if (!KeyStateTracker.#instance) {
      KeyStateTracker.#instance = new KeyStateTracker()
    }
    return KeyStateTracker.#instance
  }

  /**
   * Resets the singleton instance. Useful for testing.
   */
  static resetInstance(): void {
    if (KeyStateTracker.#instance) {
      KeyStateTracker.#instance.destroy()
      KeyStateTracker.#instance = null
    }
  }

  /**
   * Sets up the keyboard event listeners.
   */
  #setupListeners(): void {
    if (typeof document === 'undefined') {
      return // SSR safety
    }

    this.#keydownListener = (event: KeyboardEvent) => {
      const key = normalizeKeyName(event.key)
      if (!this.#heldKeysSet.has(key)) {
        this.#heldKeysSet.add(key)
        this.#syncState()
      }
    }

    this.#keyupListener = (event: KeyboardEvent) => {
      const key = normalizeKeyName(event.key)
      if (this.#heldKeysSet.has(key)) {
        this.#heldKeysSet.delete(key)
        this.#syncState()
      }
    }

    // Clear all keys when window loses focus (keys might be released while not focused)
    this.#blurListener = () => {
      if (this.#heldKeysSet.size > 0) {
        this.#heldKeysSet.clear()
        this.#syncState()
      }
    }

    document.addEventListener('keydown', this.#keydownListener)
    document.addEventListener('keyup', this.#keyupListener)
    window.addEventListener('blur', this.#blurListener)
  }

  /**
   * Syncs the internal Set to the Store state.
   */
  #syncState(): void {
    this.store.setState(() => ({
      heldKeys: Array.from(this.#heldKeysSet),
    }))
  }

  /**
   * Removes the keyboard event listeners.
   */
  #removeListeners(): void {
    if (typeof document === 'undefined') {
      return
    }

    if (this.#keydownListener) {
      document.removeEventListener('keydown', this.#keydownListener)
      this.#keydownListener = null
    }

    if (this.#keyupListener) {
      document.removeEventListener('keyup', this.#keyupListener)
      this.#keyupListener = null
    }

    if (this.#blurListener) {
      window.removeEventListener('blur', this.#blurListener)
      this.#blurListener = null
    }
  }

  /**
   * Gets an array of currently held key names.
   *
   * @returns Array of key names currently being pressed
   */
  getHeldKeys(): Array<string> {
    return this.store.state.heldKeys
  }

  /**
   * Checks if a specific key is currently being held.
   *
   * @param key - The key name to check (case-insensitive)
   * @returns True if the key is currently held
   */
  isKeyHeld(key: string): boolean {
    const normalizedKey = normalizeKeyName(key)
    return this.#heldKeysSet.has(normalizedKey)
  }

  /**
   * Checks if any of the given keys are currently held.
   *
   * @param keys - Array of key names to check
   * @returns True if any of the keys are currently held
   */
  isAnyKeyHeld(keys: Array<string>): boolean {
    return keys.some((key) => this.isKeyHeld(key))
  }

  /**
   * Checks if all of the given keys are currently held.
   *
   * @param keys - Array of key names to check
   * @returns True if all of the keys are currently held
   */
  areAllKeysHeld(keys: Array<string>): boolean {
    return keys.every((key) => this.isKeyHeld(key))
  }

  /**
   * Subscribes to key state changes.
   *
   * @deprecated Use `tracker.store.subscribe()` or `useStore()` from `@tanstack/react-store` instead.
   * @param listener - Function to call when key state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: KeyStateListener): () => void {
    // Immediately call with current state for backwards compatibility
    listener(this.getHeldKeys())

    // Subscribe to store changes
    return this.store.subscribe(() => {
      listener(this.getHeldKeys())
    })
  }

  /**
   * Destroys the tracker and removes all listeners.
   */
  destroy(): void {
    this.#removeListeners()
    this.#heldKeysSet.clear()
    this.store.setState(() => getDefaultKeyStateTrackerState())
  }
}

/**
 * Gets the singleton KeyStateTracker instance.
 * Convenience function for accessing the tracker.
 */
export function getKeyStateTracker(): KeyStateTracker {
  return KeyStateTracker.getInstance()
}
