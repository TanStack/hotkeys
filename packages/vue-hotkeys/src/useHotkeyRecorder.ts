import { onUnmounted, unref, watch } from 'vue'
import { useStore } from '@tanstack/vue-store'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProviderContext'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { Hotkey, HotkeyRecorderOptions } from '@tanstack/hotkeys'

export interface VueHotkeyRecorder {
  /** Whether recording is currently active */
  isRecording: Ref<boolean>
  /** The currently recorded hotkey (for live preview) */
  recordedHotkey: Ref<Hotkey | null>
  /** Start recording a new hotkey */
  startRecording: () => void
  /** Stop recording (same as cancel) */
  stopRecording: () => void
  /** Cancel recording without saving */
  cancelRecording: () => void
}

/**
 * Vue composable for recording keyboard shortcuts.
 *
 * This composable provides a thin wrapper around the framework-agnostic `HotkeyRecorder`
 * class, managing all the complexity of capturing keyboard events, converting them
 * to hotkey strings, and handling edge cases like Escape to cancel or Backspace/Delete
 * to clear.
 *
 * @param options - Configuration options for the recorder
 * @returns An object with recording state and control functions
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useHotkeyRecorder } from '@tanstack/vue-hotkeys'
 *
 * const shortcut = ref<Hotkey>('Mod+S')
 *
 * const recorder = useHotkeyRecorder({
 *   onRecord: (hotkey) => {
 *     shortcut.value = hotkey
 *   },
 *   onCancel: () => {
 *     console.log('Recording cancelled')
 *   },
 * })
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="recorder.startRecording()">
 *       {{ recorder.isRecording ? 'Recording...' : 'Edit Shortcut' }}
 *     </button>
 *     <div v-if="recorder.recordedHotkey">
 *       Recording: {{ recorder.recordedHotkey }}
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useHotkeyRecorder(
  options: MaybeRefOrGetter<HotkeyRecorderOptions>,
): VueHotkeyRecorder {
  const defaultOptions = useDefaultHotkeysOptions()
  const recorder = new HotkeyRecorder(
    resolveRecorderOptions(options, defaultOptions),
  )

  // Subscribe to recorder state using useStore
  const isRecording = useStore(recorder.store, (state) => state.isRecording)
  const recordedHotkey = useStore(
    recorder.store,
    (state) => state.recordedHotkey,
  )

  const stopWatcher = watch(
    () => resolveRecorderOptions(options, defaultOptions),
    (resolvedOptions) => {
      recorder.setOptions(resolvedOptions)
    },
    { immediate: true },
  )

  // Cleanup on unmount
  onUnmounted(() => {
    stopWatcher()
    recorder.destroy()
  })

  return {
    isRecording: isRecording as Ref<boolean>,
    recordedHotkey: recordedHotkey as Ref<Hotkey | null>,
    startRecording: () => recorder.start(),
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
  }
}

function resolveRecorderOptions(
  options: MaybeRefOrGetter<HotkeyRecorderOptions>,
  defaultOptions: ReturnType<typeof useDefaultHotkeysOptions>,
): HotkeyRecorderOptions {
  return {
    ...defaultOptions.hotkeyRecorder,
    ...resolveMaybeRefOrGetter(options),
  } as HotkeyRecorderOptions
}

function resolveMaybeRefOrGetter<T>(value: MaybeRefOrGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : unref(value)
}
