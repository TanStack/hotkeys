import { useLayoutEffect, useRef } from 'octane'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { select, subSlot } from './internal'
import type { OctaneHotkeyRecorder } from './types'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'

/** Records a shortcut and destroys the recorder on unmount. */
export function useHotkeyRecorder(
  options: HotkeyRecorderOptions,
): OctaneHotkeyRecorder
export function useHotkeyRecorder(
  options: HotkeyRecorderOptions,
  slot?: symbol,
): OctaneHotkeyRecorder {
  const defaults = useDefaultHotkeysOptions()
  const merged = { ...defaults.hotkeyRecorder, ...options }
  const ref = useRef<HotkeyRecorder | null>(null, subSlot(slot, 'recorder'))
  ref.current ??= new HotkeyRecorder(merged)
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
  }
}
