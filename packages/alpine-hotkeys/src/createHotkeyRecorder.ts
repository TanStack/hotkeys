import { HotkeyRecorder } from '@tanstack/hotkeys'
import { read } from './scope'
import type {
  HotkeyRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { AlpineHotkeyRecorder, MaybeGetter } from './types'

export function createHotkeyRecorder(
  scope: HotkeysScope,
  options: MaybeGetter<HotkeyRecorderOptions>,
): AlpineHotkeyRecorder {
  scope.assertActive()
  // The scope's overloads already checked the options; either shape is valid.
  const instance = new HotkeyRecorder(
    () =>
      ({
        ...scope.defaultOptions().hotkeyRecorder,
        ...read(options),
      }) as HotkeySequenceRecorderOptions,
  )
  const state = scope.select(instance.store, (value) => value)
  scope.addCleanup(() => instance.destroy())
  return {
    get isRecording() {
      return state.value.isRecording
    },
    get steps() {
      return state.value.steps
    },
    get recordedHotkey() {
      return state.value.recordedHotkey
    },
    startRecording: () => {
      if (!scope.destroyed) instance.start()
    },
    stopRecording: () => instance.stop(),
    cancelRecording: () => instance.cancel(),
    commitRecording: () => instance.commit(),
  }
}
