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
 * Punctuation keys commonly used in keyboard shortcuts.
 * These are the literal characters as they appear in KeyboardEvent.key
 * (layout-dependent, typically US keyboard layout).
 */
export type PunctuationKey =
  | '/'
  | '['
  | ']'
  | '\\'
  | '='
  | '-'
  | ','
  | '.'
  | '`'

/**
 * Keys that don't change their value when Shift is pressed.
 * These keys produce the same `KeyboardEvent.key` value whether Shift is held or not.
 *
 * Excludes NumberKey (Shift+1 produces '!' on US layout) and PunctuationKey
 * (Shift+',' produces '<' on US layout).
 *
 * Used in hotkey type definitions to prevent layout-dependent issues when Shift
 * is part of the modifier combination.
 */
type NonPunctuationKey =
  | LetterKey
  | NumberKey
  | EditingKey
  | NavigationKey
  | FunctionKey

/**
 * All supported non-modifier keys.
 */
export type Key = NonPunctuationKey | PunctuationKey

/**
 * Keys that can be tracked as "held" (pressed down).
 * Includes both modifier keys and regular keys.
 */
export type HeldKey = CanonicalModifier | Key

// =============================================================================
// Hotkey Types
// =============================================================================

/**
 * Single modifier + key combinations.
 * Uses canonical modifiers (4) + Mod (1) = 5 modifiers.
 * Shift combinations exclude PunctuationKey to avoid layout-dependent issues.
 *
 * The `Mod` modifier is platform-adaptive:
 * - **macOS**: Resolves to `Meta` (Command key ⌘)
 * - **Windows/Linux**: Resolves to `Control` (Ctrl key)
 *
 * This enables cross-platform hotkey definitions that automatically adapt to the platform.
 * For example, `Mod+S` becomes `Command+S` on Mac and `Ctrl+S` on Windows/Linux.
 */
type SingleModifierHotkey =
  | `Control+${Key}`
  | `Alt+${Key}`
  | `Shift+${NonPunctuationKey}`
  | `Meta+${Key}`
  | `Mod+${Key}`

/**
 * Two modifier + key combinations.
 * Shift combinations exclude Numbers and PunctuationKeys to avoid layout-dependent issues.
 *
 * **Platform-adaptive `Mod` combinations:**
 * - `Mod+Alt` and `Mod+Shift` are included (safe on all platforms)
 * - `Mod+Control` and `Mod+Meta` are excluded because they create duplicate modifiers:
 *   - `Mod+Control` duplicates `Control` on Windows/Linux (Mod = Control)
 *   - `Mod+Meta` duplicates `Meta` on macOS (Mod = Meta)
 */
type TwoModifierHotkey =
  | `Control+Alt+${Key}`
  | `Control+Shift+${NonPunctuationKey}`
  | `Control+Meta+${Key}`
  | `Alt+Shift+${NonPunctuationKey}`
  | `Alt+Meta+${Key}`
  | `Shift+Meta+${NonPunctuationKey}`
  | `Mod+Alt+${Key}`
  | `Mod+Shift+${NonPunctuationKey}`

/**
 * Three modifier + key combinations.
 * Shift combinations exclude Numbers and PunctuationKeys to avoid layout-dependent issues.
 *
 * **Platform-adaptive `Mod` combinations:**
 * - `Mod+Alt+Shift` is included (safe on all platforms)
 * - `Mod+Control+Shift` and `Mod+Shift+Meta` are excluded because they create duplicate modifiers:
 *   - `Mod+Control+Shift` duplicates `Control` on Windows/Linux (Mod = Control)
 *   - `Mod+Shift+Meta` duplicates `Meta` on macOS (Mod = Meta)
 */
type ThreeModifierHotkey =
  | `Control+Alt+Shift+${NonPunctuationKey}`
  | `Control+Alt+Meta+${Key}`
  | `Control+Shift+Meta+${NonPunctuationKey}`
  | `Alt+Shift+Meta+${NonPunctuationKey}`
  | `Mod+Alt+Shift+${NonPunctuationKey}`

/**
 * Four modifier + key combinations.
 * Shift combinations exclude Numbers and PunctuationKeys to avoid layout-dependent issues.
 *
 * Only the canonical `Control+Alt+Shift+Meta` combination is included.
 *
 * **Why no `Mod` combinations?**
 * Since `Mod` resolves to either `Control` (Windows/Linux) or `Meta` (macOS), any
 * four-modifier combination with `Mod` would create duplicate modifiers on one platform.
 * For example:
 * - `Mod+Control+Alt+Shift` → duplicates `Control` on Windows/Linux
 * - `Mod+Alt+Shift+Meta` → duplicates `Meta` on macOS
 */
