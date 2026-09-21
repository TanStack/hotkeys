import { Store } from '@tanstack/store'
import { findHotkeyConflicts } from './conflicts'
import {
  beginRecording,
  captureRecordingEvent,
  endRecording,
} from './_recording-guard'
import { chordRejection, hotkeyChordFromKeydown } from './_recorder-chord'
import { normalizeKeyboardEvent } from './_keyboard-event'
import { isModifierKey, parseHotkey } from './parse'
import { validateHotkey } from './validate'
import { detectPlatform } from './platform'
import { shouldIgnoreInputEvent } from './_event-target'
import type {
  HotkeySequenceRecorderValidationContext,
  RecorderOptions,
} from './recorder-options'
import type { HotkeySequence } from './sequence-manager'

/**
 * How the user can commit a recorded sequence from the keyboard.
 * - `'enter'`: plain Enter (no modifiers) commits when at least one step exists.
 * - `'none'`: only {@link HotkeySequenceRecorder.commit} finishes recording (or idle timeout if set).
 */
export type HotkeySequenceRecorderCommitKeys = 'enter' | 'none'

/**
 * State interface for the HotkeySequenceRecorder.
 */
export interface HotkeySequenceRecorderState {
  /** Whether recording is currently active */
  isRecording: boolean
  /** Chords captured so far in the current recording session */
  steps: HotkeySequence
  /** The last successfully committed sequence, or null if none / after starting a new session */
  recordedSequence: HotkeySequence | null
}

/**
 * Options for configuring a HotkeySequenceRecorder instance.
 */
export interface HotkeySequenceRecorderOptions extends RecorderOptions {
  /** Validate the completed sequence. Rejection preserves the steps for editing. */
  validate?: (
    sequence: HotkeySequence,
    context: HotkeySequenceRecorderValidationContext,
  ) => boolean | string
  /** Callback when a sequence is successfully recorded */
  onRecord: (sequence: HotkeySequence) => void
  /** Optional callback when recording is cancelled (Escape pressed) */
  onCancel?: () => void
  /** Optional callback when the sequence is cleared (Backspace/Delete with no steps) */
  onClear?: () => void
  /**
   * Whether plain Enter commits the current steps. Ignored when {@link commitKeys} is `'none'`.
   * @default true
   */
  commitOnEnter?: boolean
  /**
   * Keyboard commit mode. When `'none'`, use {@link HotkeySequenceRecorder.commit} (and optional idle timeout).
   * @default 'enter'
   */
  commitKeys?: HotkeySequenceRecorderCommitKeys
  /**
   * Milliseconds of inactivity after the **last completed chord** before auto-committing.
   * The timer does not run while waiting for the first chord (`steps.length === 0`).
   */
  idleTimeoutMs?: number
  /**
   * Whether to ignore keyboard events from input-like elements (text inputs,
   * textarea, select, contenteditable). When true, typing in inputs passes
   * through normally instead of being captured as a sequence recording.
   * Escape always works regardless of this setting.
   * @default true
   */
  ignoreInputs?: boolean
}

const defaultHotkeySequenceRecorderOptions: Pick<
  HotkeySequenceRecorderOptions,
  'commitOnEnter' | 'commitKeys'
> = {
  commitOnEnter: true,
  commitKeys: 'enter',
}

/** Resolves the Enter policy, with commitKeys: none overriding the legacy boolean. */
function resolvedCommitOnEnter(
  options: HotkeySequenceRecorderOptions,
): boolean {
  if (options.commitKeys === 'none') {
    return false
  }
  return options.commitOnEnter !== false
}

/**
 * Framework-agnostic class for recording multi-chord sequences (Vim-style shortcuts).
 *
 * Each step is captured like a single hotkey chord. Press **Enter** (no modifiers) to commit
 * when {@link HotkeySequenceRecorderOptions.commitKeys} is `'enter'` (default), **Escape** to cancel,
 * **Backspace/Delete** to remove the last step or clear when empty.
 */
export class HotkeySequenceRecorder {
  readonly store: Store<HotkeySequenceRecorderState> =
    new Store<HotkeySequenceRecorderState>({
      isRecording: false,
      steps: [],
      recordedSequence: null,
    })

  #keydownHandler: ((event: KeyboardEvent) => void) | null = null
  #options: HotkeySequenceRecorderOptions
  #platform: 'mac' | 'windows' | 'linux'
  #events: Array<KeyboardEvent> = []
  #idleTimer: ReturnType<typeof setTimeout> | null = null

