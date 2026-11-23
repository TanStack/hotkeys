import type {
  AppHotkey,
  CustomHotkeyActions,
  CustomHotkeys,
  HeldModifierOptions,
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContextFor,
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyPlatform,
  HotkeyRecorderActions,
  HotkeyRecorderOptions,
  HotkeyRecorderState,
  HotkeyRegistrationsResult,
  HotkeyScopesState,
  HotkeySequenceRecorderOptions,
  IndividualKey,
  KeyboardLayoutMap,
  MaybeGetter,
  RegisterableHotkey,
  RegisteredAppHotkeyListItem,
  RegisteredAppHotkeys,
  Target,
  formatForDisplay,
} from '@tanstack/hotkeys'
import type {
  AdapterAppHotkeyOptions,
  AdapterCommonOptions,
  AdapterHotkeyDefinition,
  AdapterOptionsFor,
  HotkeyRecorderDefaults,
} from '@tanstack/hotkeys/adapter'

/** A reactive value. Read `.value` where the framework tracks dependencies. */
export interface AlpineHotkeyState<T> {
  readonly value: T
}

/**
 * The element to listen on. A `null` or `undefined` target skips registration
 * until it is set. Omit `target` for the document.
 */
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
export interface AlpineHotkeyRecorder<THotkey extends Hotkey = Hotkey>
  extends Readonly<HotkeyRecorderState<THotkey>>, HotkeyRecorderActions {}

/** Custom hotkey state and actions. */
export interface AlpineCustomHotkeys extends CustomHotkeyActions {
  /** The user's hotkeys that differ from the defaults. */
  readonly value: CustomHotkeys
}

/** Registers a hotkey: a chord, a sequence, or an app hotkey. */
export interface AlpineCreateHotkey {
  <T extends AppHotkey>(
    hotkey: MaybeGetter<T | null | undefined>,
    callback: HotkeyCallback,
    options?: MaybeGetter<AlpineAppHotkeyOptions<T>>,
  ): void
  <const T extends RegisterableHotkey>(
    hotkey: MaybeGetter<T | null | undefined>,
    callback: HotkeyCallback<HotkeyCallbackContextFor<T>>,
    options?: MaybeGetter<AlpineHotkeyOptionsFor<T>>,
  ): void
}

/** `$hotkeyRecorder`: creates a recorder; `maxSteps` (default 1) selects chords or sequences. */
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

/** Registrations and reactive state owned by one Alpine component. */
export interface AlpineHotkeys {
  /**
   * Register one hotkey: a chord such as `'Mod+S'`, a sequence such as
   * `['G', 'G']`, or an app hotkey. Getters track changing hotkeys and options.
   * `undefined`, `null`, or `''` registers nothing, for an optional shortcut.
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
  /**
   * Read whether held modifiers reveal a hotkey through `.value`. No hotkey
   * (`undefined`, `null`, or `''`) is never visible.
   */
  createHotkeyHint: (
    hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
    options?: MaybeGetter<HeldModifierOptions>,
  ) => AlpineHotkeyState<boolean>
  /** Read live registrations, including disabled entries. */
  createHotkeyRegistrations: () => HotkeyRegistrationsResult
  /** Read the active, exclusive, allowed, and suspended scopes through `.value`. */
  createHotkeyScopesState: () => AlpineHotkeyState<HotkeyScopesState>
  /**
   * Returns `formatForDisplay` with the scope's `platform` as the default, or
   * the detected platform without one. A `platform` passed to the returned
   * function wins.
   *
   * Physical bindings such as `[KeyQ]` are labeled with the character the key
   * types for this user in Chromium browsers, once the keyboard layout has
   * loaded. A getter or an `x-text` expression that calls the function runs
   * again when the layout arrives. See `createKeyboardLayout`. A `layoutMap`
   * passed to the returned function wins. To never ask the browser for the
   * layout, set `keyboardLayout: false` in the scope's default options. Firefox
   * and Safari report no layout, so labels there keep the key's US character.
   *
   * Create it once, then call the returned function anywhere.
   *
   * @example
   * ```ts
   * Alpine.data('saveButton', () => {
   *   const hotkeys = createHotkeysScope()
   *   const formatForDisplay = hotkeys.createFormatForDisplay()
   *
   *   return {
   *     get label() {
   *       return formatForDisplay('Mod+S')
   *     },
   *     destroy() {
   *       hotkeys.destroy()
   *     },
   *   }
   * })
   * ```
   */
  createFormatForDisplay: () => typeof formatForDisplay
  /**
   * Read the browser's keyboard layout through `.value`, or `null` until it
   * loads and in browsers that don't report one. The layout maps each physical
   * code to the character it types, such as `KeyQ` to `a` on a French AZERTY
   * keyboard. Only Chromium browsers report one.
   *
   * Creating it is what loads the layout. The layout is read again when the
   * window regains focus, until the scope is destroyed.
   * `createFormatForDisplay` uses it, so you only need it for labels you draw
   * yourself.
   *
   * To never ask the browser for the layout, set `keyboardLayout: false` in
   * the scope's default options. `.value` is then `null`.
   *
   * @example
   * ```ts
   * Alpine.data('moveKeys', () => {
   *   const hotkeys = createHotkeysScope()
   *   const layout = hotkeys.createKeyboardLayout()
   *
   *   return {
   *     label(code: string) {
   *       return (layout.value?.get(code) ?? code).toUpperCase()
   *     },
   *     destroy() {
   *       hotkeys.destroy()
   *     },
   *   }
   * })
   * ```
   */
  createKeyboardLayout: () => AlpineHotkeyState<KeyboardLayoutMap | null>
  /** Read the effective app hotkeys from `provideAppHotkeys` through `.value`. */
  createAppHotkeys: () => AlpineHotkeyState<RegisteredAppHotkeys>
  /** Read every app hotkey with its live status through `.value`. */
  createAppHotkeyList: () => AlpineHotkeyState<
    Array<RegisteredAppHotkeyListItem>
  >
  /** Read and change the user's custom hotkeys. */
  createCustomHotkeys: () => AlpineCustomHotkeys
  /** Release every registration, subscription, effect, and recorder. Idempotent. */
  destroy: () => void
}

/** Shared defaults; call-specific options take precedence. */
export interface DefaultHotkeysOptions {
  /**
   * The user's platform, for labels from `createFormatForDisplay`, hotkeys,
   * and recorders. `hotkey.platform` and `hotkeyRecorder.platform` win.
   * Detected when unset.
   */
  platform?: HotkeyPlatform
  /**
   * Whether labels from `createFormatForDisplay` follow the user's keyboard
   * layout, so `[KeyQ]` reads `A` on a French AZERTY keyboard. The layout
   * loads from the browser when the first `createFormatForDisplay` or
   * `createKeyboardLayout` runs. Only Chromium browsers report one. Set
   * `false` to never ask the browser for it. Default: `true`.
   */
  keyboardLayout?: boolean
  /** Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences. */
  hotkey?: AlpineHotkeyCommonOptions
  /** Defaults for every recorder. */
  hotkeyRecorder?: HotkeyRecorderDefaults
}
