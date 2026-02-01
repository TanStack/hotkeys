// =============================================================================
// Modifier Types
// =============================================================================

/**
 * All supported modifier key names, including aliases.
 * - Control/Ctrl: The Control key
 * - Shift: The Shift key
 * - Alt/Option: The Alt key (Option on macOS)
 * - Command/Cmd: The Command key (macOS only)
 * - CommandOrControl/Mod: Command on macOS, Control on other platforms
 */
export type Modifier =
  | 'Control'
  | 'Ctrl'
  | 'Shift'
  | 'Alt'
  | 'Option'
  | 'Command'
  | 'Cmd'
  | 'CommandOrControl'
  | 'Mod'

/**
 * Canonical modifier names that map to KeyboardEvent properties.
 */
export type CanonicalModifier = 'Control' | 'Shift' | 'Alt' | 'Meta'

// =============================================================================
// Key Types
// =============================================================================

/**
 * Letter keys A-Z (case-insensitive in matching).
 */
export type LetterKey =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

/**
 * Number keys 0-9.
 */
export type NumberKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'

/**
 * Function keys F1-F12.
 */
export type FunctionKey =
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'

/**
 * Navigation keys for cursor movement.
 */
export type NavigationKey =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'

/**
 * Editing and special keys.
 */
export type EditingKey =
  | 'Enter'
  | 'Escape'
  | 'Space'
  | 'Tab'
  | 'Backspace'
  | 'Delete'

/**
 * All supported non-modifier keys.
 */
export type Key =
  | LetterKey
  | NumberKey
  | FunctionKey
  | NavigationKey
  | EditingKey

/**
 * Keys that can be tracked as "held" (pressed down).
 * Includes both modifier keys and regular keys.
 */
export type HeldKey = CanonicalModifier | Key

// =============================================================================
// Hotkey Types
// =============================================================================

/**
 * Keys commonly used with hotkeys (letters and editing keys).
 * Used to limit type expansion for better TypeScript performance.
 */
type CommonKey = LetterKey | EditingKey

/**
 * Single modifier + key combinations.
 * Uses canonical modifiers (4) + Mod (1) = 5 modifiers.
 * 5 × 32 common keys = 160 combinations.
 */
type SingleModifierHotkey =
  | `Control+${CommonKey}`
  | `Alt+${CommonKey}`
  | `Shift+${CommonKey}`
  | `Meta+${CommonKey}`
  | `Mod+${CommonKey}`

/**
 * Two modifier combinations in canonical order.
 * C(4,2) = 6 combinations + 4 Mod combinations = 10.
 * 10 × 32 common keys = 320 combinations.
 */
type TwoModifierCombo =
  | 'Control+Alt'
  | 'Control+Shift'
  | 'Control+Meta'
  | 'Alt+Shift'
  | 'Alt+Meta'
  | 'Shift+Meta'
  // Mod combinations (most common cross-platform)
  | 'Mod+Alt'
  | 'Mod+Shift'
  | 'Mod+Control'
  | 'Mod+Meta'

type TwoModifierHotkey = `${TwoModifierCombo}+${CommonKey}`

/**
 * Three modifier combinations in canonical order.
 * C(4,3) = 4 combinations + 3 Mod combinations = 7.
 * 7 × 32 common keys = 224 combinations.
 */
type ThreeModifierCombo =
  | 'Control+Alt+Shift'
  | 'Control+Alt+Meta'
  | 'Control+Shift+Meta'
  | 'Alt+Shift+Meta'
  // Mod combinations
  | 'Mod+Alt+Shift'
  | 'Mod+Control+Shift'
  | 'Mod+Shift+Meta'

type ThreeModifierHotkey = `${ThreeModifierCombo}+${CommonKey}`

/**
 * A type-safe hotkey string.
 *
 * Provides autocomplete for:
 * - All single keys (letters, numbers, function keys, navigation, editing)
 * - Single modifier + common key (Control+S, Mod+A, etc.)
 * - Two modifiers + common key (Mod+Shift+S, Control+Alt+A, etc.)
 * - Three modifiers + common key (Control+Alt+Shift+A, etc.)
 *
 * Use canonical modifier names:
 * - `Control` (not Ctrl)
 * - `Alt` (not Option)
 * - `Meta` (not Command/Cmd)
 * - `Mod` for cross-platform (Command on Mac, Control elsewhere)
 *
 * @example
 * ```ts
 * const save: Hotkey = 'Mod+S'           // ✓ Cross-platform save
 * const saveAs: Hotkey = 'Mod+Shift+S'   // ✓ Cross-platform save as
 * const macOnly: Hotkey = 'Meta+S'       // ✓ Command+S on Mac only
 * ```
 */
