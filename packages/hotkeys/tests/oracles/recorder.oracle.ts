/**
 * This oracle owns what `HotkeyRecorder` does with each key press: the chord
 * it records or the reason it rejects, by `recordBy` mode, and the session
 * around it (steps, commits, control keys, `start`, `stop`, `cancel`,
 * `destroy`, `commit`, and `store.state`). It owns the recorder's methods in
 * `src/hotkey-recorder.ts` and `src/_recorder-chord.ts#hotkeyChordFromKeydown`.
 *
 * ```ts
 * auto: Ctrl+S on Windows, Cmd+S on macOS // → onRecord('Mod+S')
 * auto: Shift+/, macOS Option+1, a dead key, Numpad1 // → by position: 'Shift+[Slash]', 'Alt+[Digit1]', ...
 * auto: macOS Option+S typing ß, Russian Ctrl+ы // → 'Alt+S', 'Mod+S': the keycap, the US position
 * code: Ctrl+S on AZERTY's A key // → 'Mod+[KeyQ]'; key: macOS Option+S // → 'Alt+ß'
 * maxSteps: 3, press G, H, Enter // → onRecord(['G', 'H']); Escape // → onCancel, recordedHotkey null
 * ```
 *
 * Spanish Shift+3 types `·`. Is that a letter, recorded by name like Shift+A,
 * or a symbol, recorded by position like Shift+/? It is a symbol, and the
 * difference is the whole reason for the rule: macOS reports `3` for
 * Command+Shift+3 on the same keyboard, so a recorded `Mod+Shift+·` from
 * Windows never fires on a Mac.
 *
 * Three parts decide every answer. The press rule turns one keydown into an
 * outcome for a mode: a chord written the way a hotkey is written by hand
 * (`Mod`, then `Alt`, then `Shift`, single letters uppercase), a rejection
 * reason, or nothing. The controls are the keys the recorder keeps for
 * itself: Escape, Tab and Shift+Tab, plain Backspace and Delete, and plain
 * Enter in a multi-step recording. The session holds the steps recorded so
 * far and commits them at `maxSteps`, on Enter, after `idleTimeoutMs`, or on
 * `commit()`, unless `validate` or `detectConflicts` rejects them.
 *
 * The laws, from `docs/guides/sensible-defaults.md` "Recording captures what
 * the user pressed", `docs/framework/react/guides/custom-hotkey-recording.md`,
 * the JSDoc of `RecorderKeyMode`, `RecorderRejectionReason`, the recorder's
 * methods and `_recorder-chord.ts`, the recorder tests, and the changesets:
 *
 * - auto press: for every non-control key press on every platform, a fresh
 *   `recordBy: 'auto'` recorder records the key by name where the name means
 *   the same press everywhere, by position otherwise, and rejects only AltGr
 *   and a press with no code and nothing typed it can record.
 * - code press: `recordBy: 'code'` records every press by position, and
 *   rejects AltGr and a press with no usable code.
 * - key press: `recordBy: 'key'` records the character or key name the press
 *   produced, rejects AltGr that typed nothing new outside Windows and
 *   whitespace characters, and records nothing for a press with no key.
 * - replay: every recorded chord fires for the press it came from, is valid,
 *   and is in canonical form.
 * - controls, steps, lifecycle, ignored presses: each key press and each
 *   method call moves the session and calls the callbacks as the docs say.
 * - paused: no registered hotkey fires while a recording listens; one fires
 *   again once it ends.
 * - context: `validate` and `onRecord` get the key press of every step.
 *
 * What a caller sees when a law breaks: a saved shortcut that fires on one
 * platform and not another, a recording that never ends, or a callback that
 * runs twice or not at all.
 *
 * Single presses come from the real keyboard layouts in
 * `tests/fixtures/layout-table.json` (132 layouts, every modifier
 * combination) and a table of named keys and odd events (no code, an
 * `Unidentified` key, synthetic keys, numpad, modifier positions), each with
 * every modifier and AltGr flag. Sessions are generated from options and
 * actions over a small table of named presses, on a controlled clock, with
 * and without a `platform` option. The driver records every callback with
 * its arguments (the key press of each step, and each parsed step's
 * modifiers), `store.state`, whether the keydown's default was prevented, how
 * often a registered `Mod+S` fired (a held key's repeat included), and what
 * production throws, after each action; after `destroy()`, the pending
 * timers and whether a key press still reaches the recorder. The models below
 * compute each of those from the docs; the checks compare them.
 *
 * Limits. AltGr "typed nothing new" is read from the press itself, as the
 * `altGraphTypedCharacter` JSDoc defines it (a named key, or an ASCII letter
 * or digit): a key whose AltGr level is empty on Windows and whose plain
 * character is a symbol counts as AltGr typing it. `recordBy: 'key'` is not
 * given synthetic keys written like `[KeyX]`. macOS Option typing an ASCII
 * letter other than its keycap's is left open. `maxSteps` is 1, 2, 3 or
 * `Infinity`, and `setOptions` changes only `recordTab` and `commitKeys`.
 * Whether the recorder listens in the capture phase and stops propagation is
 * not observed. Where the docs leave a result open, the session model marks it
 * open and the check skips it, or stops comparing that history: what
 * `recordedHotkey` holds during a new recording and after `stop()`; whether
 * the default is prevented for presses that add no step; a repeated Escape,
 * Backspace, Delete or Enter; Enter with no steps; a chord that arrives with
 * `maxSteps` steps already held after a rejected commit; and the idle timer
 * after a Backspace that leaves steps or after a rejected commit.
 * Of `parsedChord` and `parsedSequence`, only the modifiers are compared.
 */
import {
  keyEvent,
  setTestPlatform,
  testPlatform,
} from '@tanstack/hotkeys-test-utils'
import {
  differs,
  oracleProperty,
  pass,
  useOracleClock,
} from '@tanstack/oracles'
import fc from 'fast-check'
import { vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  matchesKeyboardEvent,
  normalizeHotkey,
  validateHotkey,
} from '../../src'
import { allLayoutPresses } from '../fixtures/layout-events'
import type { Calibration, Observation, Verdict } from '@tanstack/oracles'
import type {
  Hotkey,
  HotkeyChord,
  HotkeyPlatform,
  HotkeyRecorderValidationContext,
  RecorderKeyMode,
} from '../../src'

const APPROVAL =
  'Proposed by an agent for Kevin Van Cott (KevinVandy) on 2026-11-21, pending his approval; see .tasks/tanstack-oracles/decisions.md'

type Platform = HotkeyPlatform
type Mode = RecorderKeyMode
const PLATFORMS: ReadonlyArray<Platform> = ['mac', 'windows', 'linux']

/** A keydown as a browser reports it. `altGraph` is `getModifierState('AltGraph')`. */
type PressInit = KeyboardEventInit & { key: string; altGraph?: boolean }

// ---------------------------------------------------------------------------
// The press rule: what one keydown records, rejects, or leaves alone
// ---------------------------------------------------------------------------

interface Modifiers {
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
}

/** One press's outcome on a fresh recorder, and the rule that decided it. */
type Outcome =
  | { kind: 'record'; hotkey: string; rule: string }
  | { kind: 'reject'; reason: string; hotkey?: string; rule: string }
  | { kind: 'ignore'; rule: string }
  | { kind: 'open'; rule: string }

// The DOM's modifier key values. Guide, "Keys the recorder handles": "A
// modifier alone, such as Shift: Waits for a key to go with it".
const MODIFIER_KEYS = new Set([
  'Control',
  'Shift',
  'Alt',
  'Meta',
  'AltGraph',
  'OS',
])
// A key on one of these positions is a modifier position (CapsLock swapped
// onto ControlLeft). Changeset recorder-modifier-position: by code it "ignores
// a key on a modifier position, as it ignores modifier keys".
const isModifierCode = (code: string) =>
  /^(Control|Shift|Alt|Meta)(Left|Right)$/.test(code)
// A physical code the recorder can write in brackets: RecorderRejectionReason
// 'missing-code' is "the event has no usable physical key code".
const usableCode = (code: string) =>
  /^[A-Za-z][A-Za-z0-9]*$/.test(code) && code !== 'Unidentified'
const oneCharacter = (key: string) => key !== '' && Array.from(key).length === 1
const isLetter = (key: string) => /^\p{Letter}$/u.test(key)
const isLatinLetter = (key: string) =>
  isLetter(key) && /^\p{Script_Extensions=Latin}$/u.test(key)
/** A key name such as Enter, F5 or ArrowUp, as hotkey strings write them. */
const isNamedKey = (key: string) =>
  /^(?:F(?:[1-9]|1\d|2[0-4])|[A-Z][a-z][A-Za-z\d]*)$/.test(key) &&
  key !== 'Dead' &&
  key !== 'Unidentified'

/**
 * How a hotkey spells a key: single letters uppercase unless uppercasing
 * would make another key or another length (normalizeHotkey JSDoc: "uppercases
 * single letters"; the Turkish dotless ı test and the long-s changeset keep ı
 * and ſ, and ß has no one-letter uppercase), and the space character is Space.
 */
function spell(key: string): string {
  if (key === ' ') return 'Space'
  if (isLetter(key) && key !== 'ı' && key !== 'ſ') {
    const upper = key.toUpperCase()
    return upper.length === 1 ? upper : key
  }
  return key
}

/**
 * The chord text, per the normalizeHotkey JSDoc: with Mod allowed (Command
 * without Control on macOS, Control without Meta elsewhere), Mod, Alt, Shift,
 * then the key; otherwise Control, Alt, Shift, Meta, then the key.
 */
function chordText(mods: Modifiers, key: string, platform: Platform): string {
  const mod =
    platform === 'mac' ? mods.meta && !mods.ctrl : mods.ctrl && !mods.meta
  const parts = mod
    ? ['Mod', mods.alt && 'Alt', mods.shift && 'Shift']
    : [
        mods.ctrl && 'Control',
        mods.alt && 'Alt',
        mods.shift && 'Shift',
        mods.meta && 'Meta',
      ]
  return [...parts.filter(Boolean), key].join('+')
}

// The key in a position on a US keyboard. Sensible Defaults: a non-Latin
// letter "records as the key in its position on a US keyboard ... Control+х
// records `Mod+[`".
const US_PUNCTUATION: Readonly<Record<string, string>> = {
  Backquote: '`',
  Backslash: '\\',
  BracketLeft: '[',
  BracketRight: ']',
  Comma: ',',
  Equal: '=',
  Minus: '-',
  Period: '.',
  Quote: "'",
  Semicolon: ';',
  Slash: '/',
}
function usKey(code: string): string | undefined {
  const letter = /^Key([A-Z])$/.exec(code)
  if (letter) return letter[1]
  const digit = /^Digit([0-9])$/.exec(code)
  if (digit) return digit[1]
  return Object.hasOwn(US_PUNCTUATION, code) ? US_PUNCTUATION[code] : undefined
}

