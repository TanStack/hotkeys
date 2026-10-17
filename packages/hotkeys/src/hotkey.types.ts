import type { CanonicalModifier, Key, LogicalKey } from './key.types'

// =============================================================================
// HotkeyChord Types
// =============================================================================

/**
 * Single modifier + key combinations.
 * Uses canonical modifiers (4) + Mod (1) = 5 modifiers.
 *
 * The `Mod` modifier is platform-adaptive:
 * - **macOS**: Resolves to `Meta` (Command key ⌘)
 * - **Windows/Linux**: Resolves to `Control` (Ctrl key)
 *
 * This enables cross-platform hotkey definitions that automatically adapt to the platform.
 * For example, `Mod+S` becomes `Command+S` on Mac and `Ctrl+S` on Windows/Linux.
 */
export type SingleModifierHotkeyChord =
  | `Control+${Key}`
  | `Alt+${Key}`
  | `Shift+${Key}`
  | `Meta+${Key}`
  | `Mod+${Key}`

/**
 * Two modifier + key combinations.
 *
 * **Platform-adaptive `Mod` combinations:**
 * - `Mod+Alt` and `Mod+Shift` are included (safe on all platforms)
 * - `Mod+Control` and `Mod+Meta` are excluded because they create duplicate modifiers:
 *   - `Mod+Control` duplicates `Control` on Windows/Linux (Mod = Control)
 *   - `Mod+Meta` duplicates `Meta` on macOS (Mod = Meta)
 */
export type TwoModifierHotkeyChord =
  | `Control+Alt+${Key}`
  | `Control+Shift+${Key}`
  | `Control+Meta+${Key}`
  | `Alt+Shift+${Key}`
  | `Alt+Meta+${Key}`
  | `Shift+Meta+${Key}`
  | `Mod+Alt+${Key}`
  | `Mod+Shift+${Key}`

/**
 * Three modifier + key combinations.
 *
 * **Platform-adaptive `Mod` combinations:**
 * - `Mod+Alt+Shift` is included (safe on all platforms)
 * - `Mod+Control+Shift` and `Mod+Shift+Meta` are excluded because they create duplicate modifiers:
 *   - `Mod+Control+Shift` duplicates `Control` on Windows/Linux (Mod = Control)
 *   - `Mod+Shift+Meta` duplicates `Meta` on macOS (Mod = Meta)
 */
export type ThreeModifierHotkeyChord =
  | `Control+Alt+Shift+${Key}`
  | `Control+Alt+Meta+${Key}`
  | `Control+Shift+Meta+${Key}`
  | `Alt+Shift+Meta+${Key}`
  | `Mod+Alt+Shift+${Key}`

/**
 * Four modifier + key combinations.
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
export type FourModifierHotkeyChord = `Control+Alt+Shift+Meta+${Key}`

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
 * const save: HotkeyChord = 'Mod+S'           // Command+S on Mac, Ctrl+S on Windows/Linux
 * const saveAs: HotkeyChord = 'Mod+Shift+S'   // Command+Shift+S on Mac, Ctrl+Shift+S elsewhere
 * const comment: HotkeyChord = 'Mod+/'       // Command+/ on Mac, Ctrl+/ elsewhere
 *
 * // Platform-specific shortcuts
 * const macOnly: HotkeyChord = 'Meta+S'       // Command+S on Mac only
 * const windowsOnly: HotkeyChord = 'Control+S' // Ctrl+S on Windows/Linux only
 * ```
 */
export type HotkeyChord =
  | Key
  | SingleModifierHotkeyChord
  | TwoModifierHotkeyChord
  | ThreeModifierHotkeyChord
  | FourModifierHotkeyChord

/** Resolved modifier flags shared by both parsed binding variants. */
export interface ParsedModifiers {
  /** Whether Control is required. */
  ctrl: boolean
  /** Whether Shift is required. */
  shift: boolean
  /** Whether Alt is required. */
  alt: boolean
  /** Whether Meta (Command) is required. */
  meta: boolean
  /** Required modifiers in canonical order. */
  modifiers: Array<CanonicalModifier>
}

/**
 * A parsed chord matches either a logical key or a physical code, never both.
 * Check `code !== undefined` to narrow to a physical binding. Its logical
 * character is unknown without a keyboard event and is not stored in `key`.
 *
 * @example
 * parseHotkey('Alt+S') // { key: 'S', alt: true, ... }
 * parseHotkey('Alt+[KeyS]') // { code: 'KeyS', alt: true, ... } with no key property
 */
export type ParsedHotkeyChord = ParsedModifiers &
  (
    | { key: LogicalKey | (string & {}); code?: never }
    | { code: string; key?: never }
  )

/** Modifier flags shared by logical-key and physical-code registrations. */
export interface RawModifiers {
  /** Platform-adaptive modifier: Command on macOS, Control on Windows/Linux. Defaults to false. */
  mod?: boolean
  /** Whether the Control key is required. Defaults to false. */
  ctrl?: boolean
  /** Whether the Shift key is required. Defaults to false. */
  shift?: boolean
  /** Whether the Alt key is required. Defaults to false. */
  alt?: boolean
  /** Whether the Meta (Command) key is required. Defaults to false. */
  meta?: boolean
}

