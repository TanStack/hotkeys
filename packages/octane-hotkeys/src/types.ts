import type {
  Hotkey,
  HotkeyRegistrationView,
  HotkeySequence,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

/** Recording state and controls owned by the containing component. */
export interface OctaneHotkeyRecorder {
  /** Whether the recorder is listening for a shortcut. */
  isRecording: boolean
  /** The last recorded binding, including brackets for physical codes. */
  recordedHotkey: Hotkey | null
  /** Start a new recording session. */
  startRecording: () => void
  /** Stop and clear recorder state without calling onRecord or onCancel. */
  stopRecording: () => void
  /** Stop, clear recorder state, and call onCancel. */
  cancelRecording: () => void
}

/** Sequence recording state and controls. */
export interface OctaneHotkeySequenceRecorder {
  /** Whether the recorder is listening for chords. */
  isRecording: boolean
  /** Chords captured in the current session. */
  steps: HotkeySequence
  /** The last committed sequence. */
  recordedSequence: HotkeySequence | null
  /** Start a new recording session. */
  startRecording: () => void
  /** Stop without committing or calling onCancel. */
  stopRecording: () => void
  /** Discard the current session and call onCancel. */
  cancelRecording: () => void
  /** Commit the current steps. Does nothing when no steps are recorded. */
  commitRecording: () => void
}

/** Live registration views from the shared hotkey and sequence managers. */
export interface HotkeyRegistrationsResult {
  hotkeys: Array<HotkeyRegistrationView>
  sequences: Array<SequenceRegistrationView>
}