/**
 * Whether AltGr changed what the key typed. altGraphTypedCharacter JSDoc:
 * false "when the key typed its plain value: a named key such as Home, or an
 * ASCII letter or digit"; a dead key starts a composed character. Typed text
 * is any key value but a named key (isTypedText JSDoc: "text the key typed
 * rather than a named key such as End or Dead. Text can take several code
 * points"). The space bar types a space with or without AltGr.
 */
const altGraphTyped = (key: string) =>
  key === 'Dead' ||
  (key !== '' &&
    !/^[A-Z][A-Za-z0-9]+$/.test(key) &&
    !/^[A-Za-z0-9 ]$/.test(key))

/** An input method's keydown: no hotkey reads it. Guide: "IME composition never add[s] a step". */
const isComposing = (init: PressInit) =>
  Boolean(init.isComposing) ||
  init.keyCode === 229 ||
  init.key === 'Process' ||
  (init.key === 'Unidentified' &&
    (!usableCode(init.code ?? '') || isModifierCode(init.code ?? '')))

/**
 * The name `recordBy: 'auto'` gives a press that has a usable code, or
 * undefined for its position. Sensible Defaults lists the positions: Shift
 * with a digit or a symbol, macOS Option with a digit or a symbol, dead keys
 * (except macOS Option with a letter), and the numpad; a non-Latin letter is
 * the US key in its position. The keyName JSDoc in `_recorder-chord.ts` adds
 * whitespace characters and `Unidentified` keys, and the auto tests add keys
 * not written like a key name, such as a synthetic `[KeyX]`.
 */
/** A name the docs leave open. */
const OPEN_NAME = '(open)'
function autoName(
  init: PressInit,
  mods: Modifiers,
  platform: Platform,
): { name: string | undefined; rule: string } {
  const key = init.key.normalize('NFC')
  const code = init.code ?? ''
  const at = (rule: string) => ({ name: undefined, rule })
  if (/^Numpad/.test(code)) return at('the numpad')
  if (key === '' || key === 'Unidentified') return at('no key name')
  if (key === ' ') return { name: 'Space', rule: 'a named key' }
  if (key !== 'Dead' && !oneCharacter(key))
    return isNamedKey(key)
      ? { name: key, rule: 'a named key' }
      : at('not written like a key name')
  if (platform === 'mac' && mods.alt) {
    // "Option with a letter records the letter on the keycap": keyCode, which
    // macOS browsers set from the keycap letter; a digit or symbol keeps its position
    const keyCode = init.keyCode ?? 0
    const keycap =
      keyCode > 64 && keyCode < 91 ? String.fromCharCode(keyCode) : undefined
    // Option typing an ASCII letter other than the keycap's: the guide names
    // the keycap, the matcher the typed letter
    if (/^[A-Za-z]$/.test(key))
      return keycap === undefined || keycap === spell(key)
        ? { name: spell(key), rule: 'a letter' }
        : { name: OPEN_NAME, rule: 'macOS Option typing another ASCII letter' }
    return keycap !== undefined
      ? { name: keycap, rule: 'the macOS Option keycap' }
      : at('macOS Option with a digit or a symbol')
  }
  if (key === 'Dead') return at('a dead key')
  if (!key.trim()) return at('whitespace')
  if (isLatinLetter(key)) return { name: spell(key), rule: 'a letter' }
  if (isLetter(key)) {
    const us = usKey(code)
    return us === undefined
      ? at('a non-Latin letter with no US key')
      : { name: us, rule: 'a non-Latin letter' }
  }
  return mods.shift
    ? at('Shift with a digit or a symbol')
    : { name: key, rule: 'a digit or a symbol' }
}

/**
 * The outcome of one non-control keydown on a fresh, single-chord recorder.
 * Each branch names the rule, for reach.
 */
export function pressOutcome(
  init: PressInit,
  platform: Platform,
  mode: Mode,
): Outcome {
  const key = init.key.normalize('NFC')
  const code = init.code ?? ''
  if (isComposing(init)) return { kind: 'ignore', rule: 'composition' }
  if (MODIFIER_KEYS.has(key)) return { kind: 'ignore', rule: 'modifier press' }
  let mods: Modifiers = {
    ctrl: Boolean(init.ctrlKey),
    alt: Boolean(init.altKey),
    shift: Boolean(init.shiftKey),
    meta: Boolean(init.metaKey),
  }
  // macOS reports AltGraph for Option on some layouts; Option stays Alt there
  let altGraph = platform !== 'mac' && Boolean(init.altGraph)
  let controlAlt = false
  // Sensible Defaults: "AltGr with a key it does not change on Windows, such
  // as AltGr+Home, ... records as Control+Alt"
  if (altGraph && platform === 'windows' && !altGraphTyped(key)) {
    altGraph = false
    controlAlt = true
    mods = { ...mods, ctrl: true, alt: true }
  }
  const tag = (rule: string) =>
    controlAlt ? `${rule}, AltGr as Control+Alt` : rule

  if (mode === 'key') {
    // RecorderRejectionReason 'alt-graph': key mode "still rejects AltGr that
    // typed nothing new, such as AltGr+Home on Linux"
    if (altGraph && !altGraphTyped(key))
      return {
        kind: 'reject',
        reason: 'alt-graph',
        rule: 'key: AltGr typed nothing new',
      }
    // "Character recordings accept the characters AltGr types"; AltGr is not a modifier of the chord
    if (altGraph) mods = { ...mods, ctrl: false, alt: false }
    // Key mode "skips" an Unidentified key (recorder test); an empty key typed nothing
    if (key === '' || key === 'Unidentified')
      return { kind: 'ignore', rule: 'key: no key' }
    const hotkey = chordText(mods, spell(key), platform)
    if (key !== ' ' && !key.trim())
      return {
        kind: 'reject',
        reason: 'whitespace',
        hotkey,
        rule: 'key: whitespace',
      }
    return {
      kind: 'record',
      hotkey,
      rule: tag(altGraph ? 'key: AltGr character' : 'key: typed'),
    }
  }

  // RecorderRejectionReason 'alt-graph': "Only recordBy: 'key' records AltGr presses"
  if (altGraph)
    return { kind: 'reject', reason: 'alt-graph', rule: `${mode}: AltGr` }
  const byPosition = (rule: string): Outcome =>
    !usableCode(code)
      ? {
          kind: 'reject',
          reason: 'missing-code',
          rule: `${mode}: missing code`,
        }
      : isModifierCode(code)
        ? { kind: 'ignore', rule: `${mode}: modifier position` }
        : {
            kind: 'record',
            hotkey: chordText(mods, `[${code}]`, platform),
            rule: tag(rule),
          }
  if (mode === 'code') return byPosition('code: position')

  if (!usableCode(code)) {
    // 'missing-code': "recordBy: 'auto' records what the press typed instead,
    // and rejects only a press that typed nothing it can record"
    const { name, rule } = autoName(init, mods, platform)
    if (name === OPEN_NAME) return { kind: 'open', rule: `auto: open, ${rule}` }
    if (name !== undefined)
      return {
        kind: 'record',
        hotkey: chordText(mods, name, platform),
        rule: tag('auto: no code, by name'),
      }
    if (key === '' || key === 'Dead' || !(oneCharacter(key) || isNamedKey(key)))
      return {
        kind: 'reject',
        reason: 'missing-code',
        rule: 'auto: no code, nothing typed',
      }
    const hotkey = chordText(mods, spell(key), platform)
    // 'whitespace': "the key is a whitespace character, which a hotkey can't hold"
    if (!key.trim())
      return {
        kind: 'reject',
        reason: 'whitespace',
        hotkey,
        rule: 'auto: no code, whitespace',
      }
    return { kind: 'record', hotkey, rule: tag('auto: no code, as typed') }
  }
  if (isModifierCode(code))
    return { kind: 'ignore', rule: 'auto: modifier position' }
  const { name, rule } = autoName(init, mods, platform)
  if (name === OPEN_NAME) return { kind: 'open', rule: `auto: open, ${rule}` }
  if (name === undefined) return byPosition(`auto: by position, ${rule}`)
  return {
    kind: 'record',
    hotkey: chordText(mods, name, platform),
    rule: tag(`auto: by name, ${rule}`),
  }
}

// ---------------------------------------------------------------------------
// Single presses: the real layouts and the odd events
// ---------------------------------------------------------------------------

/** Named keys and odd events: [key, code]. */
const ODD_KEYS: ReadonlyArray<readonly [string, string]> = [
  ['Enter', 'Enter'],
  ['F1', 'F1'],
  ['F13', 'F13'],
  ['ArrowUp', 'ArrowUp'],
  ['Home', 'Home'],
  ['PageDown', 'PageDown'],
  ['Insert', 'Insert'],
  ['ContextMenu', 'ContextMenu'],
  ['CapsLock', 'CapsLock'],
  ['Tab', 'Tab'],
  ['Backspace', 'Backspace'],
  ['Delete', 'Delete'],
  [' ', 'Space'],
  [' ', 'Space'],
  [' ', 'Space'],
  ['1', 'Numpad1'],
  ['End', 'Numpad1'],
  ['Enter', 'NumpadEnter'],
  ['+', 'NumpadAdd'],
  ['<', 'IntlBackslash'],
  ['é', 'IntlBackslash'],
  ['ж', 'IntlBackslash'],
  ['s', ''],
  ['Enter', ''],
  ['?', ''],
  ['ы', ''],
  ['Dead', ''],
  ['', ''],
  [' ', ''],
  ['Unidentified', 'Backquote'],
  ['Unidentified', ''],
  ['', 'KeyS'],
  ['Dead', 'Backquote'],
  ['Dead', 'KeyE'],
  ['[KeyX]', 'KeyS'],
  ['[KeyX]', ''],
  ['enter', 'Enter'],
  ['ab', 'KeyA'],
  ['s', 'Unidentified'],
  ['s', 'Key S'],
  ['Shift', 'ShiftLeft'],
  ['Control', 'ControlLeft'],
  ['AltGraph', 'AltRight'],
  ['Meta', 'MetaLeft'],
  ['OS', 'MetaLeft'],
  ['CapsLock', 'ControlLeft'],
  ['A', 'AltRight'],
  ['Unidentified', 'ControlLeft'],
  ['Process', 'KeyA'],
  ['ß', 'Minus'],
  ['ı', 'KeyI'],
  ['ſ', 'KeyS'],
  ['é', 'Digit2'],
  ['ф', 'KeyA'],
  ['х', 'BracketLeft'],
  ['ש', 'KeyA'],
  ['あ', 'Digit3'],
  ['·', 'Digit3'],
  ['¡', 'Digit1'],
  ['q', 'KeyA'],
  ['a', 'KeyA'],
  ['1', 'Digit1'],
  ['/', 'Slash'],
]

