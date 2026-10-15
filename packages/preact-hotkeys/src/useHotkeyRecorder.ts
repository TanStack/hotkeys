import { useEffect, useRef } from 'preact/hooks'
import { useSelector } from '@tanstack/preact-store'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type {
  Hotkey,
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

export interface PreactHotkeyRecorder<THotkey extends Hotkey = Hotkey> {
  /** Whether recording is currently active */
  isRecording: boolean
  /** Chords recorded so far in a multi-step recording (for live preview) */
  steps: HotkeySequence
  /** The last committed hotkey */
  recordedHotkey: THotkey | null
  /** Start recording a new hotkey */
  startRecording: () => void
  /** Stop recording without calling onCancel */
  stopRecording: () => void
  /** Cancel recording and call onCancel */
  cancelRecording: () => void
  /** Commit the recorded steps now (multi-step recordings) */
  commitRecording: () => void
}

/**
 * Preact hook for recording keyboard shortcuts.
 *
 * With the default `maxSteps: 1`, the first valid chord is recorded and
 * `onRecord` receives a chord such as `'Mod+S'`. With a larger `maxSteps`, each
 * chord adds a step; the recording commits on Enter (unless
 * `commitKeys: 'none'`), after `idleTimeoutMs`, or when it reaches `maxSteps`,
 * and `onRecord` receives a chord (one step) or a sequence.
 *
 * Escape cancels. Backspace/Delete removes the last step, or calls `onClear`
 * when nothing is recorded.
 *
 * @param options - Configuration options for the recorder
 * @returns The recorder state and controls
 *
 * @example
 * ```tsx
 * function ShortcutInput() {
 *   const [shortcut, setShortcut] = useState<Hotkey>('Mod+S')
 *   const recorder = useHotkeyRecorder({ onRecord: setShortcut })
 *
 *   return (
 *     <button onClick={recorder.startRecording}>
 *       {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * const recorder = useHotkeyRecorder({
 *   maxSteps: 3,
 *   onRecord: (hotkey) => setShortcut(hotkey), // 'Mod+S' or ['G', 'H']
 * })
 * ```
 */
export function useHotkeyRecorder(
  options: HotkeyChordRecorderOptions,
): PreactHotkeyRecorder<HotkeyChord>
export function useHotkeyRecorder(
  options: HotkeySequenceRecorderOptions,
): PreactHotkeyRecorder
export function useHotkeyRecorder(
  options: HotkeyRecorderOptions,
): PreactHotkeyRecorder {
  const mergedOptions = {
    ...useDefaultHotkeysOptions().hotkeyRecorder,
    ...options,
  } as HotkeyRecorderOptions

  const recorderRef = useRef<HotkeyRecorder | null>(null)

  // Create recorder instance once
  if (!recorderRef.current) {
    // Overloads already checked the options; either shape is valid here.
    recorderRef.current = new HotkeyRecorder(
      mergedOptions as HotkeySequenceRecorderOptions,
    )
  }

  // Sync options on every render so callbacks always see the latest values
  recorderRef.current.setOptions(mergedOptions)

  const recorder = recorderRef.current
  const isRecording = useSelector(recorder.store, (state) => state.isRecording)
  const steps = useSelector(recorder.store, (state) => state.steps)
  const recordedHotkey = useSelector(
    recorder.store,
    (state) => state.recordedHotkey,
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recorderRef.current?.destroy()
    }
  }, [])

  return {
    isRecording,
    steps,
    recordedHotkey,
    startRecording: () => recorderRef.current?.start(),
    stopRecording: () => recorderRef.current?.stop(),
    cancelRecording: () => recorderRef.current?.cancel(),
    commitRecording: () => recorderRef.current?.commit(),
  }
}
