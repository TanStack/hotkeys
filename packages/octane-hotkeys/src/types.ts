import type {
  HotkeyRegistrationsResult as CoreHotkeyRegistrationsResult,
  CustomHotkeyActions,
  CustomHotkeys,
  Hotkey,
  HotkeyRecorderActions,
  HotkeyRecorderState,
  HotkeyRegistrationView,
} from '@tanstack/hotkeys'

/** Recording state and controls owned by the containing component. */
export interface OctaneHotkeyRecorder<THotkey extends Hotkey = Hotkey>
  extends HotkeyRecorderState<THotkey>, HotkeyRecorderActions {}

/** Live registration views from the shared hotkey manager. */
export interface HotkeyRegistrationsResult extends CoreHotkeyRegistrationsResult {
  /** Every registration, chords and sequences. Narrow each view with `kind`. */
  hotkeys: Array<HotkeyRegistrationView>
}

/** Custom hotkey state and actions returned by `useCustomHotkeys`. */
export interface UseCustomHotkeysResult extends CustomHotkeyActions {
  /** The user's hotkeys that differ from the defaults. */
  customHotkeys: CustomHotkeys
}
