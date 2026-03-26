import {
  MODIFIER_ALIASES,
  MODIFIER_ORDER,
  detectPlatform,
  normalizeKeyName,
  resolveModifier,
} from './constants'
import type {
  CanonicalModifier,
  Hotkey,
  Key,
  ParsedHotkey,
  RawHotkey,
  RegisterableHotkey,
} from './hotkey'

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
 * Converts a RawHotkey object to a ParsedHotkey.
 * Optional modifier booleans default to false; modifiers array is derived from them.
 * When `mod` is true, it is resolved to Control or Meta based on platform.
 *
 * @param raw - The raw hotkey object
 * @param platform - The target platform for resolving 'Mod' (defaults to auto-detection)
 * @returns A ParsedHotkey suitable for matching and formatting
 *
 * @example
 * ```ts
 * rawHotkeyToParsedHotkey({ key: 'Escape' })
 * // { key: 'Escape', ctrl: false, shift: false, alt: false, meta: false, modifiers: [] }
 *
 * rawHotkeyToParsedHotkey({ key: 'S', mod: true }, 'mac')
 * // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
 *
 * rawHotkeyToParsedHotkey({ key: 'S', mod: true, shift: true }, 'windows')
 * // { key: 'S', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control', 'Shift'] }
 * ```
 */
export function rawHotkeyToParsedHotkey(
  raw: RawHotkey,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): ParsedHotkey {
  let ctrl = raw.ctrl ?? false
  const shift = raw.shift ?? false
  const alt = raw.alt ?? false
  let meta = raw.meta ?? false

  if (raw.mod) {
    const resolved = resolveModifier('Mod', platform)
    if (resolved === 'Control') {
      ctrl = true
    } else {
      meta = true
    }
  }

  const modifiers: Array<CanonicalModifier> = MODIFIER_ORDER.filter((m) => {
    switch (m) {
      case 'Control':
        return ctrl
      case 'Shift':
        return shift
      case 'Alt':
        return alt
      case 'Meta':
        return meta
      default:
        return false
    }
  })
  return {
    key: raw.key,
    ctrl,
    shift,
    alt,
    meta,
    modifiers,
  }
}

/**
 * Serializes a parsed hotkey to the canonical string form used for registration
 * and storage: `Mod` first when the platform allows, then `Alt`, then `Shift`;
 * otherwise full `Control+Alt+Shift+Meta` order.
 */
function normalizedHotkeyStringFromParsed(
  parsed: ParsedHotkey,
  platform: 'mac' | 'windows' | 'linux',
): Hotkey {
  const canUseMod =
    platform === 'mac'
      ? parsed.meta && !parsed.ctrl
      : parsed.ctrl && !parsed.meta

  const parts: Array<string> = []

  if (canUseMod) {
    parts.push('Mod')
    if (parsed.alt) {
      parts.push('Alt')
    }
    if (parsed.shift) {
      parts.push('Shift')
    }
  } else {
    for (const modifier of MODIFIER_ORDER) {
      if (parsed.modifiers.includes(modifier)) {
        parts.push(modifier)
      }
    }
  }

  parts.push(normalizeKeyName(parsed.key))
  return parts.join('+') as Hotkey
}

/**
 * Normalizes a hotkey string to its canonical form.
 *
 * - When `Mod` is allowed for the platform (Command on Mac without Control;
 *   Control on Windows/Linux without Meta): emits `Mod`, then `Alt`, then `Shift`,
 *   then the key (e.g. `Mod+Shift+E`, `Mod+S`).
 * - Otherwise: literal modifiers in `Control+Alt+Shift+Meta` order, then the key.
 * - Resolves aliases and normalizes key casing (e.g. `esc` → `Escape`, `a` → `A`).
 *
 * @param hotkey - The hotkey string to normalize
 * @param platform - The target platform for resolving `Mod` (defaults to auto-detection)
 * @returns The normalized hotkey string
 *
 * @example
 * ```ts
 * normalizeHotkey('shift+meta+e', 'mac') // 'Mod+Shift+E'
 * normalizeHotkey('ctrl+a', 'windows') // 'Mod+A'
 * normalizeHotkey('esc') // 'Escape'
 * ```
 */
export function normalizeHotkey(
  hotkey: Key | (string & {}),
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): Hotkey {
  return normalizedHotkeyStringFromParsed(
    parseHotkey(hotkey, platform),
    platform,
  )
}

/**
 * Same canonical string as {@link normalizeHotkey}, but from an already-parsed hotkey.
 */
export function normalizeHotkeyFromParsed(
  parsed: ParsedHotkey,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): Hotkey {
  return normalizedHotkeyStringFromParsed(parsed, platform)
}

/**
 * Normalizes a string or {@link RawHotkey} object to the same canonical hotkey string.
 * Use this in framework adapters instead of branching on `formatHotkey(rawHotkeyToParsedHotkey(...))`.
 */
export function normalizeRegisterableHotkey(
  hotkey: RegisterableHotkey,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): Hotkey {
  return typeof hotkey === 'string'
    ? normalizeHotkey(hotkey, platform)
    : normalizeHotkeyFromParsed(
        rawHotkeyToParsedHotkey(hotkey, platform),
        platform,
      )
}

/**
 * Checks if a string is a recognized modifier token (including aliases).
 *
 * For a `KeyboardEvent`, use `isModifier(normalizeKeyName(event.key))` so DOM
 * spellings like `OS` / `Win` match the same alias table.
 *
 * @param key - Key name or alias (e.g. from a hotkey string or `event.key`)
 * @returns True if the string is a recognized modifier
 */
export function isModifierKey(
  key: Key | (string & {}),
): key is keyof typeof MODIFIER_ALIASES {
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
 * Normalizes a keyboard event to the same canonical hotkey string as {@link normalizeHotkey}.
 *
 * @param event - The keyboard event (typically `keydown`)
 * @param platform - Target platform for `Mod` eligibility
 */
export function normalizeHotkeyFromEvent(
  event: KeyboardEvent,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): Hotkey {
  return normalizedHotkeyStringFromParsed(parseKeyboardEvent(event), platform)
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
  const keyIsModifier = isModifierKey(parsed.key)

  // A valid hotkey must have a non-modifier key
  return !keyIsModifier && parsed.key.length > 0
}
