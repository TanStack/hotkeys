import { createStore } from './_store'
import { MODIFIER_KEYS, normalizeKeyName } from './constants'
import { detectPlatform } from './platform'
import type { Store } from './_store'
import type { KeyIdentity } from './key.types'

/**
 * State interface for the KeyStateTracker.
 */
export interface KeyStateTrackerState {
  /**
   * Array of currently held key names (normalized, e.g. "Control", "A").
   */
  heldKeys: Array<string>
  /**
   * Map from normalized key name to the physical `event.code` (e.g. "KeyA", "ShiftLeft").
   * Useful for debugging which physical key was pressed.
   */
  heldCodes: Record<string, string>
}

/**
 * Returns the default state for KeyStateTracker.
 */
function getDefaultKeyStateTrackerState(): KeyStateTrackerState {
  return {
    heldKeys: [],
    heldCodes: {},
  }
}

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
 * - When using framework adapters (React), use `useHeldKeys` and `useHeldKeyCodes` hooks for reactive state
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
  readonly store: Store<KeyStateTrackerState> = createStore(
    getDefaultKeyStateTrackerState(),
  )

  #heldEntries: Map<string, KeyIdentity> = new Map()
  /** Window listeners as `[type, listener, capture]`, removed together on destroy. */
  #listeners: Array<[string, EventListener, boolean]> = []

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
    // SSR safety. The listeners go on the window, and some server DOM shims
    // define a `document` without one.
    if (typeof window === 'undefined') {
      return
    }

    const onKeydown = (event: KeyboardEvent) => {
      let changed = this.#reconcileModifiers(event)
      const key = normalizeKeyName(event.key)
      const identity = event.code || `key:${key}`
      if (!this.#heldEntries.has(identity)) {
        this.#heldEntries.set(identity, { key, code: event.code })
        changed = true
      }
      if (changed) this.#syncState()
    }

    const onKeyup = (event: KeyboardEvent) => {
      const key = normalizeKeyName(event.key)
      const identity = event.code || `key:${key}`
      this.#heldEntries.delete(identity)

      // Code-less keyup events can only be paired by their logical key.
      if (!event.code) {
        for (const [entryIdentity, entry] of this.#heldEntries) {
          if (entry.key === key) this.#heldEntries.delete(entryIdentity)
        }
      }

      this.#reconcileModifiers(event)

      // macOS swallows the keyup of a key released while Command is held,
      // such as S after Cmd+S, so releasing Command clears non-modifier keys
      // that would otherwise stay held. Other modifiers and platforms keep
      // their keyups, so a key held while Shift is tapped stays held.
      if (key === 'Meta' && detectPlatform() === 'mac') {
        this.#releaseNonModifiers()
      }

      this.#syncState()
    }

    // A native context menu takes focus without a blur, so the keyup of a
    // held key, such as the ContextMenu key itself, never arrives. A page
    // that prevented the event shows its own menu and keeps focus.
    const onContextMenu = (event: MouseEvent) => {
      if (event.defaultPrevented || !event.isTrusted) return
      // Modifiers are still reported on the event, so keep the held ones.
      const reconciled = this.#reconcileModifiers(event)
      if (this.#releaseNonModifiers() || reconciled) this.#syncState()
    }

    const onMouse = (event: MouseEvent) => {
      if (this.#reconcileModifiers(event)) this.#syncState()
    }

    // Clear all keys when window loses focus (keys might be released while not focused)
    const onBlur = () => {
      if (this.#heldEntries.size > 0) {
        this.#heldEntries.clear()
        this.#syncState()
      }
    }

    // Window capture runs before every page listener, and stopPropagation
    // doesn't stop other listeners on the same target, so no hotkey or
    // widget can hide keys from the tracker.
    this.#listeners = [
      ['keydown', onKeydown as EventListener, true],
      ['keyup', onKeyup as EventListener, true],
      ['mousemove', onMouse as EventListener, true],
      ['mousedown', onMouse as EventListener, true],
      ['blur', onBlur, false],
      ['contextmenu', onContextMenu as EventListener, false],
      // Switching tabs or apps can hide the page without a window blur.
      ['visibilitychange', () => document.hidden && onBlur(), false],
    ]
    for (const [type, listener, capture] of this.#listeners) {
      window.addEventListener(type, listener, capture)
    }
  }

  /**
   * Removes modifiers whose release was missed without a window blur.
   * Event modifier state is shared by left/right keys, so a true flag keeps
   * both physical entries until their individual keyup events arrive.
   * Only real user input counts: events dispatched by page code report no
   * modifiers and would clear keys the user is still holding.
   */
  #reconcileModifiers(event: KeyboardEvent | MouseEvent): boolean {
    if (!event.isTrusted) return false
    let changed = false
    for (const [identity, entry] of this.#heldEntries) {
      const released =
        (entry.key === 'Control' && !event.ctrlKey) ||
        (entry.key === 'Alt' && !event.altKey) ||
        (entry.key === 'Shift' && !event.shiftKey) ||
        (entry.key === 'Meta' && !event.metaKey)
      if (released) {
        this.#heldEntries.delete(identity)
        changed = true
      }
    }
    return changed
  }

  /** Forgets every held key that isn't a modifier. Returns whether any was held. */
  #releaseNonModifiers(): boolean {
    let changed = false
    for (const [identity, entry] of this.#heldEntries) {
      if (!MODIFIER_KEYS.has(entry.key)) {
        this.#heldEntries.delete(identity)
        changed = true
      }
    }
    return changed
  }

  /**
   * Syncs the internal Set to the Store state.
   */
  #syncState(): void {
    const heldKeys = Array.from(
      new Set(Array.from(this.#heldEntries.values(), (entry) => entry.key)),
    )
    const heldCodes = Object.fromEntries(
      Array.from(this.#heldEntries.values(), (entry) => [
        entry.key,
        entry.code,
      ]),
    )
    this.store.setState(() => ({
      heldKeys,
      heldCodes,
    }))
  }

  /**
   * Removes the keyboard event listeners.
   */
  #removeListeners(): void {
    for (const [type, listener, capture] of this.#listeners) {
      window.removeEventListener(type, listener, capture)
    }
    this.#listeners = []
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
   * Letters match in any case. Other key names are case-sensitive, so
   * `'escape'` doesn't match `Escape`. Every adapter's key-hold helper uses
   * this rule.
   *
   * @param key - The key name to check, such as `'A'`, `'Shift'`, or `'Escape'`
   * @returns True if the key is currently held
   */
  isKeyHeld(key: string): boolean {
    const normalizedKey = normalizeKeyName(key)
    return Array.from(this.#heldEntries.values()).some(
      (entry) => entry.key === normalizedKey,
    )
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
   * Destroys the tracker and removes all listeners.
   */
  destroy(): void {
    this.#removeListeners()
    this.#heldEntries.clear()
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
