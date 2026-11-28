import {
  assertLogicalKey,
  chordHasKey,
  modifierAlias,
  physicalCodeOf,
  splitChordParts,
} from './_chord'
import {
  CODE_ONLY_NAMES,
  INTL_KEY_LABELS,
  NUMPAD_KEY_VALUES,
} from './_constants'
import { codeToLogicalKey } from './_keyboard-event'
import { ownValue } from './_keys'
import { warnServerPlatform } from './_server'
import { MODIFIER_ORDER, normalizeKeyName } from './constants'
import {
  KEY_DISPLAY_SYMBOLS,
  LINUX_MODIFIER_LABELS,
  MAC_MODIFIER_LABELS,
  MAC_MODIFIER_SYMBOLS,
  PUNCTUATION_KEY_DISPLAY_LABELS,
  WINDOWS_MODIFIER_LABELS,
} from './display-labels'
import { normalizeHotkey, parseHotkey } from './parse'
import { detectPlatform } from './platform'
import type { ParsedHotkeyChord, RegisterableHotkeyChord } from './hotkey.types'
import type { CanonicalModifier } from './key.types'
import type { HotkeyPlatform } from './platform'

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
  | RegisterableHotkeyChord
  | ParsedHotkeyChord
  | CanonicalModifier

/** A hotkey to display: a chord or a sequence of chords. */
export type DisplayHotkey =
  | DisplayHotkeyChord
  | ReadonlyArray<DisplayHotkeyChord>

/**
 * Formats a hotkey for display in a user interface.
 *
 * In a server-rendered app, format labels with your adapter's formatter,
 * such as `useFormatForDisplay`, or pass `platform`. Called directly,
 * `formatForDisplay` never reads a provider's `platform`. Without a
 * `platform` option, it renders Linux labels on the server, so Mac users get
 * a different label after hydration.
 *
 * On macOS, uses symbols (⇧⌘S) in Control, Option, Shift, Command order.
 * Display ordering does not change the normalized hotkey used for registration.
 * On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
 * The separator can be customized with `separatorToken`.
 * Physical codes use conventional display labels: `[KeyS]` becomes `S` and
 * `[Digit2]` becomes `2`. Keys with no US key use their keycap legends:
 * `[IntlBackslash]` and `[IntlRo]` become `\` and `[IntlYen]` becomes `¥`.
 * These labels do not infer the active keyboard layout or change matching.
 * Supply a resolved `layoutMap` for layout-aware labels; `keyLabels`
 * overrides both layout entries and fallback labels.
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

/** Detects the platform for a label, warning in development on a server. */
function detectDisplayPlatform(): HotkeyPlatform {
  warnServerPlatform()
  return detectPlatform()
}

function modifierSymbolsEnabled(options: FormatDisplayOptions): boolean {
  const symbols = options.useSymbols ?? true
  return typeof symbols === 'boolean' ? symbols : (symbols.modifiers ?? true)
}

function chordSeparator(options: FormatDisplayOptions): string {
  const platform = options.platform ?? detectDisplayPlatform()
  return (
    options.separatorToken ??
    (platform === 'mac' && modifierSymbolsEnabled(options) ? ' ' : '+')
  )
}

function formatChordParts(
  hotkey: DisplayHotkeyChord,
  options: FormatDisplayOptions,
): Array<string> {
  const platform = options.platform ?? detectDisplayPlatform()
  const symbols = options.useSymbols ?? true
  const modifierSymbols = modifierSymbolsEnabled(options)
  const keySymbols =
    typeof symbols === 'boolean' ? symbols : (symbols.keys ?? true)
  const normalized = normalizeHotkey(hotkey, platform)
  const segments = splitChordParts(normalized)
  // Canonical registration puts Mod first; display resolves it to Command on
  // macOS. Held modifiers, such as `Shift+Control`, take the same order.
  const modifierIndex = (segment: string) => {
    const index = MODIFIER_ORDER.indexOf(
      (segment === 'Mod'
        ? platform === 'mac'
          ? 'Meta'
          : 'Control'
        : segment) as CanonicalModifier,
    )
    return index === -1 ? MODIFIER_ORDER.length : index
  }
  segments.sort((a, b) => modifierIndex(a) - modifierIndex(b))
  return segments.map((segment) =>
    formatKey(segment, platform, modifierSymbols, keySymbols, options),
  )
}

/**
 * The key a layout map gives for a physical code, or undefined for a missing
 * or empty entry. Layout entries are what the key types, so their case and
 * whitespace names are normalized like event keys.
 */
function layoutKey(
  code: string,
  layoutMap: FormatDisplayOptions['layoutMap'],
): string | undefined {
  const mapped = layoutMap?.get(code)
  return mapped ? normalizeKeyName(mapped) : undefined
}