type FourModifierHotkey = `Control+Alt+Shift+Meta+${NonPunctuationKey}`

/**
 * A type-safe hotkey string.
 *
 * Provides autocomplete for:
 * - All single keys (letters, numbers, function keys, navigation, editing, punctuation)
 * - Single modifier + common key (Control+S, Mod+A, Mod+/, etc.)
 * - Two modifiers + common key (Mod+Shift+S, Control+Alt+A, etc.)
 * - Three modifiers + common key (Control+Alt+Shift+A, Mod+Alt+Shift+S, etc.)
 * - Four modifiers + common key (Control+Alt+Shift+Meta+A, etc.)
 *
 * ## Modifier Names
 *
 * Use canonical modifier names:
 * - `Control` (not Ctrl) - The Control key
 * - `Alt` (not Option) - The Alt key (Option on macOS)
 * - `Meta` (not Command/Cmd) - The Meta/Command key (macOS only)
 * - `Shift` - The Shift key
 *
 * ## Platform-Adaptive `Mod` Modifier
 *
 * The `Mod` modifier is a special platform-adaptive modifier that automatically resolves
 * to the "primary modifier" on each platform:
 *
 * - **macOS**: `Mod` → `Meta` (Command key ⌘)
 * - **Windows/Linux**: `Mod` → `Control` (Ctrl key)
 *
 * This enables cross-platform hotkey definitions that work correctly on all platforms
 * without platform-specific code. The `Mod` modifier is resolved at runtime based on
 * the detected platform.
 *
 * **When to use `Mod` vs platform-specific modifiers:**
 * - Use `Mod` for cross-platform shortcuts (e.g., `Mod+S` for save)
 * - Use `Meta` or `Control` when you need platform-specific behavior
 * - Use `Mod` when you want your shortcuts to follow platform conventions automatically
 *
 * **Limitations:**
 * - `Mod+Control` and `Mod+Meta` combinations are not allowed (they create duplicate
 *   modifiers on one platform)
 * - In four-modifier combinations, only canonical modifiers are allowed (no `Mod`)
 *
 * @example
 * ```ts
 * // Cross-platform shortcuts (recommended)
 * const save: Hotkey = 'Mod+S'           // Command+S on Mac, Ctrl+S on Windows/Linux
 * const saveAs: Hotkey = 'Mod+Shift+S'   // Command+Shift+S on Mac, Ctrl+Shift+S elsewhere
 * const comment: Hotkey = 'Mod+/'       // Command+/ on Mac, Ctrl+/ elsewhere
 *
 * // Platform-specific shortcuts
 * const macOnly: Hotkey = 'Meta+S'       // Command+S on Mac only
 * const windowsOnly: Hotkey = 'Control+S' // Ctrl+S on Windows/Linux only
 * ```
 */
export type Hotkey =
  | Key
  | SingleModifierHotkey
  | TwoModifierHotkey
  | ThreeModifierHotkey
  | FourModifierHotkey

/**
 * A parsed representation of a hotkey string.
 *
 * This interface provides a flexible fallback when the `Hotkey` type doesn't
 * fit your use case. You can pass a `ParsedHotkey` directly to hotkey functions
 * instead of a hotkey string, allowing for more dynamic or complex scenarios
 * that aren't covered by the type-safe `Hotkey` union.
 *
 * @example
 * ```ts
 * // Type-safe hotkey string
 * useHotkey('Mod+S', handler)
 *
 * // Fallback: parsed hotkey for dynamic scenarios
 * const parsed = parseHotkey(userInput)
 * useHotkey(parsed, handler) // Works even if userInput isn't in Hotkey type
 * ```
 */
export interface ParsedHotkey {
  /** The non-modifier key (e.g., 'S', 'Escape', 'F1', '/', '['). Can be any string for flexibility. */
  key: Key | (string & {})
  /** Whether the Control key is required */
  ctrl: boolean
  /** Whether the Shift key is required */
  shift: boolean
  /** Whether the Alt key is required */
  alt: boolean
  /** Whether the Meta (Command) key is required */
  meta: boolean
  /** List of canonical modifier names that are required, in canonical order */
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