function oddPresses(): ReadonlyArray<PressInit> {
  const presses: Array<PressInit> = []
  for (const [key, code] of ODD_KEYS)
    for (let mask = 0; mask < 32; mask++)
      for (const keyCode of [undefined, 65, 229]) {
        if (keyCode === 229 && mask !== 0) continue
        presses.push({
          key,
          code,
          ctrlKey: (mask & 1) !== 0,
          altKey: (mask & 2) !== 0,
          shiftKey: (mask & 4) !== 0,
          metaKey: (mask & 8) !== 0,
          altGraph: (mask & 16) !== 0,
          ...(keyCode === undefined ? {} : { keyCode }),
        })
      }
  presses.push({ key: 'a', code: 'KeyA', isComposing: true })
  return presses
}

/** Without Control, Alt, Meta, or AltGr (which macOS does not report). */
const noCommandModifiers = (init: PressInit, platform: Platform) =>
  !init.ctrlKey &&
  !init.altKey &&
  !init.metaKey &&
  !(init.altGraph && platform !== 'mac')

/**
 * The keys a default recorder keeps for itself (guide, "Keys the recorder
 * handles"): Escape; Tab and Shift+Tab without Control, Alt, or Meta;
 * Backspace or Delete without modifiers. Enter is a chord with `maxSteps: 1`.
 */
function isDefaultControl(init: PressInit, platform: Platform): boolean {
  if (init.key === 'Escape') return true
  if (init.key === 'Tab') return noCommandModifiers(init, platform)
  if (init.key === 'Backspace' || init.key === 'Delete')
    return noCommandModifiers(init, platform) && !init.shiftKey
  return false
}

type Source = 'layout' | 'odd'
const SOURCES: Record<Platform, Record<Source, ReadonlyArray<PressInit>>> = {
  mac: {
    layout: allLayoutPresses('mac').map((p) => p.init),
    odd: oddPresses(),
  },
  windows: {
    layout: allLayoutPresses('windows').map((p) => p.init),
    odd: oddPresses(),
  },
  linux: {
    layout: allLayoutPresses('linux').map((p) => p.init),
    odd: oddPresses(),
  },
}

/** The presses a mode's law covers: no controls, and no `[KeyX]`-like keys by key. */
function presses(
  mode: Mode,
  platform: Platform,
  source: Source,
): ReadonlyArray<PressInit> {
  return SOURCES[platform][source].filter(
    (init) =>
      !isDefaultControl(init, platform) &&
      !(mode === 'key' && /^\[.*\]$/s.test(init.key.trim())),
  )
}
const POOLS = Object.fromEntries(
  (['auto', 'code', 'key'] as const).map((mode) => [
    mode,
    Object.fromEntries(
      PLATFORMS.map((platform) => [
        platform,
        {
          layout: presses(mode, platform, 'layout'),
          odd: presses(mode, platform, 'odd'),
        },
      ]),
    ),
  ]),
) as Record<Mode, Record<Platform, Record<Source, ReadonlyArray<PressInit>>>>

interface PressHistory {
  platform: Platform
  source: Source
  pick: number
}
interface PressPlan {
  platform: Platform
  mode: Mode
  init: PressInit
}

const pressHistory: fc.Arbitrary<PressHistory> = fc.record({
  platform: fc.constantFrom<Platform>(...PLATFORMS),
  source: fc.oneof(
    { arbitrary: fc.constant<Source>('layout'), weight: 3 },
    { arbitrary: fc.constant<Source>('odd'), weight: 2 },
  ),
  pick: fc.nat(),
})

const resolvePress =
  (mode: Mode) =>
  ({ platform, source, pick }: PressHistory): PressPlan => {
    // Every pool has presses; a pick wraps around it
    const pool = POOLS[mode][platform][source]
    return { platform, mode, init: pool[pick % pool.length]! }
  }

/**
 * Runs production code and records what it throws: a listener error reaches
 * the dispatcher here, and a mutant that crashes must fail a law.
 */
function guarded(errors: Array<string>, run: () => unknown): void {
  try {
    run()
  } catch (error) {
    errors.push(
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error),
    )
  }
}

/** A copy of an array from production, or the value itself when it is no array. */
const copy = (value: unknown): unknown =>
  Array.isArray(value) ? [...(value as Array<unknown>)] : value

/** One keydown on a fresh recorder: every callback, the state, and the replay. */
function drivePress(
  { platform, mode, init }: PressPlan,
  observe: (checkpoint: string, value: unknown) => void,
): void {
  const calls: Array<Record<string, unknown>> = []
  const errors: Array<string> = []
  const recorder = new HotkeyRecorder({
    platform,
    recordBy: mode,
    onRecord: (hotkey) => calls.push({ record: hotkey }),
    onReject: ({ reason, hotkey }) =>
      calls.push({
        reject: reason,
        ...(hotkey === undefined ? {} : { hotkey }),
      }),
    onCancel: () => calls.push({ cancel: true }),
    onClear: () => calls.push({ clear: true }),
  })
  try {
    guarded(errors, () => recorder.start())
    const event = keyEvent('keydown', init)
    guarded(errors, () => document.dispatchEvent(event))
    const { isRecording, steps } = recorder.store.state
    observe('outcome', {
      calls,
      isRecording,
      steps: copy(steps),
      ...(errors.length ? { errors } : {}),
    })
    const recorded = calls.find((call) => 'record' in call)?.record
    if (typeof recorded === 'string') {
      const replay = keyEvent('keydown', init)
      observe('replay', {
        hotkey: recorded,
        fires: matchesKeyboardEvent(replay, recorded as HotkeyChord, platform),
        valid: validateHotkey(recorded).valid,
        canonical: normalizeHotkey(recorded, platform) === recorded,
      })
    }
  } finally {
    guarded(errors, () => recorder.destroy())
    document.dispatchEvent(keyEvent('keyup', init))
    window.dispatchEvent(new Event('blur'))
  }
}

/** What a fresh recorder owes for the press: the outcome's callback and state. */
function expectedOutcome({ platform, mode, init }: PressPlan) {
  const outcome = pressOutcome(init, platform, mode)
  const calls =
    outcome.kind === 'record'
      ? [{ record: outcome.hotkey }]
      : outcome.kind === 'reject'
        ? [
            {
              reject: outcome.reason,
              ...(outcome.hotkey === undefined
                ? {}
                : { hotkey: outcome.hotkey }),
            },
          ]
        : []
  // A recorded chord ends a single-chord recording; anything else leaves it listening
  return {
    outcome,
    owed:
      outcome.kind === 'open'
        ? undefined
        : { calls, isRecording: outcome.kind !== 'record', steps: [] },
  }
}

const valueAt = (trace: ReadonlyArray<Observation>, checkpoint: string) =>
  trace.find((entry) => entry.checkpoint === checkpoint)?.value

function checkOutcome(lawName: string) {
  return (
    _plan: PressPlan,
    trace: ReadonlyArray<Observation>,
    expected: ReturnType<typeof expectedOutcome>,
  ): Verdict =>
    expected.owed === undefined
      ? pass
      : (differs(
          'outcome',
          lawName,
          valueAt(trace, 'outcome'),
          expected.owed,
        ) ?? pass)
}

/** The rules each mode's law can reach, with a press of each, for constructed histories. */
function constructedFor(mode: Mode) {
  const found = new Map<string, PressHistory>()
  for (const platform of PLATFORMS)
    for (const source of ['odd', 'layout'] as const) {
      const pool = POOLS[mode][platform][source]
      pool.forEach((init, pick) => {
        const { rule } = pressOutcome(init, platform, mode)
        if (!found.has(rule)) found.set(rule, { platform, source, pick })
      })
    }
  return found
}

/** Finds the pick of a layout press in a pool, for fixed histories. */
function pickOf(
  mode: Mode,
  platform: Platform,
  source: Source,
  match: (init: PressInit) => boolean,
): PressHistory {
  const pick = POOLS[mode][platform][source].findIndex(match)
  if (pick < 0)
    throw new Error(`no ${platform} ${source} press for a fixed history`)
  return { platform, source, pick }
}

const shiftedMiddleDot = (init: PressInit) =>
  init.key === '·' &&
  init.code === 'Digit3' &&
  Boolean(init.shiftKey) &&
  !init.ctrlKey &&
  !init.altKey &&
  !init.metaKey &&
  !init.altGraph

const PRESS_LAWS: Record<
  Mode,
  { statement: string; authority: string; limits: string }
> = {
  auto: {
    statement:
      "For every key press that is not a recorder control key, on every platform, a fresh recorder with recordBy 'auto' records the key by name (a letter, a named key such as Enter, a digit or symbol typed without Shift, the macOS Option keycap letter, a non-Latin letter's US key) and by position in brackets otherwise (Shift or macOS Option with a digit or a symbol, dead keys, the numpad, whitespace, Unidentified or unnamed keys); rejects AltGr with 'alt-graph' unless Windows AltGr typed nothing new (then Control+Alt); without a usable code records what it typed or rejects with 'missing-code' or 'whitespace'; ignores modifier presses, composition, and modifier positions.",
    authority: `docs/guides/sensible-defaults.md:467-476 and 490 ("Recording captures what the user pressed"); RecorderKeyMode and RecorderRejectionReason JSDoc (src/hotkey-recorder.ts:26-56); keyName JSDoc (src/_recorder-chord.ts:70-91); tests/recorder-auto.test.ts; changeset recorder-records-keys-by-name (7d9cccc3). ${APPROVAL}`,
    limits:
      'AltGr typed nothing new means a named key or an ASCII letter or digit, read from the press. Composition presses that report Unidentified without a code follow the composing rule.',
  },
  code: {
    statement:
      "For every key press that is not a recorder control key, a fresh recorder with recordBy 'code' records the press's modifiers and its physical code in brackets, rejects AltGr with 'alt-graph' (Windows AltGr that typed nothing new records as Control+Alt) and a press without a usable code with 'missing-code', and ignores modifier presses, composition, and keys on a modifier position.",
    authority: `docs/guides/sensible-defaults.md:478 and 490; RecorderKeyMode and RecorderRejectionReason JSDoc (src/hotkey-recorder.ts:35-51); docs/framework/react/guides/custom-hotkey-recording.md:42; changeset recorder-modifier-position (6f507492). ${APPROVAL}`,
    limits: 'AltGr typed nothing new is read from the press.',
  },
  key: {
    statement:
      "For every key press that is not a recorder control key and not a synthetic key written like a physical token, a fresh recorder with recordBy 'key' records the character or key name the press produced, with its modifiers (AltGr characters keep only Shift); rejects AltGr that typed nothing new with 'alt-graph' outside Windows, where it records Control+Alt; rejects whitespace characters other than the space bar with 'whitespace'; and records nothing for modifier presses, composition, and a press with no key or an Unidentified key.",
    authority: `docs/guides/sensible-defaults.md:478 and 490; RecorderKeyMode and RecorderRejectionReason JSDoc (src/hotkey-recorder.ts:37-53); tests/hotkey-recorder.test.ts ("records an Unidentified key by code, and skips it in key mode", "rejects AltGr that typed nothing new in key mode"); changeset recorder-altgr-key-mode (6f507492). ${APPROVAL}`,
    limits:
      "A key written like '[KeyX]' is not generated in key mode: the recorder throws there, which no document decides.",
  },
}

