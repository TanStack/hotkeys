import type {
  AppHotkey,
  AppHotkeyListItem,
  CustomHotkeys,
  Hotkey,
  HotkeyChordRecorderOptions,
  HotkeyRegistrationView,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
  RegisteredAppHotkeys,
  Target,
} from '@tanstack/hotkeys'
import type {
  AdapterCommonOptions,
  AdapterHotkeyDefinition,
} from '@tanstack/hotkeys/adapter'

/** A reactive value. Read `.value` where the framework tracks dependencies. */
export interface EmberHotkeyState<T> {
  readonly value: T
}

/** The element to listen on. A `null` target skips registration until it is set. */
export type EmberHotkeyTarget = Target | null

/** One hotkey for `useHotkeys` and `onHotkeys`: a chord, a sequence, or an app hotkey. */
export type EmberHotkeyDefinition = AdapterHotkeyDefinition<EmberHotkeyTarget>

/** Options for every kind; each applies to the kinds that support it. */
export type EmberHotkeyCommonOptions = AdapterCommonOptions<EmberHotkeyTarget>

/** Recording state and controls owned by the containing component. */
export interface EmberHotkeyRecorder<THotkey extends Hotkey = Hotkey> {
  /** Whether the recorder is listening for a shortcut. */
  readonly isRecording: boolean
  /** Chords captured so far in a multi-step recording. */
  readonly steps: HotkeySequence
  /** The last committed hotkey, including brackets for physical codes. */
  readonly recordedHotkey: THotkey | null
  /** Start a new recording session. */
  startRecording: () => void
  /** Stop and clear recorder state without calling onRecord or onCancel. */
  stopRecording: () => void
  /** Stop, clear recorder state, and call onCancel. */
  cancelRecording: () => void
  /** Commit the current steps (multi-step recordings). */
  commitRecording: () => void
}

/** Live registration views from the shared hotkey manager. */
export interface HotkeyRegistrationsResult {
  /** Every registration, chords and sequences. Narrow each view with `kind`. */
  readonly hotkeys: Array<HotkeyRegistrationView>
}

/** Every app hotkey with its live status. */
export type EmberAppHotkeyList = EmberHotkeyState<
  Array<AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>>
>

/** Custom hotkey state and actions. */
export interface EmberCustomHotkeys {
  /** The user's hotkeys that differ from the defaults. */
  readonly value: CustomHotkeys
  /**
   * Sets the user's hotkey for an app hotkey. `null` unbinds it.
   * Returns conflicting app hotkeys; when any exist, nothing changes.
   */
  setCustomHotkey: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey | null,
  ) => Array<AppHotkey>
  /** Restores the default hotkey for an app hotkey. */
  resetCustomHotkey: (id: keyof RegisteredAppHotkeys & string) => void
  /** Restores every default hotkey. */
  resetCustomHotkeys: () => void
  /** Other app hotkeys that would collide if `id` used `hotkey`. */
  findConflicts: (
    id: keyof RegisteredAppHotkeys & string,
    hotkey: Hotkey,
  ) => Array<AppHotkey>
}

/** Shared defaults; call-specific options take precedence. */
export interface DefaultHotkeysOptions {
  /** Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences. */
  hotkey?: EmberHotkeyCommonOptions
  /** Defaults for every recorder. */
  hotkeyRecorder?: Partial<
    Omit<
      HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions,
      'maxSteps' | 'onRecord' | 'validate'
    >
  >
}
