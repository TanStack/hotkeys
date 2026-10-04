import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { read } from './scope'
import type { HotkeySequenceRecorderOptions } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'

export function createHotkeySequenceRecorder(
  scope: HotkeysScope,
  options: MaybeGetter<HotkeySequenceRecorderOptions>,
) {
  scope.assertActive()
  const instance = new HotkeySequenceRecorder(() => ({
    ...scope.defaultOptions().hotkeySequenceRecorder,
    ...read(options),
  }))
  const state = scope.select(instance.store, (value) => value)
  scope.addCleanup(() => instance.destroy())
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
    startRecording: () => {
      if (!scope.destroyed) instance.start()
    },
    stopRecording: () => instance.stop(),
    cancelRecording: () => instance.cancel(),
    commitRecording: () => instance.commit(),
  }
}
