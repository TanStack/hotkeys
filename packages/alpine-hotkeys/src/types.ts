import type {
  AppHotkey,
  AppHotkeyListItem,
  CustomHotkeys,
  HeldModifierOptions,
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContextFor,
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeyRegistrationView,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
  IndividualKey,
  RegisterableHotkey,
  RegisteredAppHotkeys,
  Target,
} from '@tanstack/hotkeys'
import type {
  AdapterAppHotkeyOptions,
  AdapterCommonOptions,
  AdapterHotkeyDefinition,
  AdapterOptionsFor,
} from '@tanstack/hotkeys/adapter'

/** A reactive value. Read `.value` where the framework tracks dependencies. */
export interface AlpineHotkeyState<T> {
  readonly value: T
}

/** The element to listen on. A `null` target skips registration until it is set. */
export type AlpineHotkeyTarget = Target | null

/** One hotkey for `createHotkeys`: a chord, a sequence, or an app hotkey. */
export type AlpineHotkeyDefinition = AdapterHotkeyDefinition<AlpineHotkeyTarget>

/** Options for every kind; each applies to the kinds that support it. */
export type AlpineHotkeyCommonOptions = AdapterCommonOptions<AlpineHotkeyTarget>

/** The options type for a hotkey: chord options for chords, sequence options for sequences. */
export type AlpineHotkeyOptionsFor<T extends RegisterableHotkey> =
  AdapterOptionsFor<T, AlpineHotkeyTarget>

/** Call-site options for an app hotkey, typed by its declared default kind. */
export type AlpineAppHotkeyOptions<T extends AppHotkey = AppHotkey> =
  AdapterAppHotkeyOptions<T, AlpineHotkeyTarget>

/** Recording state and controls owned by the containing scope. */
export interface AlpineHotkeyRecorder<THotkey extends Hotkey = Hotkey> {
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

/** Custom hotkey state and actions. */
export interface AlpineCustomHotkeys {
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

/** A value or a getter evaluated within an Alpine effect or reactive read. */
export type MaybeGetter<T> = T | (() => T)

/** Registers a hotkey: a chord, a sequence, or an app hotkey. */
export interface AlpineCreateHotkey {
  <T extends AppHotkey>(
    hotkey: MaybeGetter<T>,
    callback: HotkeyCallback,
    options?: MaybeGetter<AlpineAppHotkeyOptions<T>>,
  ): void
  <const T extends RegisterableHotkey>(
    hotkey: MaybeGetter<T>,
    callback: HotkeyCallback<HotkeyCallbackContextFor<T>>,
    options?: MaybeGetter<AlpineHotkeyOptionsFor<T>>,
  ): void
}

/** Creates a recorder; `maxSteps` (default 1) selects chords or sequences. */
export interface AlpineCreateHotkeyRecorder {
  (options: HotkeyChordRecorderOptions): AlpineHotkeyRecorder<HotkeyChord>
  (options: HotkeySequenceRecorderOptions): AlpineHotkeyRecorder
  // Getter overloads list sequences first: TypeScript keeps a lambda's
  // parameter types from the first overload it tries, and sequence types also
  // fit chords.
  (options: () => HotkeySequenceRecorderOptions): AlpineHotkeyRecorder
  (options: () => HotkeyChordRecorderOptions): AlpineHotkeyRecorder<HotkeyChord>
  (options: () => HotkeyRecorderOptions): AlpineHotkeyRecorder
}

/** Registrations, recorders, and reactive state owned by one Alpine component. */
export interface AlpineHotkeys {
  /**
   * Register one hotkey: a chord such as `'Mod+S'`, a sequence such as
   * `['G', 'G']`, or an app hotkey. Getters track changing hotkeys and options.
   */
  createHotkey: AlpineCreateHotkey
  /** Reconcile a list of hotkeys. Definition options override common options. */
  createHotkeys: (
    definitions: MaybeGetter<ReadonlyArray<AlpineHotkeyDefinition>>,
    options?: MaybeGetter<AlpineHotkeyCommonOptions>,
  ) => void
  /** Read held logical key names through `.value`. */
  createHeldKeys: () => AlpineHotkeyState<Array<string>>
  /** Read the mapping of held logical names to physical codes through `.value`. */
  createHeldKeyCodes: () => AlpineHotkeyState<Record<string, string>>
  /** Read whether a key is held through `.value`. */
  createKeyHold: (key: MaybeGetter<IndividualKey>) => AlpineHotkeyState<boolean>
  /** Read whether held modifiers reveal a hotkey through `.value`. */
  createHotkeyHint: (
    hotkey: MaybeGetter<RegisterableHotkey | AppHotkey>,
    options?: MaybeGetter<HeldModifierOptions>,
  ) => AlpineHotkeyState<boolean>
  /** Read live registrations, including disabled entries. */
  createHotkeyRegistrations: () => HotkeyRegistrationsResult
  /** Create a recorder whose options can follow Alpine state. */
  createHotkeyRecorder: AlpineCreateHotkeyRecorder
  /** Read the effective app hotkeys from `provideAppHotkeys` through `.value`. */
  createAppHotkeys: () => AlpineHotkeyState<RegisteredAppHotkeys>
  /** Read every app hotkey with its live status through `.value`. */
  createAppHotkeyList: () => AlpineHotkeyState<
    Array<AppHotkeyListItem<RegisteredAppHotkeys[keyof RegisteredAppHotkeys]>>
  >
  /** Read and change the user's custom hotkeys. */
  createCustomHotkeys: () => AlpineCustomHotkeys
  /** Release every registration, subscription, effect, and recorder. Idempotent. */
  destroy: () => void
}

/** Shared defaults; call-specific options take precedence. */
export interface DefaultHotkeysOptions {
  /** Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences. */
  hotkey?: AlpineHotkeyCommonOptions
  /** Defaults for every recorder. */
  hotkeyRecorder?: Partial<
    Omit<
      HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions,
      'maxSteps' | 'onRecord' | 'validate'
    >
  >
}