/**
 * Registers the press oracles. They run after the session oracles, whose
 * lifecycle law sees a listener that outlived its recorder before thousands
 * of single-press recorders would each leave one behind.
 */
function registerPressOracles(): void {
  for (const mode of ['auto', 'code', 'key'] as const) {
    const found = constructedFor(mode)
    const rules = [...found.keys()].sort()
    // A rule that records, so the wrong chord replaces a real one
    const recordingRule = rules.find((rule) => {
      const plan = resolvePress(mode)(found.get(rule)!)
      return pressOutcome(plan.init, plan.platform, mode).kind === 'record'
    })!
    oracleProperty<PressHistory, ReturnType<typeof expectedOutcome>, PressPlan>(
      {
        id: `recorder.press.${mode}`,
        law: PRESS_LAWS[mode],
        owns: [
          'src/hotkey-recorder.ts#HotkeyRecorder.start',
          'src/_recorder-chord.ts#hotkeyChordFromKeydown',
          'src/_recorder-chord.ts#chordRejection',
        ],
        histories: {
          arbitrary: pressHistory,
          runs: 300,
          fixedSeeds: [20261121],
          states: rules,
          bases: 1,
          constructed: rules.map((rule) => ({
            name: rule,
            enters: [rule],
            build: (): PressHistory => found.get(rule)!,
          })),
          fixed:
            mode === 'auto'
              ? [
                  {
                    name: 'Spanish Shift+3 types a middle dot on Windows',
                    history: pickOf(
                      'auto',
                      'windows',
                      'layout',
                      shiftedMiddleDot,
                    ),
                    enters: [
                      'auto: by position, Shift with a digit or a symbol',
                    ],
                  },
                  {
                    name: 'Spanish Shift+3 types a middle dot on macOS',
                    history: pickOf('auto', 'mac', 'layout', shiftedMiddleDot),
                    enters: [
                      'auto: by position, Shift with a digit or a symbol',
                    ],
                  },
                ]
              : [],
        },
        resolve: resolvePress(mode),
        model: expectedOutcome,
        reached: (_plan, _trace, expected) => [expected.outcome.rule],
        driver: drivePress,
        check: checkOutcome(`${mode} press`),
        calibrations: [
          {
            name: 'another chord recorded',
            law: `${mode} press`,
            history: { constructed: recordingRule },
            corrupt: (trace) =>
              trace.map((entry) =>
                entry.checkpoint === 'outcome'
                  ? {
                      ...entry,
                      value: {
                        ...(entry.value as object),
                        calls: [{ record: 'X' }],
                      },
                    }
                  : entry,
              ),
          },
        ],
      },
    )
  }

  // The replay law: what the recorder stores fires for the press it came from.
  type ReplayHistory = PressHistory & { mode: Mode }
  const replayHistory: fc.Arbitrary<ReplayHistory> = fc.record({
    platform: fc.constantFrom<Platform>(...PLATFORMS),
    source: fc.oneof(
      { arbitrary: fc.constant<Source>('layout'), weight: 3 },
      { arbitrary: fc.constant<Source>('odd'), weight: 2 },
    ),
    pick: fc.nat(),
    mode: fc.constantFrom<Mode>('auto', 'code', 'key'),
  })
  const replayRecorded = 'a recorded chord'
  const replayStates = (['auto', 'code', 'key'] as const).map(
    (mode) => `${replayRecorded} (${mode})`,
  )

  oracleProperty<
    ReplayHistory,
    { recorded: string | undefined; mode: Mode },
    PressPlan
  >({
    id: 'recorder.press.replay',
    law: {
      statement:
        'For every key press that a fresh recorder records, in every recordBy mode and on every platform, the recorded chord fires for that same press (matchesKeyboardEvent), is a valid hotkey, and is already in canonical form (normalizeHotkey returns it unchanged).',
      authority: `docs/guides/sensible-defaults.md:480 ("A recorded hotkey and one written by hand can differ and still fire for the same key press"); docs/framework/react/guides/custom-hotkey-recording.md:40 ("Pass the result straight to useHotkey"); RecorderKeyMode JSDoc 'auto' ("compares equal to one"); hotkeyChordFromKeydown JSDoc ("Converts a keydown to a chord that fires for the same key press"); tests/invariants/recorder-match.test.ts. ${APPROVAL}`,
      limits:
        'The press is replayed through matchesKeyboardEvent, not through a registered hotkey; the session oracle covers a registered hotkey.',
    },
    owns: [
      'src/hotkey-recorder.ts#HotkeyRecorder.start',
      'src/_recorder-chord.ts#hotkeyChordFromKeydown',
    ],
    histories: {
      arbitrary: replayHistory,
      runs: 150,
      fixedSeeds: [20261121],
      states: replayStates,
      bases: 1,
      constructed: (['auto', 'code', 'key'] as const).map((mode) => ({
        name: `${replayRecorded} (${mode})`,
        enters: [`${replayRecorded} (${mode})`],
        build: (): ReplayHistory => ({
          ...pickOf(
            mode,
            'windows',
            'layout',
            (init) => init.key === 's' && Boolean(init.ctrlKey),
          ),
          mode,
        }),
      })),
    },
    resolve: (history) => resolvePress(history.mode)(history),
    model: (plan) => {
      const outcome = pressOutcome(plan.init, plan.platform, plan.mode)
      return {
        recorded: outcome.kind === 'record' ? outcome.hotkey : undefined,
        mode: plan.mode,
      }
    },
    reached: (_plan, trace, expected) =>
      valueAt(trace, 'replay') !== undefined
        ? [`${replayRecorded} (${expected.mode})`]
        : [],
    driver: drivePress,
    check: (_plan, trace) => {
      const replay = valueAt(trace, 'replay') as { hotkey: string } | undefined
      if (replay === undefined) return pass
      return (
        differs('replay', 'replay', replay, {
          hotkey: replay.hotkey,
          fires: true,
          valid: true,
          canonical: true,
        }) ?? pass
      )
    },
    calibrations: [
      {
        name: 'a recorded chord that does not fire for its press',
        law: 'replay',
        history: { constructed: `${replayRecorded} (code)` },
        corrupt: (trace) =>
          trace.map((entry) =>
            entry.checkpoint === 'replay'
              ? {
                  ...entry,
                  value: { ...(entry.value as object), fires: false },
                }
              : entry,
          ),
      },
    ],
  })
}

// ---------------------------------------------------------------------------
// Sessions: steps, commits, controls, and the lifecycle
// ---------------------------------------------------------------------------

/** The named presses a session uses; `mod` is Command on macOS, Control elsewhere. */
const SESSION_PRESSES = {
  g: { key: 'g', code: 'KeyG' },
  h: { key: 'h', code: 'KeyH' },
  'mod-s': { key: 's', code: 'KeyS', mod: true },
  'shift-slash': { key: '?', code: 'Slash', shiftKey: true },
  enter: { key: 'Enter', code: 'Enter' },
  'shift-enter': { key: 'Enter', code: 'Enter', shiftKey: true },
  escape: { key: 'Escape', code: 'Escape' },
  'ctrl-escape': { key: 'Escape', code: 'Escape', ctrlKey: true },
  tab: { key: 'Tab', code: 'Tab' },
  'shift-tab': { key: 'Tab', code: 'Tab', shiftKey: true },
  'ctrl-tab': { key: 'Tab', code: 'Tab', ctrlKey: true },
  backspace: { key: 'Backspace', code: 'Backspace' },
  'shift-backspace': { key: 'Backspace', code: 'Backspace', shiftKey: true },
  delete: { key: 'Delete', code: 'Delete' },
  shift: { key: 'Shift', code: 'ShiftLeft', shiftKey: true },
  process: { key: 'Process', code: 'KeyA' },
  altgr: { key: '@', code: 'KeyQ', altGraph: true },
  'dead-no-code': { key: 'Dead', code: '' },
  nbsp: { key: ' ', code: 'Space' },
  'capslock-on-control': { key: 'CapsLock', code: 'ControlLeft' },
} as const satisfies Record<string, PressInit & { mod?: boolean }>
type PressName = keyof typeof SESSION_PRESSES
const PRESS_NAMES = Object.keys(SESSION_PRESSES) as Array<PressName>

function sessionInit(
  name: PressName,
  platform: Platform,
  repeat: boolean,
): PressInit {
  const { mod, ...init } = { mod: false, ...SESSION_PRESSES[name] }
  return {
    ...init,
    ...(mod
      ? platform === 'mac'
        ? { metaKey: true }
        : { ctrlKey: true }
      : {}),
    ...(repeat ? { repeat: true } : {}),
  }
}

type Validate = 'none' | 'accept' | 'false' | 'message'
interface SessionOptions {
  platform: Platform
  recordBy: Mode
  maxSteps: number
  commitKeys: 'enter' | 'none' | undefined
  recordTab: boolean | undefined
  ignoreInputs: boolean | undefined
  idleTimeoutMs: number | undefined
  validate: Validate
  /** `'exclude'` passes `{ excludeIds: [the Mod+S registration] }`. */
  detectConflicts: boolean | 'exclude'
  /** Without it, the recorder detects the platform: the test platform. */
  passPlatform: boolean
}
type Action =
  | { kind: 'start' | 'stop' | 'cancel' | 'destroy' | 'commit' }
  | { kind: 'advance'; ms: number }
  | { kind: 'setOptions'; recordTab: boolean; commitKeys: 'enter' | 'none' }
  /** `held`: an auto-repeat of the keydown follows before the keyup (Mod+S only). */
  | {
      kind: 'press'
      press: PressName
      repeat: boolean
      inInput: boolean
      held: boolean
    }
