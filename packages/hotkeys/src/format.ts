import {
  KEY_DISPLAY_SYMBOLS,
  LINUX_MODIFIER_LABELS,
  MAC_MODIFIER_LABELS,
  MAC_MODIFIER_SYMBOLS,
  PUNCTUATION_KEY_DISPLAY_LABELS,
  WINDOWS_MODIFIER_LABELS,
} from './display-labels'
import { MODIFIER_ORDER, normalizeKeyName } from './constants'
import { detectPlatform } from './platform'
import {
  assertLogicalKey,
  codeToLogicalKey,
  modifierAlias,
  physicalCodeOf,
  splitChordParts,
} from './_keyboard-event'
import { normalizeHotkey } from './parse'
import type { CanonicalModifier } from './key.types'
import type { ParsedHotkeyChord, RegisterableHotkeyChord } from './hotkey.types'

/**
 * Converts a parsed hotkey back to a string, with each platform modifier
 * spelled out, such as `Control+Shift+S`. A parsed chord returns a string, and
 * a parsed sequence returns one string per step. To get `Mod` back where the
 * platform allows it, use `normalizeHotkey` instead.
 *
 * @param parsed - A parsed chord, or the parsed steps of a sequence
 *
 * @example
 * ```ts
 * formatHotkey(parseHotkey('Mod+Shift+S', 'windows')) // 'Control+Shift+S'
 * formatHotkey(parseHotkey(['G', 'Mod+K'], 'mac')) // ['G', 'Meta+K']
 * ```
 */
export function formatHotkey(parsed: ParsedHotkeyChord): string
export function formatHotkey(
  parsed: ReadonlyArray<ParsedHotkeyChord>,
): Array<string>
export function formatHotkey(
  parsed: ParsedHotkeyChord | ReadonlyArray<ParsedHotkeyChord>,
): string | Array<string>
export function formatHotkey(
  parsed: ParsedHotkeyChord | ReadonlyArray<ParsedHotkeyChord>,
): string | Array<string> {
  return Array.isArray(parsed)
    ? parsed.map((step: ParsedHotkeyChord) => formatParsedChord(step))
    : formatParsedChord(parsed as ParsedHotkeyChord)
}

function formatParsedChord(parsed: ParsedHotkeyChord): string {
  if (parsed.code === undefined) assertLogicalKey(parsed.key)
  const parts: Array<string> = []

  // Add modifiers in canonical order
  for (const modifier of MODIFIER_ORDER) {
    if (parsed.modifiers.includes(modifier)) {
      parts.push(modifier)
    }
  }

  // Add the key
  parts.push(parsed.code !== undefined ? `[${parsed.code}]` : parsed.key)

  return parts.join('+')
}

/**
 * A single chord to display: a hotkey string, which includes single keys, a
 * modifier on its own, a raw object such as `{ key }`, or a parsed hotkey.
 */
export type DisplayHotkeyChord =
  RegisterableHotkeyChord | ParsedHotkeyChord | CanonicalModifier

/** A hotkey to display: a chord or a sequence of chords. */
export type DisplayHotkey =
  DisplayHotkeyChord | ReadonlyArray<DisplayHotkeyChord>

/**
 * Formats a hotkey for display in a user interface.
 *
 * On macOS, uses symbols (⇧⌘S) in Control, Option, Shift, Command order.
 * Display ordering does not change the normalized hotkey used for registration.
 * On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
 * The separator can be customized with `separatorToken`.
 * Physical codes use conventional display labels: `[KeyS]` becomes `S` and
 * `[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
 * or change matching. Supply a resolved `layoutMap` for layout-aware labels;
 * `keyLabels` overrides both layout entries and fallback labels.
 * Sequence steps are formatted individually and joined with `sequenceSeparator`
 * (a space by default).
 *
 * A key reported by a `KeyboardEvent`, such as a held key from
 * `KeyStateTracker`, can be outside the key types: pass it as `{ key }`.
 *
 * @param hotkey - A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence
 * @param options - Formatting options
 * @returns Display text, or individual key labels when parts is true (one array per step for sequences)
 *
 * @example
 * ```ts
 * formatForDisplay('Mod+Shift+S', { platform: 'mac' })
 * // Returns: '⇧ ⌘ S' (symbols separated by spaces on macOS)
 *
 * formatForDisplay('Mod+Shift+S', { platform: 'windows' })
 * // Returns: 'Ctrl+Shift+S'
 *
 * formatForDisplay('Escape')
 * // Returns: 'Esc' (on all platforms)
 *
 * formatForDisplay('Shift', { platform: 'mac' })
 * // Returns: '⇧'
 *
 * formatForDisplay({ key: heldKey })
 * // A key from a KeyboardEvent, such as a held key
 *
 * formatForDisplay(['G', 'H'])
 * // Returns: 'G H'
 * ```
 */
