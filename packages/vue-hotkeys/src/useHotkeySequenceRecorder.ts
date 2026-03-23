import { onUnmounted, unref, watch } from 'vue'
import { useStore } from '@tanstack/vue-store'
import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProviderContext'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type {
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

export interface VueHotkeySequenceRecorder {
  isRecording: Ref<boolean>
  steps: Ref<HotkeySequence>
  recordedSequence: Ref<HotkeySequence | null>
  startRecording: () => void
  stopRecording: () => void
  cancelRecording: () => void
  commitRecording: () => void
}

/**
 * Vue composable for recording multi-chord sequences (Vim-style shortcuts).
 */
export function useHotkeySequenceRecorder(
  options: MaybeRefOrGetter<HotkeySequenceRecorderOptions>,
): VueHotkeySequenceRecorder {
  const defaultOptions = useDefaultHotkeysOptions()
  const recorder = new HotkeySequenceRecorder(
    resolveHotkeySequenceRecorderOptions(options, defaultOptions),
  )

  const isRecording = useStore(recorder.store, (state) => state.isRecording)
  const steps = useStore(recorder.store, (state) => state.steps)
  const recordedSequence = useStore(
    recorder.store,
    (state) => state.recordedSequence,
  )

  const stopWatcher = watch(
    () => resolveHotkeySequenceRecorderOptions(options, defaultOptions),
    (resolvedOptions) => {
      recorder.setOptions(resolvedOptions)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stopWatcher()
    recorder.destroy()
  })

  return {
    isRecording: isRecording as Ref<boolean>,
    steps: steps as Ref<HotkeySequence>,
    recordedSequence: recordedSequence as Ref<HotkeySequence | null>,
    startRecording: () => recorder.start(),
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
    commitRecording: () => recorder.commit(),
  }
}

function resolveHotkeySequenceRecorderOptions(
  options: MaybeRefOrGetter<HotkeySequenceRecorderOptions>,
  defaultOptions: ReturnType<typeof useDefaultHotkeysOptions>,
): HotkeySequenceRecorderOptions {
  return {
    ...defaultOptions.hotkeySequenceRecorder,
    ...resolveMaybeRefOrGetter(options),
  } as HotkeySequenceRecorderOptions
}

function resolveMaybeRefOrGetter<T>(value: MaybeRefOrGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : unref(value)
}
