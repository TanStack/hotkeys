import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { read, select } from './utils'
import type { EmberHotkeyRecorder } from './types'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { MaybeGetter } from './utils'

/** Creates an owned recorder with autotracked state and current callback options. */
export function useHotkeyRecorder(
  owner: object,
  options: MaybeGetter<HotkeyRecorderOptions>,
): EmberHotkeyRecorder {
  const recorder = new HotkeyRecorder(() => read(options))
  const state = select(owner, recorder.store, (value) => value)
  registerDestructor(owner, () => recorder.destroy())
  return {
    get isRecording() {
      return state.value.isRecording
    },
    get recordedHotkey() {
      return state.value.recordedHotkey
    },
    startRecording() {
      if (isDestroying(owner) || isDestroyed(owner)) return
      recorder.start()
    },
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
  }
}
