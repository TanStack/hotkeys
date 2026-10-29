import { HotkeyRecorder } from '@tanstack/hotkeys'
import { getDefaultHotkeysOptions } from './HotkeysCtx.js'
import { createStoreSubscriber, resolveMaybeGetter } from './internal.svelte.js'
import type {
  Hotkey,
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte.js'

export interface SvelteHotkeyRecorder<THotkey extends Hotkey = Hotkey> {
  /** Whether recording is currently active */
  readonly isRecording: boolean
  /** Chords recorded so far in a multi-step recording (for live preview) */
  readonly steps: HotkeySequence
  /** The last committed hotkey */
  readonly recordedHotkey: THotkey | null
  /** Start recording a new hotkey */
  startRecording: () => void
  /** Stop recording without calling onCancel */
  stopRecording: () => void
  /** Cancel recording and call onCancel */
  cancelRecording: () => void
  /** Commit the recorded steps now (multi-step recordings) */
  commitRecording: () => void
}

class SvelteHotkeyRecorderState implements SvelteHotkeyRecorder {
  #recorder: HotkeyRecorder
  #subscribe: () => void

  constructor(options: HotkeySequenceRecorderOptions) {
    this.#recorder = new HotkeyRecorder(options)
    this.#subscribe = createStoreSubscriber(this.#recorder.store)
  }

  get isRecording(): boolean {
    this.#subscribe()
    return this.#recorder.store.state.isRecording
  }

  get steps(): HotkeySequence {
    this.#subscribe()
    return this.#recorder.store.state.steps
  }

  get recordedHotkey(): Hotkey | null {
    this.#subscribe()
    return this.#recorder.store.state.recordedHotkey
  }

  setOptions(options: HotkeyRecorderOptions): void {
    this.#recorder.setOptions(options)
  }

  // Arrow functions keep the receiver when used directly as event handlers.
  startRecording = (): void => {
    this.#recorder.start()
  }

  stopRecording = (): void => {
    this.#recorder.stop()
  }

  cancelRecording = (): void => {
    this.#recorder.cancel()
  }

  commitRecording = (): void => {
    this.#recorder.commit()
  }

  destroy(): void {
    this.#recorder.destroy()
  }
}

/**
 * Svelte function for recording keyboard shortcuts. Options may be a getter.
 *
 * With the default `maxSteps: 1`, the first valid chord is recorded. With a
 * larger `maxSteps`, each chord adds a step; the recording commits on Enter
 * (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
 * `onRecord` receives a chord (one step) or a sequence.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
 *   const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
 * </script>
 *
 * <button onclick={recorder.startRecording}>
 *   {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
 * </button>
 * ```
 */
export function createHotkeyRecorder(
  options: HotkeyChordRecorderOptions,
): SvelteHotkeyRecorder<HotkeyChord>
export function createHotkeyRecorder(
  options: HotkeySequenceRecorderOptions,
): SvelteHotkeyRecorder
// Getter overloads list sequences first: TypeScript keeps a lambda's parameter
// types from the first overload it tries, and sequence types also fit chords.
export function createHotkeyRecorder(
  options: () => HotkeySequenceRecorderOptions,
): SvelteHotkeyRecorder
export function createHotkeyRecorder(
  options: () => HotkeyChordRecorderOptions,
): SvelteHotkeyRecorder<HotkeyChord>
export function createHotkeyRecorder(
  options: () => HotkeyRecorderOptions,
): SvelteHotkeyRecorder
export function createHotkeyRecorder(
  options: MaybeGetter<HotkeyRecorderOptions>,
): SvelteHotkeyRecorder {
  const resolve = () =>
    ({
      ...getDefaultHotkeysOptions().hotkeyRecorder,
      ...resolveMaybeGetter(options),
    }) as HotkeySequenceRecorderOptions
  // Overloads already checked the options; either shape is valid here.
  const recorder = new SvelteHotkeyRecorderState(resolve())

  $effect(() => {
    recorder.setOptions(resolve())
  })

  // Unlike onDestroy, an effect teardown also runs when an $effect.root that
  // owns the recorder is destroyed. $effect.pre runs now, so the teardown is
  // in place even if the root is destroyed before effects flush.
  $effect.pre(() => () => recorder.destroy())

  return recorder
}