interface Session {
  options: SessionOptions
  actions: Array<Action>
}

const sessionOptions: fc.Arbitrary<SessionOptions> = fc.record({
  platform: fc.constantFrom<Platform>(...PLATFORMS),
  recordBy: fc.constantFrom<Mode>('auto', 'code', 'key'),
  maxSteps: fc.constantFrom(1, 2, 3, Infinity),
  commitKeys: fc.constantFrom<SessionOptions['commitKeys']>(
    undefined,
    'enter',
    'none',
  ),
  recordTab: fc.constantFrom<boolean | undefined>(undefined, false, true),
  ignoreInputs: fc.constantFrom<boolean | undefined>(undefined, false),
  idleTimeoutMs: fc.constantFrom<number | undefined>(undefined, 0, 400),
  validate: fc.constantFrom<Validate>('none', 'accept', 'false', 'message'),
  detectConflicts: fc.constantFrom<boolean | 'exclude'>(false, true, 'exclude'),
  passPlatform: fc.oneof(
    { arbitrary: fc.constant(true), weight: 4 },
    { arbitrary: fc.constant(false), weight: 1 },
  ),
})
const action: fc.Arbitrary<Action> = fc.oneof(
  {
    arbitrary: fc.record({
      kind: fc.constant('press' as const),
      press: fc.constantFrom(...PRESS_NAMES),
      repeat: fc.oneof(
        { arbitrary: fc.constant(false), weight: 6 },
        { arbitrary: fc.constant(true), weight: 1 },
      ),
      inInput: fc.oneof(
        { arbitrary: fc.constant(false), weight: 6 },
        { arbitrary: fc.constant(true), weight: 1 },
      ),
      held: fc.oneof(
        { arbitrary: fc.constant(false), weight: 3 },
        { arbitrary: fc.constant(true), weight: 1 },
      ),
    }),
    weight: 10,
  },
  { arbitrary: fc.record({ kind: fc.constant('start' as const) }), weight: 3 },
  {
    arbitrary: fc.record({
      kind: fc.constantFrom(
        'stop' as const,
        'cancel' as const,
        'destroy' as const,
        'commit' as const,
      ),
    }),
    weight: 2,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('advance' as const),
      ms: fc.constantFrom(100, 300, 400),
    }),
    weight: 2,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('setOptions' as const),
      recordTab: fc.boolean(),
      commitKeys: fc.constantFrom<'enter' | 'none'>('enter', 'none'),
    }),
    weight: 1,
  },
)
const sessionHistory: fc.Arbitrary<Session> = fc.record({
  options: sessionOptions,
  actions: fc.array(action, { maxLength: 14 }),
})

/** A result the docs leave open: the check skips it. */
const OPEN = { open: 'the docs leave this open' } as const
type Open = typeof OPEN
type Law = 'controls' | 'steps' | 'lifecycle' | 'ignored'
type Call = Record<string, unknown>
interface Step {
  law: Law
  tag: string
  calls: Array<Call>
  state: {
    isRecording: boolean
    steps: Array<string>
    recordedHotkey: Hotkey | null | Open
  }
  prevented?: boolean | Open
  fired?: number
  timers?: number
}
interface SessionExpected {
  steps: Array<Step>
  /** The first action whose result the docs leave open; nothing from it on is compared. */
  until: number
  untilWhy?: string
}

const plainKey = (init: PressInit, platform: Platform) =>
  noCommandModifiers(init, platform) && !init.shiftKey

/**
 * The modifiers of a recorded chord "with Mod resolved for the recorder's
 * platform" (parsedChord JSDoc): Command on macOS, Control elsewhere.
 */
function parsedModifiers(chord: string, platform: Platform): Modifiers {
  const tokens = chord.split('+').slice(0, -1)
  const mod = tokens.includes('Mod')
  return {
    ctrl: tokens.includes('Control') || (mod && platform !== 'mac'),
    alt: tokens.includes('Alt'),
    shift: tokens.includes('Shift'),
    meta: tokens.includes('Meta') || (mod && platform === 'mac'),
  }
}

/**
 * The session model: a pure step over the actions. Each rule cites the docs.
 * `steps` holds each recorded chord with the action that pressed it.
 */
function sessionModel({ options, actions }: Session): SessionExpected {
  const o = { ...options }
  const multi = o.maxSteps > 1
  let recording = false
  let steps: Array<{ chord: string; at: number; press: PressName }> = []
  let recorded: Hotkey | null | Open = null
  // The idle deadline, in the controlled clock's milliseconds
  let deadline: number | null | Open = null
  let now = 0
  const out: Array<Step> = []
  const state = () => ({
    isRecording: recording,
    steps: steps.map((s) => s.chord),
    recordedHotkey: recorded,
  })
  const end = (value: Hotkey | null | Open) => {
    recording = false
    steps = []
    recorded = value
    deadline = null
  }
  // Recorder JSDoc: "A one-step result is a chord string"; two or more steps are a sequence
  const hotkeyOf = (): Hotkey =>
    (steps.length === 1 ? steps[0]!.chord : steps.map((s) => s.chord)) as Hotkey
  // commit(): "Commits the recorded steps after validation and conflict checks.
  // A rejected commit leaves recording active with its steps intact."
  const attempt = (calls: Array<Call>) => {
    const hotkey = hotkeyOf()
    // The guide: the context has "the event that recorded the chord and
    // parsedChord", or for a sequence "events and parsedSequence, with one entry per step"
    const context = {
      kind: steps.length === 1 ? 'chord' : 'sequence',
      events: steps.map((s) => s.at),
      parsed: steps.map((s) => parsedModifiers(s.chord, o.platform)),
    }
    if (o.validate !== 'none') calls.push({ validate: hotkey, ...context })
    // The driver's validate rejects any recording with a step pressed by `h`
    const invalid =
      (o.validate === 'false' || o.validate === 'message') &&
      steps.some((s) => s.press === 'h')
    // Guide "Check for conflicts": the registered Mod+S conflicts with a chord
    // pressed by Mod+S and with a sequence whose first step is that press
    // excludeIds: "Skip the hotkey being changed"
    const conflict = o.detectConflicts === true && steps[0]!.press === 'mod-s'
    if (invalid || conflict) {
      calls.push(
        invalid
          ? {
              reject: 'validation',
              ...(o.validate === 'message' ? { message: 'no h' } : {}),
              hotkey,
            }
          : { reject: 'conflict', hotkey, conflicts: 1 },
      )
      // Guide: "A rejected sequence recording keeps its steps"; the commit
      // comment: "A single-chord recording waits for a new chord"
      if (!multi) steps = []
      deadline = multi ? OPEN : null
      return 'rejected'
    }
    end(hotkey)
    calls.push({ record: hotkey, ...context })
    return 'committed'
  }
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i]!
    const calls: Array<Call> = []
    const stop = (why: string): SessionExpected => ({
      steps: out,
      until: i,
      untilWhy: why,
    })
    if (a.kind === 'press') {
      const init = sessionInit(a.press, o.platform, a.repeat)
      // Paused: "While any recorder is listening, registered hotkeys don't
      // fire". A held key's repeat fires too when its keydown did; one whose
      // keydown the recording took stays paused until its release, even after
      // the recording ends (recorder test "suppresses recording keydowns,
      // repeats and releases then allows normal use")
      const fired = !recording && a.press === 'mod-s' ? (a.held ? 2 : 1) : 0
      const push = (law: Law, tag: string, prevented: boolean | Open) =>
        out.push({ law, tag, calls, state: state(), prevented, fired })
      if (!recording) {
        // stop(): "Removes the event listener". A registered hotkey that fires
        // prevents the default on its own (the manager's preventDefault option)
        push('lifecycle', 'press while idle', fired ? OPEN : false)
        continue
      }
      // "Typing in inputs passes through ... Escape still cancels"
      if (o.ignoreInputs !== false && a.inInput && init.key !== 'Escape') {
        push('ignored', 'typing in a field', false)
        continue
      }
      if (isComposing(init)) {
        push('ignored', 'composition', OPEN)
        continue
      }
      // "Tab and Shift+Tab cancel and move focus" without Control, Alt, or Meta,
      // unless recordTab; a repeated Tab cancels too, without preventing it
      if (
        init.key === 'Tab' &&
        noCommandModifiers(init, o.platform) &&
        !o.recordTab
      ) {
        end(null)
        calls.push({ cancel: true })
        push('controls', 'Tab cancels', false)
        continue
      }
      const plain = plainKey(init, o.platform)
      const control =
        init.key === 'Escape' ||
        ((init.key === 'Backspace' || init.key === 'Delete') && plain) ||
        (init.key === 'Enter' && plain && multi && o.commitKeys !== 'none')
      if (a.repeat) {
        if (control) return stop('a repeated control key')
        // "Repeats ... never add a step"
        push('ignored', 'repeat', OPEN)
        continue
      }
      if (init.key === 'Escape') {
        // "Escape cancels"; onCancel; recordedHotkey is null after a cancel
        end(null)
        calls.push({ cancel: true })
        push('controls', 'Escape cancels', OPEN)
        continue
      }
      if ((init.key === 'Backspace' || init.key === 'Delete') && plain) {
        // "Removes the last step. With no steps, stops recording and calls onClear."
        if (steps.length === 0) {
          end(null)
          calls.push({ clear: true })
          push('controls', 'Backspace clears', OPEN)
        } else {
          steps = steps.slice(0, -1)
          deadline = steps.length === 0 ? null : deadline === null ? null : OPEN
          push('controls', 'Backspace removes a step', OPEN)
        }
        continue
      }
      if (init.key === 'Enter' && plain && multi && o.commitKeys !== 'none') {
        if (steps.length === 0) return stop('Enter with no steps')
        attempt(calls)
        push('controls', 'Enter commits', OPEN)
        continue
      }
      if (MODIFIER_KEYS.has(init.key)) {
        push('ignored', 'modifier press', OPEN)
        continue
      }
      const outcome = pressOutcome(init, o.platform, o.recordBy)
      if (outcome.kind === 'ignore') {
        push('steps', 'press records nothing', OPEN)
        continue
      }
      if (outcome.kind === 'reject') {
        calls.push({
          reject: outcome.reason,
          ...(outcome.hotkey === undefined ? {} : { hotkey: outcome.hotkey }),
        })
        push('steps', 'press rejected', OPEN)
        continue
      }
      if (outcome.kind === 'open') return stop('a press the docs leave open')
      if (steps.length >= o.maxSteps)
        return stop('a chord past maxSteps after a rejected commit')
      // "Each chord adds a step"; the changeset recorder-tab-focus: a recorded
      // key has its default prevented
      steps = [...steps, { chord: outcome.hotkey, at: i, press: a.press }]
      if (steps.length >= o.maxSteps) {
        // maxSteps: "Reaching it commits automatically"
        const result = attempt(calls)
        push(
          'steps',
          multi ? `commit at maxSteps, ${result}` : `single chord, ${result}`,
          true,
        )
      } else {
        // idleTimeoutMs: "commits after this many milliseconds without a new step"
        deadline = o.idleTimeoutMs ? now + o.idleTimeoutMs : null
        push('steps', 'step added', true)
      }
      continue
    }
    const push = (law: Law, tag: string) =>
      out.push({ law, tag, calls, state: state() })
    switch (a.kind) {
      case 'start':
        // "Prevent starting recording if already recording"
        if (recording) {
          push('lifecycle', 'start while recording')
          break
        }
        recording = true
        steps = []
        deadline = null
        // recordedHotkey during a new recording: null, or still the last one
        recorded = recorded === null ? null : OPEN
        push('lifecycle', 'start')
        break
      case 'stop':
        // "Stops listening without calling onRecord or onCancel"
        end(recorded === null ? null : OPEN)
        push('lifecycle', 'stop')
        break
      case 'destroy':
        // "Clean up event listeners and reset state": no idle timer is left
        end(null)
        out.push({
          law: 'lifecycle',
          tag: 'destroy',
          calls,
          state: state(),
          timers: 0,
        })
        break
      case 'cancel':
        // onCancel: "Called when ... you call cancelRecording()"
        end(null)
        calls.push({ cancel: true })
        push('lifecycle', 'cancel')
        break
      case 'commit':
        // "Commits the steps recorded so far"; nothing with no steps
        if (steps.length === 0) {
          push('lifecycle', 'commit() with no steps')
          break
        }
        push('steps', `commit(), ${attempt(calls)}`)
        break
      case 'setOptions':
        o.recordTab = a.recordTab
        o.commitKeys = a.commitKeys
        push('lifecycle', 'setOptions')
        break
      case 'advance': {
        now += a.ms
        if (!recording || deadline === null) {
          push(
            recording ? 'steps' : 'lifecycle',
            recording ? 'time passes' : 'time passes idle',
          )
          break
        }
        if (typeof deadline !== 'number')
          return stop('the idle timer after a Backspace or a rejected commit')
        if (now >= deadline) push('steps', `idle commit, ${attempt(calls)}`)
        else push('steps', 'time passes')
        break
      }
    }
  }
  return { steps: out, until: actions.length }
}

