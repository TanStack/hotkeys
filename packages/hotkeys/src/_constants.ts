// Constants that the core uses internally. Public constants live in
// `constants.ts` and `display-labels.ts`, which `index.ts` exports. Keep each
// table here, so code that needs the same facts reuses one copy.

import type { HotkeyRecorderState } from './hotkey-recorder'
import type { ConflictBehavior } from './hotkey.types'

// Scopes and registration defaults

/** The scope of hotkeys that do not name one. It is always active unless an exclusive scope is active. */
export const GLOBAL_SCOPE = 'global'

/**
 * Default options for hotkey/sequence registration.
 * Omitted: platform, target (resolved at registration), requireReset (HotkeyManager only).
 */
export const defaultHotkeyOptions = {
  capture: false,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown' as const,
  enabled: true,
  ignoreInputs: 'auto' as const,
  conflictBehavior: 'warn' as ConflictBehavior,
  scope: GLOBAL_SCOPE as string,
}

// Named keys

/** Names defined for both KeyboardEvent.key and KeyboardEvent.code, beyond the basic key groups. */
export const SHARED_NAMED_KEYS = [
  'CapsLock',
  'ContextMenu',
  'Convert',
  'KanaMode',
  'NonConvert',
  'Help',
  'Insert',
  'NumLock',
  'Fn',
  'FnLock',
  'PrintScreen',
  'ScrollLock',
  'Pause',
  'BrowserBack',
  'BrowserFavorites',
  'BrowserForward',
  'BrowserHome',
  'BrowserRefresh',
  'BrowserSearch',
  'BrowserStop',
  'Eject',
  'LaunchMail',
  'MediaPlayPause',
  'MediaStop',
  'MediaTrackNext',
  'MediaTrackPrevious',
  'Power',
  'AudioVolumeDown',
  'AudioVolumeMute',
  'AudioVolumeUp',
  'WakeUp',
  'Hyper',
  'Super',
  'Again',
  'Copy',
  'Cut',
  'Find',
  'Open',
  'Paste',
  'Props',
  'Select',
  'Undo',
  'Hiragana',
  'Katakana',
] as const

/** Logical counterparts whose physical positions use different names (for example Sleep and Lang1). */
export const LOGICAL_ONLY_NAMED_KEYS = [
  'Clear',
  'Cancel',
  'Standby',
  'LaunchApplication1',
  'LaunchApplication2',
  'LaunchMediaPlayer',
  'HangulMode',
  'HanjaMode',
  'Zenkaku',
  'Hankaku',
  'ZenkakuHankaku',
] as const

// Physical codes

/**
 * Physical codes, other than letters, digits, and punctuation, that the
 * logical matcher falls back to: the numpad operators, the numpad Enter, and
 * the space bar. Matching depends on this list, so a code added here starts
 * matching a logical key.
 */
export const NAMED_CODE_KEYS: Readonly<Record<string, string>> = {
  NumpadAdd: '+',
  NumpadSubtract: '-',
  NumpadMultiply: '*',
  NumpadDivide: '/',
  NumpadDecimal: '.',
  NumpadEnter: 'Enter',
  Space: 'Space',
}

/**
 * Fallback labels for keys with no US equivalent, from the legends the UI
 * Events code spec gives: `\` on UK ISO keyboards, and `\` (ろ) and `¥` on
 * Japanese keyboards. `formatForDisplay` and `formatForAria` use them;
 * matching never does.
 */
export const INTL_KEY_LABELS: Readonly<Record<string, string>> = {
  IntlBackslash: '\\',
  IntlRo: '\\',
  IntlYen: '¥',
}

/**
 * Numpad codes whose key value differs from the code name, beyond the digits
 * and `NAMED_CODE_KEYS`. `formatForAria` names them, and character-key
 * suspension treats the ones that type a character as character keys. They
 * stay out of `NAMED_CODE_KEYS`, so a logical `(` hotkey doesn't start
 * matching `[NumpadParenLeft]`.
 */
export const NUMPAD_KEY_VALUES: Readonly<Record<string, string>> = {
  NumpadBackspace: 'Backspace',
  NumpadClear: 'Clear',
  NumpadComma: ',',
  NumpadEqual: '=',
  NumpadHash: '#',
  NumpadParenLeft: '(',
  NumpadParenRight: ')',
  NumpadStar: '*',
}

/**
 * Codes that are not also key values, such as `NumpadMemoryAdd` or `Lang1`.
 * Every other supported code, such as `Enter` or `F1`, names its key.
 */
export const CODE_ONLY_NAMES =
  /^(?:Numpad\w*|Lang\d|LaunchApp\d|MediaSelect|Sleep|Turbo|Abort|Resume|Suspend)$/

// What keys type

/** What US Shift types on each punctuation key, and the key itself. */
export const US_SHIFTED = '~_+{}|:"<>?'
export const US_UNSHIFTED = "`-=[]\\;',./"

/**
 * Function keys (`F1` to `F24`) and media keys: the audio, browser, launch,
 * and playback keys. They type nothing, and a text field does nothing with them.
 */
export const NON_TYPING_KEY =
  /^(F([1-9]|1\d|2[0-4])$|Audio|Browser|Launch|Media)/

// Keys that focused controls use themselves

// Plain array literals, not spreads, so bundlers can drop lists a build doesn't use
export const VERTICAL_KEYS = ['ArrowUp', 'ArrowDown']
export const HORIZONTAL_KEYS = ['ArrowLeft', 'ArrowRight']
export const ENTER_KEYS = ['Enter']
export const SPACE_KEYS = ['Space']
export const ACTIVATION_KEYS = ['Enter', 'Space']
// Marks widgets that move focus to the item starting with a typed character
export const TYPEAHEAD = 'typeahead'
export const MENU_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'Enter',
  'Space',
  TYPEAHEAD,
]
export const COMBOBOX_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'Enter',
  'Space',
  TYPEAHEAD,
]
export const GRID_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter',
  'Space',
]
export const RADIO_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
]
export const NAVIGATION_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]
export const SPIN_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]
// Read-only text inputs still move the caret and select text
export const CARET_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

/**
 * Input types that aren't text fields, with the keys each one keeps. Browsers
 * report unknown types as `'text'`.
 */
export const INPUT_KEYS: Record<string, ReadonlyArray<string> | undefined> = {
  button: ACTIVATION_KEYS,
  submit: ACTIVATION_KEYS,
  reset: ACTIVATION_KEYS,
  image: ACTIVATION_KEYS,
  color: ACTIVATION_KEYS,
  file: ACTIVATION_KEYS,
  checkbox: SPACE_KEYS,
  radio: RADIO_KEYS,
  range: NAVIGATION_KEYS,
}

// Server detection

// Server runtimes that define `navigator` describe the server, not the user.
export const SERVER_AGENT = /^(?:Node\.js\/|Deno\/|Bun\/|Cloudflare-Workers)/

// Recorder

/** The recorder's state while it isn't recording and has recorded nothing. */
export const INITIAL_RECORDER_STATE: HotkeyRecorderState = {
  isRecording: false,
  steps: [],
  recordedHotkey: null,
}
