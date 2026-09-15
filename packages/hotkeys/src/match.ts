import {
  PUNCTUATION_CODE_MAP,
  detectPlatform,
  isSingleLetterKey,
  normalizeKeyName,
} from './constants'
import { parseHotkey } from './parse'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  ParsedHotkey,
} from './hotkey'

/**
 * Reverse mapping from punctuation characters to their `KeyboardEvent.code` values.
 * Built from `PUNCTUATION_CODE_MAP` for use with `matchBy: 'code'`.
 */
const KEY_TO_PUNCTUATION_CODE: Record<string, string> = {}
for (const [code, key] of Object.entries(PUNCTUATION_CODE_MAP)) {
  KEY_TO_PUNCTUATION_CODE[key] = code
}

/**
 * Converts a hotkey key name to its expected `KeyboardEvent.code` value.
 *
 * Used when `matchBy: 'code'` to compare against the physical key position
 * rather than the character produced by the current keyboard layout/IME.
 *
 * @param key - The normalized hotkey key name (e.g., 'A', '4', '-', 'Escape')
 * @returns The expected `event.code` value, or the key itself for special keys
 */
function keyToCode(key: string): string {
  // Letter keys: A → KeyA
  if (/^[A-Za-z]$/.test(key)) {
    return `Key${key.toUpperCase()}`
  }
  // Digit keys: 4 → Digit4
  if (/^[0-9]$/.test(key)) {
    return `Digit${key}`
  }
  // Punctuation keys: - → Minus, / → Slash, etc.
  if (key in KEY_TO_PUNCTUATION_CODE) {
    return KEY_TO_PUNCTUATION_CODE[key]!
  }
  // Special keys (Escape, Enter, Space, Tab, F1, ArrowUp, etc.)
  // Their event.code matches the key name
  return key
}

/**
 * Checks if a KeyboardEvent matches a hotkey.
 *
 * Uses the `key` property from KeyboardEvent for matching, with a fallback to `code`
 * for letter keys, digit keys (0-9), and punctuation keys when `key` produces special
 * characters (e.g., macOS Option+letter, Shift+number, or Option+punctuation).
 * Letter keys are matched case-insensitively.
 *
 * Also handles "dead key" events where `event.key` is `'Dead'` instead of the expected
 * character. This commonly occurs on macOS with Option+letter combinations (e.g., Option+E,
 * Option+I, Option+U, Option+N) and on Windows/Linux with international keyboard layouts.
 * In these cases, `event.code` is used to determine the physical key.
 *
 * @param event - The KeyboardEvent to check
 * @param hotkey - The hotkey string or ParsedHotkey to match against
 * @param platform - The target platform for resolving 'Mod' (defaults to auto-detection)
 * @param matchBy - How to match: 'key' (layout-aware, default) or 'code' (physical key position)
 * @returns True if the event matches the hotkey
 *
 * @example
 * ```ts
 * document.addEventListener('keydown', (event) => {
 *   if (matchesKeyboardEvent(event, 'Mod+S')) {
 *     event.preventDefault()
 *     handleSave()
 *   }
 *
 *   // Physical key matching for non-Latin IME
 *   if (matchesKeyboardEvent(event, 'A', undefined, 'code')) {
 *     handleA() // Works even when a non-Latin IME is active
 *   }
 * })
 * ```
 */
export function matchesKeyboardEvent(
  event: KeyboardEvent,
  hotkey: Hotkey | ParsedHotkey,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
  matchBy: 'key' | 'code' = 'key',
): boolean {
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, platform) : hotkey

  // Check modifiers
  if (event.ctrlKey !== parsed.ctrl) {
    return false
  }
  if (event.shiftKey !== parsed.shift) {
    return false
  }
  if (event.altKey !== parsed.alt) {
    return false
  }
  if (event.metaKey !== parsed.meta) {
    return false
  }

  // When matchBy is 'code', compare against event.code (physical key position)
  // instead of event.key. Useful when a non-Latin IME is active and
  // event.key produces non-Latin characters.
  if (matchBy === 'code') {
    if (!event.code) {
      return false
    }
    const expectedCode = keyToCode(parsed.key)
    return event.code === expectedCode
  }

  // Check key (case-insensitive for letters)
  const eventKey = normalizeKeyName(event.key)
  const hotkeyKey = parsed.key

  // For single-character keys (not dead keys), try direct event.key match first
  if (eventKey !== 'Dead' && eventKey.length === 1 && hotkeyKey.length === 1) {
    if (eventKey.toUpperCase() === hotkeyKey.toUpperCase()) {
      return true
    }

    // If event.key is a letter, we usually trust the keyboard layout.
    // For ASCII letters: always trust layout (Dvorak, Colemak, AZERTY support).
    // For non-ASCII letters without Alt: trust layout (e.g., Cyrillic keyboards).
    //
    // For non-ASCII letters WITH Alt held down: fall through to the event.code
    // fallback. macOS Option+letter combinations produce non-ASCII letters as
    // event.key (e.g., Option+A → 'å', Option+' → 'æ', Option+P → 'π'), but
    // event.code still reflects the physical key. We want Alt+A to match even
    // when Option+A fires event.key='å'.
    if (
      isSingleLetterKey(eventKey) &&
      (/^[A-Za-z]$/.test(eventKey) || !event.altKey)
    ) {
      return false
    }
  }

  // Fallback to event.code for dead keys or single-char mismatches where
  // event.key is a non-letter special character.
  // Dead keys: Option+letter on macOS, international layouts produce event.key === 'Dead'
  // Single-char mismatches: Cmd+Option+T gives '†' instead of 'T', Shift+4 gives '$'
  if (
    event.code &&
    (eventKey === 'Dead' || (eventKey.length === 1 && hotkeyKey.length === 1))
  ) {
    // fallback for letter keys (common with mac option + letter)
    if (event.code.startsWith('Key')) {
      const codeLetter = event.code.slice(3)
      if (codeLetter.length === 1 && /^[A-Za-z]$/.test(codeLetter)) {
        return codeLetter.toUpperCase() === hotkeyKey.toUpperCase()
      }
    }

    // fallback for number keys (common with mac option + num)
    if (event.code.startsWith('Digit')) {
      const codeDigit = event.code.slice(5)
      if (codeDigit.length === 1 && /^[0-9]$/.test(codeDigit)) {
        return codeDigit === hotkeyKey
      }
    }
    // Fallback for punctuation keys (e.g., Minus, Slash, BracketLeft).
    // On macOS, Option+punctuation produces composed characters (e.g., Option+- → '–'),
    // but event.code still reports the physical key.
    if (event.code in PUNCTUATION_CODE_MAP) {
      return PUNCTUATION_CODE_MAP[event.code] === hotkeyKey
    }

    return false
  }

  // For special keys, compare exactly (after normalization)
  return eventKey === hotkeyKey
}

