import type {
  Hotkey,
  HotkeyOptions,
  HotkeyRecorderOptions,
  HotkeyRegistrationView,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
  SequenceOptions,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

/** A reactive value. Read `.value` where the framework tracks dependencies. */
export interface EmberHotkeyState<T> {
  readonly value: T
}

/** Recording state and controls owned by the containing component. */
export interface EmberHotkeyRecorder {
  /** Whether the recorder is listening for a shortcut. */
  readonly isRecording: boolean
  /** The last recorded binding, including brackets for physical codes. */
  readonly recordedHotkey: Hotkey | null
  /** Start a new recording session. */
  startRecording: () => void
  /** Stop and clear recorder state without calling onRecord or onCancel. */
  stopRecording: () => void
  /** Stop, clear recorder state, and call onCancel. */
  cancelRecording: () => void
}

/** Sequence recording state and controls. */
export interface EmberHotkeySequenceRecorder {
  /** Whether the recorder is listening for chords. */
  readonly isRecording: boolean
  /** Chords captured in the current session. */
  readonly steps: HotkeySequence
  /** The last committed sequence. */
  readonly recordedSequence: HotkeySequence | null
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
  readonly hotkeys: Array<HotkeyRegistrationView>
  readonly sequences: Array<SequenceRegistrationView>
}

/** Shared defaults; call-specific options take precedence. */
export interface DefaultHotkeysOptions {
  hotkey?: HotkeyOptions
  hotkeySequence?: SequenceOptions
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequenceRecorder?: Partial<HotkeySequenceRecorderOptions>
}
