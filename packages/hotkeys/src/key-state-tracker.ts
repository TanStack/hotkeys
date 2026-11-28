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
  /**
   * Whether each lock key is on. `null` while no browser event has reported
   * it: until the user presses a key, clicks, or moves the mouse, after the
   * window loses focus or the page is hidden, and always for Num Lock and Scroll Lock on macOS and
   * iOS, where browsers don't report them.
   */
  locks: Record<LockKey, boolean | null>
}

/** A lock key that browsers report through `getModifierState()`. */
export type LockKey = 'CapsLock' | 'NumLock' | 'ScrollLock'

const LOCK_KEYS: Array<LockKey> = ['CapsLock', 'NumLock', 'ScrollLock']

function unknownLocks(): Record<LockKey, boolean | null> {
  return { CapsLock: null, NumLock: null, ScrollLock: null }
}

/**
 * Returns the default state for KeyStateTracker.
 */
function getDefaultKeyStateTrackerState(): KeyStateTrackerState {
  return {
    heldKeys: [],
    heldCodes: {},
    locks: unknownLocks(),
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
  /** Read once, since mousemove reads lock state many times a second. */
  #mac = detectPlatform() === 'mac'
  /** Lock key states, published with the next held key or lock change. */
  #locks = unknownLocks()
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
    // SSR safety. The listeners go on the window. Some server DOM shims
    // define a `document` without one, and FastBoot's `window` can't listen.
    if (
      typeof window === 'undefined' ||
      typeof window.addEventListener !== 'function'
    ) {
      return
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (isKeyless(event)) return
      const locksChanged = this.#readLocks(event)
      let changed = this.#reconcileModifiers(event)
      const key = normalizeKeyName(event.key)
      const identity = event.code || `key:${key}`
      // An input method's keydown (`Process`, key code 229) names no key,
      // and its keyup may never come. A modifier still counts as held.
      if (
        (MODIFIER_KEYS.has(key) ||
          key === 'AltGraph' ||
          (!event.isComposing && event.keyCode !== 229)) &&
        !this.#heldEntries.has(identity)
      ) {
        this.#heldEntries.set(identity, { key, code: event.code })
        changed = true
      }
      this.#publish(changed, locksChanged)
    }

    const onKeyup = (event: KeyboardEvent) => {
      if (isKeyless(event)) return
      const locksChanged = this.#readLocks(event)
      // A keyup only removes entries, so a smaller map means held keys changed.
      const size = this.#heldEntries.size
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
      if (key === 'Meta' && this.#mac) {
        this.#releaseNonModifiers()
      }

      this.#publish(this.#heldEntries.size !== size, locksChanged)
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
      const locksChanged = this.#readLocks(event)
      this.#publish(this.#reconcileModifiers(event), locksChanged)
    }

    // Clear all keys when window loses focus (keys might be released while
    // not focused). Lock keys can change in another app, so they're unknown.
    const onBlur = () => {
      const locksChanged = this.#updateLocks(unknownLocks())
      const held = this.#heldEntries.size > 0
      this.#heldEntries.clear()
      this.#publish(held, locksChanged)
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
      // Switching tabs or apps can hide the page without a window blur. The
      // event bubbles from the document, so capture it like the key events.
      ['visibilitychange', () => document.hidden && onBlur(), true],
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
    const size = this.#heldEntries.size
    if (event.isTrusted) {
      for (const [identity, entry] of this.#heldEntries) {
        const released =
          (entry.key === 'Control' && !event.ctrlKey) ||
          (entry.key === 'Alt' && !event.altKey) ||
          (entry.key === 'Shift' && !event.shiftKey) ||
          (entry.key === 'Meta' && !event.metaKey) ||
          // AltGr has no event flag, only modifier state. A missed AltGr
          // keyup otherwise hides every hint until the window blurs.
          (entry.key === 'AltGraph' &&
            typeof event.getModifierState === 'function' &&
            !event.getModifierState('AltGraph'))
        if (released) this.#heldEntries.delete(identity)
      }
    }
    return this.#heldEntries.size !== size
  }

  /**
   * Reads lock key states from real user input. Events dispatched by page
   * code report every lock as off. Mouse events still reach an unfocused
   * window, where a lock can change in another app without a new blur, so
   * those are skipped. macOS has no Num Lock or Scroll Lock: Chrome reports
   * them off, and Firefox reports Num Lock for numpad keys.
   */
  #readLocks(event: KeyboardEvent | MouseEvent): boolean {
    if (
      !event.isTrusted ||
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      !event.getModifierState ||
      !document.hasFocus()
    ) {
      return false
    }
    const locks = unknownLocks()
    for (const key of LOCK_KEYS) {
      if (key === 'CapsLock' || !this.#mac)
        locks[key] = event.getModifierState(key)
    }
    return this.#updateLocks(locks)
  }

  /** Stores lock key states for the next publish. Returns whether any changed. */
  #updateLocks(locks: Record<LockKey, boolean | null>): boolean {
    if (LOCK_KEYS.every((key) => locks[key] === this.#locks[key])) return false
    this.#locks = locks
    return true
  }

  /**
   * Publishes one state per event. A held key change rebuilds the held key
   * state and carries the locks with it. A lock change alone keeps the held
   * key arrays, so held key selectors don't see a new value.
   */
  #publish(heldChanged: boolean, locksChanged: boolean): void {
    if (heldChanged) this.#syncState()
    else if (locksChanged) {
      this.store.setState((state) => ({ ...state, locks: this.#locks }))
    }
  }

  /** Forgets every held key that isn't a modifier. Returns whether any was held. */
  #releaseNonModifiers(): boolean {
    const size = this.#heldEntries.size
    for (const [identity, entry] of this.#heldEntries) {
      if (!MODIFIER_KEYS.has(entry.key)) this.#heldEntries.delete(identity)
    }
    return this.#heldEntries.size !== size
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
    this.store.setState((state) => ({
      ...state,
      heldKeys,
      heldCodes,
      locks: this.#locks,
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
   * Whether a lock key is on. Returns `null` while no browser event has
   * reported it: until the user presses a key, clicks, or moves the mouse,
   * after the window loses focus or the page is hidden, and always for Num Lock and Scroll Lock on
   * macOS and iOS.
   *
   * @param key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'`
   * @returns `true` when the lock is on, `false` when it is off, or `null`
   */
  getKeyLockState(key: LockKey): boolean | null {
    return this.store.state.locks[key]
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
    this.#locks = unknownLocks()
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

/**
 * Whether a key event names no key at all. Chrome autofill sends a trusted
 * plain `Event` named keydown or keyup, without modifier flags, so it says
 * nothing about which keys are held.
 */
function isKeyless(event: KeyboardEvent): boolean {
  return !event.key && !event.code
}
