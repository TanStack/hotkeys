import type {
  AppHotkey,
  CustomHotkeys,
  Hotkey,
  HotkeyRegistrationView,
  HotkeySequence,
  RegisteredAppHotkeys,
} from '@tanstack/hotkeys'

/** Recording state and controls owned by the containing component. */
export interface OctaneHotkeyRecorder<THotkey extends Hotkey = Hotkey> {
  /** Whether the recorder is listening for a shortcut. */
  isRecording: boolean
  /** Chords captured so far in a multi-step recording. */
  steps: HotkeySequence
  /** The last committed hotkey, including brackets for physical codes. */
  recordedHotkey: THotkey | null
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
  hotkeys: Array<HotkeyRegistrationView>
}

/** Custom hotkey state and actions returned by `useCustomHotkeys`. */
export interface UseCustomHotkeysResult {
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: CustomHotkeys
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