export type Hotkey =
  | Key
  | SingleModifierHotkey
  | TwoModifierHotkey
  | ThreeModifierHotkey

/**
 * A parsed representation of a hotkey string.
 */
export interface ParsedHotkey {
  /** The non-modifier key (e.g., 'S', 'Escape', 'F1') */
  key: string
  /** Whether the Control key is required */
  ctrl: boolean
  /** Whether the Shift key is required */
  shift: boolean
  /** Whether the Alt key is required */
  alt: boolean
  /** Whether the Meta (Command) key is required */
  meta: boolean
  /** List of canonical modifier names that are required */
  modifiers: Array<CanonicalModifier>
}

/**
 * Options for formatting hotkeys for display.
 */
export interface FormatDisplayOptions {
  /** The target platform. Defaults to auto-detection. */
  platform?: 'mac' | 'windows' | 'linux'
}

/**
 * Result of validating a hotkey string.
 */
export interface ValidationResult {
  /** Whether the hotkey is valid (can still have warnings) */
  valid: boolean
  /** Warning messages about potential issues */
  warnings: Array<string>
  /** Error messages about invalid syntax */
  errors: Array<string>
}

// =============================================================================
// Callback Types
// =============================================================================

/**
 * Context passed to hotkey callbacks along with the keyboard event.
 */
export interface HotkeyCallbackContext {
  /** The original hotkey string that was registered */
  hotkey: Hotkey
  /** The parsed representation of the hotkey */
  parsedHotkey: ParsedHotkey
}

/**
 * Callback function type for hotkey handlers.
 *
 * @param event - The keyboard event that triggered the hotkey
 * @param context - Additional context including the hotkey and parsed hotkey
 *
 * @example
 * ```ts
 * const handler: HotkeyCallback = (event, { hotkey, parsedHotkey }) => {
 *   console.log(`Hotkey ${hotkey} was pressed`)
 *   console.log(`Modifiers:`, parsedHotkey.modifiers)
 * }
 * ```
 */
export type HotkeyCallback = (
  event: KeyboardEvent,
  context: HotkeyCallbackContext,
) => void

// =============================================================================
// Options Types
// =============================================================================

/**
 * Options for registering a hotkey.
 */
export interface HotkeyOptions {
  /** Prevent the default browser action when the hotkey matches */
  preventDefault?: boolean
  /** Stop event propagation when the hotkey matches */
  stopPropagation?: boolean
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
  /** The event type to listen for. Defaults to 'keydown' */
  eventType?: 'keydown' | 'keyup'
  /** If true, only trigger once until all keys are released. Default: false */
  requireReset?: boolean
  /** Whether the hotkey is enabled. Defaults to true */
  enabled?: boolean
}

// =============================================================================
// Sequence Types
// =============================================================================

/**
 * A sequence of hotkeys for Vim-style shortcuts.
 *
 * @example
 * ```ts
 * const gotoTop: HotkeySequence = ['G', 'G']  // gg
 * const deleteLine: HotkeySequence = ['D', 'D']  // dd
 * const deleteWord: HotkeySequence = ['D', 'I', 'W']  // diw
 * ```
 */
export type HotkeySequence = Array<Hotkey>

/**
 * Options for hotkey sequence matching.
 */
export interface SequenceOptions extends HotkeyOptions {
  /** Timeout between keys in milliseconds. Default: 1000 */
  timeout?: number
}

// =============================================================================
// Registration Types
// =============================================================================

/**
 * A registered hotkey handler in the HotkeyManager.
 */
export interface HotkeyRegistration {
  /** Unique identifier for this registration */
  id: string
  /** The original hotkey string */
  hotkey: Hotkey
  /** The parsed hotkey */
  parsedHotkey: ParsedHotkey
  /** The callback to invoke */
  callback: HotkeyCallback
  /** Options for this registration */
  options: HotkeyOptions
  /** Whether this registration has fired and needs reset (for requireReset) */
  hasFired: boolean
}
