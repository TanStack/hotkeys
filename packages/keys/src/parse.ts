import {
  MODIFIER_ALIASES,
  MODIFIER_ORDER,
  detectPlatform,
  normalizeKeyName,
  resolveModifier,
} from './constants'
import type { CanonicalModifier, Hotkey, Key, ParsedHotkey } from './hotkey'

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
  hotkey: Hotkey | (string & {}),
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
  hotkey: Key | (string & {}),
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

/**
 * Parses a KeyboardEvent into a ParsedHotkey object.
 *
 * This function extracts the key and modifier state from a keyboard event
 * and converts it into the same format used by `parseHotkey()`.
 *
 * @param event - The KeyboardEvent to parse
 * @param platform - The target platform for resolving modifiers (defaults to auto-detection)
 * @returns A ParsedHotkey object representing the keyboard event
 *
 * @example
 * ```ts
 * document.addEventListener('keydown', (event) => {
 *   const parsed = parseKeyboardEvent(event)
 *   console.log(parsed) // { key: 'S', ctrl: true, shift: false, ... }
 * })
 * ```
 */
export function parseKeyboardEvent(event: KeyboardEvent): ParsedHotkey {
  const normalizedKey = normalizeKeyName(event.key)

  // Build modifiers array in canonical order
  const modifiers: Array<CanonicalModifier> = []
  if (event.ctrlKey) modifiers.push('Control')
  if (event.altKey) modifiers.push('Alt')
  if (event.shiftKey) modifiers.push('Shift')
  if (event.metaKey) modifiers.push('Meta')

  return {
    key: normalizedKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
    meta: event.metaKey,
    modifiers,
  }
}

/**
 * Converts a KeyboardEvent directly to a hotkey string.
 *
 * This is a convenience function that combines `parseKeyboardEvent()` and formatting.
 * The resulting hotkey string uses canonical modifier names (Control, Alt, Shift, Meta)
 * and is suitable for use with `useHotkey()` and other hotkey functions.
 *
 * @param event - The KeyboardEvent to convert
 * @param platform - The target platform (defaults to auto-detection)
 * @returns A hotkey string in canonical form (e.g., 'Control+Shift+S')
 *
 * @example
 * ```ts
 * document.addEventListener('keydown', (event) => {
 *   const hotkey = keyboardEventToHotkey(event)
 *   console.log(hotkey) // 'Control+Shift+S'
 *   useHotkey(hotkey, () => console.log('Shortcut triggered'))
 * })
 * ```
 */
export function keyboardEventToHotkey(event: KeyboardEvent): Hotkey {
  const parsed = parseKeyboardEvent(event)

  // Build hotkey string in canonical order (same as formatHotkey)
  const parts: Array<string> = []
  for (const modifier of MODIFIER_ORDER) {
    if (parsed.modifiers.includes(modifier)) {
      parts.push(modifier)
    }
  }
  parts.push(parsed.key)

  return parts.join('+') as Hotkey
}

/**
 * Checks if a KeyboardEvent represents a modifier-only key press.
 *
 * Modifier-only keys are keys like 'Control', 'Shift', 'Alt', 'Meta', etc.
 * that don't have an associated character or action key. This is useful
 * for filtering out modifier key presses when recording shortcuts.
 *
 * @param event - The KeyboardEvent to check
 * @returns True if the event represents a modifier-only key
 *
 * @example
 * ```ts
 * document.addEventListener('keydown', (event) => {
 *   if (isModifierKey(event)) {
 *     console.log('Modifier key pressed, waiting for action key...')
 *     return
 *   }
 *   // Process non-modifier key
 * })
 * ```
 */
export function isModifierKey(event: KeyboardEvent): boolean {
  const key = event.key
  return (
    key === 'Control' ||
    key === 'Shift' ||
    key === 'Alt' ||
    key === 'Meta' ||
    key === 'Command' ||
    key === 'OS' ||
    key === 'Win'
  )
}

/**
 * Checks if a hotkey or ParsedHotkey contains at least one non-modifier key.
 *
 * This is useful for validating that a recorded hotkey is complete and not
 * just a combination of modifiers without an action key.
 *
 * @param hotkey - The hotkey string or ParsedHotkey to check
 * @param platform - The target platform for parsing (defaults to auto-detection)
 * @returns True if the hotkey contains at least one non-modifier key
 *
 * @example
 * ```ts
 * hasNonModifierKey('Control+Shift+S') // true
 * hasNonModifierKey('Control+Shift') // false (no action key)
 * hasNonModifierKey(parseHotkey('Mod+A')) // true
 * ```
 */
export function hasNonModifierKey(
  hotkey: Hotkey | ParsedHotkey | (string & {}),
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): boolean {
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, platform) : hotkey

  // Check if the key part is actually a modifier
  const keyIsModifier = isModifier(parsed.key)

  // A valid hotkey must have a non-modifier key
  return !keyIsModifier && parsed.key.length > 0
}

/**
 * Converts a hotkey string to use 'Mod' format for portability.
 *
 * On macOS, converts 'Meta' to 'Mod'. On Windows/Linux, converts 'Control' to 'Mod'.
 * This enables cross-platform hotkey definitions that work consistently.
 *
 * @param hotkey - The hotkey string to convert
 * @param platform - The target platform (defaults to auto-detection)
 * @returns The hotkey string with 'Mod' format applied
 *
 * @example
 * ```ts
 * convertToModFormat('Meta+S', 'mac') // 'Mod+S'
 * convertToModFormat('Control+S', 'windows') // 'Mod+S'
 * convertToModFormat('Control+Meta+S', 'mac') // 'Control+Meta+S' (both present, no conversion)
 * ```
 */
export function convertToModFormat(
  hotkey: Hotkey | (string & {}),
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): Hotkey {
  const parsed = parseHotkey(hotkey, platform)

  // Only convert if we have exactly one primary modifier
  if (platform === 'mac' && parsed.meta && !parsed.ctrl) {
    // Convert Meta to Mod on Mac
    const parts = hotkey.split('+')
    return parts
      .map((part) => (part === 'Meta' ? 'Mod' : part))
      .join('+') as Hotkey
  } else if (platform !== 'mac' && parsed.ctrl && !parsed.meta) {
    // Convert Control to Mod on Windows/Linux
    const parts = hotkey.split('+')
    return parts
      .map((part) => (part === 'Control' ? 'Mod' : part))
      .join('+') as Hotkey
  }

  // No conversion needed
  return hotkey as Hotkey
}
