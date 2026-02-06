import {
  KEY_DISPLAY_SYMBOLS,
  MAC_MODIFIER_SYMBOLS,
  MODIFIER_ORDER,
  STANDARD_MODIFIER_LABELS,
  detectPlatform,
} from './constants'
import { parseHotkey } from './parse'
import type { FormatDisplayOptions, Hotkey, ParsedHotkey } from './hotkey'

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
 * On macOS, uses symbols (⌘⇧S).
 * On Windows/Linux, uses text (Ctrl+Shift+S).
 *
 * @param hotkey - The hotkey string or ParsedHotkey to format
 * @param options - Formatting options
 * @returns A formatted string suitable for display
 *
 * @example
 * ```ts
 * formatForDisplay('Mod+Shift+S', { platform: 'mac' })
 * // Returns: '⇧⌘S'
 *
 * formatForDisplay('Mod+Shift+S', { platform: 'windows' })
 * // Returns: 'Ctrl+Shift+S'
 *
 * formatForDisplay('Escape')
 * // Returns: 'Esc' (on all platforms)
 * ```
 */
export function formatForDisplay(
  hotkey: Hotkey | (string & {}) | ParsedHotkey,
  options: FormatDisplayOptions = {},
): string {
  const platform = options.platform ?? detectPlatform()
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, platform) : hotkey

  if (platform === 'mac') {
    return formatForMac(parsed)
  }

  return formatForStandard(parsed)
}

/**
 * Formats a hotkey for macOS display using symbols.
 */
function formatForMac(parsed: ParsedHotkey): string {
  const parts: Array<string> = []

  // Add modifiers in macOS order (typically Control, Option, Shift, Command)
  // But we'll use our canonical order and just use symbols
  for (const modifier of MODIFIER_ORDER) {
    if (parsed.modifiers.includes(modifier)) {
      parts.push(MAC_MODIFIER_SYMBOLS[modifier])
    }
  }

  // Add the key (use symbol if available, otherwise the key itself)
  const keyDisplay = KEY_DISPLAY_SYMBOLS[parsed.key] ?? parsed.key
  parts.push(keyDisplay)

  // On Mac, modifiers are typically concatenated without separators
  return parts.join('')
}

/**
 * Formats a hotkey for Windows/Linux display using text labels.
 */
function formatForStandard(parsed: ParsedHotkey): string {
  const parts: Array<string> = []

  // Add modifiers in canonical order
  for (const modifier of MODIFIER_ORDER) {
    if (parsed.modifiers.includes(modifier)) {
      parts.push(STANDARD_MODIFIER_LABELS[modifier])
    }
  }

  // Add the key (use symbol/short form if available)
  const keyDisplay = KEY_DISPLAY_SYMBOLS[parsed.key] ?? parsed.key
  parts.push(keyDisplay)

  // On Windows/Linux, use + as separator
  return parts.join('+')
}

/**
 * Formats a hotkey using platform-agnostic labels.
 * Uses 'Cmd' on Mac and 'Ctrl' for Control, etc.
 *
 * @param hotkey - The hotkey string or ParsedHotkey to format
 * @param platform - The target platform
 * @returns A formatted string with platform-appropriate labels
 */
export function formatWithLabels(
  hotkey: Hotkey | (string & {}),
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): string {
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, platform) : hotkey
  const parts: Array<string> = []

  // Custom labels for more readable output
  const labels: Record<string, string> = {
    Control: 'Ctrl',
    Alt: platform === 'mac' ? 'Option' : 'Alt',
    Shift: 'Shift',
    Meta: platform === 'mac' ? 'Cmd' : 'Win',
  }

  for (const modifier of MODIFIER_ORDER) {
    if (parsed.modifiers.includes(modifier)) {
      parts.push(labels[modifier] ?? modifier)
    }
  }

  // Add the key
  parts.push(parsed.key)

  return parts.join('+')
}
