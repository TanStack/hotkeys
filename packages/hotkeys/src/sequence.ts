import { detectPlatform } from './constants'
import { parseHotkey } from './parse'
import { matchesKeyboardEvent } from './match'
import type { HotkeyOptions } from './hotkey-manager'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  ParsedHotkey,
} from './hotkey'

/**
 * Options for hotkey sequence matching.
 */
export interface SequenceOptions extends HotkeyOptions {
  /** Timeout between keys in milliseconds. Default: 1000 */
  timeout?: number
}

/**
 * A sequence of hotkeys for Vim-style shortcuts.
 *
 * @example
 * ```ts
 * const gotoTop: HotkeySequence = ['G', 'G']  // gg
 * const deleteLine: HotkeySequence = ['D', 'D']  // dd
 * const deleteWord: HotkeySequence = ['D', 'I', 'W']  // diw
 * ```
 */
export type HotkeySequence = Array<Hotkey>

/**
 * Default timeout between keys in a sequence (in milliseconds).
 */
const DEFAULT_SEQUENCE_TIMEOUT = 1000

let sequenceIdCounter = 0

/**
 * Generates a unique ID for sequence registrations.
 */
function generateSequenceId(): string {
  return `sequence_${++sequenceIdCounter}`
}

/**
 * Computes the default ignoreInputs value for a sequence based on its first step.
 * Uses the same logic as HotkeyManager: Ctrl/Meta combos and Escape fire in inputs;
 * single keys and Shift/Alt combos are ignored.
 */
function getDefaultIgnoreInputsForSequence(
  parsedSequence: Array<ParsedHotkey>,
): boolean {
  const firstStep = parsedSequence[0]
  if (!firstStep) return true
  if (firstStep.ctrl || firstStep.meta) return false
  if (firstStep.key === 'Escape') return false
  return true
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
  currentIndex: number
  lastKeyTime: number
}

/**
 * Manages keyboard sequence matching for Vim-style shortcuts.
 *
 * This class allows registering multi-key sequences like 'g g' or 'd d'
 * that trigger callbacks when the full sequence is pressed within
 * a configurable timeout.
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
export class SequenceManager {
  static #instance: SequenceManager | null = null

  #registrations: Map<string, SequenceRegistration> = new Map()
  #keydownListener: ((event: KeyboardEvent) => void) | null = null
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

  /**
   * Registers a hotkey sequence handler.
   *
   * @param sequence - Array of hotkey strings that form the sequence
   * @param callback - Function to call when the sequence is completed
   * @param options - Options for the sequence behavior
   * @returns A function to unregister the sequence
   */
  register(
    sequence: HotkeySequence,
    callback: HotkeyCallback,
    options: SequenceOptions = {},
  ): () => void {
    if (sequence.length === 0) {
      throw new Error('Sequence must contain at least one hotkey')
    }

    const id = generateSequenceId()
    const platform = options.platform ?? this.#platform
    const parsedSequence = sequence.map((hotkey) =>
      parseHotkey(hotkey, platform),
    )

    const resolvedIgnoreInputs =
      options.ignoreInputs ?? getDefaultIgnoreInputsForSequence(parsedSequence)

    const registration: SequenceRegistration = {
      id,
      sequence,
      parsedSequence,
      callback,
      options: {
        timeout: DEFAULT_SEQUENCE_TIMEOUT,
        preventDefault: true,
        stopPropagation: true,
        enabled: true,
        ...options,
        platform,
        ignoreInputs: resolvedIgnoreInputs,
      },
      currentIndex: 0,
      lastKeyTime: 0,
    }

    this.#registrations.set(id, registration)
    this.#ensureListener()

    return () => {
      this.#unregister(id)
    }
  }

  /**
   * Unregisters a sequence by its registration ID.
   */
  #unregister(id: string): void {
    this.#registrations.delete(id)

    if (this.#registrations.size === 0) {
      this.#removeListener()
    }
  }

  /**
   * Ensures the keydown listener is attached.
   */
  #ensureListener(): void {
    if (typeof document === 'undefined') {
      return // SSR safety
    }

    if (!this.#keydownListener) {
      this.#keydownListener = this.#handleKeyDown.bind(this)
      document.addEventListener('keydown', this.#keydownListener)
    }
  }

  /**
   * Removes the keydown listener.
   */
  #removeListener(): void {
    if (typeof document === 'undefined') {
      return
    }

    if (this.#keydownListener) {
      document.removeEventListener('keydown', this.#keydownListener)
      this.#keydownListener = null
    }
  }

  /**
   * Checks if an element is an input-like element that should be ignored.
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

    if (element instanceof HTMLElement) {
      const contentEditable = element.contentEditable
      if (contentEditable === 'true' || contentEditable === '') {
        return true
      }
    }

    return false
  }

  /**
   * Handles keydown events for sequence matching.
   */
  #handleKeyDown(event: KeyboardEvent): void {
    const now = Date.now()

    for (const registration of this.#registrations.values()) {
      if (!registration.options.enabled) {
        continue
      }

      // Check if we should ignore input elements
      if (registration.options.ignoreInputs !== false) {
        if (this.#isInputElement(event.target)) {
          continue
        }
      }

      const timeout = registration.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT

      // Check if sequence has timed out
      if (
        registration.currentIndex > 0 &&
        now - registration.lastKeyTime > timeout
      ) {
        // Reset the sequence
        registration.currentIndex = 0
      }

      const expectedHotkey =
        registration.parsedSequence[registration.currentIndex]
      if (!expectedHotkey) {
        continue
      }

      // Check if current key matches the expected key in sequence
      if (
        matchesKeyboardEvent(
          event,
          expectedHotkey,
          registration.options.platform,
        )
      ) {
        registration.lastKeyTime = now
        registration.currentIndex++

        // Check if sequence is complete
        if (registration.currentIndex >= registration.parsedSequence.length) {
          // Sequence complete!
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

          registration.callback(event, context)

          // Reset for next sequence
          registration.currentIndex = 0
        }
      } else if (registration.currentIndex > 0) {
        // Key didn't match and we were in the middle of a sequence
        // Check if it matches the start of the sequence (for overlapping sequences)
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
          // Reset the sequence
          registration.currentIndex = 0
        }
      }
    }
  }

  /**
   * Resets all sequence progress.
   */
  resetAll(): void {
    for (const registration of this.#registrations.values()) {
      registration.currentIndex = 0
      registration.lastKeyTime = 0
    }
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
    this.#removeListener()
    this.#registrations.clear()
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

      // Check timeout
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
        // Check if it matches start of sequence
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
