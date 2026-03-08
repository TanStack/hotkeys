import { HotkeyRecorder } from '@tanstack/hotkeys'
import { onDestroy } from 'svelte'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import type { Hotkey, HotkeyRecorderOptions } from '@tanstack/hotkeys'

export interface SvelteHotkeyRecorder {
  /** Whether recording is currently active */
  isRecording: boolean
  /** The currently recorded hotkey (for live preview) */
  recordedHotkey: Hotkey | null
  /** Start recording a new hotkey */
  startRecording: () => void
  /** Stop recording (same as cancel) */
  stopRecording: () => void
  /** Cancel recording without saving */
  cancelRecording: () => void
}

/**
 * Svelte function for recording keyboard shortcuts.
 *
 * This function provides a thin wrapper around the framework-agnostic `HotkeyRecorder`
 * class, managing all the complexity of capturing keyboard events, converting them
 * to hotkey strings, and handling edge cases like Escape to cancel or Backspace/Delete
 * to clear.
 *
 * @param options - Configuration options for the recorder
 * @returns An object with recording state and control functions
 *
 * @example
 * ```svelte
 * <script>
 *   import { createHotkeyRecorder } from '@tanstack/svelte-hotkeys'
 *
 *   const recorder = createHotkeyRecorder({
 *     onRecord: (hotkey) => {
 *       console.log('Recorded:', hotkey) // e.g., "Mod+Shift S"
 *     },
 *     onCancel: () => {
 *       console.log('Recording cancelled')
 *     },
 *   })
 * </script>
 *
 * <div>
 *   <button on:click={recorder.startRecording}>
 *     {recorder.isRecording ? 'Recording...' : 'Edit Shortcut'}
 *   </button>
 *   {recorder.recordedHotkey && (
 *     <div>Recording: {recorder.recordedHotkey}</div>
 *   )}
 * </div>
 * ```
 */

export function createHotkeyRecorder(
  options: HotkeyRecorderOptions,
): SvelteHotkeyRecorder {
  const mergedOptions = {
    ...getDefaultHotkeysOptions().hotkeyRecorder,
    ...options,
  } as HotkeyRecorderOptions

  const recorder = new HotkeyRecorder(mergedOptions)

  // Sync options on every render (same pattern as createHotkey)
  // This ensures callbacks always have access to latest values
  $effect(() => {
    recorder.setOptions(mergedOptions)
  })

  const isRecording = $derived.by(() => recorder.store.state.isRecording)
  const recordedHotkey = $derived.by(() => recorder.store.state.recordedHotkey)

  onDestroy(() => {
    recorder.destroy()
  })

  return {
    get isRecording() {
      return isRecording
    },
    get recordedHotkey() {
      return recordedHotkey
    },
    startRecording: () => recorder.start(),
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
  }
}