/**
 * The modifiers of each parsed step, read as untyped data: a broken recorder
 * may pass no array, or holes in it.
 */
function parsedOf(steps: unknown): unknown {
  if (!Array.isArray(steps)) return steps
  return steps.map((step: unknown) => {
    if (typeof step !== 'object' || step === null) return step
    const { ctrl, alt, shift, meta } = step as Partial<Modifiers>
    return { ctrl, alt, shift, meta }
  })
}

/** Runs the session on a controlled clock, observing after every action. */
function driveSession(
  { options, actions }: Session,
  observe: (checkpoint: string, value: unknown) => void,
): void {
  const clock = useOracleClock()
  const errors: Array<string> = []
  // Without a platform option, the recorder detects the platform, here the
  // one the browser reports
  if (!options.passPlatform) setTestPlatform(options.platform)
  HotkeyManager.resetInstance()
  const input = document.createElement('input')
  document.body.append(input)
  const calls: Array<Call> = []
  const at = new Map<KeyboardEvent, number>()
  const indices = (context: HotkeyRecorderValidationContext) =>
    (context.kind === 'chord' ? [context.event] : [...context.events]).map(
      (event) => at.get(event) ?? -1,
    )
  const context = (c: HotkeyRecorderValidationContext) => ({
    kind: c.kind,
    events: indices(c),
    parsed: parsedOf(c.kind === 'chord' ? [c.parsedChord] : c.parsedSequence),
  })
  let fired = 0
  const handle = HotkeyManager.getInstance().register('Mod+S', () => fired++, {
    platform: options.platform,
    ignoreInputs: false,
    conflictBehavior: 'allow',
  })
  const recorder = new HotkeyRecorder({
    ...(options.passPlatform ? { platform: options.platform } : {}),
    recordBy: options.recordBy,
    maxSteps: options.maxSteps,
    ...(options.commitKeys === undefined
      ? {}
      : { commitKeys: options.commitKeys }),
    ...(options.recordTab === undefined
      ? {}
      : { recordTab: options.recordTab }),
    ...(options.ignoreInputs === undefined
      ? {}
      : { ignoreInputs: options.ignoreInputs }),
    ...(options.idleTimeoutMs === undefined
      ? {}
      : { idleTimeoutMs: options.idleTimeoutMs }),
    detectConflicts:
      options.detectConflicts === 'exclude'
        ? { excludeIds: [handle.id] }
        : options.detectConflicts,
    ...(options.validate === 'none'
      ? {}
      : {
          validate: (hotkey: Hotkey, c: HotkeyRecorderValidationContext) => {
            calls.push({ validate: hotkey, ...context(c) })
            const hasH = indices(c).some((index) => {
              const step = actions[index]
              return step?.kind === 'press' && step.press === 'h'
            })
            if (options.validate === 'accept' || !hasH) return true
            return options.validate === 'message' ? 'no h' : false
          },
        }),
    onRecord: (hotkey: Hotkey, c: HotkeyRecorderValidationContext) =>
      calls.push({ record: hotkey, ...context(c) }),
    onReject: ({ reason, message, hotkey, conflicts }) =>
      calls.push({
        reject: reason,
        ...(message === undefined ? {} : { message }),
        ...(hotkey === undefined ? {} : { hotkey }),
        ...(conflicts === undefined ? {} : { conflicts: conflicts.length }),
      }),
    onCancel: () => calls.push({ cancel: true }),
    onClear: () => calls.push({ clear: true }),
  })
  try {
    for (let i = 0; i < actions.length; i++) {
      const a = actions[i]!
      calls.length = 0
      errors.length = 0
      fired = 0
      let press: Record<string, unknown> = {}
      const run = (work: () => unknown) => guarded(errors, work)
      switch (a.kind) {
        case 'start':
          run(() => recorder.start())
          break
        case 'stop':
          run(() => recorder.stop())
          break
        case 'cancel':
          run(() => recorder.cancel())
          break
        case 'destroy':
          run(() => recorder.destroy())
          break
        case 'commit':
          run(() => recorder.commit())
          break
        case 'setOptions':
          run(() =>
            recorder.setOptions({
              recordTab: a.recordTab,
              commitKeys: a.commitKeys,
            }),
          )
          break
        case 'advance':
          run(() => vi.advanceTimersByTime(a.ms))
          break
        case 'press': {
          const init = sessionInit(a.press, options.platform, a.repeat)
          const target: EventTarget = a.inInput ? input : document
          if (a.inInput) input.focus()
          const down = keyEvent('keydown', { ...init, composed: true })
          at.set(down, i)
          run(() => target.dispatchEvent(down))
          const { repeat: _repeat, ...release } = init
          if (a.held && a.press === 'mod-s')
            run(() =>
              target.dispatchEvent(
                keyEvent('keydown', {
                  ...release,
                  repeat: true,
                  composed: true,
                }),
              ),
            )
          run(() =>
            target.dispatchEvent(
              keyEvent('keyup', { ...release, composed: true }),
            ),
          )
          if (a.inInput) input.blur()
          press = { prevented: down.defaultPrevented, fired }
          break
        }
      }
      const { isRecording, steps, recordedHotkey } = recorder.store.state
      observe(`action ${i}`, {
        calls: [...calls],
        state: {
          isRecording,
          steps: copy(steps),
          recordedHotkey: copy(recordedHotkey),
        },
        ...press,
        // destroy(): "Clean up event listeners and reset state"
        ...(a.kind === 'destroy' ? { timers: vi.getTimerCount() } : {}),
        ...(errors.length ? { errors: [...errors] } : {}),
      })
    }
  } finally {
    guarded(errors, () => recorder.destroy())
    // destroy(): "ensure all event listeners are properly removed". A key
    // press now reaches no recorder.
    calls.length = 0
    const after = keyEvent('keydown', { key: 'g', code: 'KeyG' })
    guarded(errors, () => document.dispatchEvent(after))
    observe('after destroy', {
      calls: [...calls],
      prevented: after.defaultPrevented,
      ...(errors.length ? { errors: [...errors] } : {}),
    })
    document.dispatchEvent(keyEvent('keyup', { key: 'g', code: 'KeyG' }))
    handle.unregister()
    clock.release()
    setTestPlatform(testPlatform())
    input.remove()
    window.dispatchEvent(new Event('blur'))
    HotkeyManager.resetInstance()
  }
}

const withoutContext = ({
  kind: _kind,
  events: _events,
  parsed: _parsed,
  ...call
}: Call) => call
const contextOf = (calls: ReadonlyArray<Call>) =>
  calls
    .filter((call) => 'events' in call)
    .map((call) => ({
      kind: call.kind,
      events: call.events,
      parsed: call.parsed,
    }))

/** Compares the session's checkpoints that one law speaks about, up to the first open one. */
function sessionCheck(law: Law | 'paused' | 'context') {
  return (
    _plan: Session,
    trace: ReadonlyArray<Observation>,
    expected: SessionExpected,
  ): Verdict => {
    for (let i = 0; i < expected.until; i++) {
      const owed = expected.steps[i]!
      const checkpoint = `action ${i}`
      const seen = valueAt(trace, checkpoint) as
        | {
            calls: Array<Call>
            state: Step['state']
            prevented?: boolean
            fired?: number
            timers?: number
            errors?: Array<string>
          }
        | undefined
      if (seen === undefined)
        return (
          differs(
            checkpoint,
            law,
            seen,
            owed.state,
            'no observation for this action',
          ) ?? pass
        )
      const verdict =
        differs(
          checkpoint,
          law,
          seen.errors,
          undefined,
          'the recorder threw',
        ) ??
        (law === 'paused'
          ? differs(checkpoint, law, seen.fired, owed.fired)
          : law === 'context'
            ? differs(
                checkpoint,
                law,
                contextOf(seen.calls),
                contextOf(owed.calls),
              )
            : owed.law !== law
              ? undefined
              : (differs(
                  checkpoint,
                  law,
                  seen.calls.map(withoutContext),
                  owed.calls.map(withoutContext),
                ) ??
                differs(
                  checkpoint,
                  law,
                  seen.state.isRecording,
                  owed.state.isRecording,
                  'isRecording differs',
                ) ??
                differs(
                  checkpoint,
                  law,
                  seen.state.steps,
                  owed.state.steps,
                  'steps differ',
                ) ??
                (owed.state.recordedHotkey === OPEN
                  ? undefined
                  : differs(
                      checkpoint,
                      law,
                      seen.state.recordedHotkey,
                      owed.state.recordedHotkey,
                      'recordedHotkey differs',
                    )) ??
                (owed.prevented === undefined || owed.prevented === OPEN
                  ? undefined
                  : differs(
                      checkpoint,
                      law,
                      seen.prevented,
                      owed.prevented,
                      'defaultPrevented differs',
                    )) ??
                differs(
                  checkpoint,
                  law,
                  seen.timers,
                  owed.timers,
                  'pending timers differ',
                )))
      if (verdict) return verdict
    }
    if (law === 'lifecycle')
      return (
        differs(
          'after destroy',
          law,
          valueAt(trace, 'after destroy'),
          { calls: [], prevented: false },
          'a listener outlived destroy()',
        ) ?? pass
      )
    return pass
  }
}

