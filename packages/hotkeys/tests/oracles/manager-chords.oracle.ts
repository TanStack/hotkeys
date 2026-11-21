/**
 * This oracle owns how `HotkeyManager` dispatches chord hotkeys: which
 * registered chords run for each keydown and keyup, what happens to the
 * event (`defaultPrevented`, and whether it keeps propagating), and what the
 * registrations store shows after it (`triggerCount`, `hasFired`, `status`,
 * and its notifications). It owns `HotkeyManager.#processChords` and
 * `HotkeyManager.#endPresses` in `src/hotkey-manager.ts`, and what they call.
 *
 * ```ts
 * register('K', a); register('[KeyK]', b); press л on the K key // → b runs: an exact match beats a fallback
 * register('K', a, { scope: 'b' }); activateScope('a'); activateScope('b') // → only the newest scope's K runs
 * register('K', a, { enabled: false, preventDefault: 'always' }); press k // → prevented, a does not run, propagation goes on
 * register('K', a, { requireReset: true }); press k; repeat k // → a runs once
 * register('K', a, { eventType: 'keyup' }); press k; press j; release k // → a does not run: another key came in between
 * ```
 *
 * Why does a keyup `K` on the document not fire when the user presses K,
 * then presses J in a panel whose own `J` hotkey stops the event, then
 * releases K? The document never received J, but the guide's rule is about
 * the user's keys, not about what one listener receives: a keyup chord fires
 * "unless another key was pressed in between". So a press ends wherever the
 * manager first receives the next key, not where the chord listens.
 *
 * Three parts decide every key event. The rounds are the listeners an event
 * reaches, in order: the document's capture phase, the panel (an element
 * target, only while focus is inside it), the page's own handler on `body`,
 * then the document's bubble phase; a hotkey or the page that stops
 * propagation ends them. The candidates of a round are its live
 * registrations (enabled, scope active) that receive the event, are not
 * skipped (a text field, a key another listener prevented, Escape that an
 * open dialog owns), and match it; the winners are the best match, then the
 * newest scope. The press state of each chord is its `requireReset` latch
 * and, for a keyup chord, the press waiting for its release.
 *
 * The laws, each one property below: fires on a match; precedence; enabled
 * and scopes (with `status`); skips; preventDefault and stopPropagation
 * (with `'always'`, and a callback's own `preventDefault()`); requireReset;
 * keyup chords; registration over time (unregister, also from another
 * callback during the same event, setOptions, duplicate warnings,
 * `triggerCount`, and the store's notifications); no throw.
 *
 * The model steps the registrations, the scope activations, and each chord's
 * press state through the plan, and computes each event's rounds,
 * candidates, and winners from the guides. The single-chord match relation
 * is a small table from the guides (the key-matching oracle owns it):
 * letters match the character typed, a Russian letter falls back to its US
 * position, `?` typed with Shift matches `?` below `Shift+?`, and `[KeyK]`
 * matches the position. Histories register up to six chords on the document
 * (bubble or capture) or on a panel, some whose callbacks prevent the key or
 * unregister the next registration, change their options, activate and
 * release scopes (exclusive, or exclusive allowing `'global'`), move focus
 * between the page, the panel, a text field in it, and an element inside a
 * `role="dialog"`, and press, repeat, release, and lose the keyup of nine
 * keys: two Control keys, Shift, keys of an on-screen keyboard that report
 * no `code`, and a K key on a US or Russian layout. The page's own
 * listeners prevent or stop some events. The driver dispatches each event at
 * the focused element and records the callbacks that ran (with their event
 * and context), `defaultPrevented`, whether `window` saw the event, each
 * registration's store entry and view, notifications, warnings, and errors.
 * The check finds the first step where production leaves the model, and
 * reports the law of the rule that decided it and every law involved in it.
 *
 * Limits. Three rules the documentation does not settle are allowed sets.
 * When the best match and the newest scope disagree (an exact match in an
 * older scope, a fallback in a newer one), and when a chord skips an
 * automatic repeat of a keyup chord's press, the model predicts both
 * readings, and production must follow one through the whole history. An
 * `'always'` chord that can't fire defers to "another hotkey" that handles
 * the key: when a hotkey on the event's path never receives the key (the
 * page stopped it first), or the only other hotkey is a keyup chord whose
 * press this keydown is, either `defaultPrevented` is accepted. `hasFired` is
 * checked only for keydown chords while `requireReset` is on, and after a
 * release the registration's own target did not receive, either value is
 * accepted. Every history has a document capture listener (an `F12` chord),
 * so the manager receives every key press. Not generated: sequences, the
 * recorder, `Mod` and macOS, `capture` on an element,
 * `afterDelegatedHandlers`, window and shadow-root targets,
 * `conflictBehavior` other than the default and `'allow'`, a scope activated
 * twice at once, nested scopes, a layout switch while a key is held, and
 * changes of `eventType`, `scope`, `target`, or `capture` through
 * `setOptions`.
 */
import { HotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { oracleProperty, pass, violation } from '@tanstack/oracles'
import fc from 'fast-check'
import { vi } from 'vitest'
import type { HotkeyRegistrationHandle } from '@tanstack/hotkeys'
import type { Observation, Verdict } from '@tanstack/oracles'

const APPROVAL =
  'Proposed by an agent for Kevin Van Cott (KevinVandy) on 2026-11-21, pending his approval; see .tasks/tanstack-oracles/decisions.md.'

// ---------------------------------------------------------------------------
// The alphabet: chords, physical keys, focus, and the page's own listeners
// ---------------------------------------------------------------------------

const HOTKEYS = [
  'K',
  'Shift+K',
  'Control+K',
  '[KeyK]',
  '?',
  'Shift+?',
  'Escape',
  'J',
] as const
type HotkeyName = (typeof HOTKEYS)[number]

/**
 * What each hotkey string binds, read from the hotkey grammar (the
 * hotkey-grammar oracle owns parsing): a logical key or a physical code, and
 * whether it names Shift and Control. Every registration uses
 * `platform: 'linux'`, so `Control` is the only command modifier.
 */
interface Chord {
  key?: string
  code?: string
  shift: boolean
  ctrl: boolean
}
const CHORDS: Record<HotkeyName, Chord> = {
  K: { key: 'K', shift: false, ctrl: false },
  'Shift+K': { key: 'K', shift: true, ctrl: false },
  'Control+K': { key: 'K', shift: false, ctrl: true },
  '[KeyK]': { code: 'KeyK', shift: false, ctrl: false },
  '?': { key: '?', shift: false, ctrl: false },
  'Shift+?': { key: '?', shift: true, ctrl: false },
  Escape: { key: 'Escape', shift: false, ctrl: false },
  J: { key: 'J', shift: false, ctrl: false },
}

const PHYSICAL = [
  'KeyK',
  'Slash',
  'Escape',
  'KeyJ',
  'ShiftLeft',
  'ControlLeft',
  'ControlRight',
  'VirtualK',
  'VirtualJ',
] as const
type Physical = (typeof PHYSICAL)[number]
type Layout = 'us' | 'ru'

/** What a key types, from its position, the layout, and Shift (US QWERTY, and Russian on the K key). */
function typed(code: Physical, layout: Layout, shift: boolean): string {
  switch (code) {
    case 'KeyK':
      return layout === 'ru' ? (shift ? 'Л' : 'л') : shift ? 'K' : 'k'
    case 'Slash':
      return shift ? '?' : '/'
    case 'Escape':
      return 'Escape'
    case 'KeyJ':
      return shift ? 'J' : 'j'
    case 'ShiftLeft':
      return 'Shift'
    case 'ControlLeft':
    case 'ControlRight':
      return 'Control'
    case 'VirtualK':
      return shift ? 'K' : 'k'
    case 'VirtualJ':
      return shift ? 'J' : 'j'
  }
}

/** The `KeyboardEvent.code` a key reports. An on-screen keyboard's keys report none. */
function codeOf(key: Physical): string {
  return key.startsWith('Virtual') ? '' : key
}

/** The US character at a position, which a non-Latin letter falls back to. */
const US_POSITION: Partial<Record<string, string>> = {
  KeyK: 'K',
  KeyJ: 'J',
  Slash: '/',
}

/** Where focus is: the page, a focusable panel, a text field in the panel, an element in a `role="dialog"`. */
const FOCUS = ['body', 'panel', 'input', 'inner'] as const
type Focus = (typeof FOCUS)[number]

/** What the page's own listeners do to an event: nothing, `preventDefault()` in a document capture listener, or `stopPropagation()` on `body`. */
const PAGES = ['none', 'prevent', 'stop'] as const
type Page = (typeof PAGES)[number]

const SCOPES = ['a', 'b'] as const
type NamedScope = (typeof SCOPES)[number]
type Exclusive = 'no' | 'yes' | 'allowGlobal'

/** A registration as the history writes it. `undefined` leaves an option at its default. */
interface Spec {
  hotkey: HotkeyName
  target: 'document' | 'panel'
  capture: boolean
  eventType: 'keydown' | 'keyup' | undefined
  enabled: boolean | undefined
  preventDefault: boolean | 'always' | undefined
  stopPropagation: boolean | undefined
  requireReset: boolean | undefined
  ignoreInputs: boolean | 'auto' | undefined
  ignoreDefaultPrevented: boolean | undefined
  scope: 'global' | NamedScope | undefined
  conflict: 'allow' | undefined
  /** The callback calls `event.preventDefault()` itself. */
  prevents: boolean
  /** The callback unregisters the registration made right after this one. */
  unregisters: boolean
}

/** The options `setOptions` changes in these histories, and the values each takes. */
const SET_VALUES = {
  enabled: [true, false, undefined],
  preventDefault: [true, false, 'always', undefined],
  stopPropagation: [true, false, undefined],
  requireReset: [true, false, undefined],
  ignoreInputs: [true, false, 'auto', undefined],
  ignoreDefaultPrevented: [true, false, undefined],
} as const
type SetField = keyof typeof SET_VALUES
const SET_FIELDS = Object.keys(SET_VALUES) as Array<SetField>

// ---------------------------------------------------------------------------
// Histories
// ---------------------------------------------------------------------------

type HistoryAction =
  | { kind: 'register'; spec: Spec }
  | { kind: 'unregister'; n: number }
  | { kind: 'set'; n: number; field: SetField; value: number }
  | { kind: 'activate'; scope: NamedScope; exclusive: Exclusive }
  | { kind: 'release'; n: number }
  | { kind: 'focus'; where: Focus }
  | { kind: 'down'; key: Physical; layout: Layout; page: Page }
  | { kind: 'up'; key: Physical; page: Page }
  | { kind: 'drop'; key: Physical }

interface History {
  actions: Array<HistoryAction>
}

const MAX_ACTIONS = 30
const MAX_REGISTRATIONS = 6

const specArbitrary: fc.Arbitrary<Spec> = fc.record({
  hotkey: fc.constantFrom(...HOTKEYS),
  target: fc.constantFrom('document' as const, 'panel' as const),
  capture: fc.boolean(),
  eventType: fc.constantFrom(undefined, 'keydown' as const, 'keyup' as const),
  enabled: fc.constantFrom(undefined, true, false),
  preventDefault: fc.constantFrom(undefined, true, false, 'always' as const),
  stopPropagation: fc.constantFrom(undefined, true, false),
  requireReset: fc.constantFrom(undefined, false, true),
  ignoreInputs: fc.constantFrom(undefined, 'auto' as const, true, false),
  ignoreDefaultPrevented: fc.constantFrom(undefined, false, true),
  scope: fc.constantFrom(
    undefined,
    'global' as const,
    'a' as const,
    'b' as const,
  ),
  conflict: fc.constantFrom(undefined, 'allow' as const),
  prevents: fc.boolean(),
  unregisters: fc.oneof(
    { arbitrary: fc.constant(false), weight: 5 },
    { arbitrary: fc.constant(true), weight: 1 },
  ),
})

const pageArbitrary = fc.oneof(
  { arbitrary: fc.constant('none' as const), weight: 6 },
  { arbitrary: fc.constant('prevent' as const), weight: 1 },
  { arbitrary: fc.constant('stop' as const), weight: 1 },
)

const actionArbitrary: fc.Arbitrary<HistoryAction> = fc.oneof(
  {
    arbitrary: fc.record({
      kind: fc.constant('register' as const),
      spec: specArbitrary,
    }),
    weight: 4,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('unregister' as const),
      n: fc.nat({ max: 7 }),
    }),
    weight: 1,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('set' as const),
      n: fc.nat({ max: 7 }),
      field: fc.constantFrom(...SET_FIELDS),
      value: fc.nat({ max: 3 }),
    }),
    weight: 2,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('activate' as const),
      scope: fc.constantFrom(...SCOPES),
      exclusive: fc.constantFrom(
        'no' as const,
        'yes' as const,
        'allowGlobal' as const,
      ),
    }),
    weight: 1,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('release' as const),
      n: fc.nat({ max: 3 }),
    }),
    weight: 1,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('focus' as const),
      where: fc.constantFrom(...FOCUS),
    }),
    weight: 2,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('down' as const),
      key: fc.constantFrom(...PHYSICAL),
      layout: fc.constantFrom('us' as const, 'us' as const, 'ru' as const),
      page: pageArbitrary,
    }),
    weight: 7,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('up' as const),
      key: fc.constantFrom(...PHYSICAL),
      page: pageArbitrary,
    }),
    weight: 5,
  },
  {
    arbitrary: fc.record({
      kind: fc.constant('drop' as const),
      key: fc.constantFrom(...PHYSICAL),
    }),
    weight: 1,
  },
)

