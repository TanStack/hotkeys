import type { LOGICAL_ONLY_NAMED_KEYS, SHARED_NAMED_KEYS } from './_named-keys'

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
 * Function keys F1-F24, supported as both logical keys and physical codes.
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
  | 'F13'
  | 'F14'
  | 'F15'
  | 'F16'
  | 'F17'
  | 'F18'
  | 'F19'
  | 'F20'
  | 'F21'
  | 'F22'
  | 'F23'
  | 'F24'

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
 * Printable punctuation glyphs used in keyboard shortcuts. Matching uses the
 * final KeyboardEvent.key glyph, independent of which layout produced it.
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
  | ';'
  | '`'
  | "'"
  | '+'
  | '?'
  | '!'
  | '@'
  | '#'
  | '$'
  | '%'
  | '^'
  | '&'
  | '*'
  | '('
  | ')'
  | '_'
  | '{'
  | '}'
  | '|'
  | ':'
  | '"'
  | '<'
  | '>'
  | '~'

/** Additional named logical keys, including media, browser, lock, and input-mode keys. */
export type NamedKey =
  | (typeof SHARED_NAMED_KEYS)[number]
  | (typeof LOGICAL_ONLY_NAMED_KEYS)[number]

/** Supported logical key names other than printable punctuation. */
export type NonPunctuationKey =
  | LetterKey
  | NumberKey
  | EditingKey
  | NavigationKey
  | FunctionKey
  | NamedKey

/**
 * Supported physical KeyboardEvent.code names, independent of keyboard layout.
 * Letter, digit, numpad, and sided modifier names use finite template unions.
 * `Unidentified` is excluded because it cannot identify a physical key.
 *
 * @see https://www.w3.org/TR/uievents-code/
 */
export type PhysicalKeyCode =
  | `Key${LetterKey}`
  | `Digit${NumberKey}`
  | `Numpad${NumberKey}`
  | `${'Alt' | 'Control' | 'Meta' | 'Shift'}${'Left' | 'Right'}`
  | EditingKey
  | NavigationKey
  | FunctionKey
  | (typeof SHARED_NAMED_KEYS)[number]
  | 'Backquote'
  | 'Backslash'
  | 'BracketLeft'
  | 'BracketRight'
  | 'Comma'
  | 'Equal'
  | 'IntlBackslash'
  | 'IntlRo'
  | 'IntlYen'
  | 'Minus'
  | 'Period'
  | 'Quote'
  | 'Semicolon'
  | 'Slash'
  | `Lang${1 | 2 | 3 | 4 | 5}`
  | `Numpad${
      | 'Add'
      | 'Backspace'
      | 'Clear'
      | 'ClearEntry'
      | 'Comma'
      | 'Decimal'
      | 'Divide'
      | 'Enter'
      | 'Equal'
      | 'Hash'
      | 'MemoryAdd'
      | 'MemoryClear'
      | 'MemoryRecall'
      | 'MemoryStore'
      | 'MemorySubtract'
      | 'Multiply'
      | 'ParenLeft'
      | 'ParenRight'
      | 'Star'
      | 'Subtract'}`
  | 'LaunchApp1'
  | 'LaunchApp2'
  | 'MediaSelect'
  | 'Sleep'
  | 'Turbo'
  | 'Abort'
  | 'Resume'
  | 'Suspend'

/**
 * An explicit physical key token. All codes use brackets, including names such
 * as `[Enter]` that also exist as logical keys. Invalid code names are rejected
 * by TypeScript, and supported names are available in autocomplete.
 */
export type PhysicalKey = `[${PhysicalKeyCode}]`

/** Supported logical key names, excluding bracketed physical-code syntax. */
export type LogicalKey = NonPunctuationKey | PunctuationKey

/** All supported logical keys and bracketed physical key tokens. */
export type Key = LogicalKey | PhysicalKey

/**
 * Includes both modifier keys and regular keys.
 */
export type IndividualKey = CanonicalModifier | Key

/** Keyboard event properties normalized for internal matching and recording. */
export interface NormalizedKeyboardEvent {
  key: string
  code: string
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  altGraph: boolean
  location: number
  isComposing: boolean
}
