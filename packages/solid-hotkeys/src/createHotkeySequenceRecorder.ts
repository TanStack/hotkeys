import { createEffect, onCleanup } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type {
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

export interface SolidHotkeySequenceRecorder {
  isRecording: () => boolean
  steps: () => HotkeySequence
  recordedSequence: () => HotkeySequence | null
  startRecording: () => void
  stopRecording: () => void
  cancelRecording: () => void
  commitRecording: () => void
}

/**
 * SolidJS primitive for recording multi-chord sequences (Vim-style shortcuts).
 */
export function createHotkeySequenceRecorder(
  options:
    | HotkeySequenceRecorderOptions
    | (() => HotkeySequenceRecorderOptions),
): SolidHotkeySequenceRecorder {
  const defaultOptions = useDefaultHotkeysOptions()

  const resolvedOptions = typeof options === 'function' ? options() : options
  const mergedOptions = {
    ...defaultOptions.hotkeySequenceRecorder,
    ...resolvedOptions,
  } as HotkeySequenceRecorderOptions

  const recorder = new HotkeySequenceRecorder(mergedOptions)

  const isRecording = useStore(recorder.store, (state) => state.isRecording)
  const steps = useStore(recorder.store, (state) => state.steps)
  const recordedSequence = useStore(
    recorder.store,
    (state) => state.recordedSequence,
  )

  createEffect(() => {
    const resolved = typeof options === 'function' ? options() : options
    recorder.setOptions({
      ...defaultOptions.hotkeySequenceRecorder,
      ...resolved,
    } as HotkeySequenceRecorderOptions)
  })

  onCleanup(() => {
    recorder.destroy()
  })

  return {
    isRecording,
    steps,
    recordedSequence,
    startRecording: () => recorder.start(),
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
    commitRecording: () => recorder.commit(),
  }
}