const historyArbitrary: fc.Arbitrary<History> = fc.record({
  actions: fc.array(actionArbitrary, { maxLength: MAX_ACTIONS }),
})

// ---------------------------------------------------------------------------
// The plan: legal, concrete steps
// ---------------------------------------------------------------------------

interface KeyStep {
  kind: 'key'
  type: 'keydown' | 'keyup'
  key: string
  code: string
  physical: Physical
  shift: boolean
  ctrl: boolean
  repeat: boolean
  page: Page
  focus: Focus
}

type Step =
  | { kind: 'register'; slot: number; spec: Spec }
  | { kind: 'unregister'; slot: number }
  | { kind: 'set'; slot: number; field: SetField; value: Spec[SetField] }
  | {
      kind: 'activate'
      handle: number
      scope: NamedScope
      exclusive: Exclusive
    }
  | { kind: 'release'; handle: number }
  | { kind: 'focus'; where: Focus }
  | { kind: 'drop'; code: Physical }
  | KeyStep

interface Plan {
  steps: Array<Step>
}

/**
 * The grammar's legality: a key that is held repeats only while it is the
 * last key pressed (otherwise the action releases it), a release of a key
 * that is not held presses it, Shift and Control set the flags of every event
 * while held, and a key's release types with the layout of its press. A
 * registration on the panel listens in the bubble phase. A scope is not
 * activated while it is already active. Actions on registrations or scope
 * activations that don't exist are dropped.
 */
function resolve(history: History): Plan {
  const steps: Array<Step> = []
  const held = new Map<Physical, Layout>()
  const keys: { last: Physical | null } = { last: null }
  let focus: Focus = 'body'
  let slots = 0
  const alive: Array<number> = []
  let handles = 0
  const activations: Array<{ handle: number; scope: NamedScope }> = []
  const keyStep = (
    type: 'keydown' | 'keyup',
    code: Physical,
    layout: Layout,
    repeat: boolean,
    page: Page,
  ) => {
    const shift = held.has('ShiftLeft')
    const ctrl = held.has('ControlLeft') || held.has('ControlRight')
    steps.push({
      kind: 'key',
      type,
      key: typed(code, layout, shift),
      code: codeOf(code),
      physical: code,
      shift,
      ctrl,
      repeat,
      page,
      focus,
    })
  }
  const press = (code: Physical, layout: Layout, page: Page) => {
    held.set(code, layout)
    keys.last = code
    keyStep('keydown', code, layout, false, page)
  }
  const release = (code: Physical, page: Page) => {
    const layout = held.get(code)!
    held.delete(code)
    if (keys.last === code) keys.last = null
    keyStep('keyup', code, layout, false, page)
  }
  for (const action of history.actions) {
    switch (action.kind) {
      case 'register': {
        if (alive.length >= MAX_REGISTRATIONS) break
        const spec = {
          ...action.spec,
          capture: action.spec.target === 'document' && action.spec.capture,
        }
        steps.push({ kind: 'register', slot: slots, spec })
        alive.push(slots++)
        break
      }
      case 'unregister': {
        if (alive.length === 0) break
        const [slot] = alive.splice(action.n % alive.length, 1)
        steps.push({ kind: 'unregister', slot: slot! })
        break
      }
      case 'set': {
        if (alive.length === 0) break
        const values = SET_VALUES[action.field] as ReadonlyArray<Spec[SetField]>
        steps.push({
          kind: 'set',
          slot: alive[action.n % alive.length]!,
          field: action.field,
          value: values[action.value % values.length],
        })
        break
      }
      case 'activate': {
        if (activations.some((a) => a.scope === action.scope)) break
        activations.push({ handle: handles, scope: action.scope })
        steps.push({
          kind: 'activate',
          handle: handles++,
          scope: action.scope,
          exclusive: action.exclusive,
        })
        break
      }
      case 'release': {
        if (activations.length === 0) break
        const [activation] = activations.splice(
          action.n % activations.length,
          1,
        )
        steps.push({ kind: 'release', handle: activation!.handle })
        break
      }
      case 'focus':
        focus = action.where
        steps.push({ kind: 'focus', where: action.where })
        break
      case 'down':
        if (!held.has(action.key)) press(action.key, action.layout, action.page)
        else if (keys.last === action.key)
          keyStep(
            'keydown',
            action.key,
            held.get(action.key)!,
            true,
            action.page,
          )
        else release(action.key, action.page)
        break
      case 'up':
        if (held.has(action.key)) release(action.key, action.page)
        else press(action.key, 'us', action.page)
        break
      case 'drop':
        if (!held.has(action.key)) break
        held.delete(action.key)
        if (keys.last === action.key) keys.last = null
        steps.push({ kind: 'drop', code: action.key })
        break
    }
  }
  return { steps }
}

// ---------------------------------------------------------------------------
// The model
// ---------------------------------------------------------------------------

const LAWS = {
  fires: 'fires on a match',
  precedence: 'precedence',
  live: 'enabled and scopes',
  skips: 'skips',
  prevent: 'preventDefault and stopPropagation',
  requireReset: 'requireReset',
  keyup: 'keyup chords',
  registration: 'registration over time',
  noThrow: 'no throw',
} as const
type Law = (typeof LAWS)[keyof typeof LAWS]

/**
 * How well an event matches a chord, 0 for no match. The ranks follow the
 * guide's "an exact match takes priority over a fallback"
 * (docs/guides/sensible-defaults.md:56) and the matcher's JSDoc
 * (src/_match.ts KeyboardEventMatch): 3 for the exact key or code with the
 * modifiers the binding names, 2 for a symbol that Shift typed matched by a
 * binding without Shift (`?`, sensible-defaults.md:119), 1 for a non-Latin
 * letter matched by its US position (sensible-defaults.md:43). Control and
 * Shift must match exactly otherwise (sensible-defaults.md:117), and letters
 * match without regard to case (sensible-defaults.md:62).
 */
function score(chord: Chord, event: KeyStep): 0 | 1 | 2 | 3 {
  if (event.ctrl !== chord.ctrl) return 0
  const shiftMatches = event.shift === chord.shift
  if (chord.code !== undefined)
    return shiftMatches && event.code === chord.code ? 3 : 0
  const letter = /^\p{L}$/u.test(event.key)
  const same = letter
    ? event.key.toUpperCase() === chord.key
    : event.key === chord.key
  if (same) {
    if (shiftMatches) return 3
    const symbol = event.key.length === 1 && !letter
    return symbol && event.shift && !chord.shift ? 2 : 0
  }
  const nonLatin =
    /^\p{L}$/u.test(event.key) && !/^\p{Script=Latin}$/u.test(event.key)
  return shiftMatches && nonLatin && US_POSITION[event.code] === chord.key
    ? 1
    : 0
}

/** The modifiers a chord names, as `KeyboardEvent.key` reports their keys. */
function modifiersOf(chord: Chord): Array<string> {
  return [...(chord.shift ? ['Shift'] : []), ...(chord.ctrl ? ['Control'] : [])]
}

/** Options with their documented defaults (docs/framework/react/guides/hotkeys.md:120-135). */
function optionsOf(spec: Spec) {
  return {
    enabled: spec.enabled ?? true,
    preventDefault: spec.preventDefault ?? true,
    stopPropagation: spec.stopPropagation ?? true,
    requireReset: spec.requireReset ?? false,
    eventType: spec.eventType ?? 'keydown',
    ignoreInputs: spec.ignoreInputs ?? 'auto',
    ignoreDefaultPrevented: spec.ignoreDefaultPrevented ?? false,
    scope: spec.scope ?? 'global',
  }
}

/**
 * Whether a registration skips keys that a focused text field uses. `'auto'`
 * is false for Control chords and Escape and true for the rest
 * (sensible-defaults.md:132-139).
 */
function ignoresInputs(spec: Spec): boolean {
  const { ignoreInputs } = optionsOf(spec)
  if (ignoreInputs !== 'auto') return ignoreInputs
  const chord = CHORDS[spec.hotkey]
  return !chord.ctrl && chord.key !== 'Escape'
}

interface Reg {
  slot: number
  spec: Spec
  alive: boolean
  count: number
  /** The code that latched a requireReset chord, cleared by releases its target received. */
  latch: string | null
  /** The same latch, cleared by any release of its key or modifiers the manager received. */
  latchUser: string | null
  /** A keyup chord's press waiting for its release: the pressed code and its match rank. */
  pending: { code: string; score: number } | null
}

interface Activation {
  handle: number
  scope: NamedScope
  exclusive: Exclusive
  order: number
}

type Precedence = 'score first' | 'scope first'
/**
 * The readings of the two rules the documentation leaves open. Precedence:
 * the best match, then the newest scope, or the other way round. A skipped
 * repeat: when the chord skips an automatic repeat of a keyup chord's press
 * (the page prevented it, or focus moved into a dialog that owns Escape),
 * the press ends there, or it keeps waiting for its release.
 */
interface Reading {
  precedence: Precedence
  skippedRepeat: 'ends' | 'keeps'
}
const READINGS: ReadonlyArray<Reading> = (
  ['score first', 'scope first'] as const
).flatMap((precedence) =>
  (['ends', 'keeps'] as const).map((skippedRepeat) => ({
    precedence,
    skippedRepeat,
  })),
)

interface Fired {
  slot: number
  hotkey: string
  kind: string
  event: boolean
}

type Status = 'active' | 'suspended' | 'disabled'

