import { Store } from '@tanstack/store'
import { findHotkeyConflicts } from './conflicts'
import {
  beginRecording,
  captureRecordingEvent,
  endRecording,
} from './_recording-guard'
import { chordRejection, hotkeyChordFromKeydown } from './_recorder-chord'
import { normalizeKeyboardEvent } from './_keyboard-event'
import { isModifierKey, parseHotkey, simplifyHotkey } from './parse'
import { validateHotkey } from './validate'
import { detectPlatform } from './platform'
import { isTypingEvent } from './_event-target'
import type {
  HotkeyRecorderValidationContext,
  RecorderOptions,
  RecorderRejection,
} from './recorder-options'
import type { Hotkey, HotkeyChord, HotkeySequence } from './hotkey.types'

/**
 * State interface for the HotkeyRecorder.
 */
export interface HotkeyRecorderState {
  /** Whether recording is currently active */
  isRecording: boolean
  /** Chords recorded so far in a multi-step recording (empty for `maxSteps: 1`) */
  steps: HotkeySequence
  /** The last committed hotkey: a chord, or a sequence of two or more steps */
  recordedHotkey: Hotkey | null
}

/** Which keys commit a multi-step recording before it reaches `maxSteps`. */
export type HotkeyRecorderCommitKeys = 'enter' | 'none'

interface HotkeyRecorderBaseOptions extends RecorderOptions {
  /** Optional callback when recording is cancelled (Escape pressed) */
  onCancel?: () => void
  /**
   * Optional callback when the recording is cleared: Backspace/Delete with no
   * modifiers and no recorded steps
   */
  onClear?: () => void
  /**
   * Whether to ignore keyboard events from input-like elements (text inputs,
   * textarea, select, contenteditable) while recording. When true, typing in
   * inputs passes through normally (Escape still cancels). Defaults to true.
   */
  ignoreInputs?: boolean
}

/** Options for recording a single chord. This is the default (`maxSteps: 1`). */
export interface HotkeyChordRecorderOptions extends HotkeyRecorderBaseOptions {
  /** Maximum number of chords to record. Default: 1 */
  maxSteps?: 1
  /** Return true to accept, or false/a message to reject while staying in recording mode. */
  validate?: (
    hotkey: HotkeyChord,
    context: HotkeyRecorderValidationContext,
  ) => boolean | string
  /** Callback when a chord is successfully recorded */
  onRecord: (hotkey: HotkeyChord) => void
}

/**
 * Options for recording up to `maxSteps` chords. A one-step recording commits
 * as a chord string; two or more steps commit as a sequence.
 */
export interface HotkeySequenceRecorderOptions extends HotkeyRecorderBaseOptions {
  /** Maximum number of chords to record. Reaching it commits automatically. Use `Infinity` for no limit. */
  maxSteps: number
  /** Return true to accept, or false/a message to reject while staying in recording mode. */
  validate?: (
    hotkey: Hotkey,
    context: HotkeyRecorderValidationContext,
  ) => boolean | string
  /** Callback when a hotkey is successfully recorded */
  onRecord: (hotkey: Hotkey) => void
  /** Whether plain Enter commits the recorded steps. Default: 'enter' */
  commitKeys?: HotkeyRecorderCommitKeys
  /** Commit automatically after this many milliseconds without a new step. Disabled when unset or 0. */
  idleTimeoutMs?: number
}

/**
 * Options for HotkeyRecorder. `maxSteps` (default 1) selects between recording
 * a single chord and recording a sequence.
 */
export type HotkeyRecorderOptions =
  HotkeyChordRecorderOptions | HotkeySequenceRecorderOptions

/** Internal view of either options shape. */
type ResolvedRecorderOptions = HotkeyRecorderBaseOptions & {
  maxSteps?: number
  validate?: (
    hotkey: Hotkey,
    context: HotkeyRecorderValidationContext,
  ) => boolean | string
  onRecord: (hotkey: Hotkey) => void
  commitKeys?: HotkeyRecorderCommitKeys
  idleTimeoutMs?: number
}

const initialState: HotkeyRecorderState = {
  isRecording: false,
  steps: [],
  recordedHotkey: null,
}