function formatKey(
  segment: string,
  platform: HotkeyPlatform,
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
  const label = ownValue(options.keyLabels, code ?? segment)
  if (label !== undefined) return label
  // Shorten conventional position labels for display only; stored identity is unchanged.
  const numpad = code?.startsWith('Numpad') ?? false
  let displayKey = code ?? segment
  const mappedKey = code ? layoutKey(code, options.layoutMap) : undefined
  if (mappedKey) {
    displayKey = mappedKey
  } else if (code) {
    // The extra ISO and JIS keys have no US key: use their keycap legends.
    const intl = ownValue(INTL_KEY_LABELS, code)
    if (intl !== undefined) return intl
    // Numpad keys keep their names (Add, not +) and gain a prefix below.
    displayKey = numpad ? code.slice(6) : (codeToLogicalKey(code) ?? code)
  }
  const display =
    ownValue(
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
  /**
   * The target platform. Without it, `formatForDisplay` detects the platform
   * in the browser and uses `'linux'` on a server.
   */
  platform?: HotkeyPlatform
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

/** Options for formatting a hotkey for `aria-keyshortcuts`. */
export interface FormatAriaOptions {
  /**
   * The target platform, for resolving `Mod`. Without it, `formatForAria`
   * detects the platform in the browser and uses `'linux'` on a server.
   */
  platform?: HotkeyPlatform
  /**
   * An already-resolved code-to-key map, such as KeyboardLayoutMap or Map.
   * Used only for physical bindings, to name the key the user presses.
   * Missing or empty entries use the key at that position on a US keyboard.
   */
  layoutMap?: { get: (code: string) => string | undefined }
}

/**
 * A key as `aria-keyshortcuts` names it, or undefined when it has no name
 * there. The spec spells the plus key `Plus` and the space bar `Space`,
 * because `+` and spaces separate its tokens.
 */
function ariaKeyName(key: string): string | undefined {
  const name = normalizeKeyName(key)
  if (name === '+') return 'Plus'
  return name && !/\s/.test(name) ? name : undefined
}

/** The key a physical code presses, for `aria-keyshortcuts`. */
function ariaCodeName(
  code: string,
  layoutMap: FormatAriaOptions['layoutMap'],
): string | undefined {
  const key =
    layoutKey(code, layoutMap) ??
    ownValue(INTL_KEY_LABELS, code) ??
    codeToLogicalKey(code) ??
    ownValue(NUMPAD_KEY_VALUES, code) ??
    (CODE_ONLY_NAMES.test(code) ? undefined : code)
  return key === undefined ? undefined : ariaKeyName(key)
}

/**
 * Formats a hotkey for an `aria-keyshortcuts` attribute so screen readers can
 * announce the shortcut. `Mod+K` becomes `Meta+K` on macOS and `Control+K`
 * elsewhere.
 *
 * Modifiers use the ARIA names (`Control`, `Alt`, `Shift`, `Meta`) and come
 * before the key. Keys use `KeyboardEvent.key` values, such as `K`, `/`,
 * `Escape`, or `ArrowUp`, with `Space` for the space bar and `Plus` for the
 * plus key. A physical binding names the key at that position, so `[KeyQ]`
 * becomes `Q`, or the key from `layoutMap` such as `A` on a French AZERTY
 * keyboard. Logical punctuation stays as written, so `'?'` stays `?` even
 * where it takes Shift to type.
 *
 * Returns `undefined` when the hotkey has no ARIA form, so the attribute is
 * omitted. This applies to empty or `null` hotkeys, multi-step sequences,
 * standalone modifiers, and physical codes with no key value such as
 * `[NumpadMemoryAdd]`. A one-step sequence formats like its chord.
 *
 * For a control with two shortcuts, join both formatted values with a space.
 * In a server-rendered app, use your adapter's formatter or pass `platform`.
 * Without a `platform` option, `formatForAria` uses `'linux'` on the server,
 * like `formatForDisplay`.
 *
 * @param hotkey - A hotkey string, raw object, parsed chord, or nothing
 * @param options - The platform and keyboard layout
 * @returns The attribute value, or `undefined` when there is none
 *
 * @example
 * ```ts
 * formatForAria('Mod+K', { platform: 'mac' }) // 'Meta+K'
 * formatForAria('Mod+Shift+P', { platform: 'windows' }) // 'Control+Shift+P'
 * formatForAria('Shift+Space') // 'Shift+Space'
 * formatForAria(['G', 'H']) // undefined
 * ```
 */
export function formatForAria(
  hotkey: DisplayHotkey | null | undefined,
  options: FormatAriaOptions = {},
): string | undefined {
  if (!hotkey) return undefined
  let chord: DisplayHotkeyChord
  if (Array.isArray(hotkey)) {
    // A sequence has no ARIA form: a shortcut is keys pressed together.
    if (hotkey.length !== 1) return undefined
    chord = (hotkey as ReadonlyArray<DisplayHotkeyChord>)[0]!
  } else {
    chord = hotkey as DisplayHotkeyChord
  }
  const parsed = parseHotkey(chord, options.platform ?? detectDisplayPlatform())
  if (!chordHasKey(parsed)) return undefined
  const key =
    parsed.code !== undefined
      ? ariaCodeName(parsed.code, options.layoutMap)
      : ariaKeyName(parsed.key)
  if (key === undefined) return undefined
  return [
    ...MODIFIER_ORDER.filter((modifier) => parsed.modifiers.includes(modifier)),
    key,
  ].join('+')
}