interface OwedKey {
  kind: 'key'
  fired: Array<Fired>
  prevented: boolean | 'either'
  reachedWindow: boolean
  /** How many times the registrations store notified subscribers during the event. */
  notifications: { min: number; max: number }
  regs: Array<{
    slot: number
    triggerCount: number
    hasFired: boolean | 'either'
    status: Status
  }>
  /** The law of the rule that decided each registration's outcome. */
  reasons: Record<number, Law>
  /** Every law whose rules decided something in this event. */
  involved: Array<Law>
  errors: 0
}
interface OwedRegister {
  kind: 'register'
  warned: number
  active: true
  errors: 0
}
interface OwedOther {
  kind: 'other'
  errors: 0
}
type Owed = OwedKey | OwedRegister | OwedOther

interface OwedReading {
  reading: Reading
  steps: Array<Owed>
  /** Each live registration's view status after `resetInstance()`, when no manager exists. */
  afterReset: Array<{ slot: number; status: Status }>
}

interface Expected {
  readings: Array<OwedReading>
  states: Array<string>
}

/**
 * Scope state: live scopes and precedence. `'global'` is always active and
 * ranks lowest; a newer activation ranks higher (hotkeys-provider-and-scopes.md:120,
 * hotkey-manager.ts activateScope JSDoc). The newest exclusive activation owns
 * the keyboard, and only it, plus `'global'` when it allows it, is live
 * (hotkeys-provider-and-scopes.md:186, 223, 229).
 */
function scopesOf(activations: ReadonlyArray<Activation>) {
  const order = [...activations].sort((a, b) => a.order - b.order)
  const owner = order.filter((a) => a.exclusive !== 'no').pop()
  return {
    any: order.length > 0,
    rank: (scope: string) =>
      scope === 'global' ? 0 : order.findIndex((a) => a.scope === scope) + 1,
    live: (scope: string) =>
      owner
        ? scope === owner.scope ||
          (owner.exclusive === 'allowGlobal' && scope === 'global')
        : scope === 'global' || order.some((a) => a.scope === scope),
  }
}

/**
 * A registration's status (src/hotkey-manager.ts HotkeyRegistrationStatus
 * JSDoc): 'disabled' with enabled: false, else 'suspended' when its scope
 * can't fire, else 'active'. Without a manager, scopes don't apply
 * (getRegistrationStatus JSDoc).
 */
function statusOf(
  spec: Spec,
  live: ((scope: string) => boolean) | null,
): Status {
  const o = optionsOf(spec)
  if (!o.enabled) return 'disabled'
  return live === null || live(o.scope) ? 'active' : 'suspended'
}

/** One reading's walk through the plan. */
function walk(plan: Plan, reading: Reading, states: Set<string>): OwedReading {
  const regs: Array<Reg> = []
  let activations: Array<Activation> = []
  let order = 0
  const steps: Array<Owed> = []
  for (const step of plan.steps) {
    switch (step.kind) {
      case 'register': {
        const opts = optionsOf(step.spec)
        // A duplicate is the same hotkey on the same target, in the same scope,
        // for the same event type (sensible-defaults.md:457, hotkeys.md:362).
        const duplicate = regs.some(
          (r) =>
            r.alive &&
            r.spec.hotkey === step.spec.hotkey &&
            r.spec.target === step.spec.target &&
            optionsOf(r.spec).scope === opts.scope &&
            optionsOf(r.spec).eventType === opts.eventType,
        )
        if (duplicate)
          states.add(
            step.spec.conflict === 'allow'
              ? 'duplicate allowed'
              : 'duplicate warns',
          )
        regs.push({
          slot: step.slot,
          spec: step.spec,
          alive: true,
          count: 0,
          latch: null,
          latchUser: null,
          pending: null,
        })
        steps.push({
          kind: 'register',
          warned: duplicate && step.spec.conflict !== 'allow' ? 1 : 0,
          active: true,
          errors: 0,
        })
        break
      }
      case 'unregister': {
        const reg = regs.find((r) => r.slot === step.slot)!
        reg.alive = false
        reg.pending = null
        steps.push({ kind: 'other', errors: 0 })
        break
      }
      case 'set': {
        const reg = regs.find((r) => r.slot === step.slot)!
        reg.spec = { ...reg.spec, [step.field]: step.value }
        states.add('setOptions changes a registration')
        steps.push({ kind: 'other', errors: 0 })
        break
      }
      case 'activate':
        activations.push({
          handle: step.handle,
          scope: step.scope,
          exclusive: step.exclusive,
          order: ++order,
        })
        steps.push({ kind: 'other', errors: 0 })
        break
      case 'release':
        activations = activations.filter((a) => a.handle !== step.handle)
        steps.push({ kind: 'other', errors: 0 })
        break
      case 'focus':
        steps.push({ kind: 'other', errors: 0 })
        break
      case 'drop':
        states.add('lost keyup')
        steps.push({ kind: 'other', errors: 0 })
        break
      case 'key':
        steps.push(keyEvent(step, regs, scopesOf(activations), reading, states))
        break
    }
  }
  return {
    reading,
    steps,
    afterReset: regs
      .filter((r) => r.alive)
      .map((r) => ({ slot: r.slot, status: statusOf(r.spec, null) })),
  }
}

interface Round {
  name: 'capture' | 'panel' | 'document'
  onPath: boolean
}

/** Whether a release event still holds a modifier down, through its other key. */
function stillHeld(modifier: string, event: KeyStep): boolean {
  return modifier === 'Control'
    ? event.ctrl
    : modifier === 'Shift'
      ? event.shift
      : false
}

