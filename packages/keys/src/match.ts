import { detectPlatform, normalizeKeyName } from './constants'
import { parseHotkey } from './parse'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  ParsedHotkey,
} from './hotkey'

/**
 * Checks if a KeyboardEvent matches a hotkey.
 *
 * Uses the `key` property from KeyboardEvent for matching, with a fallback to `code`
 * for letter keys (A-Z) and digit keys (0-9) when `key` produces special characters
 * (e.g., macOS Option+letter or Shift+number). Letter keys are matched case-insensitively.
 *
 * @param event - The KeyboardEvent to check
 * @param hotkey - The hotkey string or ParsedHotkey to match against
 * @param platform - The target platform for resolving 'Mod' (defaults to auto-detection)
 * @returns True if the event matches the hotkey
 *
 * @example
 * ```ts
 * document.addEventListener('keydown', (event) => {
 *   if (matchesKeyboardEvent(event, 'Mod+S')) {
 *     event.preventDefault()
 *     handleSave()
 *   }
 * })
 * ```
 */
export function matchesKeyboardEvent(
  event: KeyboardEvent,
  hotkey: Hotkey | ParsedHotkey,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
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

  // Check key (case-insensitive for letters)
  const eventKey = normalizeKeyName(event.key)
  const hotkeyKey = parsed.key

  // For single letters, compare case-insensitively
  if (eventKey.length === 1 && hotkeyKey.length === 1) {
    // First try matching with event.key
    if (eventKey.toUpperCase() === hotkeyKey.toUpperCase()) {
      return true
    }

    // Fallback to event.code for letter keys when event.key doesn't match
    // This handles cases like Command+Option+T on macOS where event.key is '†' instead of 'T'
    // event.code format for letter keys is "KeyA", "KeyB", etc. (always uppercase in browsers)
    if (event.code && event.code.startsWith('Key')) {
      const codeLetter = event.code.slice(3) // Remove "Key" prefix
      if (codeLetter.length === 1 && /^[A-Za-z]$/.test(codeLetter)) {
        return codeLetter.toUpperCase() === hotkeyKey.toUpperCase()
      }
    }

    // Fallback to event.code for digit keys when event.key doesn't match
    // This handles cases like Shift+4 where event.key is '$' instead of '4'
    // event.code format for digit keys is "Digit0", "Digit1", etc.
    if (event.code && event.code.startsWith('Digit')) {
      const codeDigit = event.code.slice(5) // Remove "Digit" prefix
      if (codeDigit.length === 1 && /^[0-9]$/.test(codeDigit)) {
        return codeDigit === hotkeyKey
      }
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
  /** Prevent the default browser action when the hotkey matches */
  preventDefault?: boolean
  /** Stop event propagation when the hotkey matches */
  stopPropagation?: boolean
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
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
 * }, { preventDefault: true })
 *
 * document.addEventListener('keydown', handler)
 * ```
 */
export function createHotkeyHandler(
  hotkey: Hotkey | ParsedHotkey,
  callback: HotkeyCallback,
  options: CreateHotkeyHandlerOptions = {},
): (event: KeyboardEvent) => void {
  const { preventDefault = false, stopPropagation = false, platform } = options
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
    if (matchesKeyboardEvent(event, parsed, resolvedPlatform)) {
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
  const { preventDefault = false, stopPropagation = false, platform } = options
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
      if (matchesKeyboardEvent(event, parsed, resolvedPlatform)) {
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
