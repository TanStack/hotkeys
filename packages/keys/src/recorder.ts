import { Store } from '@tanstack/store'
import { detectPlatform } from './constants'
import {
  convertToModFormat,
  hasNonModifierKey,
  isModifierKey,
  keyboardEventToHotkey,
} from './parse'
import type { Hotkey } from './hotkey'

/**
 * State interface for the HotkeyRecorder.
 */
export interface HotkeyRecorderState {
  /** Whether recording is currently active */
  isRecording: boolean
  /** The currently recorded hotkey (for live preview) */
  recordedHotkey: Hotkey | null
}

/**
 * Options for configuring a HotkeyRecorder instance.
 */
export interface HotkeyRecorderOptions {
  /** Callback when a hotkey is successfully recorded */
  onRecord: (hotkey: Hotkey) => void
  /** Optional callback when recording is cancelled (Escape pressed) */
  onCancel?: () => void
  /** Optional callback when shortcut is cleared (Backspace/Delete pressed) */
  onClear?: () => void
}

/**
 * Framework-agnostic class for recording keyboard shortcuts.
 *
 * This class handles all the complexity of capturing keyboard events,
 * converting them to hotkey strings, and handling edge cases like
 * Escape to cancel or Backspace/Delete to clear.
 *
 * State Management:
 * - Uses TanStack Store for reactive state management
 * - State can be accessed via `recorder.store.state` when using the class directly
 * - When using framework adapters (React), use `useStore` hooks for reactive state
 *
 * @example
 * ```ts
 * const recorder = new HotkeyRecorder({
 *   onRecord: (hotkey) => {
 *     console.log('Recorded:', hotkey)
 *   },
 *   onCancel: () => {
 *     console.log('Recording cancelled')
 *   },
 * })
 *
 * // Start recording
 * recorder.start()
 *
 * // Access state directly
 * console.log(recorder.store.state.isRecording) // true
 *
 * // Subscribe to changes with TanStack Store
 * const unsubscribe = recorder.store.subscribe(() => {
 *   console.log('Recording:', recorder.store.state.isRecording)
 * })
 *
 * // Cleanup
 * recorder.destroy()
 * unsubscribe()
 * ```
 */
export class HotkeyRecorder {
  /**
   * The TanStack Store instance containing the recorder state.
   * Use this to subscribe to state changes or access current state.
   */
  readonly store: Store<HotkeyRecorderState> = new Store<HotkeyRecorderState>({
    isRecording: false,
    recordedHotkey: null,
  })

  #keydownHandler: ((event: KeyboardEvent) => void) | null = null
  #options: HotkeyRecorderOptions
  #platform: 'mac' | 'windows' | 'linux'

  constructor(options: HotkeyRecorderOptions) {
    this.#options = options
    this.#platform = detectPlatform()
  }

  /**
   * Updates the recorder options, including callbacks.
   * This allows framework adapters to sync callback changes without recreating the recorder.
   */
  setOptions(options: Partial<HotkeyRecorderOptions>): void {
    this.#options = {
      ...this.#options,
      ...options,
    }
  }

  /**
   * Start recording a new hotkey.
   *
   * Sets up a keydown event listener that captures keyboard events
   * and converts them to hotkey strings. Recording continues until
   * a valid hotkey is recorded, Escape is pressed, or stop/cancel is called.
   */
  start(): void {
    // Prevent starting recording if already recording
    if (this.#keydownHandler) {
      return
    }

    // Update store state
    this.store.setState(() => ({
      isRecording: true,
      recordedHotkey: null,
    }))

    // Create keydown handler
    const handler = (event: KeyboardEvent) => {
      // Check if we're still recording (handler might be called after stop/cancel)
      if (!this.#keydownHandler) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      // Handle Escape to cancel
      if (event.key === 'Escape') {
        this.cancel()
        return
      }

      // Handle Backspace/Delete to clear shortcut
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          this.#options.onClear?.()
          this.#options.onRecord('' as Hotkey)
          this.stop()
          return
        }
      }

      // Ignore pure modifier keys (wait for a non-modifier key)
      if (isModifierKey(event)) {
        return
      }

      // Convert event to hotkey string using library function
      const hotkey = keyboardEventToHotkey(event)

      // Always convert to Mod format for portability
      const finalHotkey = convertToModFormat(hotkey, this.#platform)

      // Validate: must have at least one non-modifier key
      if (hasNonModifierKey(finalHotkey, this.#platform)) {
        // Remove listener FIRST to prevent any additional events
        const handlerToRemove = this.#keydownHandler as
          | ((event: KeyboardEvent) => void)
          | null
        if (handlerToRemove) {
          this.#removeListener(handlerToRemove)
          this.#keydownHandler = null
        }

        // Update store state immediately
        this.store.setState(() => ({
          isRecording: false,
          recordedHotkey: finalHotkey,
        }))

        // Call callback AFTER listener is removed and state is set
        this.#options.onRecord(finalHotkey)
      }
    }

    this.#keydownHandler = handler
    this.#addListener(handler)
  }

  /**
   * Stop recording (same as cancel, but doesn't call onCancel).
   *
   * Removes the event listener and resets the recording state.
   */
  stop(): void {
    // Remove event listener immediately
    if (this.#keydownHandler) {
      this.#removeListener(this.#keydownHandler)
      this.#keydownHandler = null
    }

    // Update store state
    this.store.setState(() => ({
      isRecording: false,
      recordedHotkey: null,
    }))
  }

  /**
   * Cancel recording without saving.
   *
   * Removes the event listener, resets the recording state, and calls
   * the onCancel callback if provided.
   */
  cancel(): void {
    // Remove event listener immediately
    if (this.#keydownHandler) {
      this.#removeListener(this.#keydownHandler)
      this.#keydownHandler = null
    }

    // Update store state
    this.store.setState(() => ({
      isRecording: false,
      recordedHotkey: null,
    }))

    // Call cancel callback
    this.#options.onCancel?.()
  }

  /**
   * Adds the keydown event listener to the document.
   */
  #addListener(handler: (event: KeyboardEvent) => void): void {
    if (typeof document === 'undefined') {
      return // SSR safety
    }

    document.addEventListener('keydown', handler, true)
  }

  /**
   * Removes the keydown event listener from the document.
   */
  #removeListener(handler: (event: KeyboardEvent) => void): void {
    if (typeof document === 'undefined') {
      return
    }

    document.removeEventListener('keydown', handler, true)
  }

  /**
   * Clean up event listeners and reset state.
   *
   * Call this when you're done with the recorder to ensure
   * all event listeners are properly removed.
   */
  destroy(): void {
    this.stop()
    this.store.setState(() => ({
      isRecording: false,
      recordedHotkey: null,
    }))
  }
}