/**
 * A chord written as an object instead of a string, for building chords from
 * data. Set `key` for a logical key or `code` for a physical one, and set a
 * boolean for each modifier. Omitted modifiers default to `false`.
 *
 * The `mod` modifier is platform-adaptive: Command on macOS, Control on Windows/Linux.
 * Sequence steps can be objects too: `[{ key: 'K', mod: true }, 'C']`.
 *
 * @example
 * ```ts
 * useHotkey({ key: 'S', mod: true }, handler)             // Mod+S (cross-platform)
 * useHotkey({ key: 'S', ctrl: true }, handler)            // Control+S
 * useHotkey({ key: 'Escape' }, handler)                   // Escape (no modifiers)
 * useHotkey({ key: 'A', shift: true, meta: true }, handler) // Shift+Meta+A
 * useHotkey({ key: 'S', mod: true, shift: true }, handler)  // Mod+Shift+S
 * useHotkey({ code: 'KeyW', mod: true }, handler)           // Physical Mod+KeyW
 * useHotkey({ code: 'NumpadAdd', mod: true }, handler)      // Physical numpad plus
 * ```
 */
export type RawHotkeyChord =
  | ({ key: LogicalKey | (string & {}); code?: never } & RawModifiers)
  | ({ code: string; key?: never } & RawModifiers)

/**
 * A sequence of chord strings pressed one after another (Vim-style), such as
 * `['G', 'G']`. Registered sequences are stored in this form. To register
 * steps written as objects, see {@link RegisterableHotkeySequence}.
 *
 * Steps may include modifiers; the same modifier can appear on consecutive
 * steps (e.g. `['Shift+R', 'Shift+T']`). Modifier-only key events do not
 * advance or reset matching. Automatic repeats and IME composition are ignored.
 * A one-step sequence is treated as its single chord.
 */
export type HotkeySequence = ReadonlyArray<HotkeyChord>

/**
 * A hotkey: one chord (`'Mod+S'`) or a sequence of chords (`['G', 'G']`).
 */
export type Hotkey = HotkeyChord | HotkeySequence

/** A single chord as a type-safe string (`HotkeyChord`) or an object (`RawHotkeyChord`). */
export type RegisterableHotkeyChord = HotkeyChord | RawHotkeyChord

/**
 * A sequence whose steps are chord strings or chord objects, such as
 * `['G', { key: 'H', shift: true }]`.
 */
export type RegisterableHotkeySequence = ReadonlyArray<RegisterableHotkeyChord>

/**
 * Anything that can be registered: a chord or a sequence, with each chord
 * written as a string or an object.
 */
export type RegisterableHotkey =
  RegisterableHotkeyChord | RegisterableHotkeySequence

/** Context passed to a chord's callback. */
export interface HotkeyChordCallbackContext {
  kind: 'chord'
  /** The registered chord */
  hotkey: HotkeyChord
  /** The chord with `Mod` resolved for the registration's platform */
  parsedChord: ParsedHotkeyChord
}

/** Context passed to a sequence's callback. */
export interface HotkeySequenceCallbackContext {
  kind: 'sequence'
  /** The registered sequence */
  hotkey: HotkeySequence
  /** Each step with `Mod` resolved for the registration's platform */
  parsedSequence: Array<ParsedHotkeyChord>
}

/**
 * Context passed to hotkey callbacks along with the keyboard event.
 * Narrow with `kind` to read `parsedChord` or `parsedSequence`.
 */
export type HotkeyCallbackContext =
  HotkeyChordCallbackContext | HotkeySequenceCallbackContext

/**
 * The callback context for a hotkey: chord context for chords (including
 * one-step tuples), sequence context for sequences, and either when the kind
 * is not known statically.
 */
export type HotkeyCallbackContextFor<T extends RegisterableHotkey> = [
  T,
] extends [never]
  ? HotkeyCallbackContext
  : T extends readonly [RegisterableHotkeyChord]
    ? HotkeyChordCallbackContext
    : T extends RegisterableHotkeySequence
      ? HotkeySequenceCallbackContext
      : HotkeyChordCallbackContext

/**
 * Callback function type for hotkey handlers.
 *
 * @param event - The keyboard event that triggered the hotkey
 * @param context - The registered hotkey and its parsed form. APIs that take
 * one hotkey narrow it to chord or sequence context from the hotkey you pass.
 *
 * @example
 * ```ts
 * const handler: HotkeyCallback = (event, context) => {
 *   if (context.kind === 'chord') {
 *     console.log(context.hotkey, context.parsedChord.modifiers)
 *   } else {
 *     console.log(context.hotkey.join(' '), context.parsedSequence.length)
 *   }
 * }
 * ```
 */
export type HotkeyCallback<
  TContext extends HotkeyCallbackContext = HotkeyCallbackContext,
> = (event: KeyboardEvent, context: TContext) => void

/**
 * Metadata for hotkey registrations, chords and sequences alike.
 * Includes `name`, `description`, and `group` by default. Extend via declaration merging:
 *
 * @example
 * ```ts
 * declare module '@tanstack/hotkeys' {
 *   interface HotkeyMeta {
 *     category?: string
 *     icon?: string
 *   }
 * }
 * ```
 */
export interface HotkeyMeta {
  /** Human-readable name for this hotkey (e.g., "Save Document") */
  name?: string
  /** Description of what this hotkey does */
  description?: string
  /** Optional display group. Does not affect matching or scope. */
  group?: string
}

/**
 * Behavior when registering a hotkey/sequence that conflicts with an existing registration.
 *
 * - `'warn'` - Log a warning to the console but allow both registrations (default)
 * - `'error'` - Throw an error and prevent the new registration
 * - `'replace'` - Unregister the existing registration and register the new one
 * - `'allow'` - Allow multiple registrations without warning
 */
export type ConflictBehavior = 'warn' | 'error' | 'replace' | 'allow'
