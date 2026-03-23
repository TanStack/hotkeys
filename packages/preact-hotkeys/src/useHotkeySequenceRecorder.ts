import { useEffect, useRef } from 'preact/hooks'
import { useStore } from '@tanstack/preact-store'
import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type {
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

export interface PreactHotkeySequenceRecorder {
  isRecording: boolean
  steps: HotkeySequence
  recordedSequence: HotkeySequence | null
  startRecording: () => void
  stopRecording: () => void
  cancelRecording: () => void
  commitRecording: () => void
}

/**
 * Preact hook for recording multi-chord sequences (Vim-style shortcuts).
 */
export function useHotkeySequenceRecorder(
  options: HotkeySequenceRecorderOptions,
): PreactHotkeySequenceRecorder {
  const mergedOptions = {
    ...useDefaultHotkeysOptions().hotkeySequenceRecorder,
    ...options,
  } as HotkeySequenceRecorderOptions

  const recorderRef = useRef<HotkeySequenceRecorder | null>(null)

  if (!recorderRef.current) {
    recorderRef.current = new HotkeySequenceRecorder(mergedOptions)
  }

  recorderRef.current.setOptions(mergedOptions)

  const isRecording = useStore(
    recorderRef.current.store,
    (state) => state.isRecording,
  )
  const steps = useStore(recorderRef.current.store, (state) => state.steps)
  const recordedSequence = useStore(
    recorderRef.current.store,
    (state) => state.recordedSequence,
  )

  useEffect(() => {
    return () => {
      recorderRef.current?.destroy()
    }
  }, [])

  return {
    isRecording,
    steps,
    recordedSequence,
    startRecording: () => recorderRef.current?.start(),
    stopRecording: () => recorderRef.current?.stop(),
    cancelRecording: () => recorderRef.current?.cancel(),
    commitRecording: () => recorderRef.current?.commit(),
  }
}
