import type { CanonicalModifier, Key, LogicalKey } from './key.types'

// =============================================================================
// Hotkey Types
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
export type SingleModifierHotkey =
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
export type TwoModifierHotkey =
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
export type ThreeModifierHotkey =
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
export type FourModifierHotkey = `Control+Alt+Shift+Meta+${Key}`

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
 * A parsed binding matches either a logical key or a physical code, never both.
 * Check `code !== undefined` to narrow to a physical binding. Its logical
 * character is unknown without a keyboard event and is not stored in `key`.
 *
 * @example
 * parseHotkey('Alt+S') // { key: 'S', alt: true, ... }
 * parseHotkey('Alt+[KeyS]') // { code: 'KeyS', alt: true, ... } — no key property
 */
export type ParsedHotkey = ParsedModifiers &
  (
    | { key: LogicalKey | (string & {}); code?: never }
    | { code: string; key?: never }
  )

/**
 * A raw hotkey object for programmatic registration.
 *
 * Like `ParsedHotkey` but without `modifiers` (derived from booleans)
 * and with optional modifier booleans (default to `false` when omitted).
 * Use with `HotkeyManager.register()` and `useHotkey()` when you prefer
 * object form over a string.
 *
 * The `mod` modifier is platform-adaptive: Command on macOS, Control on Windows/Linux.
 * Pass `platform` when converting to ParsedHotkey (e.g., via `options.platform`).
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
/** Modifier flags shared by logical-key and physical-code registrations. */
export interface RawModifiers {
  /** The non-modifier key (e.g., 'S', 'Escape', 'F1'). */
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

export type RawHotkey =
  | ({ key: LogicalKey | (string & {}); code?: never } & RawModifiers)
  | ({ code: string; key?: never } & RawModifiers)

/**
 * A hotkey that can be passed to `HotkeyManager.register()` and `useHotkey()`.
 * Either a type-safe string (`Hotkey`) or a raw object (`RawHotkey`).
 */
export type RegisterableHotkey = Hotkey | RawHotkey

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

/**
 * Metadata for hotkey and sequence registrations.
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
