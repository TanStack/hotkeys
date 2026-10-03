import type {
  HeldModifierOptions,
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRecorderOptions,
  HotkeyRegistrationView,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
  IndividualKey,
  RegisterableHotkey,
  SequenceOptions,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'
import type {
  HotkeyDefinition,
  HotkeySequenceDefinition,
} from '@tanstack/hotkeys/adapter'

/** A reactive value. Read `.value` where the framework tracks dependencies. */
export interface AlpineHotkeyState<T> {
  readonly value: T
}

/** Recording state and controls owned by the containing scope. */
export interface AlpineHotkeyRecorder {
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
export interface AlpineHotkeySequenceRecorder {
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

/** A value or a getter evaluated within an Alpine effect or reactive read. */
export type MaybeGetter<T> = T | (() => T)

/** Registrations, recorders, and reactive state owned by one Alpine component. */
export interface AlpineHotkeys {
  /** Register one shortcut. Getters track changing bindings and options. */
  createHotkey: (
    hotkey: MaybeGetter<RegisterableHotkey>,
    callback: HotkeyCallback,
    options?: MaybeGetter<HotkeyOptions>,
  ) => void
  /** Reconcile a list of shortcuts. Definition options override common options. */
  createHotkeys: (
    definitions: MaybeGetter<Array<HotkeyDefinition>>,
    options?: MaybeGetter<HotkeyOptions>,
  ) => void
  /** Register consecutive chords with an optional timeout and element target. */
  createHotkeySequence: (
    sequence: MaybeGetter<HotkeySequence>,
    callback: HotkeyCallback,
    options?: MaybeGetter<SequenceOptions>,
  ) => void
  /** Reconcile a changing list of sequences. */
  createHotkeySequences: (
    definitions: MaybeGetter<Array<HotkeySequenceDefinition>>,
    options?: MaybeGetter<SequenceOptions>,
  ) => void
  /** Read held logical key names through `.value`. */
  createHeldKeys: () => AlpineHotkeyState<Array<string>>
  /** Read the mapping of held logical names to physical codes through `.value`. */
  createHeldKeyCodes: () => AlpineHotkeyState<Record<string, string>>
  /** Read whether a key is held through `.value`. */
  createKeyHold: (key: MaybeGetter<IndividualKey>) => AlpineHotkeyState<boolean>
  /** Read whether held modifiers reveal a binding through `.value`. */
  createHotkeyHint: (
    hotkey: MaybeGetter<RegisterableHotkey>,
    options?: MaybeGetter<HeldModifierOptions>,
  ) => AlpineHotkeyState<boolean>
  /** Read live hotkey and sequence registrations, including disabled entries. */
  createHotkeyRegistrations: () => HotkeyRegistrationsResult
  /** Create a recorder whose options can follow Alpine state. */
  createHotkeyRecorder: (
    options: MaybeGetter<HotkeyRecorderOptions>,
  ) => AlpineHotkeyRecorder
  /** Create a sequence recorder with live steps and explicit commit controls. */
  createHotkeySequenceRecorder: (
    options: MaybeGetter<HotkeySequenceRecorderOptions>,
  ) => AlpineHotkeySequenceRecorder
  /** Release every registration, subscription, effect, and recorder. Idempotent. */
  destroy: () => void
}

/** Shared defaults; call-specific options take precedence. */
export interface DefaultHotkeysOptions {
  hotkey?: HotkeyOptions
  hotkeySequence?: SequenceOptions
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequenceRecorder?: Partial<HotkeySequenceRecorderOptions>
}