/**
 * Options for creating a hotkey handler.
 */
export interface CreateHotkeyHandlerOptions {
  /** Prevent the default browser action when the hotkey matches. Defaults to true */
  preventDefault?: boolean
  /** Stop event propagation when the hotkey matches. Defaults to true */
  stopPropagation?: boolean
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
  /** How to match: 'key' (layout-aware, default) or 'code' (physical key position) */
  matchBy?: 'key' | 'code'
}

/**
 * Creates a keyboard event handler that calls the callback when the hotkey matches.
 *
 * @param hotkey - The hotkey string or ParsedHotkey to match
 * @param callback - The function to call when the hotkey matches
 * @param options - Options for matching and handling
 * @returns A function that can be used as an event handler
 *
 * @example
 * ```ts
 * const handler = createHotkeyHandler('Mod+S', (event, { hotkey, parsedHotkey }) => {
 *   console.log(`${hotkey} was pressed`)
 *   handleSave()
 * })
 *
 * document.addEventListener('keydown', handler)
 * ```
 */
export function createHotkeyHandler(
  hotkey: Hotkey | ParsedHotkey,
  callback: HotkeyCallback,
  options: CreateHotkeyHandlerOptions = {},
): (event: KeyboardEvent) => void {
  const {
    preventDefault = true,
    stopPropagation = true,
    platform,
    matchBy,
  } = options
  const resolvedPlatform = platform ?? detectPlatform()

  const hotkeyString: Hotkey =
    typeof hotkey === 'string' ? hotkey : formatParsedHotkey(hotkey)
  const parsed =
    typeof hotkey === 'string' ? parseHotkey(hotkey, resolvedPlatform) : hotkey

  const context: HotkeyCallbackContext = {
    hotkey: hotkeyString,
    parsedHotkey: parsed,
  }

  return (event: KeyboardEvent) => {
    if (matchesKeyboardEvent(event, parsed, resolvedPlatform, matchBy)) {
      if (preventDefault) {
        event.preventDefault()
      }
      if (stopPropagation) {
        event.stopPropagation()
      }
      callback(event, context)
    }
  }
}

type MultiHotkeyHandler = { [K in Hotkey]?: HotkeyCallback }

/**
 * Creates a handler that matches multiple hotkeys.
 *
 * @param handlers - A map of hotkey strings to their handlers
 * @param options - Options for matching and handling
 * @returns A function that can be used as an event handler
 *
 * @example
 * ```ts
 * const handler = createMultiHotkeyHandler({
 *   'Mod+S': (event, { hotkey }) => handleSave(),
 *   'Mod+Z': (event, { hotkey }) => handleUndo(),
 *   'Mod+Shift+Z': (event, { hotkey }) => handleRedo(),
 * })
 *
 * document.addEventListener('keydown', handler)
 * ```
 */
export function createMultiHotkeyHandler(
  handlers: MultiHotkeyHandler,
  options: CreateHotkeyHandlerOptions = {},
): (event: KeyboardEvent) => void {
  const {
    preventDefault = true,
    stopPropagation = true,
    platform,
    matchBy,
  } = options
  const resolvedPlatform = platform ?? detectPlatform()

  // Pre-parse all hotkeys for efficiency
  const parsedHandlers = Object.entries(handlers)
    .filter((entry): entry is [string, HotkeyCallback] => Boolean(entry[1]))
    .map(([hotkey, handler]) => {
      const parsed = parseHotkey(hotkey as Hotkey, resolvedPlatform)
      const context: HotkeyCallbackContext = {
        hotkey: hotkey as Hotkey,
        parsedHotkey: parsed,
      }
      return { parsed, handler, context }
    })

  return (event: KeyboardEvent) => {
    for (const { parsed, handler, context } of parsedHandlers) {
      if (matchesKeyboardEvent(event, parsed, resolvedPlatform, matchBy)) {
        if (preventDefault) {
          event.preventDefault()
        }
        if (stopPropagation) {
          event.stopPropagation()
        }
        handler(event, context)
        return // Only handle the first match
      }
    }
  }
}

/**
 * Formats a ParsedHotkey back to a hotkey string.
 * Used internally to provide the hotkey string in callback context.
 */
function formatParsedHotkey(parsed: ParsedHotkey): Hotkey {
  const parts: Array<string> = []

  if (parsed.ctrl) parts.push('Control')
  if (parsed.alt) parts.push('Alt')
  if (parsed.shift) parts.push('Shift')
  if (parsed.meta) parts.push('Meta')
  parts.push(parsed.key)

  return parts.join('+') as Hotkey
}