// Constructed sessions, one per declared state. Each keeps the generated
// options it does not need to fix, so the platform and mode still vary.
type Scenario = { options?: Partial<SessionOptions>; actions: Array<Action> }
const P = (
  press: PressName,
  extra: Partial<{ repeat: boolean; inInput: boolean; held: boolean }> = {},
): Action => ({
  kind: 'press',
  press,
  repeat: false,
  inInput: false,
  held: false,
  ...extra,
})
const T = (ms: number): Action => ({ kind: 'advance', ms })
const S = (
  kind: 'start' | 'stop' | 'cancel' | 'destroy' | 'commit',
): Action => ({ kind })
const quiet: Partial<SessionOptions> = {
  validate: 'none',
  detectConflicts: false,
  ignoreInputs: undefined,
  recordTab: undefined,
  commitKeys: undefined,
  idleTimeoutMs: undefined,
  passPlatform: true,
}
const idle = { ...quiet, maxSteps: 3, idleTimeoutMs: 400 }
const SCENARIOS: Record<string, Scenario> = {
  'Escape cancels': {
    options: { ...quiet, maxSteps: 3 },
    actions: [S('start'), P('g'), P('escape')],
  },
  'Tab cancels': {
    options: { ...quiet, maxSteps: 3 },
    actions: [S('start'), P('g'), P('shift-tab')],
  },
  'Backspace removes a step': {
    options: { ...quiet, maxSteps: 3 },
    actions: [S('start'), P('g'), P('h'), P('backspace')],
  },
  'Backspace clears': {
    options: { ...quiet },
    actions: [S('start'), P('delete')],
  },
  'Enter commits': {
    options: { ...quiet, maxSteps: Infinity },
    actions: [S('start'), P('g'), P('h'), P('enter')],
  },
  'step added': {
    options: { ...quiet, maxSteps: 3 },
    actions: [S('start'), P('g')],
  },
  'single chord, committed': {
    options: { ...quiet, maxSteps: 1 },
    actions: [S('start'), P('mod-s')],
  },
  'commit at maxSteps, committed': {
    options: { ...quiet, maxSteps: 2 },
    actions: [S('start'), P('g'), P('shift-slash')],
  },
  'idle commit, committed': {
    options: { ...quiet, maxSteps: 3, idleTimeoutMs: 400 },
    actions: [
      S('start'),
      P('g'),
      { kind: 'advance', ms: 100 },
      { kind: 'advance', ms: 400 },
    ],
  },
  'commit(), committed': {
    options: { ...quiet, maxSteps: Infinity },
    actions: [S('start'), P('g'), P('h'), S('commit')],
  },
  'single chord, rejected': {
    options: { ...quiet, maxSteps: 1, validate: 'message' },
    actions: [S('start'), P('h'), P('g')],
  },
  'commit at maxSteps, rejected': {
    options: { ...quiet, maxSteps: 2, detectConflicts: true },
    actions: [S('start'), P('mod-s'), P('g'), P('backspace'), P('backspace')],
  },
  'press rejected': {
    options: { ...quiet, platform: 'linux', recordBy: 'auto' },
    actions: [S('start'), P('altgr')],
  },
  'press records nothing': {
    options: { ...quiet, recordBy: 'code' },
    actions: [S('start'), P('capslock-on-control')],
  },
  'time passes': {
    options: { ...quiet, maxSteps: 3, idleTimeoutMs: 400 },
    actions: [S('start'), P('g'), { kind: 'advance', ms: 100 }],
  },
  // An ended recording's idle timer must not commit the next one early
  'idle timer after Enter': {
    options: idle,
    actions: [
      S('start'),
      P('g'),
      P('enter'),
      S('start'),
      T(100),
      P('g'),
      T(300),
      T(100),
    ],
  },
  'idle timer after Escape': {
    options: idle,
    actions: [
      S('start'),
      P('g'),
      P('escape'),
      S('start'),
      T(100),
      P('g'),
      T(300),
      T(100),
    ],
  },
  'idle timer after stop': {
    options: idle,
    actions: [
      S('start'),
      P('g'),
      S('stop'),
      S('start'),
      T(100),
      P('g'),
      T(300),
      T(100),
    ],
  },
  'idle timer after maxSteps': {
    options: { ...idle, maxSteps: 2 },
    actions: [
      S('start'),
      P('g'),
      P('h'),
      S('start'),
      T(100),
      P('g'),
      T(300),
      T(100),
    ],
  },
  'idle timer after Backspace to no steps': {
    options: idle,
    actions: [
      S('start'),
      P('g'),
      P('backspace'),
      T(100),
      P('h'),
      T(300),
      T(100),
    ],
  },
  'idle timeout 0 is off': {
    options: { ...idle, idleTimeoutMs: 0 },
    actions: [S('start'), P('g'), T(100)],
  },
  'idle timer before destroy': {
    options: idle,
    actions: [S('start'), P('g'), S('destroy')],
  },
  'idle timer restarts on each step': {
    options: idle,
    actions: [S('start'), P('g'), T(300), P('h'), T(300), T(100)],
  },
  'idle timer after commit()': {
    options: idle,
    actions: [
      S('start'),
      P('g'),
      S('commit'),
      S('start'),
      T(100),
      P('g'),
      T(300),
      T(100),
    ],
  },
  'Enter commits one step': {
    options: { ...quiet, maxSteps: 3 },
    actions: [S('start'), P('g'), P('enter')],
  },
  'conflict excluded': {
    options: { ...quiet, maxSteps: 1, detectConflicts: 'exclude' },
    actions: [S('start'), P('mod-s')],
  },
  'detected platform': {
    options: {
      ...quiet,
      passPlatform: false,
      detectConflicts: true,
      maxSteps: 2,
    },
    actions: [
      S('start'),
      P('mod-s'),
      P('g'),
      P('backspace'),
      P('backspace'),
      S('start'),
      P('g'),
      P('mod-s'),
    ],
  },
  // macOS ignores AltGraph, which only the detected platform tells the recorder
  'detected macOS platform': {
    options: {
      ...quiet,
      platform: 'mac',
      recordBy: 'auto',
      maxSteps: 1,
      passPlatform: false,
    },
    actions: [S('start'), P('altgr')],
  },
  'held key after commit': {
    options: { ...quiet, maxSteps: 1 },
    actions: [
      S('start'),
      P('mod-s', { held: true }),
      P('mod-s', { held: true }),
    ],
  },
  'sequence context after an edit': {
    options: { ...quiet, maxSteps: Infinity, validate: 'accept' },
    actions: [
      S('start'),
      P('g'),
      P('h'),
      P('backspace'),
      P('shift-slash'),
      P('enter'),
    ],
  },
  start: { options: { ...quiet }, actions: [S('start'), P('g'), S('start')] },
  'start while recording': {
    options: { ...quiet },
    actions: [S('start'), S('start'), P('g')],
  },
  stop: {
    options: { ...quiet, maxSteps: 3 },
    actions: [S('start'), P('g'), S('stop'), P('g')],
  },
  destroy: {
    options: { ...quiet },
    actions: [S('start'), P('g'), S('destroy')],
  },
  cancel: {
    options: { ...quiet },
    actions: [S('cancel'), S('start'), S('cancel')],
  },
  'press while idle': {
    options: { ...quiet },
    actions: [P('mod-s'), S('start'), P('g'), P('mod-s')],
  },
  'commit() with no steps': {
    options: { ...quiet },
    actions: [S('commit'), S('start'), S('commit')],
  },
  setOptions: {
    options: { ...quiet, maxSteps: 3 },
    actions: [
      S('start'),
      { kind: 'setOptions', recordTab: true, commitKeys: 'none' },
      P('tab'),
      P('enter'),
    ],
  },
  'time passes idle': {
    options: { ...quiet },
    actions: [{ kind: 'advance', ms: 400 }],
  },
  'typing in a field': {
    options: { ...quiet },
    actions: [
      S('start'),
      P('g', { inInput: true }),
      P('escape', { inInput: true }),
    ],
  },
  composition: {
    options: { ...quiet },
    actions: [S('start'), P('process'), P('g')],
  },
  repeat: {
    options: { ...quiet },
    actions: [S('start'), P('g', { repeat: true }), P('h')],
  },
  'modifier press': {
    options: { ...quiet },
    actions: [S('start'), P('shift'), P('g')],
  },
}
const scenario = (name: string): ((generated: Session) => Session) => {
  const { options, actions } = SCENARIOS[name]!
  return (generated) => ({
    options: { ...generated.options, ...options },
    actions,
  })
}

const SESSION_LAWS: Record<
  Law | 'paused' | 'context',
  {
    statement: string
    authority: string
    limits: string
    states: Array<string>
  }
