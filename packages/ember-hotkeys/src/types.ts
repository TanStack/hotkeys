import type {
  CustomHotkeyActions,
  CustomHotkeys,
  Hotkey,
  HotkeyPlatform,
  HotkeyRecorderActions,
  HotkeyRecorderState,
  RegisteredAppHotkeyListItem,
  Target,
} from '@tanstack/hotkeys'
import type {
  AdapterCommonOptions,
  AdapterHotkeyDefinition,
  HotkeyRecorderDefaults,
} from '@tanstack/hotkeys/adapter'

/** A reactive value. Read `.value` where the framework tracks dependencies. */
export interface EmberHotkeyState<T> {
  readonly value: T
}

/**
 * The element to listen on. A `null` or `undefined` target skips registration
 * until it is set. Omit `target` for the document.
 */
export type EmberHotkeyTarget = Target | null

/** One hotkey for `useHotkeys` and `onHotkeys`: a chord, a sequence, or an app hotkey. */
export type EmberHotkeyDefinition = AdapterHotkeyDefinition<EmberHotkeyTarget>

/** Options for every kind; each applies to the kinds that support it. */
export type EmberHotkeyCommonOptions = AdapterCommonOptions<EmberHotkeyTarget>

/** Recording state and controls owned by the containing component. */
export interface EmberHotkeyRecorder<THotkey extends Hotkey = Hotkey>
  extends Readonly<HotkeyRecorderState<THotkey>>, HotkeyRecorderActions {}

/** Every app hotkey with its live status. */
export type EmberAppHotkeyList = EmberHotkeyState<
  Array<RegisteredAppHotkeyListItem>
>

/** Custom hotkey state and actions. */
export interface EmberCustomHotkeys extends CustomHotkeyActions {
  /** The user's hotkeys that differ from the defaults. */
  readonly value: CustomHotkeys
}

/** Shared defaults; call-specific options take precedence. */
export interface DefaultHotkeysOptions {
  /**
   * The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
   * recorders. `hotkey.platform` and `hotkeyRecorder.platform` win. Detected
   * when unset. On a server, set it from the request with
   * `detectPlatform(userAgent)`.
   */
  platform?: HotkeyPlatform
  /**
   * Whether labels from `useFormatForDisplay` follow the user's keyboard
   * layout, so `[KeyQ]` reads `A` on a French AZERTY keyboard. The layout
   * loads from the browser when the first label renders. Only Chromium
   * browsers report one. Set `false` to never ask the browser for it.
   * Default: `true`.
   */
  keyboardLayout?: boolean
  /** Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences. */
  hotkey?: EmberHotkeyCommonOptions
  /** Defaults for every recorder. */
  hotkeyRecorder?: HotkeyRecorderDefaults
}
