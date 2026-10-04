import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { read, select } from './utils'
import type { EmberHotkeySequenceRecorder } from './types'
import type { HotkeySequenceRecorderOptions } from '@tanstack/hotkeys'
import type { MaybeGetter } from './utils'

/** Creates an owned sequence recorder with explicit commit and cancel controls. */
export function useHotkeySequenceRecorder(
  owner: object,
  options: MaybeGetter<HotkeySequenceRecorderOptions>,
): EmberHotkeySequenceRecorder {
  const recorder = new HotkeySequenceRecorder(() => read(options))
  const state = select(owner, recorder.store, (value) => value)
  registerDestructor(owner, () => recorder.destroy())
  return {
    get isRecording() {
      return state.value.isRecording
    },
    get steps() {
      return state.value.steps
    },
    get recordedSequence() {
      return state.value.recordedSequence
    },
    startRecording() {
      if (isDestroying(owner) || isDestroyed(owner)) return
      recorder.start()
    },
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
    commitRecording: () => recorder.commit(),
  }
}
