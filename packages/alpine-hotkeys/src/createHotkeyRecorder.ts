import { HotkeyRecorder } from '@tanstack/hotkeys'
import { read } from './scope'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'

export function createHotkeyRecorder(
  scope: HotkeysScope,
  options: MaybeGetter<HotkeyRecorderOptions>,
) {
  scope.assertActive()
  const instance = new HotkeyRecorder(() => ({
    ...scope.defaultOptions().hotkeyRecorder,
    ...read(options),
  }))
  const state = scope.select(instance.store, (value) => value)
  scope.addCleanup(() => instance.destroy())
  return {
    get isRecording() {
      return state.value.isRecording
    },
    get recordedHotkey() {
      return state.value.recordedHotkey
    },
    startRecording: () => {
      if (!scope.destroyed) instance.start()
    },
    stopRecording: () => instance.stop(),
    cancelRecording: () => instance.cancel(),
  }
}
