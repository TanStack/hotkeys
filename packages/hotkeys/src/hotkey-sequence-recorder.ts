import { Store } from '@tanstack/store'
import { detectPlatform } from './constants'
import { hotkeyChordFromKeydown } from './recorder-chord'
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
export interface HotkeySequenceRecorderOptions {
  /** Callback when a sequence is successfully recorded (including empty array when cleared) */
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
}

const defaultHotkeySequenceRecorderOptions: Pick<
  HotkeySequenceRecorderOptions,
  'commitOnEnter' | 'commitKeys'
> = {
  commitOnEnter: true,
  commitKeys: 'enter',
}

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
  #idleTimer: ReturnType<typeof setTimeout> | null = null

  constructor(options: HotkeySequenceRecorderOptions) {
    this.#options = {
      ...defaultHotkeySequenceRecorderOptions,
      ...options,
    }
    this.#platform = detectPlatform()
  }

  setOptions(options: Partial<HotkeySequenceRecorderOptions>): void {
    this.#options = {
      ...defaultHotkeySequenceRecorderOptions,
      ...this.#options,
      ...options,
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

  #patchSteps(updater: (prev: HotkeySequence) => HotkeySequence): void {
    this.store.setState((s) => ({
      ...s,
      steps: updater(s.steps),
    }))
  }

  start(): void {
    if (this.#keydownHandler) {
      return
    }

    this.#clearIdleTimer()
    this.store.setState(() => ({
      isRecording: true,
      steps: [],
      recordedSequence: null,
    }))

    const handler = (event: KeyboardEvent) => {
      if (!this.#keydownHandler) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

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
            this.#options.onClear?.()
            this.#options.onRecord([])
            this.#finishWithoutCommitCallback()
            return
          }
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

      const finalHotkey = hotkeyChordFromKeydown(event, this.#platform)
      if (finalHotkey === null) {
        return
      }

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

  #finishWithoutCommitCallback(): void {
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

  stop(): void {
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

  cancel(): void {
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

  #addListener(handler: (event: KeyboardEvent) => void): void {
    if (typeof document === 'undefined') {
      return
    }
    document.addEventListener('keydown', handler, true)
  }

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
