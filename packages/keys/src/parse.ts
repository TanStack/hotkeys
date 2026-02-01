import {
  MODIFIER_ALIASES,
  MODIFIER_ORDER,
  detectPlatform,
  normalizeKeyName,
  resolveModifier,
} from './constants'
import type { CanonicalModifier, ParsedHotkey } from './types'

/**
 * Parses a hotkey string into its component parts.
 *
 * @param hotkey - The hotkey string to parse (e.g., 'Mod+Shift+S')
 * @param platform - The target platform for resolving 'Mod' (defaults to auto-detection)
 * @returns A ParsedHotkey object with the key and modifier flags
 *
 * @example
 * ```ts
 * parseHotkey('Mod+S') // On Mac: { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
 * parseHotkey('Mod+S') // On Windows: { key: 'S', ctrl: true, shift: false, alt: false, meta: false, modifiers: ['Control'] }
 * parseHotkey('Control+Shift+A') // { key: 'A', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control', 'Shift'] }
 * ```
 */
export function parseHotkey(
  hotkey: string,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): ParsedHotkey {
  const parts = hotkey.split('+')
  const modifiers: Set<CanonicalModifier> = new Set()
  let key = ''

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!.trim()

    if (i === parts.length - 1) {
      // Last part is always the key
      key = normalizeKeyName(part)
    } else {
      // All other parts are modifiers
      const alias =
        MODIFIER_ALIASES[part] ?? MODIFIER_ALIASES[part.toLowerCase()]

      if (alias) {
        const resolved = resolveModifier(alias, platform)
        modifiers.add(resolved)
      } else {
        // Unknown modifier, treat as part of the key if it's the only part
        // or ignore if there are more parts
        if (parts.length === 1) {
          key = normalizeKeyName(part)
        }
      }
    }
  }

  // If no key was found (empty string), use the last part as-is
  if (!key && parts.length > 0) {
    key = normalizeKeyName(parts[parts.length - 1]!.trim())
  }

  return {
    key,
    ctrl: modifiers.has('Control'),
    shift: modifiers.has('Shift'),
    alt: modifiers.has('Alt'),
    meta: modifiers.has('Meta'),
    modifiers: MODIFIER_ORDER.filter((m) => modifiers.has(m)),
  }
}

/**
 * Normalizes a hotkey string to its canonical form.
 *
 * The canonical form uses:
 * - Full modifier names (Control, Alt, Shift, Meta)
 * - Modifiers in order: Control+Alt+Shift+Meta
 * - Uppercase letters for single-character keys
 * - Proper casing for special keys (Escape, not escape)
 *
 * @param hotkey - The hotkey string to normalize
 * @param platform - The target platform for resolving 'Mod' (defaults to auto-detection)
 * @returns The normalized hotkey string
 *
 * @example
 * ```ts
 * normalizeHotkey('mod+shift+s') // On Mac: 'Shift+Meta+S'
 * normalizeHotkey('ctrl+a') // 'Control+A'
 * normalizeHotkey('esc') // 'Escape'
 * ```
 */
export function normalizeHotkey(
  hotkey: string,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): string {
  const parsed = parseHotkey(hotkey, platform)
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
 * Checks if a string represents a modifier key.
 *
 * @param key - The string to check
 * @returns True if the string is a recognized modifier
 */
export function isModifier(key: string): boolean {
  return key in MODIFIER_ALIASES || key.toLowerCase() in MODIFIER_ALIASES
}
