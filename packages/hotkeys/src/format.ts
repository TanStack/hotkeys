import {
  KEY_DISPLAY_SYMBOLS,
  LINUX_MODIFIER_LABELS,
  MAC_MODIFIER_LABELS,
  MAC_MODIFIER_SYMBOLS,
  PUNCTUATION_KEY_DISPLAY_LABELS,
  WINDOWS_MODIFIER_LABELS,
} from './display-labels'
import {
  MODIFIER_ALIASES,
  MODIFIER_ORDER,
  PUNCTUATION_CODE_MAP,
  normalizeKeyName,
} from './constants'
import { detectPlatform } from './platform'
import { assertLogicalKey, splitHotkeyParts } from './_keyboard-event'
import {
  isModifierKey,
  normalizeHotkeyFromParsed,
  normalizeRegisterableHotkey,
} from './parse'
import type { CanonicalModifier } from './key.types'
import type { Hotkey, ParsedHotkey, RegisterableHotkey } from './hotkey.types'

/**
 * Joins stored sequence steps with spaces, preserving physical code tokens.
 * For user-facing labels, call formatForDisplay on each step instead.
 *
 * @param sequence - Array of hotkey strings that form the sequence
 * @returns A space-separated string (e.g. ['G','G'] → 'G G')
 *
 * @example
 * ```ts
 * formatHotkeySequence(['G', 'G'])      // 'G G'
 * formatHotkeySequence(['D', 'I', 'W']) // 'D I W'
 * ```
 */
export function formatHotkeySequence(sequence: Array<Hotkey>): string {
  return sequence.join(' ')
}

/**
 * Converts a ParsedHotkey back to a hotkey string.
 *
 * @param parsed - The parsed hotkey object
 * @returns A hotkey string in canonical form
 *
 * @example
 * ```ts
 * formatHotkey({ key: 'S', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control', 'Shift'] })
 * // Returns: 'Control+Shift+S'
 * ```
 */
export function formatHotkey(parsed: ParsedHotkey): string {
  if (parsed.code === undefined) assertLogicalKey(parsed.key)
  const parts: Array<string> = []

  // Add modifiers in canonical order
  for (const modifier of MODIFIER_ORDER) {
    if (parsed.modifiers.includes(modifier)) {
      parts.push(modifier)
    }
  }

  // Add the key
  parts.push(parsed.code !== undefined ? `[${parsed.code}]` : parsed.key)

  return parts.join('+')
}

export type DisplayHotkey = RegisterableHotkey | ParsedHotkey | (string & {})

/**
 * Formats a hotkey for display in a user interface.
 *
 * On macOS, uses symbols (⌘⇧S) in the same modifier order as {@link normalizeHotkeyFromParsed}.
 * On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
 * The separator can be customized with `separatorToken`.
 * Physical codes use conventional display labels: `[KeyS]` becomes `S` and
 * `[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
 * or change matching. Supply a resolved `layoutMap` for layout-aware labels;
 * `keyLabels` overrides both layout entries and fallback labels.
 *
 * @param hotkey - A logical or physical string, raw binding, or ParsedHotkey
 * @param options - Formatting options
 * @returns Display text, or individual key labels when parts is true
 *
 * @example
 * ```ts
 * formatForDisplay('Mod+Shift+S', { platform: 'mac' })
 * // Returns: '⌘ ⇧ S' (symbols separated by spaces on macOS)
 *
 * formatForDisplay('Mod+Shift+S', { platform: 'windows' })
 * // Returns: 'Ctrl+Shift+S'
 *
 * formatForDisplay('Escape')
 * // Returns: 'Esc' (on all platforms)
 * ```
 */