/** The rounds, candidates, and winners of one key event. */
function keyEvent(
  event: KeyStep,
  allRegs: Array<Reg>,
  scopes: ReturnType<typeof scopesOf>,
  reading: Reading,
  states: Set<string>,
): OwedKey {
  const reasons: Record<number, Law> = {}
  const involved = new Set<Law>()
  const inPanel = event.focus === 'panel' || event.focus === 'input'
  const inField = event.focus === 'input'
  const pagePrevents = event.page === 'prevent'
  const keydown = event.type === 'keydown'
  const escapeInDialog =
    keydown && event.key === 'Escape' && event.focus === 'inner'
  if (inField || escapeInDialog || pagePrevents) involved.add(LAWS.skips)
  if (scopes.any) involved.add(LAWS.live)

  const live = (r: Reg) => {
    const o = optionsOf(r.spec)
    return o.enabled && scopes.live(o.scope)
  }
  const inInput = (r: Reg) => inField && ignoresInputs(r.spec)
  // Escape belongs to the open dialog around focus, except for a hotkey in a
  // named scope (sensible-defaults.md:341, 356). A key the page prevented is
  // skipped with ignoreDefaultPrevented (sensible-defaults.md:263).
  const skips = (r: Reg) => {
    const o = optionsOf(r.spec)
    return (
      (escapeInDialog && o.scope === 'global') ||
      (o.ignoreDefaultPrevented && pagePrevents)
    )
  }
  const matchOf = (r: Reg) => score(CHORDS[r.spec.hotkey], event)
  const onPath = (r: Reg) => r.spec.target === 'document' || inPanel
  const roundOf = (r: Reg): Round['name'] =>
    r.spec.target === 'panel'
      ? 'panel'
      : r.spec.capture
        ? 'capture'
        : 'document'
  for (const r of allRegs) {
    if (!r.alive || matchOf(r) === 0) continue
    involved.add(LAWS.fires)
    // Whether a key counts as prevented by another listener is a skip rule.
    if (optionsOf(r.spec).ignoreDefaultPrevented) involved.add(LAWS.skips)
  }

  // A keyup chord's press ends at the first release of its key or one of its
  // modifiers, and any other key press cancels it (sensible-defaults.md:235,
  // hotkey-manager.ts eventType JSDoc), wherever the manager receives that
  // key. The pressed key is its code; a key without a code is known by what
  // it types. A modifier counts as released while no other key holds it
  // down (tests/hotkey-manager.test.ts:2125).
  const releasesPress = (r: Reg, code: string) =>
    (code !== '' && event.code === code) ||
    matchOf(r) > 0 ||
    modifiersOf(CHORDS[r.spec.hotkey]).some(
      (m) => m === event.key && !stillHeld(m, event),
    )
  // Releasing the key or any of its modifiers re-arms requireReset
  // (sensible-defaults.md:233): the code that latched it, a key that types
  // the chord's key, or a Shift or Control key the chord names.
  const releasesLatch = (r: Reg, code: string) => {
    const chord = CHORDS[r.spec.hotkey]
    const sameKey =
      chord.code !== undefined
        ? event.code === chord.code
        : event.key.toUpperCase() === chord.key
    return (
      (code !== '' && event.code === code) ||
      sameKey ||
      modifiersOf(chord).includes(event.key)
    )
  }
  const ended = new Map<number, { code: string; score: number }>()
  const cancelled: Array<Reg> = []
  for (const r of allRegs) {
    if (!r.alive) continue
    if (keydown && !event.repeat && r.pending) {
      r.pending = null
      cancelled.push(r)
      involved.add(LAWS.keyup)
      states.add('keyup press cancelled by another key')
    }
    if (!keydown) {
      if (r.pending && releasesPress(r, r.pending.code)) {
        ended.set(r.slot, r.pending)
        r.pending = null
        involved.add(LAWS.keyup)
      }
      if (r.latchUser !== null && releasesLatch(r, r.latchUser))
        r.latchUser = null
    }
    if (r.latch !== null) involved.add(LAWS.requireReset)
  }

  const rounds: Array<Round> = [
    { name: 'capture', onPath: true },
    { name: 'panel', onPath: inPanel },
    { name: 'document', onPath: true },
  ]
  let stopped = false
  let prevented = pagePrevents
  const fired: Array<Fired> = []
  const received: Array<Reg> = []
  const pressHandlers: Array<Reg> = []
  let reservation: boolean | 'either' = false
  const reserves: Array<boolean> = []
  let notifications = 0
  let clearedRounds = 0
  const receivedRounds = new Set<Round['name']>()

  for (const round of rounds) {
    // Registrations a callback unregistered earlier in this event are gone.
    const roundRegs = allRegs.filter(
      (r) => r.alive && roundOf(r) === round.name,
    )
    // The page's handler on body runs after the panel and before the document
    // (sensible-defaults.md:249).
    if (round.name === 'document' && event.page === 'stop' && !stopped) {
      stopped = true
      if (roundRegs.some((r) => live(r) && matchOf(r) > 0))
        states.add('stopped by the page')
    }
    if (!round.onPath) {
      for (const r of roundRegs) reasons[r.slot] = LAWS.fires
      continue
    }
    if (stopped) {
      for (const r of roundRegs) reasons[r.slot] = LAWS.prevent
      if (roundRegs.some((r) => matchOf(r) > 0 || r.latch !== null))
        involved.add(LAWS.prevent)
      continue
    }
    receivedRounds.add(round.name)
    let reserved = false
    let cleared = false
    const candidates: Array<{ reg: Reg; score: number }> = []
    for (const r of roundRegs) {
      const o = optionsOf(r.spec)
      const m = matchOf(r)
      // Releases re-arm requireReset whatever else holds (sensible-defaults.md:233;
      // tests/hotkey-manager.test.ts:2420-2453).
      if (!keydown && r.latch !== null && releasesLatch(r, r.latch)) {
        r.latch = null
        cleared = true
        states.add('requireReset re-armed by a release')
      }
      if (o.eventType === 'keyup' && keydown) {
        // A keyup chord sees its keydown: it prevents it and records the press.
        reasons[r.slot] = LAWS.keyup
        if (inInput(r)) {
          reasons[r.slot] = LAWS.skips
          continue
        }
        if (m === 0) continue
        involved.add(LAWS.keyup)
        if (skips(r)) {
          reasons[r.slot] = LAWS.skips
          states.add(
            event.repeat
              ? 'a skipped repeat of a keyup press'
              : 'keyup press skipped',
          )
          if (reading.skippedRepeat === 'ends') r.pending = null
          continue
        }
        if (live(r)) {
          if (o.preventDefault) prevented = true
          else states.add('a keyup chord leaves its press to the browser')
          pressHandlers.push(r)
        } else if (o.preventDefault === 'always') {
          reserved = true
          states.add('keyup chord that cannot fire reserves its press')
        } else states.add('a keyup chord that cannot fire leaves its press')
        r.pending = { code: event.code, score: m }
        continue
      }
      if (o.eventType !== event.type) {
        reasons[r.slot] = o.eventType === 'keyup' ? LAWS.keyup : LAWS.fires
        continue
      }
      if (inInput(r)) {
        reasons[r.slot] = LAWS.skips
        if (m > 0) states.add('skipped in a text field')
        continue
      }
      if (!live(r) && o.preventDefault !== 'always') {
        reasons[r.slot] = LAWS.live
        if (m > 0)
          states.add(
            o.enabled
              ? 'suspended scope does not fire'
              : 'disabled does not fire',
          )
        continue
      }
      let rank: number
      if (!keydown) {
        const press = ended.get(r.slot)
        if (!press) {
          reasons[r.slot] = LAWS.keyup
          continue
        }
        if (skips(r)) {
          reasons[r.slot] = LAWS.skips
          continue
        }
        rank = m || press.score
      } else {
        if (m === 0) {
          reasons[r.slot] = LAWS.fires
          continue
        }
        if (skips(r)) {
          reasons[r.slot] = LAWS.skips
          states.add(
            escapeInDialog && !o.ignoreDefaultPrevented
              ? 'Escape yields to an open dialog'
              : 'skips a key the page prevented',
          )
          continue
        }
        rank = m
      }
      if (!live(r)) {
        reasons[r.slot] = LAWS.prevent
        involved.add(LAWS.prevent)
        reserved = true
        continue
      }
      candidates.push({ reg: r, score: rank })
      if (inField) states.add('fires in a text field')
      if (escapeInDialog) states.add('named scope keeps Escape')
      if (pagePrevents) states.add('fires on a key the page prevented')
      if (o.ignoreDefaultPrevented && prevented && !pagePrevents)
        states.add("a hotkey's own prevention does not skip")
    }
    if (cleared) clearedRounds++

    const winners = pick(candidates, scopes.rank, reading.precedence)
    const other = pick(
      candidates,
      scopes.rank,
      reading.precedence === 'score first' ? 'scope first' : 'score first',
    )
    if (candidates.length > 1) involved.add(LAWS.precedence)
    if (
      winners.length !== other.length ||
      winners.some((w, i) => w !== other[i])
    )
      states.add('score and scope disagree')
    if (new Set(candidates.map((c) => c.score)).size > 1)
      states.add('exact beats fallback')
    const best = candidates.filter((c) =>
      winners.some((w) => w.score === c.score),
    )
    if (
      new Set(best.map((c) => scopes.rank(optionsOf(c.reg.spec).scope))).size >
      1
    )
      states.add('newer scope wins')

    let stopsHere = false
    for (const c of candidates) {
      const r = c.reg
      const o = optionsOf(r.spec)
      if (!winners.includes(c)) {
        reasons[r.slot] = LAWS.precedence
        continue
      }
      // An earlier callback in this event unregistered it.
      if (!r.alive) {
        reasons[r.slot] = LAWS.registration
        states.add('unregistered by an earlier callback')
        continue
      }
      // Both apply when a hotkey matches, even while requireReset holds it
      // (sensible-defaults.md:192; tests/hotkey-manager.test.ts:430-482).
      if (o.preventDefault) prevented = true
      if (o.stopPropagation) stopsHere = true
      if (!keydown) {
        reasons[r.slot] = LAWS.keyup
        fire(r)
        const press = ended.get(r.slot)!
        states.add(
          event.code === press.code
            ? 'keyup chord fires on its key release'
            : 'keyup chord fires on a modifier release',
        )
        continue
      }
      if (!o.requireReset || r.latch === null || !event.repeat) {
        reasons[r.slot] = o.requireReset ? LAWS.requireReset : LAWS.fires
        if (o.requireReset) {
          if (r.latch !== null) states.add('requireReset fires on a new press')
          r.latch = event.code
          r.latchUser = event.code
        } else if (event.repeat) states.add('repeat fires again')
        fire(r)
      } else {
        reasons[r.slot] = LAWS.requireReset
        states.add('requireReset holds a repeat')
      }
    }
    received.push(...winners.map((c) => c.reg))
    if (reserved && candidates.length === 0) {
      // An 'always' chord that can't fire prevents the key unless another
      // hotkey handles it (sensible-defaults.md:200-206). Read as "a hotkey
      // that received the key and fired or held it" (decided once every
      // round ran), "that, or a live keyup chord whose press this is", or "a
      // live hotkey on the event's path for this event type that matches it":
      // where they disagree, either is allowed.
      const onPathHandler = allRegs.some(
        (r) =>
          r.alive &&
          live(r) &&
          optionsOf(r.spec).eventType === event.type &&
          onPath(r) &&
          !skips(r) &&
          !inInput(r) &&
          matchOf(r) > 0,
      )
      reserves.push(!onPathHandler)
    } else if (reserved) states.add('always defers to a live hotkey')
    if (stopsHere) {
      stopped = true
      if (round.name !== 'document') {
        const later = rounds.slice(rounds.indexOf(round) + 1)
        if (
          later.some(
            (l) =>
              l.onPath &&
              allRegs.some(
                (r) =>
                  r.alive && roundOf(r) === l.name && live(r) && matchOf(r) > 0,
              ),
          )
        )
          states.add('a hotkey stops a later hotkey')
      }
    }
  }
  if (reserves.length > 0) {
    const values = [
      ...reserves,
      received.length === 0,
      received.length === 0 && (!keydown || pressHandlers.length === 0),
    ]
    reservation = values.every(Boolean)
      ? true
      : values.some(Boolean)
        ? 'either'
        : false
    states.add(
      reservation === true
        ? 'disabled always prevents'
        : reservation === false
          ? 'always defers to a live hotkey'
          : 'always is open',
    )
  }

  if (cancelled.some((r) => !receivedRounds.has(roundOf(r))))
    states.add('keyup press cancelled by a key its target did not receive')
  if (
    [...ended.keys()].some(
      (slot) =>
        !receivedRounds.has(roundOf(allRegs.find((r) => r.slot === slot)!)),
    )
  )
    states.add('keyup press ended by a release its target did not receive')
  if (allRegs.some((r) => !r.alive && matchOf(r) > 0))
    states.add('unregistered does not fire')
  states.add('key event')
  if (
    receivedRounds.has('panel') &&
    new Set(fired.map((f) => roundOf(allRegs.find((r) => r.slot === f.slot)!)))
      .size > 1
  )
    states.add('both targets fire')
  // The same key with other modifiers, such as Shift+K for `K`, matches nothing.
  if (
    keydown &&
    allRegs.some(
      (r) =>
        r.alive &&
        live(r) &&
        CHORDS[r.spec.hotkey].key === event.key.toUpperCase() &&
        matchOf(r) === 0,
    )
  )
    states.add('modifiers must match')
  if (
    !keydown &&
    allRegs.some(
      (r) => r.alive && r.latch !== null && optionsOf(r.spec).requireReset,
    )
  )
    states.add('requireReset holds through a release of another key')
  if (
    keydown &&
    !event.repeat &&
    allRegs.some((r) => r.latch !== null && r.latchUser === null)
  )
    states.add('latch after an unreceived release')
  if (
    event.code === '' &&
    !keydown &&
    allRegs.some((r) => r.alive && r.pending !== null)
  )
    states.add('a key without a code is released')
  if (!keydown && event.code === 'ControlLeft' && event.ctrl)
    states.add('one of two Control keys is released')

  return {
    kind: 'key',
    fired,
    prevented: prevented ? true : reservation,
    reachedWindow: !stopped,
    notifications: {
      min: notifications + (clearedRounds > 0 ? 1 : 0),
      max: notifications + clearedRounds,
    },
    regs: allRegs
      .filter((r) => r.alive)
      .map((r) => {
        const o = optionsOf(r.spec)
        // hasFired is the requireReset latch; for other chords, and for keyup
        // chords, nothing settles it.
        const hasFired: boolean | 'either' =
          !o.requireReset ||
          o.eventType === 'keyup' ||
          (r.latch === null) !== (r.latchUser === null)
            ? 'either'
            : r.latch !== null
        return {
          slot: r.slot,
          triggerCount: r.count,
          hasFired,
          status: statusOf(r.spec, scopes.live),
        }
      }),
    reasons,
    involved: [...involved],
    errors: 0,
  }

  function fire(r: Reg) {
    r.count++
    // Firing publishes the new count (docs/framework/react/guides/hotkey-manager.md:77).
    notifications++
    fired.push({
      slot: r.slot,
      hotkey: r.spec.hotkey,
      kind: 'chord',
      event: true,
    })
    if (r.spec.prevents) {
      // A callback's own preventDefault is the hotkey's (sensible-defaults.md:263).
      prevented = true
      states.add('a callback prevents the key')
    }
    if (r.spec.unregisters) {
      // The callback unregisters the registration made right after it.
      const next = allRegs.find((other) => other.slot === r.slot + 1)
      if (next?.alive) {
        next.alive = false
        next.pending = null
        notifications++
        involved.add(LAWS.registration)
      }
    }
  }
}

/**
 * The winners among a round's candidates: the best match, then the newest
 * scope ('score first'), or the newest scope, then the best match ('scope
 * first'). The guide states both rules (sensible-defaults.md:56,
 * hotkeys-provider-and-scopes.md:117-122) and not their order.
 */
function pick<T extends { reg: Reg; score: number }>(
  candidates: Array<T>,
  rank: (scope: string) => number,
  reading: Precedence,
): Array<T> {
  if (candidates.length === 0) return []
  const rankOf = (c: T) => rank(optionsOf(c.reg.spec).scope)
  if (reading === 'score first') {
    const best = Math.max(...candidates.map((c) => c.score))
    const top = Math.max(
      ...candidates.filter((c) => c.score === best).map(rankOf),
    )
    return candidates.filter((c) => c.score === best && rankOf(c) === top)
  }
  const top = Math.max(...candidates.map(rankOf))
  const best = Math.max(
    ...candidates.filter((c) => rankOf(c) === top).map((c) => c.score),
  )
  return candidates.filter((c) => rankOf(c) === top && c.score === best)
}

function model(plan: Plan): Expected {
  const states = new Set<string>()
  const readings = READINGS.map((reading) => walk(plan, reading, states))
  return { readings, states: [...states] }
}

// ---------------------------------------------------------------------------
// The driver
// ---------------------------------------------------------------------------

interface Did {
  kind: 'key' | 'register' | 'other' | 'setup' | 'reset'
  fired?: Array<Fired>
  prevented?: boolean
  reachedWindow?: boolean
  notifications?: number
  regs?: Array<{
    slot: number
    triggerCount: number | null
    hasFired: boolean | null
    status: string | null
  }>
  statuses?: Array<{ slot: number; status: string }>
  warned?: number
  active?: boolean
  errors: number
  threw: string | null
}

