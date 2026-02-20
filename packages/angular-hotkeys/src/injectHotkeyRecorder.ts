import { injectStore } from '@tanstack/angular-store'
import { DestroyRef, effect, inject } from '@angular/core'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type { Hotkey, HotkeyRecorderOptions } from '@tanstack/hotkeys'

export interface AngularHotkeyRecorder {
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
 * Angular inject-based API for recording keyboard shortcuts.
 *
 * Thin wrapper around the framework-agnostic HotkeyRecorder class: captures
 * keyboard events, converts them to hotkey strings, and handles Escape to
 * cancel or Backspace/Delete to clear.
 *
 * @param options - Configuration options for the recorder (or getter)
 * @returns Object with recording state signals and control functions
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class ShortcutSettingsComponent {
 *   shortcut = signal<Hotkey>('Mod+S')
 *   recorder = injectHotkeyRecorder({
 *     onRecord: (hotkey) => this.shortcut.set(hotkey),
 *     onCancel: () => console.log('Recording cancelled'),
 *   })
 *
 *   constructor() {
 *     injectHotkey(
 *       () => this.shortcut(),
 *       () => this.handleSave(),
 *       () => ({ enabled: !this.recorder.isRecording() }),
 *     )
 *   }
 * }
 * ```
 */
export function injectHotkeyRecorder(
  options: HotkeyRecorderOptions | (() => HotkeyRecorderOptions),
): AngularHotkeyRecorder {
  const defaultOptions = injectDefaultHotkeysOptions()
  const destroyRef = inject(DestroyRef)

  const resolvedOptions = typeof options === 'function' ? options() : options
  const mergedOptions = {
    ...defaultOptions.hotkeyRecorder,
    ...resolvedOptions,
  } as HotkeyRecorderOptions

  // Create recorder once synchronously (matches React's useRef pattern)
  const recorder = new HotkeyRecorder(mergedOptions)

  // Subscribe to recorder state using useStore (same pattern as useHotkeyRecorder)
  const isRecording = injectStore(recorder.store, (state) => state.isRecording)
  const recordedHotkey = injectStore(
    recorder.store,
    (state) => state.recordedHotkey,
  )

  // Sync options on every effect run (matches React's sync on render)
  effect(() => {
    const resolved = typeof options === 'function' ? options() : options
    recorder.setOptions({
      ...defaultOptions.hotkeyRecorder,
      ...resolved,
    } as HotkeyRecorderOptions)
  })

  destroyRef.onDestroy(() => {
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
