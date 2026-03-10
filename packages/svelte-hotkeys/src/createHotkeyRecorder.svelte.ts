import { HotkeyRecorder } from '@tanstack/hotkeys'
import { onDestroy } from 'svelte'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { createStoreSubscriber, resolveMaybeGetter } from './internal.svelte'
import type { Hotkey, HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte'

export interface SvelteHotkeyRecorder {
  /** Whether recording is currently active */
  readonly isRecording: boolean
  /** The currently recorded hotkey (for live preview) */
  readonly recordedHotkey: Hotkey | null
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
 *   <button onclick={recorder.startRecording}>
 *     {recorder.isRecording ? 'Recording...' : 'Edit Shortcut'}
 *   </button>
 *   {#if recorder.recordedHotkey}
 *     <div>Recording: {recorder.recordedHotkey}</div>
 *   {/if}
 * </div>
 * ```
 */

class SvelteHotkeyRecorderState implements SvelteHotkeyRecorder {
  #recorder: HotkeyRecorder
  #subscribe: () => void

  constructor(options: HotkeyRecorderOptions) {
    this.#recorder = new HotkeyRecorder(options)
    this.#subscribe = createStoreSubscriber(this.#recorder.store)
  }

  get isRecording(): boolean {
    this.#subscribe()
    return this.#recorder.store.state.isRecording
  }

  get recordedHotkey(): Hotkey | null {
    this.#subscribe()
    return this.#recorder.store.state.recordedHotkey
  }

  setOptions(options: HotkeyRecorderOptions): void {
    this.#recorder.setOptions(options)
  }

  startRecording(): void {
    this.#recorder.start()
  }

  stopRecording(): void {
    this.#recorder.stop()
  }

  cancelRecording(): void {
    this.#recorder.cancel()
  }

  destroy(): void {
    this.#recorder.destroy()
  }
}

export function createHotkeyRecorder(
  options: MaybeGetter<HotkeyRecorderOptions>,
): SvelteHotkeyRecorder {
  const recorder = new SvelteHotkeyRecorderState({
    ...getDefaultHotkeysOptions().hotkeyRecorder,
    ...resolveMaybeGetter(options),
  } as HotkeyRecorderOptions)

  $effect(() => {
    recorder.setOptions({
      ...getDefaultHotkeysOptions().hotkeyRecorder,
      ...resolveMaybeGetter(options),
    } as HotkeyRecorderOptions)
  })

  onDestroy(() => {
    recorder.destroy()
  })

  return recorder
}