export function formatForDisplay(
  hotkey: ReadonlyArray<DisplayHotkeyChord>,
  options: FormatDisplayOptions & { parts: true },
): Array<Array<string>>
export function formatForDisplay(
  hotkey: DisplayHotkeyChord,
  options: FormatDisplayOptions & { parts: true },
): Array<string>
export function formatForDisplay(
  hotkey: DisplayHotkey,
  options?: FormatDisplayOptions & { parts?: false },
): string
export function formatForDisplay(
  hotkey: DisplayHotkey,
  options: FormatDisplayOptions,
): string | Array<string> | Array<Array<string>>
export function formatForDisplay(
  hotkey: DisplayHotkey,
  options: FormatDisplayOptions = {},
): string | Array<string> | Array<Array<string>> {
  if (Array.isArray(hotkey)) {
    const steps = (hotkey as ReadonlyArray<DisplayHotkeyChord>).map((step) =>
      formatChordParts(step, options),
    )
    return options.parts
      ? steps
      : steps
          .map((parts) => parts.join(chordSeparator(options)))
          .join(options.sequenceSeparator ?? ' ')
  }
  const parts = formatChordParts(hotkey as DisplayHotkeyChord, options)
  return options.parts ? parts : parts.join(chordSeparator(options))
}

function modifierSymbolsEnabled(options: FormatDisplayOptions): boolean {
  const symbols = options.useSymbols ?? true
  return typeof symbols === 'boolean' ? symbols : (symbols.modifiers ?? true)
}

function chordSeparator(options: FormatDisplayOptions): string {
  const platform = options.platform ?? detectPlatform()
  return (
    options.separatorToken ??
    (platform === 'mac' && modifierSymbolsEnabled(options) ? ' ' : '+')
  )
}

function formatChordParts(
  hotkey: DisplayHotkeyChord,
  options: FormatDisplayOptions,
): Array<string> {
  const platform = options.platform ?? detectPlatform()
  const symbols = options.useSymbols ?? true
  const modifierSymbols = modifierSymbolsEnabled(options)
  const keySymbols =
    typeof symbols === 'boolean' ? symbols : (symbols.keys ?? true)
  const normalized = normalizeHotkey(hotkey, platform)
  const segments = splitChordParts(normalized)
  if (platform === 'mac') {
    // Canonical registration puts Mod first; display resolves it to Command.
    const modifierIndex = (segment: string) => {
      const index = MODIFIER_ORDER.indexOf(
        (segment === 'Mod' ? 'Meta' : segment) as CanonicalModifier,
      )
      return index === -1 ? MODIFIER_ORDER.length : index
    }
    segments.sort((a, b) => modifierIndex(a) - modifierIndex(b))
  }
  return segments.map((segment) =>
    formatKey(segment, platform, modifierSymbols, keySymbols, options),
  )
}

/** Own properties only, so names such as `toString` never read Object.prototype. */
function lookup(
  table: Readonly<Record<string, string>> | undefined,
  name: string,
): string | undefined {
  return table && Object.hasOwn(table, name) ? table[name] : undefined
}

function formatKey(
  segment: string,
  platform: 'mac' | 'windows' | 'linux',
  modifierSymbols: boolean,
  keySymbols: boolean,
  options: FormatDisplayOptions,
): string {
  const modifier = modifierAlias(segment)
  if (modifier) {
    return platform === 'mac'
      ? modifierSymbols
        ? MAC_MODIFIER_SYMBOLS[modifier]
        : MAC_MODIFIER_LABELS[modifier]
      : platform === 'windows'
        ? WINDOWS_MODIFIER_LABELS[modifier]
        : LINUX_MODIFIER_LABELS[modifier]
  }
  const code = physicalCodeOf(segment)
  const label = lookup(options.keyLabels, code ?? segment)
  if (label !== undefined) return label
  // Shorten conventional position labels for display only; stored identity is unchanged.
  const numpad = code?.startsWith('Numpad') ?? false
  let displayKey = code ?? segment
  const mappedKey = code ? options.layoutMap?.get(code) : undefined
  if (mappedKey) {
    // Layout entries are logical labels; normalize their case and whitespace names.
    displayKey = normalizeKeyName(mappedKey)
  } else if (code) {
    // Numpad keys keep their names (Add, not +) and gain a prefix below.
    displayKey = numpad ? code.slice(6) : (codeToLogicalKey(code) ?? code)
  }
  const display =
    lookup(
      keySymbols ? KEY_DISPLAY_SYMBOLS : PUNCTUATION_KEY_DISPLAY_LABELS,
      displayKey,
    ) ?? displayKey
  // Retain numpad identity while making longer names such as MemoryAdd readable.
  return numpad
    ? `Numpad ${display.replace(/([a-z])([A-Z])/g, '$1 $2')}`
    : display
}

/**
 * Options for formatting hotkeys for display.
 */
export interface FormatDisplayOptions {
  /** The target platform. Defaults to auto-detection. */
  platform?: 'mac' | 'windows' | 'linux'
  /** Whether to use symbols for the display. Defaults to true. */
  useSymbols?: boolean | { modifiers?: boolean; keys?: boolean }
  /** Return individual key labels instead of a joined string. Default: false. */
  parts?: boolean
  /**
   * An already-resolved code-to-key map, such as KeyboardLayoutMap or Map.
   * Used only for physical bindings. Mapped keys receive normal display formatting;
   * missing or empty entries use conventional fallback labels. The caller owns
   * loading and refreshing the map; this formatter never calls browser APIs.
   */
  layoutMap?: { get: (code: string) => string | undefined }
  /** Final display overrides for logical keys or physical codes; take precedence over layoutMap. Never changes matching. */
  keyLabels?: Readonly<Record<string, string>>
  /** Override the separator between display tokens. Defaults to platform-specific formatting when null/undefined. */
  separatorToken?: string | null
  /** Separator between sequence steps. Default: a space. */
  sequenceSeparator?: string
}
