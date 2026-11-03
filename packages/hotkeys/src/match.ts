import { matchKeyboardEvent, parsedChordsEqual } from './_match'
import { formatHotkey } from './format'
import { isHotkeySequence, isModifierKey, parseHotkey } from './parse'
import { detectPlatform } from './platform'
import { chordHasKey } from './_registration'
import { normalizeKeyName } from './constants'
import { normalizeKeyboardEvent } from './_keyboard-event'
import type {
  HotkeyCallback,
  HotkeyChord,
  HotkeyChordCallbackContext,
  ParsedHotkeyChord,
  RegisterableHotkey,
  RegisterableHotkeySequence,
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
 * @param chord - The chord string or parsed chord to match against
 * @param platform - The target platform for resolving 'Mod' (defaults to auto-detection)
 * @returns True if the event matches the chord
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
  chord: HotkeyChord | ParsedHotkeyChord,
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): boolean {
  const parsed =
    typeof chord === 'string' ? parseHotkey(chord, platform) : chord
  // Registrations always have a key; a chord passed here may not.
  if (!chordHasKey(parsed)) return false
  return matchKeyboardEvent(event, parsed, platform).matched
}

/**
 * Options for creating a chord handler.
 */
export interface CreateHotkeyChordHandlerOptions {
  /** Prevent the default browser action when the chord matches. Defaults to true */
  preventDefault?: boolean
  /** Stop event propagation when the chord matches. Defaults to true */
  stopPropagation?: boolean
  /** The target platform for resolving 'Mod' */
  platform?: 'mac' | 'windows' | 'linux'
}

/**
 * Creates a keyboard event handler that calls the callback when the chord
 * matches. For sequences, use `createSequenceMatcher`.
 *
 * @param chord - The chord string or parsed chord to match
 * @param callback - The function to call when the hotkey matches
 * @param options - Options for matching and handling
 * @returns A function that can be used as an event handler
 *
 * @example
 * ```ts
 * const handler = createHotkeyChordHandler('Mod+S', (event, { hotkey, parsedChord }) => {
 *   console.log(`${hotkey} was pressed`)
 *   handleSave()
 * })
 *
 * document.addEventListener('keydown', handler)
 * ```
 */
export function createHotkeyChordHandler(
  chord: HotkeyChord | ParsedHotkeyChord,
  callback: HotkeyCallback<HotkeyChordCallbackContext>,
  options: CreateHotkeyChordHandlerOptions = {},
): (event: KeyboardEvent) => void {
  const { preventDefault = true, stopPropagation = true, platform } = options
  const resolvedPlatform = platform ?? detectPlatform()

  const hotkeyString: HotkeyChord =
    typeof chord === 'string' ? chord : (formatHotkey(chord) as HotkeyChord)
  const parsed =
    typeof chord === 'string' ? parseHotkey(chord, resolvedPlatform) : chord

  const context: HotkeyChordCallbackContext = {
    kind: 'chord',
    hotkey: hotkeyString,
    parsedChord: parsed,
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

export type MultiHotkeyChordHandler = {
  [K in HotkeyChord]?: HotkeyCallback<HotkeyChordCallbackContext>
}

/**
 * Creates a handler that matches several chords.
 *
 * @param handlers - A map of chord strings to their handlers
 * @param options - Options for matching and handling
 * @returns A function that can be used as an event handler
 *
 * @example
 * ```ts
 * const handler = createMultiHotkeyChordHandler({
 *   'Mod+S': (event, { hotkey }) => handleSave(),
 *   'Mod+Z': (event, { hotkey }) => handleUndo(),
 *   'Mod+Shift+Z': (event, { hotkey }) => handleRedo(),
 * })
 *
 * document.addEventListener('keydown', handler)
 * ```
 */
export function createMultiHotkeyChordHandler(
  handlers: MultiHotkeyChordHandler,
  options: CreateHotkeyChordHandlerOptions = {},
): (event: KeyboardEvent) => void {
  const { preventDefault = true, stopPropagation = true, platform } = options
  const resolvedPlatform = platform ?? detectPlatform()

  // Pre-parse all hotkeys for efficiency
  const parsedHandlers = Object.entries(handlers)
    .filter(
      (entry): entry is [string, HotkeyCallback<HotkeyChordCallbackContext>] =>
        Boolean(entry[1]),
    )
    .map(([hotkey, handler]) => {
      const parsed = parseHotkey(hotkey, resolvedPlatform)
      const context: HotkeyChordCallbackContext = {
        kind: 'chord',
        hotkey: hotkey as HotkeyChord,
        parsedChord: parsed,
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
    a.every((step, index) =>
      parsedChordsEqual(
        parseHotkey(step, platform),
        parseHotkey(b[index]!, platform),
      ),
    )
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
  sequence: RegisterableHotkeySequence,
  options: { timeout?: number; platform?: 'mac' | 'windows' | 'linux' } = {},
): {
  match: (event: KeyboardEvent) => boolean
  reset: () => void
  getProgress: () => number
} {
  const platform = options.platform ?? detectPlatform()
  const timeout = options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT
  const parsedSequence = parseHotkey(sequence, platform)

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
