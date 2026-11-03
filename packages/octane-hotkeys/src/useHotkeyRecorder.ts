import { useLayoutEffect, useRef } from 'octane'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { withDefaults } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { select, subSlot } from './internal'
import type { OctaneHotkeyRecorder } from './types'
import type {
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

type RecorderActions = Omit<
  OctaneHotkeyRecorder,
  'isRecording' | 'steps' | 'recordedHotkey'
>

/**
 * Records a shortcut and destroys the recorder on unmount. With the default
 * `maxSteps: 1`, the first valid chord is recorded. With a larger `maxSteps`,
 * each chord adds a step; the recording commits on Enter (unless
 * `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
 * `onRecord` receives a chord (one step) or a sequence.
 */
export function useHotkeyRecorder(
  options: HotkeyChordRecorderOptions,
): OctaneHotkeyRecorder<HotkeyChord>
export function useHotkeyRecorder(
  options: HotkeySequenceRecorderOptions,
): OctaneHotkeyRecorder
export function useHotkeyRecorder(
  options: HotkeyRecorderOptions,
  slot?: symbol,
): OctaneHotkeyRecorder {
  const defaults = useDefaultHotkeysOptions()
  // Overloads already checked the options; either shape is valid here.
  const merged = withDefaults(
    defaults.hotkeyRecorder,
    options,
  ) as HotkeySequenceRecorderOptions
  // The actions are created with the recorder, so they keep their identity
  // across renders.
  const ref = useRef<[HotkeyRecorder, RecorderActions] | null>(
    null,
    subSlot(slot, 'recorder'),
  )
  if (!ref.current) {
    const recorder = new HotkeyRecorder(merged)
    ref.current = [
      recorder,
      {
        startRecording: () => recorder.start(),
        stopRecording: () => recorder.stop(),
        cancelRecording: () => recorder.cancel(),
        commitRecording: () => recorder.commit(),
      },
    ]
  }
  const [recorder, actions] = ref.current
  useLayoutEffect(
    () => {
      recorder.setOptions(merged)
    },
    null,
    subSlot(slot, 'options'),
  )
  useLayoutEffect(() => () => recorder.destroy(), [], subSlot(slot, 'cleanup'))
  const state = select(recorder.store, (value) => value, subSlot(slot, 'state'))
  return { ...state, ...actions }
}
