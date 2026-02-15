import { createEffect, createSignal, onCleanup } from 'solid-js'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type { Hotkey, HotkeyRecorderOptions } from '@tanstack/hotkeys'

export interface SolidHotkeyRecorder {
  /** Whether recording is currently active */
  isRecording: () => boolean
  /** The currently recorded hotkey (for live preview) */
  recordedHotkey: () => Hotkey | null
  /** Start recording a new hotkey */
  startRecording: () => void
  /** Stop recording (same as cancel) */
  stopRecording: () => void
  /** Cancel recording without saving */
  cancelRecording: () => void
}

/**
 * SolidJS primitive for recording keyboard shortcuts.
 *
 * This primitive provides a thin wrapper around the framework-agnostic `HotkeyRecorder`
 * class, managing all the complexity of capturing keyboard events, converting them
 * to hotkey strings, and handling edge cases like Escape to cancel or Backspace/Delete
 * to clear.
 *
 * @param options - Configuration options for the recorder (or accessor function)
 * @returns An object with recording state signals and control functions
 *
 * @example
 * ```tsx
 * function ShortcutSettings() {
 *   const [shortcut, setShortcut] = createSignal<Hotkey>('Mod+S')
 *
 *   const recorder = createHotkeyRecorder({
 *     onRecord: (hotkey) => {
 *       setShortcut(hotkey)
 *     },
 *     onCancel: () => {
 *       console.log('Recording cancelled')
 *     },
 *   })
 *
 *   return (
 *     <div>
 *       <button onClick={recorder.startRecording}>
 *         {recorder.isRecording() ? 'Recording...' : 'Edit Shortcut'}
 *       </button>
 *       <Show when={recorder.recordedHotkey()}>
 *         <div>Recording: {recorder.recordedHotkey()}</div>
 *       </Show>
 *     </div>
 *   )
 * }
 * ```
 */
export function createHotkeyRecorder(
  options: HotkeyRecorderOptions | (() => HotkeyRecorderOptions),
): SolidHotkeyRecorder {
  const defaultOptions = useDefaultHotkeysOptions()

  let recorder: HotkeyRecorder | null = null
  let storeUnsubscribe: (() => void) | null = null
  const [isRecording, setIsRecording] = createSignal(false)
  const [recordedHotkey, setRecordedHotkey] = createSignal<Hotkey | null>(null)

  // Destroy recorder only when component unmounts (not when effect re-runs)
  onCleanup(() => {
    storeUnsubscribe?.()
    recorder?.destroy()
    recorder = null
    storeUnsubscribe = null
  })

  createEffect(() => {
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...defaultOptions.hotkeyRecorder,
      ...resolvedOptions,
    } as HotkeyRecorderOptions

    // Create recorder once on first run (matches React's useRef pattern)
    if (!recorder) {
      recorder = new HotkeyRecorder(mergedOptions)

      storeUnsubscribe = recorder.store.subscribe(() => {
        setIsRecording(recorder!.store.state.isRecording)
        setRecordedHotkey(recorder!.store.state.recordedHotkey)
      })

      setIsRecording(recorder.store.state.isRecording)
      setRecordedHotkey(recorder.store.state.recordedHotkey)
    }

    // Sync options on every effect run (matches React's sync on render)
    recorder.setOptions(mergedOptions)
  })

  return {
    isRecording,
    recordedHotkey,
    startRecording: () => recorder?.start(),
    stopRecording: () => recorder?.stop(),
    cancelRecording: () => recorder?.cancel(),
  }
}
