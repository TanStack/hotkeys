import { HotkeyRecorder } from '@tanstack/hotkeys'
import { resolveMaybeGetter, withDefaults } from '@tanstack/hotkeys/adapter'
import { createEffect, onCleanup } from 'solid-js'
import { useSelector } from './_useSelector'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import type {
  Hotkey,
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderActions,
  HotkeyRecorderOptions,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
  MaybeGetter,
} from '@tanstack/hotkeys'

export interface SolidHotkeyRecorder<
  THotkey extends Hotkey = Hotkey,
> extends HotkeyRecorderActions {
  /** Whether recording is currently active */
  isRecording: () => boolean
  /** Chords recorded so far in a multi-step recording (for live preview) */
  steps: () => HotkeySequence
  /** The last committed hotkey */
  recordedHotkey: () => THotkey | null
}

/**
 * Solid primitive for recording keyboard shortcuts. Options may be an accessor.
 *
 * With the default `maxSteps: 1`, the first valid chord is recorded. With a
 * larger `maxSteps`, each chord adds a step; the recording commits on Enter
 * (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
 * `onRecord` receives a chord (one step) or a sequence.
 *
 * @example
 * ```tsx
 * const recorder = createHotkeyRecorder({ onRecord: setShortcut })
 * const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: setShortcut })
 * ```
 */
export function createHotkeyRecorder(
  options: HotkeyChordRecorderOptions,
): SolidHotkeyRecorder<HotkeyChord>
export function createHotkeyRecorder(
  options: HotkeySequenceRecorderOptions,
): SolidHotkeyRecorder
// Getter overloads list sequences first: TypeScript keeps a lambda's parameter
// types from the first overload it tries, and sequence types also fit chords.
export function createHotkeyRecorder(
  options: () => HotkeySequenceRecorderOptions,
): SolidHotkeyRecorder
export function createHotkeyRecorder(
  options: () => HotkeyChordRecorderOptions,
): SolidHotkeyRecorder<HotkeyChord>
export function createHotkeyRecorder(
  options: () => HotkeyRecorderOptions,
): SolidHotkeyRecorder
export function createHotkeyRecorder(
  options: MaybeGetter<HotkeyRecorderOptions>,
): SolidHotkeyRecorder {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const resolve = () =>
    withDefaults(
      defaultOptions().hotkeyRecorder,
      resolveMaybeGetter(options),
    ) as HotkeySequenceRecorderOptions

  // Create recorder once synchronously; overloads already checked the options.
  const recorder = new HotkeyRecorder(resolve())

  const isRecording = useSelector(recorder.store, (state) => state.isRecording)
  const steps = useSelector(recorder.store, (state) => state.steps)
  const recordedHotkey = useSelector(
    recorder.store,
    (state) => state.recordedHotkey,
  )

  // Sync options whenever reactive options change
  createEffect(() => {
    recorder.setOptions(resolve())
  })

  onCleanup(() => {
    recorder.destroy()
  })

  return {
    isRecording,
    steps,
    recordedHotkey,
    startRecording: () => recorder.start(),
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
    commitRecording: () => recorder.commit(),
  }
}