/** The registration options a spec passes, leaving out what it leaves at the default. */
function registerOptions(spec: Spec, panel: HTMLElement) {
  const options: Record<string, unknown> = { platform: 'linux' }
  if (spec.target === 'panel') options.target = panel
  if (spec.capture) options.capture = true
  for (const key of [
    'eventType',
    'enabled',
    'preventDefault',
    'stopPropagation',
    'requireReset',
    'ignoreInputs',
    'ignoreDefaultPrevented',
    'scope',
  ] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  if (spec.conflict !== undefined) options.conflictBehavior = spec.conflict
  return options
}

/**
 * Builds the page, runs each step through the real singleton manager, and
 * records what a user of the library sees. The page's own listeners are
 * added before any hotkey: a document capture listener that prevents the
 * events the plan marks, a `body` listener that stops the ones it marks, and
 * a `window` listener that records whether the event got there. A subscriber
 * counts the registrations store's notifications.
 */
function driver(
  plan: Plan,
  observe: (checkpoint: string, value: unknown) => void,
): void {
  document.body.innerHTML = ''
  const panel = document.createElement('div')
  panel.tabIndex = 0
  const input = document.createElement('input')
  input.type = 'text'
  panel.appendChild(input)
  const dialog = document.createElement('div')
  dialog.setAttribute('role', 'dialog')
  const inner = document.createElement('div')
  inner.tabIndex = 0
  dialog.appendChild(inner)
  document.body.append(panel, dialog)
  const places: Record<Focus, HTMLElement> = {
    body: document.body,
    panel,
    input,
    inner,
  }

  let page: Page = 'none'
  let reachedWindow = false
  const onCapture = (event: Event) => {
    if (page === 'prevent') event.preventDefault()
  }
  const onBody = (event: Event) => {
    if (page === 'stop') event.stopPropagation()
  }
  const onWindow = () => {
    reachedWindow = true
  }
  let windowErrors = 0
  const onError = () => {
    windowErrors++
  }
  for (const type of ['keydown', 'keyup']) {
    document.addEventListener(type, onCapture, true)
    document.body.addEventListener(type, onBody)
    window.addEventListener(type, onWindow)
  }
  window.addEventListener('error', onError)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const errors = () => error.mock.calls.length + windowErrors

  HotkeyManager.resetInstance()
  const manager = HotkeyManager.getInstance()
  let notifications = 0
  const subscription = manager.registrations.subscribe(() => {
    notifications++
  })
  const handles = new Map<number, HotkeyRegistrationHandle>()
  const releases = new Map<number, () => void>()
  let current: { event: KeyboardEvent; fired: Array<Fired> } | null = null

  try {
    try {
      // The manager receives every key press through this capture listener.
      manager.register('F12', () => {}, { platform: 'linux', capture: true })
      observe('setup', {
        kind: 'setup',
        errors: errors(),
        threw: null,
      } satisfies Did)
    } catch (thrown) {
      observe('setup', {
        kind: 'setup',
        errors: errors(),
        threw: String(thrown),
      } satisfies Did)
      return
    }
    plan.steps.forEach((step, index) => {
      const checkpoint = `step ${index}`
      const errorsBefore = errors()
      const warnsBefore = warn.mock.calls.length
      try {
        switch (step.kind) {
          case 'register': {
            const slot = step.slot
            const handle = manager.register(
              step.spec.hotkey,
              (event, context) => {
                current?.fired.push({
                  slot,
                  hotkey: context.hotkey,
                  kind: context.kind,
                  event: event === current.event,
                })
                if (step.spec.prevents) event.preventDefault()
                if (step.spec.unregisters) handles.get(slot + 1)?.unregister()
              },
              registerOptions(step.spec, panel),
            )
            handles.set(slot, handle)
            observe(checkpoint, {
              kind: 'register',
              warned: warn.mock.calls.length - warnsBefore,
              active: handle.isActive,
              errors: errors() - errorsBefore,
              threw: null,
            } satisfies Did)
            return
          }
          case 'unregister':
            handles.get(step.slot)!.unregister()
            break
          case 'set':
            handles.get(step.slot)!.setOptions({ [step.field]: step.value })
            break
          case 'activate':
            releases.set(
              step.handle,
              manager.activateScope(
                step.scope,
                step.exclusive === 'no'
                  ? {}
                  : {
                      exclusive:
                        step.exclusive === 'yes' ? true : { allow: ['global'] },
                    },
              ),
            )
            break
          case 'release':
            releases.get(step.handle)!()
            break
          case 'focus':
            if (step.where === 'body')
              (document.activeElement as HTMLElement | null)?.blur()
            else places[step.where].focus()
            break
          case 'drop':
            break
          case 'key': {
            const target =
              step.focus === 'body' ? document.body : places[step.focus]
            const event = new KeyboardEvent(step.type, {
              key: step.key,
              code: step.code,
              shiftKey: step.shift,
              ctrlKey: step.ctrl,
              repeat: step.repeat,
              bubbles: true,
              cancelable: true,
              composed: true,
            })
            page = step.page
            reachedWindow = false
            notifications = 0
            current = { event, fired: [] }
            target.dispatchEvent(event)
            const fired = current.fired
            current = null
            page = 'none'
            observe(checkpoint, {
              kind: 'key',
              fired,
              prevented: event.defaultPrevented,
              reachedWindow,
              notifications,
              regs: [...handles]
                .filter(([, h]) => h.isActive)
                .map(([slot, h]) => {
                  const reg = manager.registrations.state.get(h.id)
                  return {
                    slot,
                    triggerCount: reg?.triggerCount ?? null,
                    hasFired: reg?.hasFired ?? null,
                    status: reg ? toHotkeyRegistrationView(reg).status : null,
                  }
                }),
              errors: errors() - errorsBefore,
              threw: null,
            } satisfies Did)
            return
          }
        }
        observe(checkpoint, {
          kind: 'other',
          errors: errors() - errorsBefore,
          threw: null,
        } satisfies Did)
      } catch (thrown) {
        observe(checkpoint, {
          kind:
            step.kind === 'key'
              ? 'key'
              : step.kind === 'register'
                ? 'register'
                : 'other',
          errors: errors() - errorsBefore,
          threw: String(thrown),
        } satisfies Did)
      }
    })
    // With no manager, a view reports only whether the registration is enabled.
    const kept = [...handles]
      .filter(([, h]) => h.isActive)
      .map(
        ([slot, h]) => [slot, manager.registrations.state.get(h.id)!] as const,
      )
    subscription.unsubscribe()
    HotkeyManager.resetInstance()
    try {
      observe('after reset', {
        kind: 'reset',
        statuses: kept.map(([slot, reg]) => ({
          slot,
          status: toHotkeyRegistrationView(reg).status,
        })),
        errors: 0,
        threw: null,
      } satisfies Did)
    } catch (thrown) {
      observe('after reset', {
        kind: 'reset',
        errors: 0,
        threw: String(thrown),
      } satisfies Did)
    }
  } finally {
    subscription.unsubscribe()
    for (const type of ['keydown', 'keyup']) {
      document.removeEventListener(type, onCapture, true)
      document.body.removeEventListener(type, onBody)
      window.removeEventListener(type, onWindow)
    }
    window.removeEventListener('error', onError)
    warn.mockRestore()
    error.mockRestore()
    HotkeyManager.resetInstance()
    ;(document.activeElement as HTMLElement | null)?.blur()
    document.body.innerHTML = ''
  }
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

interface Divergence {
  at: number
  checkpoint: string
  /** The law of the rule that decided the step, then every law involved in it. */
  laws: Array<Law>
  actual: unknown
  expected: unknown
}

/** The first step where the trace leaves one reading's owed steps, and the laws of the rules that decided it. */
function firstDivergence(
  plan: Plan,
  trace: ReadonlyArray<Observation>,
  owed: OwedReading,
): Divergence | undefined {
  const byCheckpoint = new Map(trace.map((o) => [o.checkpoint, o.value as Did]))
  const setup = byCheckpoint.get('setup')
  if (setup === undefined || setup.threw !== null || setup.errors !== 0)
    return {
      at: -1,
      checkpoint: 'setup',
      laws: [LAWS.noThrow],
      actual: setup,
      expected: { errors: 0, threw: null },
    }
  for (const [index, want] of owed.steps.entries()) {
    const checkpoint = `step ${index}`
    const did = byCheckpoint.get(checkpoint)
    const involved = want.kind === 'key' ? want.involved : []
    const at = (law: Law, actual: unknown, expected: unknown): Divergence => ({
      at: index,
      checkpoint,
      laws: [law, ...involved],
      actual,
      expected,
    })
    if (did === undefined || did.threw !== null || did.errors !== 0)
      return at(LAWS.noThrow, did, {
        step: plan.steps[index],
        errors: 0,
        threw: null,
      })
    if (want.kind === 'register') {
      if (did.warned !== want.warned || did.active !== true)
        return at(
          LAWS.registration,
          { warned: did.warned, active: did.active },
          { warned: want.warned, active: true },
        )
      continue
    }
    if (want.kind !== 'key') continue
    const step = plan.steps[index]
    const fired = did.fired ?? []
    if (!sameFired(fired, want.fired)) {
      const slot = firstDifferentSlot(fired, want.fired)
      const law =
        slot === undefined ? LAWS.fires : (want.reasons[slot] ?? LAWS.fires)
      return at(law, { step, fired }, { step, fired: want.fired })
    }
    if (want.prevented !== 'either' && did.prevented !== want.prevented)
      return at(
        LAWS.prevent,
        { step, prevented: did.prevented },
        { prevented: want.prevented },
      )
    if (did.reachedWindow !== want.reachedWindow)
      return at(
        LAWS.prevent,
        { step, reachedWindow: did.reachedWindow },
        { reachedWindow: want.reachedWindow },
      )
    const regs = did.regs ?? []
    if (
      regs.length !== want.regs.length ||
      regs.some((r, i) => r.slot !== want.regs[i]!.slot)
    )
      return at(LAWS.registration, regs, want.regs)
    for (const [i, r] of regs.entries()) {
      const w = want.regs[i]!
      if (r.triggerCount !== w.triggerCount) return at(LAWS.registration, r, w)
      if (w.hasFired !== 'either' && r.hasFired !== w.hasFired)
        return at(LAWS.requireReset, r, w)
      if (r.status !== w.status) return at(LAWS.live, r, w)
    }
    const n = did.notifications ?? -1
    if (n < want.notifications.min || n > want.notifications.max)
      return at(
        LAWS.registration,
        { step, notifications: n },
        { notifications: want.notifications },
      )
  }
  const reset = byCheckpoint.get('after reset')
  if (reset === undefined || reset.threw !== null)
    return {
      at: owed.steps.length,
      checkpoint: 'after reset',
      laws: [LAWS.noThrow],
      actual: reset,
      expected: owed.afterReset,
    }
  if (JSON.stringify(reset.statuses) !== JSON.stringify(owed.afterReset))
    return {
      at: owed.steps.length,
      checkpoint: 'after reset',
      laws: [LAWS.live],
      actual: reset.statuses,
      expected: owed.afterReset,
    }
  return undefined
}

function sameFired(a: ReadonlyArray<Fired>, b: ReadonlyArray<Fired>): boolean {
  return (
    a.length === b.length &&
    a.every(
      (f, i) =>
        f.slot === b[i]!.slot &&
        f.hotkey === b[i]!.hotkey &&
        f.kind === b[i]!.kind &&
        f.event === b[i]!.event,
    )
  )
}

/** The first slot, in registration order, that ran a different number of times than owed. */
function firstDifferentSlot(
  a: ReadonlyArray<Fired>,
  b: ReadonlyArray<Fired>,
): number | undefined {
  const count = (list: ReadonlyArray<Fired>, slot: number) =>
    list.filter((f) => f.slot === slot).length
  const slots = [...new Set([...a, ...b].map((f) => f.slot))].sort(
    (x, y) => x - y,
  )
  return slots.find((slot) => count(a, slot) !== count(b, slot))
}

/**
 * Production passes when its trace follows some reading to the end.
 * Otherwise the reading it followed longest decides where it went wrong. The
 * step breaks the law of the rule that decided it, and every law whose rules
 * decided something in that step: a property fails when its law is one of
 * them.
 */
function checkLaw(law: Law) {
  return (
    plan: Plan,
    trace: ReadonlyArray<Observation>,
    expected: Expected,
  ): Verdict => {
    let worst: Divergence | undefined
    for (const reading of expected.readings) {
      const divergence = firstDivergence(plan, trace, reading)
      if (divergence === undefined) return pass
      if (worst === undefined || divergence.at > worst.at) worst = divergence
    }
    if (worst === undefined || !worst.laws.includes(law)) return pass
    return violation(
      worst.checkpoint,
      `${worst.checkpoint} breaks '${law}': the manager did something no reading of the law allows`,
      law,
      { actual: worst.actual, expected: worst.expected },
    )
  }
}

// ---------------------------------------------------------------------------
// Constructed histories: each enters the states its law needs, on any base
// ---------------------------------------------------------------------------

const spec = (hotkey: HotkeyName, options: Partial<Spec> = {}): Spec => ({
  hotkey,
  target: 'document',
  capture: false,
  eventType: undefined,
  enabled: undefined,
  preventDefault: undefined,
  stopPropagation: undefined,
  requireReset: undefined,
  ignoreInputs: undefined,
  ignoreDefaultPrevented: undefined,
  scope: undefined,
  conflict: undefined,
  prevents: false,
  unregisters: false,
  ...options,
})
const register = (
  hotkey: HotkeyName,
  options: Partial<Spec> = {},
): HistoryAction => ({ kind: 'register', spec: spec(hotkey, options) })
const down = (
  key: Physical,
  layout: Layout = 'us',
  page: Page = 'none',
): HistoryAction => ({ kind: 'down', key, layout, page })
const up = (key: Physical, page: Page = 'none'): HistoryAction => ({
  kind: 'up',
  key,
  page,
})
const focus = (where: Focus): HistoryAction => ({ kind: 'focus', where })
const activate = (
  scope: NamedScope,
  exclusive: Exclusive = 'no',
): HistoryAction => ({ kind: 'activate', scope, exclusive })
const drop = (key: Physical): HistoryAction => ({ kind: 'drop', key })
const unregister = (n: number): HistoryAction => ({ kind: 'unregister', n })
const set = (n: number, field: SetField, value: number): HistoryAction => ({
  kind: 'set',
  n,
  field,
  value,
})

/** A fresh manager, then these actions, then the base's own actions. */
const opening =
  (actions: Array<HistoryAction>) =>
  (base: History): History => ({
    actions: [...actions, ...base.actions].slice(0, MAX_ACTIONS),
  })

const CONSTRUCTED: Array<{
  name: string
  enters: Array<string>
  actions: Array<HistoryAction>
}> = [
  // fires on a match
  {
    name: 'repeat fires again',
    enters: ['repeat fires again'],
    actions: [register('K'), down('KeyK'), down('KeyK')],
  },
  {
    name: 'both targets fire',
    enters: ['both targets fire'],
    actions: [
      register('K', { target: 'panel', stopPropagation: false }),
      register('K'),
      focus('panel'),
      down('KeyK'),
    ],
  },
  {
    name: 'modifiers must match',
    enters: ['modifiers must match'],
    actions: [register('K'), down('ShiftLeft'), down('KeyK')],
  },
  // precedence
  {
    name: 'exact beats fallback',
    enters: ['exact beats fallback'],
    actions: [register('K'), register('[KeyK]'), down('KeyK', 'ru')],
  },
  {
    name: 'newer scope wins',
    enters: ['newer scope wins'],
    actions: [
      register('K'),
      register('K', { scope: 'a' }),
      activate('a'),
      down('KeyK'),
    ],
  },
  // enabled and scopes
  {
    name: 'disabled does not fire',
    enters: ['disabled does not fire'],
    actions: [register('K', { enabled: false }), down('KeyK')],
  },
  {
    name: 'suspended scope does not fire',
    enters: ['suspended scope does not fire'],
    actions: [register('K'), activate('a', 'yes'), down('KeyK')],
  },
  // skips
  {
    name: 'skipped in a text field',
    enters: ['skipped in a text field'],
    actions: [register('K'), focus('input'), down('KeyK')],
  },
  {
    name: 'fires in a text field',
    enters: ['fires in a text field'],
    actions: [
      register('Control+K'),
      focus('input'),
      down('ControlLeft'),
      down('KeyK'),
    ],
  },
  {
    name: 'skips a key the page prevented',
    enters: ['skips a key the page prevented'],
    actions: [
      register('K', { ignoreDefaultPrevented: true }),
      down('KeyK', 'us', 'prevent'),
    ],
  },
  {
    name: 'Escape yields to an open dialog',
    enters: ['Escape yields to an open dialog'],
    actions: [register('Escape'), focus('inner'), down('Escape')],
  },
  {
    name: 'named scope keeps Escape',
    enters: ['named scope keeps Escape'],
    actions: [
      register('Escape', { scope: 'a' }),
      activate('a'),
      focus('inner'),
      down('Escape'),
    ],
  },
  // preventDefault and stopPropagation
  {
    name: 'a hotkey stops a later hotkey',
    enters: ['a hotkey stops a later hotkey'],
    actions: [
      register('K', { target: 'panel' }),
      register('K'),
      focus('panel'),
      down('KeyK'),
    ],
  },
  {
    name: 'stopped by the page',
    enters: ['stopped by the page'],
    actions: [register('K'), down('KeyK', 'us', 'stop')],
  },
  {
    name: 'disabled always prevents',
    enters: ['disabled always prevents'],
    actions: [
      register('K', { enabled: false, preventDefault: 'always' }),
      down('KeyK'),
    ],
  },
  {
    name: 'always defers to a live hotkey',
    enters: ['always defers to a live hotkey'],
    actions: [
      register('K', { enabled: false, preventDefault: 'always' }),
      register('K', { preventDefault: false }),
      down('KeyK'),
    ],
  },
  // requireReset
  {
    name: 'requireReset holds a repeat',
    enters: ['requireReset holds a repeat'],
    actions: [
      register('K', { requireReset: true }),
      down('KeyK'),
      down('KeyK'),
    ],
  },
  {
    name: 'requireReset re-armed by a release',
    enters: ['requireReset re-armed by a release'],
    actions: [
      register('Control+K', { requireReset: true }),
      down('ControlLeft'),
      down('KeyK'),
      up('ControlLeft'),
      down('ControlLeft'),
      down('KeyK'),
    ],
  },
  {
    name: 'requireReset fires on a new press',
    enters: ['requireReset fires on a new press', 'lost keyup'],
    actions: [
      register('K', { requireReset: true }),
      down('KeyK'),
      drop('KeyK'),
      down('KeyK'),
    ],
  },
  // keyup chords
  {
    name: 'keyup chord fires on its key release',
    enters: ['keyup chord fires on its key release'],
    actions: [register('K', { eventType: 'keyup' }), down('KeyK'), up('KeyK')],
  },
  {
    name: 'keyup chord fires on a modifier release',
    enters: ['keyup chord fires on a modifier release'],
    actions: [
      register('Control+K', { eventType: 'keyup' }),
      down('ControlLeft'),
      down('KeyK'),
      up('ControlLeft'),
    ],
  },
  {
    name: 'keyup press cancelled by another key',
    enters: ['keyup press cancelled by another key'],
    actions: [
      register('K', { eventType: 'keyup' }),
      down('KeyK'),
      down('KeyJ'),
      up('KeyK'),
    ],
  },
  {
    name: 'keyup press cancelled by a key another hotkey stopped',
    enters: ['keyup press cancelled by a key its target did not receive'],
    actions: [
      register('K', { eventType: 'keyup' }),
      register('J', { target: 'panel' }),
      focus('panel'),
      down('KeyK'),
      down('KeyJ'),
      up('KeyJ'),
      up('KeyK'),
    ],
  },
  {
    name: 'keyup press cancelled by a key pressed outside its target',
    enters: ['keyup press cancelled by a key its target did not receive'],
    actions: [
      register('K', { eventType: 'keyup', target: 'panel' }),
      focus('panel'),
      down('KeyK'),
      focus('body'),
      down('KeyJ'),
      focus('panel'),
      up('KeyK'),
    ],
  },
  {
    name: 'keyup press ended by a release outside its target',
    enters: ['keyup press ended by a release its target did not receive'],
    actions: [
      register('Control+K', { eventType: 'keyup', target: 'panel' }),
      focus('panel'),
      down('ControlLeft'),
      down('KeyK'),
      focus('body'),
      up('KeyK'),
      focus('panel'),
      up('ControlLeft'),
    ],
  },
  // registration over time
  {
    name: 'duplicate warns',
    enters: ['duplicate warns'],
    actions: [register('K'), register('K'), down('KeyK')],
  },
  {
    name: 'duplicate allowed',
    enters: ['duplicate allowed'],
    actions: [
      register('K'),
      register('K', { conflict: 'allow' }),
      down('KeyK'),
    ],
  },
  {
    name: 'unregistered does not fire',
    enters: ['unregistered does not fire'],
    actions: [register('K'), unregister(0), down('KeyK')],
  },
  {
    name: 'setOptions changes a registration',
    enters: ['setOptions changes a registration'],
    actions: [register('K'), set(0, 'enabled', 1), down('KeyK')],
  },
  // widened for the gaps: the 'always' reservation across listeners
  {
    name: 'always defers to a hotkey on another target',
    enters: ['always defers to a live hotkey'],
    actions: [
      register('K', {
        target: 'panel',
        enabled: false,
        preventDefault: 'always',
      }),
      register('K', { preventDefault: false }),
      focus('panel'),
      down('KeyK'),
    ],
  },
  {
    name: 'always ignores a hotkey off the path',
    enters: ['disabled always prevents'],
    actions: [
      register('K', { enabled: false, preventDefault: 'always' }),
      register('K', { target: 'panel', preventDefault: false }),
      down('KeyK'),
    ],
  },
  {
    name: 'always ignores a hotkey skipped in a text field',
    enters: ['disabled always prevents'],
    actions: [
      register('Control+K', { enabled: false, preventDefault: 'always' }),
      register('Control+K', {
        ignoreInputs: true,
        preventDefault: false,
        conflict: 'allow',
      }),
      focus('input'),
      down('ControlLeft'),
      down('KeyK'),
    ],
  },
  {
    name: 'always ignores a hotkey that yields Escape',
    enters: ['disabled always prevents'],
    actions: [
      register('Escape', { scope: 'a', preventDefault: 'always' }),
      register('Escape', { preventDefault: false }),
      focus('inner'),
      down('Escape'),
    ],
  },
  {
    name: 'keyup chord that cannot fire reserves its press',
    enters: ['keyup chord that cannot fire reserves its press'],
    actions: [
      register('K', {
        eventType: 'keyup',
        enabled: false,
        preventDefault: 'always',
      }),
      down('KeyK'),
      up('KeyK'),
    ],
  },
  {
    name: 'a callback prevents the key',
    enters: ['a callback prevents the key'],
    actions: [
      register('K', { preventDefault: false, prevents: true }),
      down('KeyK'),
    ],
  },
  // whose prevention ignoreDefaultPrevented sees
  {
    name: "a hotkey's own prevention does not skip",
    enters: ["a hotkey's own prevention does not skip"],
    actions: [
      register('K', { target: 'panel', stopPropagation: false }),
      register('K', { ignoreDefaultPrevented: true }),
      focus('panel'),
      down('KeyK'),
    ],
  },
  {
    name: "a callback's prevention does not skip",
    enters: ["a hotkey's own prevention does not skip"],
    actions: [
      register('K', {
        target: 'panel',
        stopPropagation: false,
        preventDefault: false,
        prevents: true,
      }),
      register('K', { ignoreDefaultPrevented: true }),
      focus('panel'),
      down('KeyK'),
    ],
  },
  {
    name: "the page's prevention stays the page's",
    enters: ['skips a key the page prevented'],
    actions: [
      register('K', { capture: true, stopPropagation: false }),
      register('K', { ignoreDefaultPrevented: true }),
      down('KeyK', 'us', 'prevent'),
    ],
  },
  {
    name: 'fires on a key the page prevented',
    enters: ['fires on a key the page prevented'],
    actions: [register('K'), down('KeyK', 'us', 'prevent')],
  },
  // requireReset releases
  {
    name: 'requireReset holds through a release of another key',
    enters: ['requireReset holds through a release of another key'],
    actions: [
      register('K', { requireReset: true }),
      down('KeyK'),
      down('KeyJ'),
      up('KeyJ'),
    ],
  },
  {
    name: 'requireReset re-armed after a fallback press',
    enters: ['requireReset re-armed by a release'],
    actions: [
      register('K', { requireReset: true }),
      down('KeyK', 'ru'),
      up('KeyK'),
    ],
  },
  {
    name: 'requireReset re-armed by a key without a code',
    enters: ['requireReset re-armed by a release'],
    actions: [
      register('K', { requireReset: true }),
      down('VirtualK'),
      up('VirtualK'),
    ],
  },
  {
    name: 'requireReset and one of two Control keys',
    enters: [
      'one of two Control keys is released',
      'requireReset re-armed by a release',
    ],
    actions: [
      register('Control+K', { requireReset: true }),
      down('ControlLeft'),
      down('ControlRight'),
      down('KeyK'),
      up('ControlLeft'),
      down('KeyK'),
    ],
  },
  // keyup presses
  {
    name: 'keyup press survives a repeat',
    enters: ['keyup chord fires on its key release'],
    actions: [
      register('K', { eventType: 'keyup' }),
      down('KeyK'),
      down('KeyK'),
      up('KeyK'),
    ],
  },
  {
    name: "keyup press survives another key's release",
    enters: ['keyup chord fires on its key release'],
    actions: [
      register('K', { eventType: 'keyup' }),
      down('KeyJ'),
      down('KeyK'),
      up('KeyJ'),
      up('KeyK'),
    ],
  },
  {
    name: 'keyup press skipped by the page',
    enters: ['keyup press skipped'],
    actions: [
      register('K', { eventType: 'keyup', ignoreDefaultPrevented: true }),
      down('KeyK', 'us', 'prevent'),
      up('KeyK'),
    ],
  },
  {
    name: 'keyup press skipped by an open dialog',
    enters: ['keyup press skipped'],
    actions: [
      register('Escape', { eventType: 'keyup' }),
      focus('inner'),
      down('Escape'),
      up('Escape'),
    ],
  },
  {
    name: 'keyup chord and one of two Control keys',
    enters: [
      'one of two Control keys is released',
      'keyup chord fires on its key release',
    ],
    actions: [
      register('Control+K', { eventType: 'keyup' }),
      down('ControlLeft'),
      down('ControlRight'),
      down('KeyK'),
      up('ControlLeft'),
      up('KeyK'),
    ],
  },
  {
    name: 'keyup press of keys without a code',
    enters: [
      'a key without a code is released',
      'keyup chord fires on its key release',
    ],
    actions: [
      register('K', { eventType: 'keyup' }),
      down('VirtualJ'),
      down('VirtualK'),
      up('VirtualJ'),
      up('VirtualK'),
    ],
  },
  {
    name: 'a keyup chord leaves its press to the browser',
    enters: ['a keyup chord leaves its press to the browser'],
    actions: [
      register('K', { eventType: 'keyup', preventDefault: false }),
      down('KeyK'),
      up('KeyK'),
    ],
  },
  {
    name: 'a keyup chord that cannot fire leaves its press',
    enters: ['a keyup chord that cannot fire leaves its press'],
    actions: [
      register('K', { eventType: 'keyup', enabled: false }),
      down('KeyK'),
      up('KeyK'),
    ],
  },
  {
    name: 'requireReset on a position holds through a release of another key',
    enters: ['requireReset holds through a release of another key'],
    actions: [
      register('[KeyK]', { requireReset: true }),
      down('KeyK'),
      down('KeyJ'),
      up('KeyJ'),
    ],
  },
  {
    name: 'keyup press survives a repeat outside its target',
    enters: ['keyup chord fires on its key release'],
    actions: [
      register('K', { eventType: 'keyup', target: 'panel' }),
      focus('panel'),
      down('KeyK'),
      focus('body'),
      down('KeyK'),
      focus('panel'),
      up('KeyK'),
    ],
  },
  // precedence when the rules disagree, and registrations a callback removes
  {
    name: 'score and scope disagree',
    enters: ['score and scope disagree'],
    actions: [
      register('[KeyK]'),
      register('K', { scope: 'a' }),
      activate('a'),
      down('KeyK', 'ru'),
    ],
  },
  {
    name: 'unregistered by an earlier callback',
    enters: ['unregistered by an earlier callback'],
    actions: [
      register('K', { unregisters: true }),
      register('K'),
      down('KeyK'),
    ],
  },
  // no throw
  {
    name: 'a key event',
    enters: ['key event'],
    actions: [register('K'), down('KeyK'), up('KeyK')],
  },
]

const STATES: Record<Law, Array<string>> = {
  [LAWS.fires]: [
    'repeat fires again',
    'both targets fire',
    'modifiers must match',
  ],
  [LAWS.precedence]: [
    'exact beats fallback',
    'newer scope wins',
    'score and scope disagree',
  ],
  [LAWS.live]: ['disabled does not fire', 'suspended scope does not fire'],
  [LAWS.skips]: [
    'skipped in a text field',
    'fires in a text field',
    'skips a key the page prevented',
    'fires on a key the page prevented',
    "a hotkey's own prevention does not skip",
    'Escape yields to an open dialog',
    'named scope keeps Escape',
  ],
  [LAWS.prevent]: [
    'a hotkey stops a later hotkey',
    'stopped by the page',
    'disabled always prevents',
    'always defers to a live hotkey',
    'keyup chord that cannot fire reserves its press',
    'a callback prevents the key',
    'a keyup chord leaves its press to the browser',
    'a keyup chord that cannot fire leaves its press',
  ],
  [LAWS.requireReset]: [
    'requireReset holds a repeat',
    'requireReset re-armed by a release',
    'requireReset fires on a new press',
    'requireReset holds through a release of another key',
    'one of two Control keys is released',
  ],
  [LAWS.keyup]: [
    'keyup chord fires on its key release',
    'keyup chord fires on a modifier release',
    'keyup press cancelled by another key',
    'keyup press cancelled by a key its target did not receive',
    'keyup press ended by a release its target did not receive',
    'keyup press skipped',
    'a key without a code is released',
    'one of two Control keys is released',
  ],
  [LAWS.registration]: [
    'duplicate warns',
    'duplicate allowed',
    'unregistered does not fire',
    'setOptions changes a registration',
    'unregistered by an earlier callback',
  ],
  [LAWS.noThrow]: ['key event'],
}
const OTHER_STATES = [
  'a skipped repeat of a keyup press',
  'always is open',
  'lost keyup',
  'latch after an unreceived release',
]
const ALL_STATES = [
  ...new Set([...Object.values(STATES).flat(), ...OTHER_STATES]),
]

/** The generated source of one law's property: its states are declared, the others measured. */
function historiesFor(law: Law) {
  const own = STATES[law]
  return {
    arbitrary: historyArbitrary,
    states: own,
    measured: ALL_STATES.filter((state) => !own.includes(state)),
    runs: 60,
    fixedSeeds: [20261121],
    constructed: CONSTRUCTED.filter((c) =>
      c.enters.some((state) => own.includes(state)),
    ).map((c) => ({
      name: c.name,
      enters: c.enters.filter((state) => own.includes(state)),
      build: opening(c.actions),
    })),
  }
}

/** A wrong answer at the first step this law decides in a history: the check must reject it. */
function wrongAt(law: Law, history: string) {
  return {
    name: `wrong answer under '${law}'`,
    law,
    history: { constructed: history },
    corrupt: (trace: ReadonlyArray<Observation>, plan: Plan) => {
      const owed = model(plan).readings[0]!.steps
      const replace = (index: number, change: (did: Did) => Did) =>
        trace.map((o) =>
          o.checkpoint === `step ${index}`
            ? { ...o, value: change(o.value as Did) }
            : o,
        )
      if (law === LAWS.noThrow)
        return replace(0, (did) => ({ ...did, threw: 'Error: planted' }))
      if (law === LAWS.registration) {
        const index = owed.findIndex((o) => o.kind === 'register')
        return index < 0
          ? undefined
          : replace(index, (did) => ({ ...did, warned: (did.warned ?? 0) + 1 }))
      }
      if (law === LAWS.prevent) {
        const index = owed.findIndex(
          (o) => o.kind === 'key' && o.prevented !== 'either',
        )
        return index < 0
          ? undefined
          : replace(index, (did) => ({ ...did, prevented: !did.prevented }))
      }
      for (const [index, o] of owed.entries()) {
        if (o.kind !== 'key') continue
        const slot = Object.entries(o.reasons).find(
          ([, reason]) => reason === law,
        )?.[0]
        if (slot === undefined) continue
        const s = Number(slot)
        const step = plan.steps.find(
          (p) => p.kind === 'register' && p.slot === s,
        ) as { spec: Spec }
        return replace(index, (did) => {
          const fired = did.fired ?? []
          return {
            ...did,
            fired: fired.some((f) => f.slot === s)
              ? fired.filter((f) => f.slot !== s)
              : [
                  ...fired,
                  {
                    slot: s,
                    hotkey: step.spec.hotkey,
                    kind: 'chord',
                    event: true,
                  },
                ].sort((a, b) => a.slot - b.slot),
          }
        })
      }
      return undefined
    },
  }
}

const shared = {
  resolve,
  model: (plan: Plan) => model(plan),
  reached: (
    _plan: Plan,
    _trace: ReadonlyArray<Observation>,
    expected: Expected,
  ) => expected.states,
  driver,
}

const LIMITS =
  "The match relation of each chord is a table of documented cases; the key-matching oracle owns it. When the best match and the newest scope disagree, and when a chord skips an automatic repeat of a keyup chord's press, production may follow either reading through the whole history. Not generated: sequences, the recorder, Mod and macOS, capture on an element, afterDelegatedHandlers, window and shadow-root targets, nested or doubly activated scopes, conflictBehavior other than the default and 'allow', a layout switch while a key is held, callbacks that change registrations other than unregistering the next one, and setOptions changes of eventType, scope, target, or capture. Every history has a document capture listener, so the manager receives every key press."

// ---------------------------------------------------------------------------
// The laws
// ---------------------------------------------------------------------------

oracleProperty({
  ...shared,
  id: 'manager chords: fires on a match',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      "For every keydown, each live registration (enabled, scope active) whose target the event reaches, whose eventType is 'keydown', that is not skipped, and whose chord matches the event with exactly its modifiers, runs its callback once with the event and a context of kind 'chord' and its hotkey string, unless precedence or requireReset decides otherwise; it runs again on each automatic repeat; registrations run in the order the event reaches their targets (document capture, then an element target, then the document), and in registration order on one target.",
    authority: `docs/guides/sensible-defaults.md:117 ("K does not fire for Shift+K"), 231 ("Holding a key fires the chord again on each automatic repeat"), 241 ("The element receives keyboard events only while it, or something inside it, has focus"), 253 ("With capture: true, the hotkey runs first"); docs/framework/react/guides/hotkeys.md:37-43 (the callback receives the KeyboardEvent and a context; context.hotkey) and :310 ("While focus is inside the element, its hotkeys run before hotkeys on document"); tests/hotkey-manager.test.ts:243-283. ${APPROVAL}`,
    limits: LIMITS,
  },
  histories: historiesFor(LAWS.fires),
  check: checkLaw(LAWS.fires),
  calibrations: [wrongAt(LAWS.fires, 'repeat fires again')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: precedence',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      'For every key event and every listener it reaches, among the registrations there that would fire, only those with the best match run (an exact key or code over a symbol typed with Shift over a position fallback), and among those only the ones in the newest active scope (global ranks lowest); every one of them runs, and registrations on another target are judged on their own.',
    authority: `docs/guides/sensible-defaults.md:56 ("When one key press could match several registrations on the same target, an exact match takes priority over a fallback"); docs/framework/react/guides/hotkeys-provider-and-scopes.md:117-122 ("the scope that activated most recently wins. Every hotkey in the winning scope that matches the key runs") and :152 ("Precedence compares hotkeys on the same target"); src/hotkey-manager.ts scope JSDoc ("When active scopes share a hotkey on the same target, the most recently activated scope handles it"); tests/hotkey-manager.test.ts:541-639 (layout collision precedence). ${APPROVAL}`,
    limits: `When an exact match is in an older scope and a fallback in a newer one, the guides state both rules and not their order; production may apply either order, held through the whole history. ${LIMITS}`,
  },
  histories: historiesFor(LAWS.precedence),
  check: checkLaw(LAWS.precedence),
  calibrations: [wrongAt(LAWS.precedence, 'exact beats fallback')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: enabled and scopes',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      "For every key event, a registration with enabled: false, or whose scope is not active ('global' is always active unless an exclusive scope suspends it; a named scope is active while activated; while an exclusive scope is active only it, and 'global' when it allows it, can fire), does not run; and toHotkeyRegistrationView reports its status as 'disabled' with enabled: false, else 'suspended' while its scope can't fire, else 'active', and without a manager (after resetInstance) only 'disabled' or 'active'.",
    authority: `src/hotkey-manager.ts enabled JSDoc ("when false, the callback does not run") and scope JSDoc; docs/framework/react/guides/hotkeys.md:267 ("While disabled, it ignores key presses"); docs/framework/react/guides/hotkeys-provider-and-scopes.md:186 ("An exclusive scope suspends every other scope while it is active, including 'global'"), 223 ("An allowed scope still has to be active on its own. Only 'global' is always active"), 229 (stacked exclusive scopes); src/hotkey-manager.ts HotkeyRegistrationStatus JSDoc ("'active': enabled, and its scope is active; 'suspended': enabled, but its scope is inactive or suspended by an exclusive scope; 'disabled': registered with enabled: false") and getRegistrationStatus JSDoc ("Without a manager, scopes don't apply"); tests/hotkey-manager.test.ts:273-283, 1926-1945. ${APPROVAL}`,
    limits: LIMITS,
  },
  histories: historiesFor(LAWS.live),
  check: checkLaw(LAWS.live),
  calibrations: [wrongAt(LAWS.live, 'disabled does not fire')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: skips',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      "For every key event, a registration skips it, so it neither runs nor prevents nor stops the event, when focus is in a text field inside its target and it ignores inputs ('auto' ignores them for every chord but Control chords and Escape), when ignoreDefaultPrevented is on and a listener outside the manager prevented the event first, or when the key is Escape on keydown, focus is inside a role=\"dialog\" outside its target, and its scope is 'global'.",
    authority: `docs/guides/sensible-defaults.md:132-139 (the ignoreInputs 'auto' table), 151 ("A hotkey whose target is the input itself always receives that input's events"), 205 ('always' "still skips typing in text fields"), 263 ("hotkeys skip a key that another listener already prevented. A hotkey's own preventDefault doesn't count"), 341 ("While one is open, hotkeys outside it skip Escape. They don't run, call preventDefault(), or stop propagation"), 356 ("any hotkey in a named scope keeps Escape, whatever its target"); tests/hotkey-manager.test.ts:891-1497; tests/default-prevented.test.ts; tests/escape-layers.test.ts. ${APPROVAL}`,
    limits: `Only a text input, a focusable element, and a role="dialog" element are generated; buttons, links, ARIA widgets, native dialogs, and popovers are not. ${LIMITS}`,
  },
  histories: historiesFor(LAWS.skips),
  check: checkLaw(LAWS.skips),
  calibrations: [wrongAt(LAWS.skips, 'skipped in a text field')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: preventDefault and stopPropagation',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      "For every key event, defaultPrevented is true exactly when the page prevented it, a winning registration with preventDefault true or 'always' matched it (whether or not requireReset let it run), a live keyup chord with preventDefault matched its keydown, a callback that ran called preventDefault(), or an 'always' registration that can't fire matched it and no other hotkey handled the key; and the event stops propagating after the first listener where a winning registration has stopPropagation, or where the page stops it, and never because of a registration that can't fire.",
    authority: `docs/guides/sensible-defaults.md:190-192 ("preventDefault and stopPropagation are true by default ... Both apply only when a hotkey matches; every other key press is left alone"), 200-206 (a hotkey that can't fire leaves the key alone; 'always' prevents it, "never stops propagation", and "When another hotkey handles the key, that hotkey's options apply instead"), 235 ("A keyup chord also prevents its keydown"), 249 (a widget that stops propagation keeps the key from the hotkey); docs/framework/react/guides/hotkeys.md:310 ("With the default stopPropagation: true, a document hotkey for the same key doesn't run at all"); tests/hotkey-manager.test.ts:430-482, 640-890, 2009-2040, 2274-2300. ${APPROVAL}`,
    limits: `For an 'always' registration that can't fire, "another hotkey handles the key" has three readings: a live hotkey that received the key, that or a live keyup chord whose press this keydown is, or a live hotkey on the event's path for this event type that matches it; where they disagree, either value of defaultPrevented is accepted. ${LIMITS}`,
  },
  histories: historiesFor(LAWS.prevent),
  check: checkLaw(LAWS.prevent),
  calibrations: [wrongAt(LAWS.prevent, 'disabled always prevents')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: requireReset',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      'For every requireReset chord, an automatic repeat does not run it again after it ran, until its target receives a release of the key that ran it or of one of its modifiers; a new press that is not a repeat always runs it; and hasFired is true from the time it runs until that release.',
    authority: `docs/guides/sensible-defaults.md:233 ("Set requireReset: true to fire once per press. Releasing the key or any of its modifiers allows the chord to fire again. So does a new press that isn't an automatic repeat, so a lost keyup ... never blocks the chord"); src/hotkey-manager.ts hasFired JSDoc ("Whether this registration has fired (and, for requireReset chords, needs a reset)"); tests/hotkey-manager.test.ts:367-539, 1907-1924, 1958-1972, 2420-2453. ${APPROVAL}`,
    limits: `hasFired is checked only for keydown chords while requireReset is on; after a release that the manager received but the registration's own target did not, either value is accepted. ${LIMITS}`,
  },
  histories: historiesFor(LAWS.requireReset),
  check: checkLaw(LAWS.requireReset),
  calibrations: [wrongAt(LAWS.requireReset, 'requireReset holds a repeat')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: keyup chords',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      "For every chord with eventType 'keyup', a press that matched it (on its target, not skipped, and not in a text field it ignores) ends at the first release of the pressed key or of one of its modifiers, and another key press before that cancels it; the chord runs at that release when its target receives the release and it is live and not skipped, and at no other time.",
    authority: `docs/guides/sensible-defaults.md:235 ("A keyup chord fires when the user releases its key or one of its modifiers, whichever comes first, unless another key was pressed in between. It fires only for the release of a press that matched it"); src/hotkey-manager.ts eventType JSDoc (the same rule); tests/hotkey-manager.test.ts:1974-2327. ${APPROVAL}`,
    limits: `A key press that no listener of the manager receives cannot cancel or end a press; every history has a document capture listener. When the chord skips an automatic repeat of the press (the page prevented it, or focus moved into a dialog that owns Escape), the press may end there or keep waiting. A key without a code is known by what it types. ${LIMITS}`,
  },
  histories: historiesFor(LAWS.keyup),
  check: checkLaw(LAWS.keyup),
  calibrations: [wrongAt(LAWS.keyup, 'keyup chord fires on its key release')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: registration over time',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      "For every history of register, unregister, and setOptions calls, a registration takes part in every key event from its register call until its unregister call, with the options of its last setOptions call (undefined restores the default); registering the same hotkey on the same target, in the same scope, for the same event type logs one console warning unless conflictBehavior is 'allow', and both run; a registration that a callback unregisters during an event does not run later in that event; triggerCount counts the times its callback ran; and the registrations store notifies its subscribers once for each callback that runs, once for each unregister, and once for a release that clears requireReset latches.",
    authority: `docs/framework/react/guides/hotkey-manager.md:21-35 (register, setOptions "Merges new options into the registration", unregister "Removes the hotkey"); docs/guides/sensible-defaults.md:457 ("Registering a hotkey that is already registered on the same target logs a console warning in development, and both callbacks run"); docs/framework/react/guides/hotkeys.md:362-367; docs/framework/react/guides/hotkey-manager.md:77 ("The store also updates each time a hotkey fires"); tests/hotkey-manager.test.ts:409-428 ("notifies subscribers once when a release clears the latch"; "A release that clears no latch doesn't notify"); src/hotkey-manager.ts triggerCount JSDoc ("How many times this registration's callback has been triggered") and the setOptions comment ("undefined resets an option to its default"); tests/hotkey-manager.test.ts:30-208, 1573-1665. ${APPROVAL}`,
    limits: `conflictBehavior 'replace' and 'error' are not generated. A release that clears latches in several listeners may notify once or once for each listener. ${LIMITS}`,
  },
  histories: historiesFor(LAWS.registration),
  check: checkLaw(LAWS.registration),
  calibrations: [wrongAt(LAWS.registration, 'duplicate warns')],
})

oracleProperty({
  ...shared,
  id: 'manager chords: no throw',
  owns: [
    'src/hotkey-manager.ts#HotkeyManager.#processChords',
    'src/hotkey-manager.ts#HotkeyManager.#endPresses',
  ],
  law: {
    statement:
      'For every generated history, register, unregister, setOptions, activateScope and its release, and dispatching each key event return without throwing, and nothing reports an error to the console or to window.',
    authority: `The signatures in src/hotkey-manager.ts: register returns a HotkeyRegistrationHandle, activateScope returns a release function, and the listeners return nothing. ${APPROVAL}`,
    limits: LIMITS,
  },
  histories: historiesFor(LAWS.noThrow),
  check: checkLaw(LAWS.noThrow),
  calibrations: [wrongAt(LAWS.noThrow, 'a key event')],
})