  constructor(options: HotkeySequenceRecorderOptions) {
    this.#options = {
      ...defaultHotkeySequenceRecorderOptions,
      ...options,
    }
    this.#platform = detectPlatform()
  }

  /** Merges current callbacks and options without discarding recorded steps. */
  setOptions(options: Partial<HotkeySequenceRecorderOptions>): void {
    this.#options = {
      ...defaultHotkeySequenceRecorderOptions,
      ...this.#options,
      ...options,
    }
  }

  /** Cancels a pending idle commit so it cannot fire after editing or stopping. */
  #clearIdleTimer(): void {
    if (this.#idleTimer !== null) {
      clearTimeout(this.#idleTimer)
      this.#idleTimer = null
    }
  }

  /** Restarts optional idle commit after a step is recorded or edited. */
  #scheduleIdleTimer(): void {
    this.#clearIdleTimer()
    const ms = this.#options.idleTimeoutMs
    if (ms === undefined || ms <= 0) {
      return
    }
    const steps = this.store.state.steps
    if (steps.length === 0) {
      return
    }
    this.#idleTimer = setTimeout(() => {
      this.#idleTimer = null
      if (!this.#keydownHandler) {
        return
      }
      if (this.store.state.steps.length >= 1) {
        this.commit()
      }
    }, ms)
  }

  /** Publishes edited steps while preserving the remaining recorder state. */
  #patchSteps(updater: (prev: HotkeySequence) => HotkeySequence): void {
    this.store.setState((s) => ({
      ...s,
      steps: updater(s.steps),
    }))
  }

  /** Starts a fresh recording; repeated starts during an active session are ignored. */
  start(): void {
    if (this.#keydownHandler) {
      return
    }

    this.#clearIdleTimer()
    this.#events = []
    beginRecording(this)
    this.store.setState(() => ({
      isRecording: true,
      steps: [],
      recordedSequence: null,
    }))

    const handler = (event: KeyboardEvent) => {
      if (!this.#keydownHandler) {
        return
      }

      // If ignoreInputs is enabled (default) and focus is in an input element,
      // let the event pass through so the user can type normally.
      // Escape is the exception — it should always cancel recording.
      if (
        this.#options.ignoreInputs !== false &&
        event.key !== 'Escape' &&
        shouldIgnoreInputEvent(event, document, document)
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

      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          const steps = this.store.state.steps
          if (steps.length === 0) {
            this.stop()
            this.#options.onClear?.()
            return
          }
          this.#events.pop()
          this.#patchSteps((prev) => prev.slice(0, -1))
          const next = this.store.state.steps
          if (next.length === 0) {
            this.#clearIdleTimer()
          } else {
            this.#scheduleIdleTimer()
          }
          return
        }
      }

      const enterCommits =
        resolvedCommitOnEnter(this.#options) &&
        event.key === 'Enter' &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        !event.metaKey

      if (enterCommits && this.store.state.steps.length >= 1) {
        this.commit()
        return
      }

      if (enterCommits && this.store.state.steps.length === 0) {
        return
      }

      if (isModifierKey(event.key) || event.key === 'AltGraph') return
      const rejection = chordRejection(event, { ...this.#options, platform })
      if (rejection) {
        this.#options.onReject?.(rejection)
        return
      }
      const finalHotkey = hotkeyChordFromKeydown(
        event,
        platform,
        this.#options.recordBy,
      )
      if (finalHotkey === null) {
        return
      }

      const validation = validateHotkey(finalHotkey)
      if (!validation.valid) {
        this.#options.onReject?.({
          reason: 'invalid',
          message: validation.errors.join('; '),
          hotkey: finalHotkey,
        })
        return
      }
      this.#events.push(event)
      this.#patchSteps((prev) => [...prev, finalHotkey])
      this.#scheduleIdleTimer()
    }

    this.#keydownHandler = handler
    this.#addListener(handler)
  }

  /**
   * Commit the current steps as a sequence. No-op if fewer than one step.
   */
  commit(): void {
    const steps = this.store.state.steps
    if (steps.length < 1) {
      return
    }

    const sequence = [...steps]
    const platform = this.#options.platform ?? this.#platform
    this.#clearIdleTimer()
    const accepted = this.#options.validate?.(sequence, {
      events: [...this.#events],
      parsedSequence: sequence.map((step) => parseHotkey(step, platform)),
    })
    if (accepted !== undefined && accepted !== true) {
      this.#options.onReject?.({
        reason: 'validation',
        message:
          typeof accepted === 'string'
            ? accepted
            : 'This sequence is not allowed.',
        sequence,
      })
      return
    }
    if (this.#options.detectConflicts) {
      const conflicts = findHotkeyConflicts(sequence, {
        ...(typeof this.#options.detectConflicts === 'object'
          ? this.#options.detectConflicts
          : {}),
        platform,
        events: this.#events,
      })
      if (conflicts.length) {
        this.#options.onReject?.({
          reason: 'conflict',
          message: 'This sequence conflicts with a registered binding.',
          sequence,
          conflicts,
        })
        return
      }
    }
    endRecording(this)
    this.#events = []

    if (this.#keydownHandler) {
      this.#removeListener(this.#keydownHandler)
      this.#keydownHandler = null
    }
    this.#clearIdleTimer()

    this.store.setState(() => ({
      isRecording: false,
      steps: [],
      recordedSequence: sequence,
    }))

    this.#options.onRecord(sequence)
  }

  /** Stops and discards in-progress steps without invoking onCancel. */
  stop(): void {
    endRecording(this)
    this.#events = []
    if (this.#keydownHandler) {
      this.#removeListener(this.#keydownHandler)
      this.#keydownHandler = null
    }
    this.#clearIdleTimer()
    this.store.setState(() => ({
      isRecording: false,
      steps: [],
      recordedSequence: null,
    }))
  }

  /** Stops, discards in-progress steps, and notifies onCancel. */
  cancel(): void {
    endRecording(this)
    this.#events = []
    if (this.#keydownHandler) {
      this.#removeListener(this.#keydownHandler)
      this.#keydownHandler = null
    }
    this.#clearIdleTimer()
    this.store.setState(() => ({
      isRecording: false,
      steps: [],
      recordedSequence: null,
    }))
    this.#options.onCancel?.()
  }

  /** Captures keydowns before application handlers, with an SSR-safe document check. */
  #addListener(handler: (event: KeyboardEvent) => void): void {
    if (typeof document === 'undefined') {
      return
    }
    document.addEventListener('keydown', handler, true)
  }

  /** Detaches the capture listener when recording ends. */
  #removeListener(handler: (event: KeyboardEvent) => void): void {
    if (typeof document === 'undefined') {
      return
    }
    document.removeEventListener('keydown', handler, true)
  }

  destroy(): void {
    this.stop()
    this.store.setState(() => ({
      isRecording: false,
      steps: [],
      recordedSequence: null,
    }))
  }
}
