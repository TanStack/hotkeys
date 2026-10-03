import { useLayoutEffect, useRef } from 'octane'
import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { select, subSlot } from './internal'
import type { OctaneHotkeySequenceRecorder } from './types'
import type { HotkeySequenceRecorderOptions } from '@tanstack/hotkeys'

/** Records a sequence, including live steps and explicit commit/cancel controls. */
export function useHotkeySequenceRecorder(
  options: HotkeySequenceRecorderOptions,
): OctaneHotkeySequenceRecorder
export function useHotkeySequenceRecorder(
  options: HotkeySequenceRecorderOptions,
  slot?: symbol,
): OctaneHotkeySequenceRecorder {
  const defaults = useDefaultHotkeysOptions()
  const merged = { ...defaults.hotkeySequenceRecorder, ...options }
  const ref = useRef<HotkeySequenceRecorder | null>(
    null,
    subSlot(slot, 'recorder'),
  )
  ref.current ??= new HotkeySequenceRecorder(merged)
  const recorder = ref.current
  useLayoutEffect(
    () => {
      recorder.setOptions(merged)
    },
    null,
    subSlot(slot, 'options'),
  )
  useLayoutEffect(() => () => recorder.destroy(), [], subSlot(slot, 'cleanup'))
  const state = select(
    recorder.store,
    (value) => value,
    undefined,
    subSlot(slot, 'state'),
  )
  return {
    ...state,
    startRecording: () => recorder.start(),
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
    commitRecording: () => recorder.commit(),
  }
}