> = {
  controls: {
    statement:
      "For every session, while recording: Escape cancels and calls onCancel; Tab and Shift+Tab without Control, Alt, or Meta cancel and call onCancel without preventing the default, unless recordTab is set; Backspace or Delete without modifiers removes the last step, or with no steps stops recording and calls onClear; plain Enter in a multi-step recording with commitKeys 'enter' commits the steps; and recordedHotkey is null after a cancel or a clear.",
    authority: `docs/guides/sensible-defaults.md:484-487; docs/framework/react/guides/custom-hotkey-recording.md:50 and 84-93; HotkeyRecorder JSDoc (src/hotkey-recorder.ts:229-238); HotkeyRecorderCommitKeys and recordTab JSDoc (src/hotkey-recorder.ts:135-158, 197); tests/recorder-tab.test.ts; changeset recorder-tab-focus (934af6f2). ${APPROVAL}`,
    limits:
      'Repeated Escape, Backspace, Delete, and plain multi-step Enter, and Enter with no steps, are left open; defaultPrevented is compared only for Tab.',
    states: [
      'Escape cancels',
      'Tab cancels',
      'Backspace removes a step',
      'Backspace clears',
      'Enter commits',
    ],
  },
  steps: {
    statement:
      "For every session, while recording, each press the press rule records adds a step and has its default prevented; the steps commit at maxSteps, on commit(), and after idleTimeoutMs without a new step in a multi-step recording; a commit calls validate, then (with detectConflicts) the conflict check, which skips the registrations in excludeIds, and on success ends recording with recordedHotkey set to the chord, or the sequence of two or more steps, and calls onRecord; a rejected commit calls onReject with 'validation' (and validate's message) or 'conflict' and keeps recording, clearing the steps of a single-chord recording and keeping a sequence's; a press the rule rejects calls onReject and adds no step.",
    authority: `docs/framework/react/guides/custom-hotkey-recording.md:58, 80, 103-127, 143, 160, 236-238; HotkeyRecorder JSDoc and commit() JSDoc (src/hotkey-recorder.ts:229-238, 451-455); maxSteps and idleTimeoutMs JSDoc (src/hotkey-recorder.ts:186, 199-200); tests/hotkey-recorder-steps.test.ts; changeset recorder-tab-focus (934af6f2, a recorded key's default is prevented). ${APPROVAL}`,
    limits:
      'maxSteps is 1, 2, 3 or Infinity. A chord past maxSteps after a rejected commit, and the idle timer after a Backspace that leaves steps or after a rejected commit, are left open. The conflict check is exercised with one registered Mod+S.',
    states: [
      'step added',
      'single chord, committed',
      'commit at maxSteps, committed',
      'idle commit, committed',
      'commit(), committed',
      'single chord, rejected',
      'commit at maxSteps, rejected',
      'press rejected',
      'press records nothing',
      'time passes',
    ],
  },
  lifecycle: {
    statement:
      'For every session: start() begins recording with no steps, and does nothing while recording; stop() ends recording without calling onRecord or onCancel; destroy() ends it, resets the state, leaves no idle timer pending, and no later key press reaches the recorder; cancel() ends it with recordedHotkey null and calls onCancel, even while idle; commit() with no steps does nothing; setOptions changes the options the next press reads; an idle recorder ignores key presses and time; and without a platform option the recorder uses the detected platform.',
    authority: `HotkeyRecorder start, stop, cancel, destroy, setOptions JSDoc and the start() comment (src/hotkey-recorder.ts:293-302, 325-336, 531-575); docs/framework/react/guides/custom-hotkey-recording.md:50-54, 234; tests/hotkey-recorder-steps.test.ts ("commit() is no-op with zero steps", "stop does not call onRecord or onCancel"); tests/recorder-options.test.ts. ${APPROVAL}`,
    limits:
      'recordedHotkey during a new recording and after stop() is left open when an earlier recording set it.',
    states: [
      'start',
      'start while recording',
      'stop',
      'destroy',
      'cancel',
      'press while idle',
      'commit() with no steps',
      'setOptions',
      'time passes idle',
    ],
  },
  ignored: {
    statement:
      'For every session, while recording, a repeated keydown other than Tab, an IME composition keydown, and a modifier key alone add no step and call no callback; with ignoreInputs on (the default), a key press in a text field other than Escape passes through: no step, no callback, and its default is not prevented.',
    authority: `docs/framework/react/guides/custom-hotkey-recording.md:86, 93, 95; docs/guides/sensible-defaults.md:489; ignoreInputs JSDoc (src/hotkey-recorder.ts:146-151); tests/hotkey-recorder.test.ts ("ignores typing but allows Escape"). ${APPROVAL}`,
    limits:
      'Whether a repeat, composition, or modifier press has its default prevented is left open.',
    states: ['typing in a field', 'composition', 'repeat', 'modifier press'],
  },
  paused: {
    statement:
      'For every session, a registered Mod+S hotkey does not fire for any key press while the recorder is listening, nor for the repeats of a key press the recording took, even after it ends, and fires for the Mod+S press (and its repeats) once the recording has ended.',
    authority: `docs/guides/sensible-defaults.md:488 ("Registered hotkeys are paused, so pressing Mod+S to record it does not also save"); docs/framework/react/guides/custom-hotkey-recording.md:11. ${APPROVAL}`,
    limits:
      'Each keydown is released before the next action, so a key held across the end of a recording is not covered.',
    states: ['paused while recording', 'fires while idle'],
  },
  context: {
    statement:
      "For every commit, validate and onRecord receive context.kind 'chord' with the event of the one step and its parsedChord, or 'sequence' with the events and parsedSequence of every step in order, each parsed step with Mod resolved for the recorder's platform.",
    authority: `docs/framework/react/guides/custom-hotkey-recording.md:114; HotkeyChordRecorderValidationContext and onRecord JSDoc (src/hotkey-recorder.ts:84-108, 170-177, 192-196); tests/recorder-auto.test.ts ("onRecord context"). ${APPROVAL}`,
    limits:
      'Of parsedChord and parsedSequence, only the modifiers are compared.',
    states: [
      'chord context',
      'sequence context',
      'sequence context after an edit',
    ],
  },
}
/** More constructed sessions, each entering a state of the named law. */
const EXTRA_SCENARIOS: Record<
  Law | 'paused' | 'context',
  Array<[scenario: string, state: string]>
> = {
  controls: [['Enter commits one step', 'Enter commits']],
  steps: [
    ...[
      'Enter',
      'Escape',
      'stop',
      'maxSteps',
      'Backspace to no steps',
      'commit()',
    ].map((after): [string, string] => [
      `idle timer after ${after}`,
      'idle commit, committed',
    ]),
    ['idle timer restarts on each step', 'idle commit, committed'],
    ['idle timeout 0 is off', 'time passes'],
    ['conflict excluded', 'single chord, committed'],
    ['detected platform', 'commit at maxSteps, rejected'],
    ['detected macOS platform', 'single chord, committed'],
  ],
  lifecycle: [['idle timer before destroy', 'destroy']],
  ignored: [],
  paused: [['held key after commit', 'fires while idle']],
  context: [],
}
const CONTEXT_SCENARIOS: Record<string, string> = {
  'chord context': 'single chord, committed',
  'sequence context': 'Enter commits',
  'paused while recording': 'single chord, committed',
  'fires while idle': 'press while idle',
}

function sessionReached(law: Law | 'paused' | 'context') {
  return (
    plan: Session,
    _trace: ReadonlyArray<Observation>,
    expected: SessionExpected,
  ): Array<string> => {
    const seen = expected.steps.slice(0, expected.until)
    if (law === 'paused')
      return seen.flatMap((step, i) => {
        const a = plan.actions[i]!
        if (a.kind !== 'press' || a.press !== 'mod-s') return []
        return [step.fired ? 'fires while idle' : 'paused while recording']
      })
    if (law === 'context')
      return seen.flatMap((step) =>
        step.calls
          .filter((call) => 'record' in call)
          .map((call) => {
            if (call.kind === 'chord') return 'chord context'
            const events = call.events as Array<number>
            // Steps pressed one after another, or with an edit between them
            return events.every((at, k) => k === 0 || at === events[k - 1]! + 1)
              ? 'sequence context'
              : 'sequence context after an edit'
          }),
      )
    return seen.filter((step) => step.law === law).map((step) => step.tag)
  }
}

const SESSION_MEASURED: Record<Law, Array<string>> = {
  controls: [],
  steps: [
    'idle commit, rejected',
    'commit(), rejected',
    'commit at maxSteps, rejected',
  ],
  lifecycle: [],
  ignored: [],
}

for (const law of [
  'lifecycle',
  'controls',
  'steps',
  'ignored',
  'paused',
  'context',
] as const) {
  const { states, ...lawText } = SESSION_LAWS[law]
  const measured = (
    law in SESSION_MEASURED ? SESSION_MEASURED[law as Law] : []
  ).filter((state) => !states.includes(state))
  const calibration: Calibration<Session, Session> = {
    name: `a wrong ${law} observation`,
    law,
    history: { constructed: states[0]! },
    corrupt: (trace, plan) => {
      const expected = sessionModel(plan)
      const index = expected.steps.findIndex((step, i) =>
        law === 'paused'
          ? plan.actions[i]!.kind === 'press'
          : law === 'context'
            ? contextOf(step.calls).length > 0
            : step.law === law,
      )
      if (index < 0) return undefined
      return trace.map((entry) => {
        if (entry.checkpoint !== `action ${index}`) return entry
        const value = entry.value as {
          calls: Array<Call>
          fired?: number
          state: Step['state']
        }
        if (law === 'paused')
          return {
            ...entry,
            value: { ...value, fired: 1 - (value.fired ?? 0) },
          }
        if (law === 'context')
          return {
            ...entry,
            value: {
              ...value,
              calls: value.calls.map((call) =>
                'events' in call ? { ...call, events: [] } : call,
              ),
            },
          }
        return {
          ...entry,
          value: {
            ...value,
            state: { ...value.state, isRecording: !value.state.isRecording },
          },
        }
      })
    },
  }
  oracleProperty<Session, SessionExpected, Session>({
    id: `recorder.session.${law}`,
    law: lawText,
    owns: [
      'src/hotkey-recorder.ts#HotkeyRecorder.constructor',
      'src/hotkey-recorder.ts#HotkeyRecorder.setOptions',
      'src/hotkey-recorder.ts#HotkeyRecorder.start',
      'src/hotkey-recorder.ts#HotkeyRecorder.commit',
      'src/hotkey-recorder.ts#HotkeyRecorder.stop',
      'src/hotkey-recorder.ts#HotkeyRecorder.cancel',
      'src/hotkey-recorder.ts#HotkeyRecorder.destroy',
    ],
    histories: {
      arbitrary: sessionHistory,
      runs: 100,
      fixedSeeds: [20261121],
      states,
      measured,
      bases: 2,
      constructed: [
        ...states.map((state) => ({
          name: state,
          enters: [state],
          build: scenario(CONTEXT_SCENARIOS[state] ?? state),
        })),
        ...EXTRA_SCENARIOS[law].map(([name, state]) => ({
          name,
          enters: [state],
          build: scenario(name),
        })),
      ],
    },
    model: sessionModel,
    reached: sessionReached(law),
    driver: driveSession,
    check: sessionCheck(law),
    calibrations: [calibration],
  })
}

registerPressOracles()
