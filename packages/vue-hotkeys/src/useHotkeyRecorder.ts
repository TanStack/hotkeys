import { HotkeyRecorder } from '@tanstack/hotkeys'
import { withDefaults } from '@tanstack/hotkeys/adapter'
import { getCurrentInstance, onScopeDispose, toValue, watch } from 'vue'
import { useLive } from './_useLive'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import { useStoreSelector } from './useStoreSelector'
import type {
  Hotkey,
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderActions,
  HotkeyRecorderOptions,
  HotkeyRecorderState,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { MaybeRefOrGetter, Ref } from 'vue'

/** The recorder state, each field as a read-only ref. */
type VueHotkeyRecorderState<THotkey extends Hotkey> = {
  [K in keyof HotkeyRecorderState<THotkey>]: Readonly<
    Ref<HotkeyRecorderState<THotkey>[K]>
  >
}

export interface VueHotkeyRecorder<THotkey extends Hotkey = Hotkey>
  extends VueHotkeyRecorderState<THotkey>, HotkeyRecorderActions {}

/**
 * Vue composable for recording keyboard shortcuts. Options may be a ref or getter.
 *
 * With the default `maxSteps: 1`, the first valid chord is recorded. With a
 * larger `maxSteps`, each chord adds a step; the recording commits on Enter
 * (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
 * `onRecord` receives a chord (one step) or a sequence.
 *
 * @example
 * ```ts
 * const recorder = useHotkeyRecorder({ onRecord: (hotkey) => (shortcut.value = hotkey) })
 * const sequenceRecorder = useHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
 * ```
 */
export function useHotkeyRecorder(
  options: HotkeyChordRecorderOptions,
): VueHotkeyRecorder<HotkeyChord>
export function useHotkeyRecorder(
  options: HotkeySequenceRecorderOptions,
): VueHotkeyRecorder
// Getter overloads list sequences first: TypeScript keeps a lambda's parameter
// types from the first overload it tries, and sequence types also fit chords.
export function useHotkeyRecorder(
  options: () => HotkeySequenceRecorderOptions,
): VueHotkeyRecorder
export function useHotkeyRecorder(
  options: () => HotkeyChordRecorderOptions,
): VueHotkeyRecorder<HotkeyChord>
export function useHotkeyRecorder(
  options: Ref<HotkeyRecorderOptions>,
): VueHotkeyRecorder
export function useHotkeyRecorder(
  options: MaybeRefOrGetter<HotkeyRecorderOptions>,
): VueHotkeyRecorder {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const resolve = () =>
    withDefaults(
      defaultOptions().hotkeyRecorder,
      toValue(options),
    ) as HotkeySequenceRecorderOptions

  // Overloads already checked the options; either shape is valid here.
  const recorder = new HotkeyRecorder(resolve())

  const isRecording = useStoreSelector(
    recorder.store,
    (state) => state.isRecording,
  )
  const steps = useStoreSelector(recorder.store, (state) => state.steps)
  const recordedHotkey = useStoreSelector(
    recorder.store,
    (state) => state.recordedHotkey,
  )

  const stopWatcher = watch(resolve, (resolved) =>
    recorder.setOptions(resolved),
  )

  // A page cached by <KeepAlive> stops recording when hidden, and can't
  // start again until shown. The start check reads Vue's own flag, because
  // a descendant's onActivated hook can run before useLive's ref updates.
  const instance = getCurrentInstance()
  const hidden = () => {
    for (let i: any = instance; i; i = i.parent)
      if (i.isDeactivated) return true
    return false
  }
  watch(
    useLive(),
    (live) => live || (recorder.store.state.isRecording && recorder.stop()),
  )

  onScopeDispose(() => {
    stopWatcher()
    recorder.destroy()
  })

  return {
    isRecording,
    steps,
    recordedHotkey,
    startRecording: () => {
      if (!hidden()) recorder.start()
    },
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
    commitRecording: () => recorder.commit(),
  }
}
