import { matchKeyboardEvent } from './_match'
import { parseHotkey, parseRegisterableHotkey } from './parse'
import { detectPlatform } from './platform'
import { keysEqual } from './_keyboard-event'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  ParsedHotkey,
  RegisterableHotkey,
} from './hotkey.types'

export interface KeyboardEventMatch {
  matched: boolean
  score: 0 | 1 | 2 | 3
  source?: 'key' | 'code' | 'fallback'
  identity?: { key: string; code: string }
}

/**
 * Checks if a KeyboardEvent matches a hotkey.
 *
 * Physical bindings such as `Mod+[KeyS]` match `event.code` exactly.
 * Logical bindings use `event.key`, with a fallback to `code`
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
  return matchKeyboardEvent(event, hotkey, platform).matched
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
  const { preventDefault = true, stopPropagation = true, platform } = options
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

export type MultiHotkeyHandler = { [K in Hotkey]?: HotkeyCallback }

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
  const { preventDefault = true, stopPropagation = true, platform } = options
  const resolvedPlatform = platform ?? detectPlatform()

  // Pre-parse all hotkeys for efficiency
  const parsedHandlers = Object.entries(handlers)
    .filter((entry): entry is [string, HotkeyCallback] => Boolean(entry[1]))
    .map(([hotkey, handler]) => {
      const parsed = parseHotkey(hotkey, resolvedPlatform)
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
  parts.push(parsed.code !== undefined ? `[${parsed.code}]` : parsed.key)

  return parts.join('+') as Hotkey
}

/**
 * Compares normalized binding identity, including all four modifiers.
 * Aliases resolve on the supplied platform. A physical code and a logical key
 * remain distinct even when one keyboard event could match both.
 */
export function areHotkeysEqual(
  left: RegisterableHotkey,
  right: RegisterableHotkey,
  platform = detectPlatform(),
): boolean {
  const a = parseRegisterableHotkey(left, platform)
  const b = parseRegisterableHotkey(right, platform)
  return (
    a.ctrl === b.ctrl &&
    a.alt === b.alt &&
    a.shift === b.shift &&
    a.meta === b.meta &&
    (a.code !== undefined || b.code !== undefined
      ? a.code === b.code
      : keysEqual(a.key, b.key))
  )
}