/**
 * Framework-agnostic class for recording keyboard shortcuts.
 *
 * With the default `maxSteps: 1`, the first valid chord commits. With a larger
 * `maxSteps`, each chord adds a step; the recording commits on Enter (unless
 * `commitKeys: 'none'`), after `idleTimeoutMs`, or when it reaches `maxSteps`.
 * Backspace/Delete removes the last step, and on an empty recording calls
 * `onClear`. Escape cancels. A one-step result is a chord string.
 *
 * State Management:
 * - Uses TanStack Store for reactive state management
 * - State can be accessed via `recorder.store.state` when using the class directly
 * - When using framework adapters, use the `useHotkeyRecorder` hook for reactive state
 *
 * @example
 * ```ts
 * const recorder = new HotkeyRecorder({
 *   onRecord: (hotkey) => {
 *     console.log('Recorded:', hotkey) // 'Mod+S'
 *   },
 * })
 *
 * const sequenceRecorder = new HotkeyRecorder({
 *   maxSteps: 3,
 *   onRecord: (hotkey) => {
 *     console.log('Recorded:', hotkey) // 'Mod+S' or ['G', 'H']
 *   },
 * })
 *
 * recorder.start()
 * // ... later
 * recorder.destroy()
 * ```
 */
export class HotkeyRecorder {
  readonly store: Store<HotkeyRecorderState> = new Store<HotkeyRecorderState>(
    initialState,
  )

  #keydownHandler: ((event: KeyboardEvent) => void) | null = null
  #optionsSource: HotkeyRecorderOptions | (() => HotkeyRecorderOptions)
  #optionOverrides: Partial<ResolvedRecorderOptions> = {}
  #platform: 'mac' | 'windows' | 'linux'
  #events: Array<KeyboardEvent> = []
  #idleTimer: ReturnType<typeof setTimeout> | null = null

  get #options(): ResolvedRecorderOptions {
    return {
      ...((typeof this.#optionsSource === 'function'
        ? this.#optionsSource()
        : this.#optionsSource) as ResolvedRecorderOptions),
      ...this.#optionOverrides,
    }
  }

  get #maxSteps(): number {
    return Math.max(1, this.#options.maxSteps ?? 1)
  }

  constructor(
    options: HotkeyChordRecorderOptions | (() => HotkeyChordRecorderOptions),
  )
  constructor(
    options:
      HotkeySequenceRecorderOptions | (() => HotkeySequenceRecorderOptions),
  )
  constructor(options: HotkeyRecorderOptions | (() => HotkeyRecorderOptions)) {
    this.#optionsSource = options
    this.#platform = detectPlatform()
  }

  /**
   * Updates the recorder options, including callbacks.
   * This allows framework adapters to sync callback changes without recreating the recorder.
   */
  setOptions(options: Partial<HotkeyRecorderOptions>): void {
    this.#optionOverrides = {
      ...this.#optionOverrides,
      ...(options as Partial<ResolvedRecorderOptions>),
    }
  }

  #clearIdleTimer(): void {
    if (this.#idleTimer !== null) {
      clearTimeout(this.#idleTimer)
      this.#idleTimer = null
    }
  }

