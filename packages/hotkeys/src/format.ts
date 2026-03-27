import {
  KEY_DISPLAY_SYMBOLS,
  LINUX_MODIFIER_LABELS,
  MAC_MODIFIER_LABELS,
  MAC_MODIFIER_SYMBOLS,
  MODIFIER_ALIASES,
  MODIFIER_ORDER,
  PUNCTUATION_KEY_DISPLAY_LABELS,
  WINDOWS_MODIFIER_LABELS,
  detectPlatform,
} from './constants'
import {
  isModifierKey,
  normalizeHotkeyFromParsed,
  normalizeRegisterableHotkey,
} from './parse'
import type {
  CanonicalModifier,
  FormatDisplayOptions,
  Hotkey,
  ParsedHotkey,
  RegisterableHotkey,
} from './hotkey'

/**
 * Converts a hotkey sequence array to a display string.
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
  const parts: Array<string> = []

  // Add modifiers in canonical order
  for (const modifier of MODIFIER_ORDER) {
    if (parsed.modifiers.includes(modifier)) {
      parts.push(modifier)
    }
  }

  // Add the key
  parts.push(parsed.key)

  return parts.join('+')
}

/**
 * Formats a hotkey for display in a user interface.
 *
 * On macOS, uses symbols (⌘⇧S) in the same modifier order as {@link normalizeHotkeyFromParsed}.
 * On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
 * The separator can be customized with `separatorToken`.
 *
 * @param hotkey - The hotkey string or ParsedHotkey to format
 * @param options - Formatting options
 * @returns A formatted string suitable for display
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
  hotkey: RegisterableHotkey | (string & {}),
  options: FormatDisplayOptions = {},
): string {
  const platform = options.platform ?? detectPlatform()
  const useSymbols = options.useSymbols ?? true
  const separatorToken =
    options.separatorToken ?? (platform === 'mac' && useSymbols ? ' ' : '+')
  const normalizedHotkey = normalizeRegisterableHotkey(
    hotkey as RegisterableHotkey,
    platform,
  )
  return normalizedHotkey
    .split('+')
    .map((segment) => {
      if (isModifierKey(segment)) {
        const modifierToken = (MODIFIER_ALIASES[segment] ??
          MODIFIER_ALIASES[segment.toLowerCase()]) as CanonicalModifier | 'Mod'
        return platform === 'mac'
          ? useSymbols
            ? MAC_MODIFIER_SYMBOLS[modifierToken]
            : MAC_MODIFIER_LABELS[modifierToken]
          : platform === 'windows'
            ? WINDOWS_MODIFIER_LABELS[modifierToken]
            : LINUX_MODIFIER_LABELS[modifierToken]
      } else {
        const keyDisplaySymbol =
          useSymbols &&
          KEY_DISPLAY_SYMBOLS[segment as keyof typeof KEY_DISPLAY_SYMBOLS]
        if (keyDisplaySymbol) return keyDisplaySymbol

        const punctuationKeyDisplayLabel =
          !useSymbols &&
          PUNCTUATION_KEY_DISPLAY_LABELS[
            segment as keyof typeof PUNCTUATION_KEY_DISPLAY_LABELS
          ]
        return punctuationKeyDisplayLabel || segment
      }
    })
    .join(separatorToken)
}

/**
 * @deprecated Use {@link formatForDisplay} instead with `useSymbols: false` option.
 */
export function formatWithLabels(
  hotkey: RegisterableHotkey,
  options: Omit<FormatDisplayOptions, 'useSymbols'> = {},
): string {
  return formatForDisplay(hotkey, { ...options, useSymbols: false })
}
