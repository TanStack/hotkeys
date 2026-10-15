import { matchKeyboardEvent } from './_match'
import {
  isHotkeySequence,
  isModifierKey,
  parseHotkey,
  parseRegisterableHotkey,
} from './parse'
import { detectPlatform } from './platform'
import { normalizeKeyName } from './constants'
import { keysEqual, normalizeKeyboardEvent } from './_keyboard-event'
import type {
  HotkeyCallback,
  HotkeyCallbackContext,
  HotkeyChord,
  HotkeySequence,
  ParsedHotkey,
  RegisterableHotkey,
  RegisterableHotkeyChord,
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
  hotkey: HotkeyChord | ParsedHotkey,
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
  hotkey: HotkeyChord | ParsedHotkey,
  callback: HotkeyCallback,
  options: CreateHotkeyHandlerOptions = {},
): (event: KeyboardEvent) => void {
  const { preventDefault = true, stopPropagation = true, platform } = options
  const resolvedPlatform = platform ?? detectPlatform()

  const hotkeyString: HotkeyChord =
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

export type MultiHotkeyHandler = { [K in HotkeyChord]?: HotkeyCallback }

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
        hotkey: hotkey as HotkeyChord,
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
function formatParsedHotkey(parsed: ParsedHotkey): HotkeyChord {
  const parts: Array<string> = []

  if (parsed.ctrl) parts.push('Control')
  if (parsed.alt) parts.push('Alt')
  if (parsed.shift) parts.push('Shift')
  if (parsed.meta) parts.push('Meta')
  parts.push(parsed.code !== undefined ? `[${parsed.code}]` : parsed.key)

  return parts.join('+') as HotkeyChord
}

/**
 * Compares normalized hotkey identity, including all four modifiers.
 * Sequences are equal when every step is equal; a one-step sequence equals its chord.
 * Aliases resolve on the supplied platform. A physical code and a logical key
 * remain distinct even when one keyboard event could match both.
 */
export function areHotkeysEqual(
  left: RegisterableHotkey,
  right: RegisterableHotkey,
  platform = detectPlatform(),
): boolean {
  const a = isHotkeySequence(left) ? left : [left]
  const b = isHotkeySequence(right) ? right : [right]
  return (
    a.length === b.length &&
    a.every((step, index) => areChordsEqual(step, b[index]!, platform))
  )
}

function areChordsEqual(
  left: RegisterableHotkeyChord,
  right: RegisterableHotkeyChord,
  platform: 'mac' | 'windows' | 'linux',
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

/** Default timeout between sequence steps (in milliseconds). */
export const DEFAULT_SEQUENCE_TIMEOUT = 1000

/**
 * Creates a simple sequence matcher for one-off use.
 *
 * This is a low-level helper that does not support ignoreInputs, target,
 * or other HotkeyOptions. Callers must handle input filtering themselves
 * if attaching to document.
 *
 * @param sequence - The sequence of hotkeys to match
 * @param options - Options including timeout
 * @returns An object with match() and reset() methods
 *
 * @example
 * ```ts
 * const matcher = createSequenceMatcher(['G', 'G'], { timeout: 500 })
 *
 * document.addEventListener('keydown', (event) => {
 *   if (matcher.match(event)) {
 *     console.log('Sequence matched!')
 *   }
 * })
 * ```
 */
export function createSequenceMatcher(
  sequence: HotkeySequence,
  options: { timeout?: number; platform?: 'mac' | 'windows' | 'linux' } = {},
): {
  match: (event: KeyboardEvent) => boolean
  reset: () => void
  getProgress: () => number
} {
  const platform = options.platform ?? detectPlatform()
  const timeout = options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT
  const parsedSequence = sequence.map((hotkey) => parseHotkey(hotkey, platform))

  let currentIndex = 0
  let lastKeyTime = 0

  return {
    match(event: KeyboardEvent): boolean {
      // These events are not sequence steps and must not refresh the timeout.
      if (
        (event.type === 'keydown' && event.repeat) ||
        normalizeKeyboardEvent(event, platform).isComposing ||
        isModifierKey(normalizeKeyName(event.key))
      ) {
        return false
      }
      const now = Date.now()

      if (currentIndex > 0 && now - lastKeyTime > timeout) {
        currentIndex = 0
      }

      const expected = parsedSequence[currentIndex]
      if (!expected) {
        return false
      }

      if (matchesKeyboardEvent(event, expected, platform)) {
        lastKeyTime = now
        currentIndex++

        if (currentIndex >= parsedSequence.length) {
          currentIndex = 0
          return true
        }
      } else if (currentIndex > 0) {
        if (matchesKeyboardEvent(event, parsedSequence[0]!, platform)) {
          currentIndex = 1
          lastKeyTime = now
        } else {
          currentIndex = 0
        }
      }

      return false
    },

    reset(): void {
      currentIndex = 0
      lastKeyTime = 0
    },

    getProgress(): number {
      return currentIndex
    },
  }
}