  #scheduleIdleTimer(): void {
    this.#clearIdleTimer()
    const ms = this.#maxSteps > 1 ? this.#options.idleTimeoutMs : undefined
    if (ms === undefined || ms <= 0 || this.store.state.steps.length === 0) {
      return
    }
    this.#idleTimer = setTimeout(() => {
      this.#idleTimer = null
      if (this.#keydownHandler && this.store.state.steps.length >= 1) {
        this.commit()
      }
    }, ms)
  }

  /**
   * Start recording a new hotkey.
   *
   * Sets up a keydown event listener that captures keyboard events
   * and records chords according to `maxSteps`.
   */
  start(): void {
    // Prevent starting recording if already recording
    if (this.#keydownHandler) {
      return
    }

    this.#clearIdleTimer()
    this.#events = []
    beginRecording(this)
    this.store.setState(() => ({ ...initialState, isRecording: true }))

    const handler = (event: KeyboardEvent) => {
      // Check if we're still recording (handler might be called after stop/cancel)
      if (!this.#keydownHandler) {
        return
      }

      // If ignoreInputs is enabled (default) and focus is in a text field,
      // let the event pass through so the user can type normally. Buttons
      // don't count: focus often stays on the button that started recording.
      // Escape is the exception — it should always cancel recording.
      if (
        this.#options.ignoreInputs !== false &&
        event.key !== 'Escape' &&
        isTypingEvent(event, document)
      )
        return

      const platform = this.#options.platform ?? this.#platform
      if (normalizeKeyboardEvent(event, platform).isComposing) return
      captureRecordingEvent(event)
      event.preventDefault()
      event.stopPropagation()
      if (event.repeat) return

      if (event.key === 'Escape') {
        this.cancel()
        return
      }

      const unmodified =
        !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
      const multiStep = this.#maxSteps > 1

      // Backspace/Delete removes the last step, or clears an empty recording
      if ((event.key === 'Backspace' || event.key === 'Delete') && unmodified) {
        if (this.store.state.steps.length === 0) {
          this.stop()
          this.#options.onClear?.()
          return
        }
        this.#events.pop()
        this.store.setState((s) => ({ ...s, steps: s.steps.slice(0, -1) }))
        if (this.store.state.steps.length === 0) this.#clearIdleTimer()
        else this.#scheduleIdleTimer()
        return
      }

      const options = this.#options
      const enterCommits =
        multiStep &&
        options.commitKeys !== 'none' &&
        event.key === 'Enter' &&
        unmodified
      if (enterCommits) {
        if (this.store.state.steps.length >= 1) this.commit()
        return
      }

      if (isModifierKey(event.key) || event.key === 'AltGraph') return
      const rejection = chordRejection(event, { ...options, platform })
      if (rejection) {
        options.onReject?.(rejection)
        return
      }
      const chord = hotkeyChordFromKeydown(event, platform, options.recordBy)
      if (chord === null) {
        return
      }

      const validation = validateHotkey(chord)
      if (!validation.valid) {
        options.onReject?.({
          reason: 'invalid',
          message: validation.errors.join('; '),
          hotkey: chord,
        })
        return
      }

      this.#events.push(event)
      this.store.setState((s) => ({ ...s, steps: [...s.steps, chord] }))
      if (this.store.state.steps.length >= this.#maxSteps) {
        this.commit()
      } else {
        this.#scheduleIdleTimer()
      }
    }

    this.#keydownHandler = handler
    this.#addListener(handler)
  }

  /**
   * Commits the recorded steps after validation and conflict checks.
   * Called automatically at `maxSteps`, on Enter, or after `idleTimeoutMs`.
   * A rejected commit leaves recording active with its steps intact.
   */
  commit(): void {
    const steps = this.store.state.steps
    if (steps.length < 1) {
      return
    }

    const options = this.#options
    const platform = options.platform ?? this.#platform
    const hotkey = simplifyHotkey(steps)
    const single = this.#maxSteps === 1
    this.#clearIdleTimer()

    const rejectAndKeepRecording = (rejection: RecorderRejection) => {
      // A single-chord recording waits for a new chord rather than editing steps.
      if (single) {
        this.#events = []
        this.store.setState((s) => ({ ...s, steps: [] }))
      }
      options.onReject?.(rejection)
    }

    const parsedSequence = steps.map((step) => parseHotkey(step, platform))
    const accepted = options.validate?.(hotkey, {
      event: this.#events[this.#events.length - 1]!,
      parsedHotkey: parsedSequence[parsedSequence.length - 1]!,
      events: [...this.#events],
      parsedSequence,
    })
    if (accepted !== undefined && accepted !== true) {
      rejectAndKeepRecording({
        reason: 'validation',
        message:
          typeof accepted === 'string'
            ? accepted
            : `This ${single ? 'shortcut' : 'sequence'} is not allowed.`,
        hotkey,
      })
      return
    }

    if (options.detectConflicts) {
      const conflicts = findHotkeyConflicts(hotkey, {
        ...(typeof options.detectConflicts === 'object'
          ? options.detectConflicts
          : {}),
        platform,
        events: this.#events,
      })
      if (conflicts.length) {
        rejectAndKeepRecording({
          reason: 'conflict',
          message: `This ${single ? 'shortcut' : 'sequence'} conflicts with a registered hotkey.`,
          hotkey,
          conflicts,
        })
        return
      }
    }

    this.#finish(hotkey)
    options.onRecord(hotkey)
  }

  /** Stops listening and stores the final state. */
  #finish(recordedHotkey: Hotkey | null): void {
    endRecording(this)
    this.#events = []
    this.#clearIdleTimer()
    // Remove listener FIRST to prevent any additional events
    if (this.#keydownHandler) {
      this.#removeListener(this.#keydownHandler)
      this.#keydownHandler = null
    }
    this.store.setState(() => ({ ...initialState, recordedHotkey }))
  }

  /**
   * Stop recording (same as cancel, but doesn't call onCancel).
   *
   * Removes the event listener and resets the recording state.
   */
  stop(): void {
    this.#finish(null)
  }

  /**
   * Cancel recording without saving.
   *
   * Removes the event listener, resets the recording state, and calls
   * the onCancel callback if provided.
   */
  cancel(): void {
    this.#finish(null)
    this.#options.onCancel?.()
  }

  #addListener(handler: (event: KeyboardEvent) => void): void {
    if (typeof document === 'undefined') {
      return // SSR safety
    }

    document.addEventListener('keydown', handler, true)
  }

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
    this.#finish(null)
  }
}