export function formatForDisplay(
  hotkey: DisplayHotkey,
  options: FormatDisplayOptions & { parts: true },
): Array<string>
export function formatForDisplay(
  hotkey: DisplayHotkey,
  options?: FormatDisplayOptions & { parts?: false },
): string
export function formatForDisplay(
  hotkey: DisplayHotkey,
  options: FormatDisplayOptions,
): string | Array<string>
export function formatForDisplay(
  hotkey: DisplayHotkey,
  options: FormatDisplayOptions = {},
): string | Array<string> {
  const platform = options.platform ?? detectPlatform()
  const symbols = options.useSymbols ?? true
  const modifierSymbols =
    typeof symbols === 'boolean' ? symbols : (symbols.modifiers ?? true)
  const keySymbols =
    typeof symbols === 'boolean' ? symbols : (symbols.keys ?? true)
  const separator =
    options.separatorToken ??
    (platform === 'mac' && modifierSymbols ? ' ' : '+')
  const normalized =
    typeof hotkey === 'object' && 'modifiers' in hotkey
      ? normalizeHotkeyFromParsed(hotkey, platform)
      : normalizeRegisterableHotkey(hotkey as RegisterableHotkey, platform)
  const parts = splitHotkeyParts(normalized).map((segment) => {
    if (isModifierKey(segment)) {
      const modifier = (MODIFIER_ALIASES[segment] ??
        MODIFIER_ALIASES[segment.toLowerCase()]) as CanonicalModifier | 'Mod'
      return platform === 'mac'
        ? modifierSymbols
          ? MAC_MODIFIER_SYMBOLS[modifier]
          : MAC_MODIFIER_LABELS[modifier]
        : platform === 'windows'
          ? WINDOWS_MODIFIER_LABELS[modifier]
          : LINUX_MODIFIER_LABELS[modifier]
    }
    const code = /^\[([A-Za-z][A-Za-z0-9]*)\]$/.exec(segment)?.[1]
    const label = options.keyLabels?.[code ?? segment]
    if (label !== undefined) return label
    // Shorten conventional position labels for display only; stored identity is unchanged.
    const numpad = code?.startsWith('Numpad') ?? false
    let displayKey = code ?? segment
    const mappedKey = code ? options.layoutMap?.get(code) : undefined
    if (mappedKey) {
      // Layout entries are logical labels; normalize their case and whitespace names.
      displayKey = normalizeKeyName(mappedKey)
    } else if (code) {
      if (/^Key[A-Z]$/.test(code)) displayKey = code.slice(3)
      else if (/^Digit[0-9]$/.test(code)) displayKey = code.slice(5)
      else if (numpad) displayKey = code.slice(6)
      else displayKey = PUNCTUATION_CODE_MAP[code] ?? code
    }
    const labels = keySymbols
      ? KEY_DISPLAY_SYMBOLS
      : PUNCTUATION_KEY_DISPLAY_LABELS
    const display =
      (labels as Partial<Record<string, string>>)[displayKey] ?? displayKey
    // Retain numpad identity while making longer names such as MemoryAdd readable.
    return numpad
      ? `Numpad ${display.replace(/([a-z])([A-Z])/g, '$1 $2')}`
      : display
  })
  return options.parts ? parts : parts.join(separator)
}

/**
 * @deprecated Use {@link formatForDisplay} instead with `useSymbols: false` option.
 */
export function formatWithLabels(
  hotkey: RegisterableHotkey,
  options: Omit<FormatDisplayOptions, 'useSymbols' | 'parts'> = {},
): string {
  return formatForDisplay(hotkey, { ...options, useSymbols: false })
}

/**
 * Options for formatting hotkeys for display.
 */
export interface FormatDisplayOptions {
  /** The target platform. Defaults to auto-detection. */
  platform?: 'mac' | 'windows' | 'linux'
  /** Whether to use symbols for the display. Defaults to true. */
  useSymbols?: boolean | { modifiers?: boolean; keys?: boolean }
  /** Return individual key labels instead of a joined string. Default: false. */
  parts?: boolean
  /**
   * An already-resolved code-to-key map, such as KeyboardLayoutMap or Map.
   * Used only for physical bindings. Mapped keys receive normal display formatting;
   * missing or empty entries use conventional fallback labels. The caller owns
   * loading and refreshing the map; this formatter never calls browser APIs.
   */
  layoutMap?: { get: (code: string) => string | undefined }
  /** Final display overrides for logical keys or physical codes; take precedence over layoutMap. Never changes matching. */
  keyLabels?: Readonly<Record<string, string>>
  /** Override the separator between display tokens. Defaults to platform-specific formatting when null/undefined. */
  separatorToken?: string | null
}
