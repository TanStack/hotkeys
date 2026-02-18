import { createEffect, onCleanup } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
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
 * This primitive uses `useStore` from `@tanstack/solid-store` to subscribe
 * to the recorder's store state (same pattern as useHotkeyRecorder in React).
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

  const resolvedOptions = typeof options === 'function' ? options() : options
  const mergedOptions = {
    ...defaultOptions.hotkeyRecorder,
    ...resolvedOptions,
  } as HotkeyRecorderOptions

  // Create recorder once synchronously (matches React's useRef pattern)
  const recorder = new HotkeyRecorder(mergedOptions)

  // Subscribe to recorder state using useStore (same pattern as useHotkeyRecorder)
  const isRecording = useStore(recorder.store, (state) => state.isRecording)
  const recordedHotkey = useStore(
    recorder.store,
    (state) => state.recordedHotkey,
  )

  // Sync options on every effect run (matches React's sync on render)
  createEffect(() => {
    const resolved = typeof options === 'function' ? options() : options
    recorder.setOptions({
      ...defaultOptions.hotkeyRecorder,
      ...resolved,
    } as HotkeyRecorderOptions)
  })

  // Cleanup on unmount
  onCleanup(() => {
    recorder.destroy()
  })

  return {
    isRecording,
    recordedHotkey,
    startRecording: () => recorder.start(),
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
  }
}
