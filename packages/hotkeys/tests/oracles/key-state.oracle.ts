import { differs, oracleProperty, pass, violation } from '@tanstack/oracles'
/**
 * This oracle owns which keys `KeyStateTracker` reports as held, checked after
 * every keyboard, mouse, focus, visibility and context menu event, and after
 * `destroy()` and `resetInstance()`. It owns the tracker's methods in
 * `src/key-state-tracker.ts`.
 *
 * ```ts
 * keydown W, keydown Shift, keyup Shift // → getHeldKeys() is ['W']
 * keydown ф on KeyA, keyup a on KeyA // → getHeldKeys() is []: paired by the physical key
 * mac: keydown Meta, keydown S, keyup Meta // → getHeldKeys() is [], though S's keyup never came
 * window blur, page hidden, native context menu // → held keys cleared (the menu keeps reported modifiers)
 * isKeyHeld('a') // → true while A is held; isKeyHeld('shift') // → false while Shift is held
 * ```
 *
 * Hold W and tap Shift: W stays held. Hold S and release Command on a Mac: S
 * is gone, though no keyup for S arrived. Both are right, because macOS
 * swallows the keyup of a key released while Command is down, and no other
 * modifier or platform does.
 *
 * Three parts decide the answer. The held keys are the physical keys pressed
 * and not yet released, in press order, each named by its normalized
 * `event.key` from its keydown and identified by its `event.code` (by its name
 * when the event has no code). A release is a keyup of that physical key, or a
 * code-less keyup of that name. The lost keyups are the events that stand in
 * for a release the browser never delivers: a window blur or a hidden page
 * clears every held key, a native context menu clears all but the modifiers it
 * reports, releasing Command on macOS clears every non-modifier, and any real
 * keyboard or mouse event releases a modifier whose flag it reports as up.
 *
 * The laws, from `docs/guides/sensible-defaults.md` "Held keys reset when the
 * window loses focus", the React held-key guide, the tracker's JSDoc and
 * comments, and its tests:
 *
 * - held keys: for every history, after each event `getHeldKeys()` and
 *   `store.state.heldKeys` are the normalized names of the held keys, each
 *   once, in press order.
 * - held codes: `store.state.heldCodes` maps exactly those names, each to the
 *   `event.code` of a held key with that name. With Left and Right Shift both
 *   down, either code is right.
 * - key queries: `isKeyHeld(k)` is true when `k` names a held key, with
 *   letters in any case and other names case-sensitive; `isAnyKeyHeld` and
 *   `areAllKeysHeld` are `some` and `every` over it.
 * - publication: each event publishes at most one state, the final one;
 *   exactly one when the held names change; none for a mouse event that
 *   releases nothing, and none after `destroy()`.
 * - lifecycle: `destroy()` empties the tracker and stops it listening;
 *   `resetInstance()` makes `getInstance()` return a new, listening tracker;
 *   `getKeyStateTracker()` is `getInstance()`.
 * - no throw: every event and every query returns.
 * - server rendering: where a document exists without a window, the
 *   tracker reports no held keys and does not throw.
 *
 * A page listener that stops propagation hides nothing from the tracker, so
 * the held keys do not depend on where an event was dispatched or whether the
 * page stopped it. What a caller sees when a law breaks: a key that stays held
 * after its release (a stuck Shift that turns every click into a
 * Shift-click), or a key dropped while it is still down.
 *
 * The histories run on a simulated keyboard: each step presses, releases, or
 * silently loses or gains a physical key (the OS swallowed its event), or
 * sends a mouse, focus, visibility or context menu event, and every event
 * reports the modifiers that are physically down, as browsers do. Key names
 * come from the real layouts in `tests/fixtures/layout-table.json`, on macOS,
 * Windows and Linux, so keyups can report another level's name than their
 * keydown. The model is a pure step function over the held list; it never
 * sees the keyboard, only the events. The driver dispatches each event on the
 * document or an element, with or without a page listener that stops it, and
 * records the state, the published states, and every query.
 *
 * Limits. Page-dispatched keyboard events, events with an empty `key`, and
 * AltGraph are not generated: whether a synthetic keydown marks a key held,
 * and how AltGr is tracked, are not stated. A keydown always reports the
 * name its key had when first pressed, and code-less keydowns use names no
 * coded key in the history has, because neither a repeat that reports a new
 * name nor a coded keyup of a code-less key's name is decided. A page
 * listener that stops a `contextmenu` event hides it from the tracker, so the
 * native menu's lost keyups stay held; the histories never stop one. A
 * page-dispatched window blur or `visibilitychange` is not generated. After
 * `destroy()` without `resetInstance()`, what `getInstance()` returns is not
 * observed, and neither is whether `resetInstance()` stops the old tracker.
 * Whether an event that changes no held name publishes a state is not
 * decided, so zero or one is accepted.
 */
import fc from 'fast-check'
import { vi } from 'vitest'
import { KeyStateTracker, getKeyStateTracker } from '../../src/index'
import { layoutsFor } from '../fixtures/layout-events'
import type { Observation, Verdict } from '@tanstack/oracles'
import type { HotkeyPlatform } from '../../src/index'

const APPROVAL =
  'Proposed by an agent for Kevin Van Cott (KevinVandy) on 2026-11-21, pending his approval; see .tasks/tanstack-oracles/decisions.md'

// ---------------------------------------------------------------------------
// Histories: a simulated keyboard and page.
// ---------------------------------------------------------------------------

/** Fixed physical keys present in every history, then three layout keys. */
const FIXED_SLOTS: ReadonlyArray<{ code: string; key: string }> = [
  { code: 'ShiftLeft', key: 'Shift' },
  { code: 'ShiftRight', key: 'Shift' },
  { code: 'ControlLeft', key: 'Control' },
  { code: 'ControlRight', key: 'Control' },
  { code: 'AltLeft', key: 'Alt' },
  { code: 'MetaLeft', key: 'Meta' },
  { code: 'MetaRight', key: 'Meta' },
  { code: 'Space', key: ' ' },
  { code: 'Escape', key: 'Escape' },
  { code: 'ContextMenu', key: 'ContextMenu' },
]
const SLOT = {
  ShiftLeft: 0,
  ShiftRight: 1,
  ControlLeft: 2,
  AltLeft: 4,
  MetaLeft: 5,
  Space: 7,
  ContextMenu: 9,
  char0: 10,
  char1: 11,
} as const
const CHAR_SLOTS = 3
const SLOT_COUNT = FIXED_SLOTS.length + CHAR_SLOTS
/** Physical modifier flags, by fixed slot. */
const FLAG_SLOTS = {
  ctrlKey: [2, 3],
  altKey: [4],
  shiftKey: [0, 1],
  metaKey: [5, 6],
} as const
/** Names for keys whose events have no `event.code`, such as some virtual keyboards. */
const CODELESS_NAMES = ['Unidentified', 'Process', 'z', 'ö', 'Ж']
const MAX_STEPS = 24

const KINDS = [
  ['press', 8],
  ['release', 7],
  ['lose', 2],
  ['grab', 1],
  ['codelessPress', 1],
  ['codelessRelease', 1],
  ['mousemove', 2],
  ['mousedown', 1],
  ['blur', 1],
  ['focusMove', 1],
  ['hide', 1],
  ['show', 1],
  ['contextmenu', 2],
  ['destroy', 1],
  ['reset', 1],
] as const
type StepKind = (typeof KINDS)[number][0]

interface Step {
  kind: StepKind
  /** The physical key, an index into the history's slots. */
  slot: number
  /** A keyup's reported name, or a code-less event's name, by index. */
  variant: number
  onElement: boolean
  /** A page listener on the target stops the event's propagation. */
  stop: boolean
  /** Real user input, for mouse and context menu events. */
  trusted: boolean
  /** A page listener calls `preventDefault()` on a context menu event. */
  prevented: boolean
}

interface History {
  platform: HotkeyPlatform
  layout: number
  chars: Array<{ code: number; level: number }>
  steps: Array<Step>
  /** Lists for `isAnyKeyHeld` and `areAllKeysHeld`, by query index. */
  lists: Array<Array<number>>
}

const stepArb: fc.Arbitrary<Step> = fc.record({
  kind: fc.oneof(
    ...KINDS.map(([kind, weight]) => ({
      arbitrary: fc.constant(kind),
      weight,
    })),
  ),
  slot: fc.nat(SLOT_COUNT - 1),
  variant: fc.nat(40),
  onElement: fc.boolean(),
  stop: fc.boolean(),
  trusted: fc.boolean(),
  prevented: fc.boolean(),
})

const historyArb: fc.Arbitrary<History> = fc.record({
  platform: fc.constantFrom<HotkeyPlatform>('mac', 'windows', 'linux'),
  layout: fc.nat(60),
  chars: fc.array(fc.record({ code: fc.nat(60), level: fc.nat(1) }), {
    minLength: CHAR_SLOTS,
    maxLength: CHAR_SLOTS,
  }),
  steps: fc.array(stepArb, { maxLength: MAX_STEPS }),
  lists: fc.array(fc.array(fc.nat(60), { maxLength: 3 }), { maxLength: 3 }),
})

// ---------------------------------------------------------------------------
// The plan: concrete events, from the simulated keyboard.
// ---------------------------------------------------------------------------

interface Mods {
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
}
const NO_MODS: Mods = {
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
}

type Action =
  | {
      type: 'keydown' | 'keyup'
      key: string
      code: string
      repeat: boolean
      mods: Mods
      onElement: boolean
      stop: boolean
    }
  | {
      type: 'mousemove' | 'mousedown'
      trusted: boolean
      mods: Mods
      onElement: boolean
      stop: boolean
    }
  | {
      type: 'contextmenu'
      trusted: boolean
      prevented: boolean
      mods: Mods
      onElement: boolean
    }
  | { type: 'visibility'; hidden: boolean; stop: boolean }
  | { type: 'blur' | 'focusMove' | 'destroy' | 'reset' | 'silent' }

interface Plan {
  platform: HotkeyPlatform
  layout: string
  actions: Array<Action>
  queries: Array<string>
  lists: Array<Array<string>>
}

interface Slot {
  code: string
  /** The name every keydown of this key reports. */
  press: string
  /** The names a keyup of this key may report. */
  releases: Array<string>
}

function layoutOf(history: History) {
  const layouts = layoutsFor(history.platform)
  return layouts[history.layout % layouts.length]!
}

/** The layout's keys that type something, in table order. */
function typedCodes(layout: ReturnType<typeof layoutOf>): Array<string> {
  return [...layout.keys.keys()].filter((code) =>
    layout.keys.get(code)!.some((name) => name !== ''),
  )
}

/** The history's physical keys: the fixed ones, then distinct layout keys. */
function slotsOf(history: History): Array<Slot> {
  const layout = layoutOf(history)
  // Keys that type nothing on this layout, such as Backquote on Japanese
  // Linux, send no keyboard events the table can describe.
  const codes = typedCodes(layout)
  const used = new Set<string>()
  const chars = history.chars.map(({ code, level }) => {
    let index = code % codes.length
    while (used.has(codes[index]!)) index = (index + 1) % codes.length
    const chosen = codes[index]!
    used.add(chosen)
    const levels = layout.keys.get(chosen)!.filter((name) => name !== '')
    return {
      code: chosen,
      press: levels[level % levels.length]!,
      releases: levels,
    }
  })
  return [
    ...FIXED_SLOTS.map((slot) => ({
      ...slot,
      releases: [slot.key],
      press: slot.key,
    })),
    ...chars,
  ]
}

function caseVariants(name: string): Array<string> {
  return [name, name.toLowerCase(), name.toUpperCase()]
}

function resolve(history: History): Plan {
  const slots = slotsOf(history)
  const codedNames = new Set(
    slots.flatMap((slot) => slot.releases).map((name) => keyName(name)),
  )
  // Code-less keydowns use names no coded key has (see the limits).
  const codeless = CODELESS_NAMES.map((name) =>
    codedNames.has(keyName(name)) ? 'Unidentified' : name,
  )
  const keyupPool = [
    ...slots.map((slot) => slot.press),
    ...slots.flatMap((slot) => slot.releases),
    ...codeless,
  ]
  const down = new Set<number>()
  const mods = (): Mods => {
    const flag = (list: ReadonlyArray<number>) => list.some((s) => down.has(s))
    return {
      ctrlKey: flag(FLAG_SLOTS.ctrlKey),
      altKey: flag(FLAG_SLOTS.altKey),
      shiftKey: flag(FLAG_SLOTS.shiftKey),
      metaKey: flag(FLAG_SLOTS.metaKey),
    }
  }
  const actions = history.steps.map((step): Action => {
    const slot = slots[step.slot % slots.length]!
    const index = step.slot % slots.length
    const placement = { onElement: step.onElement }
    switch (step.kind) {
      case 'press': {
        const repeat = down.has(index)
        down.add(index)
        return {
          type: 'keydown',
          key: slot.press,
          code: slot.code,
          repeat,
          mods: mods(),
          ...placement,
          stop: step.stop,
        }
      }
      case 'release':
        down.delete(index)
        return {
          type: 'keyup',
          key: slot.releases[step.variant % slot.releases.length]!,
          code: slot.code,
          repeat: false,
          mods: mods(),
          ...placement,
          stop: step.stop,
        }
      case 'lose':
        down.delete(index)
        return { type: 'silent' }
      case 'grab':
        down.add(index)
        return { type: 'silent' }
      case 'codelessPress':
        return {
          type: 'keydown',
          key: codeless[step.variant % codeless.length]!,
          code: '',
          repeat: false,
          mods: mods(),
          ...placement,
          stop: step.stop,
        }
      case 'codelessRelease':
        return {
          type: 'keyup',
          key: keyupPool[step.variant % keyupPool.length]!,
          code: '',
          repeat: false,
          mods: mods(),
          ...placement,
          stop: step.stop,
        }
      case 'mousemove':
      case 'mousedown':
        return {
          type: step.kind,
          trusted: step.trusted,
          // Events that page code dispatches report no modifiers
          mods: step.trusted ? mods() : NO_MODS,
          ...placement,
          stop: step.stop,
        }
      case 'contextmenu':
        return {
          type: 'contextmenu',
          trusted: step.trusted,
          prevented: step.prevented,
          mods: step.trusted ? mods() : NO_MODS,
          ...placement,
        }
      case 'hide':
      case 'show':
        return {
          type: 'visibility',
          hidden: step.kind === 'hide',
          stop: step.stop,
        }
      case 'blur':
      case 'focusMove':
      case 'destroy':
      case 'reset':
        return { type: step.kind }
    }
  })
  const names = [...new Set([...keyupPool, 'Meta'])]
  const queries = [
    ...new Set([
      ...names.flatMap(caseVariants),
      ' ',
      'Space',
      'space',
      'escape',
      'KeyA',
      '',
    ]),
  ]
  return {
    platform: history.platform,
    layout: layoutOf(history).id,
    actions,
    queries,
    lists: history.lists.map((list) =>
      list.map((i) => queries[i % queries.length]!),
    ),
  }
}

// ---------------------------------------------------------------------------
// The model: a pure step function over the held keys.
// ---------------------------------------------------------------------------

/**
 * The documented key-name rule (`normalizeKeyName`'s JSDoc, and the React
 * held-key guide: "letters match in any case"): a single letter is its
 * uppercase when that is one letter, except Turkish `ı` and the long `ſ`,
 * which would merge with I and S; the space character is `Space`; every
 * other name is as written.
 */
function keyName(name: string): string {
  if (name === ' ') return 'Space'
  if (/^\p{L}$/u.test(name) && name !== 'ı' && name !== 'ſ') {
    const upper = name.toUpperCase()
    return [...upper].length === 1 ? upper : name
  }
  return name
}

/** The modifiers each event reports a flag for (sensible-defaults: "Shift, Control, or Alt", and Command). */
const MODIFIER_FLAGS: Record<string, keyof Mods> = {
  Control: 'ctrlKey',
  Alt: 'altKey',
  Shift: 'shiftKey',
  Meta: 'metaKey',
}
const isModifier = (name: string) => name in MODIFIER_FLAGS

/** One held physical key. Model term: production keeps the same pair. */
interface Held {
  name: string
  code: string
}
interface TrackerState {
  held: ReadonlyArray<Held>
  /** False after `destroy()` until `resetInstance()`: the tracker listens to nothing. */
  listening: boolean
}

/** A key's identity: its physical key, or its name when the event has no code. */
const identity = (held: { name: string; code: string }) =>
  held.code === '' ? `name:${held.name}` : `code:${held.code}`

/**
 * Releases each held modifier whose flag a real event reports as up
 * (sensible-defaults: "the next key press, mouse movement, or click releases
 * any modifier it reports as up. Only real user input counts").
 */
function recover(held: ReadonlyArray<Held>, mods: Mods): Array<Held> {
  return held.filter(
    (entry) => !isModifier(entry.name) || mods[MODIFIER_FLAGS[entry.name]!],
  )
}

function step(
  state: TrackerState,
  action: Action,
  platform: HotkeyPlatform,
): TrackerState {
  if (action.type === 'reset') return { held: [], listening: true }
  if (action.type === 'destroy') return { held: [], listening: false }
  if (!state.listening) return state
  const { held } = state
  const keep = (next: ReadonlyArray<Held>) => ({ held: next, listening: true })
  switch (action.type) {
    case 'keydown': {
      // A keydown marks its physical key held; a repeat or a second keydown
      // of a held key changes nothing (sensible-defaults: "marks a key as
      // held on keydown").
      const entry = { name: keyName(action.key), code: action.code }
      const after = recover(held, action.mods)
      return keep(
        after.some((h) => identity(h) === identity(entry))
          ? after
          : [...after, entry],
      )
    }
    case 'keyup': {
      // A keyup releases its physical key, whatever name it reports
      // (test "pairs keyup by code when the logical key changes"); a
      // code-less keyup releases every held key of its name (comment:
      // "Code-less keyup events can only be paired by their logical key").
      const name = keyName(action.key)
      const released = (h: Held) =>
        action.code === '' ? h.name === name : h.code === action.code
      let after = recover(
        held.filter((h) => !released(h)),
        action.mods,
      )
      // sensible-defaults: "Releasing Command on macOS clears any other keys
      // still marked as held"; other modifiers and platforms keep them.
      if (name === 'Meta' && platform === 'mac')
        after = after.filter((h) => isModifier(h.name))
      return keep(after)
    }
    case 'mousemove':
    case 'mousedown':
      return keep(action.trusted ? recover(held, action.mods) : held)
    case 'contextmenu':
      // A native menu clears every held key "except the modifiers the event
      // still reports"; a menu the page shows or dispatches clears nothing
      // (sensible-defaults; changelog for #216).
      return keep(
        action.trusted && !action.prevented
          ? recover(held, action.mods).filter((h) => isModifier(h.name))
          : held,
      )
    case 'blur':
      return keep([])
    case 'visibility':
      return keep(action.hidden ? [] : held)
    case 'focusMove':
    case 'silent':
      return state
  }
}

interface Expected {
  names: Array<string>
  /** For each held name, the codes of the held keys with that name. */
  codes: Record<string, Array<string>>
  queries: Array<boolean>
  any: Array<boolean>
  all: Array<boolean>
  /** The fewest and most states the step may publish. */
  publish: [number, number]
  listening: boolean
}

function namesOf(held: ReadonlyArray<Held>): Array<string> {
  return [...new Set(held.map((h) => h.name))]
}

function expectStep(
  plan: Plan,
  before: TrackerState,
  after: TrackerState,
  action: Action,
): Expected {
  const names = namesOf(after.held)
  const codes: Record<string, Array<string>> = {}
  for (const h of after.held) (codes[h.name] ??= []).push(h.code)
  const isHeld = (query: string) => names.includes(keyName(query))
  const changed = namesOf(before.held).join('\u0000') !== names.join('\u0000')
  const isEvent = action.type !== 'destroy' && action.type !== 'reset'
  // A tracker that stopped listening publishes nothing for an event; a mouse
  // event that releases nothing publishes nothing (tests "publishes mouse
  // recovery once" and "preserves a held modifier across keyboard and mouse
  // events"); a change publishes exactly one final state (test "publishes one
  // final state per keyboard event"). Whether a keyboard event that changes
  // nothing publishes is open, so zero or one is allowed.
  const silent =
    action.type === 'silent' ||
    (isEvent && !before.listening) ||
    ((action.type === 'mousemove' || action.type === 'mousedown') && !changed)
  // A reset's publications go to the old tracker's store, which the driver
  // no longer watches.
  const publish: [number, number] =
    action.type === 'reset'
      ? [0, 1]
      : changed
        ? [1, 1]
        : silent
          ? [0, 0]
          : [0, 1]
  return {
    names,
    codes,
    queries: plan.queries.map(isHeld),
    any: plan.lists.map((list) => list.some(isHeld)),
    all: plan.lists.map((list) => list.every(isHeld)),
    publish,
    listening: after.listening,
  }
}

/** Step 0 is the new tracker, before any event: nothing held, nothing published. */
function model(plan: Plan): Array<Expected> {
  let state: TrackerState = { held: [], listening: true }
  const initial = expectStep(plan, state, state, { type: 'silent' })
  return [
    initial,
    ...plan.actions.map((action) => {
      const next = step(state, action, plan.platform)
      const expected = expectStep(plan, state, next, action)
      state = next
      return expected
    }),
  ]
}

// ---------------------------------------------------------------------------
// Reach: the states the laws need, read from the plan and the model.
// ---------------------------------------------------------------------------

const STATES = {
  pairedByCode: 'keyup released a key that reports another name',
  codelessRelease: 'code-less keyup released coded keys by name',
  sharedName: 'two held keys share a name',
  windowBlur: 'window blur cleared held keys',
  focusMove: 'focus moved inside the page with keys held',
  hidden: 'hidden page cleared held keys',
  shown: 'shown page kept held keys',
  hiddenStopped: 'hidden page cleared keys though the page stopped the event',
  nativeMenu: 'native context menu kept a reported modifier and cleared a key',
  pageMenu: 'page context menu kept held keys',
  syntheticMenu: 'dispatched context menu kept held keys',
  macCommand: 'Command release on macOS cleared a key',
  otherCommand: 'Command release off macOS kept a key',
  modifierTap: 'modifier tap kept a held key',
  keyRecovery: 'keydown released a stale modifier',
  keyupRecovery: 'keyup released a stale modifier',
  menuRecovery: 'native context menu released a stale modifier',
  mouseStopped: 'page stopped a mouse event that released a modifier',
  mouseRecovery: 'mouse event released a stale modifier',
  syntheticMouse: 'dispatched mouse event kept a modifier',
  otherSide: 'other key of a modifier stayed held',
  stopped: 'page stopped a key or mouse event that changed held keys',
  pressedAgain: 'released key pressed again behind a held key',
  notInferred: 'event reported a modifier the tracker never saw pressed',
  strayKeyup: 'keyup of a key not held',
  codelessHeld: 'code-less key held',
  otherCase: 'held letter queried in another case',
  spaceQuery: 'held Space queried as a space character',
  quietMouse: 'mouse event released nothing',
  destroyedHeld: 'destroy with keys held',
  deadEvent: 'keydown after destroy changed nothing',
  resetTracks: 'reset tracker tracked a key',
} as const
type StateName = (typeof STATES)[keyof typeof STATES]
const ALL_STATES = Object.values(STATES) as Array<StateName>

function reachOf(plan: Plan): Set<StateName> {
  const reached = new Set<StateName>()
  const enter = (name: StateName, when: boolean) => when && reached.add(name)
  let state: TrackerState = { held: [], listening: true }
  const everHeld = new Set<string>()
  let resetSeen = false
  for (const action of plan.actions) {
    const next = step(state, action, plan.platform)
    const before = state.held
    const after = next.held
    const gone = before.filter(
      (h) => !after.some((a) => identity(a) === identity(h)),
    )
    const added = after.filter(
      (h) => !before.some((b) => identity(b) === identity(h)),
    )
    const nonModAfter = after.some((h) => !isModifier(h.name))
    const live = state.listening
    switch (action.type) {
      case 'keydown':
        enter(
          STATES.keyRecovery,
          gone.some((h) => isModifier(h.name)),
        )
        enter(STATES.deadEvent, !live)
        enter(STATES.resetTracks, resetSeen && added.length > 0)
        enter(
          STATES.pressedAgain,
          added.some((h) => everHeld.has(identity(h))) && before.length > 0,
        )
        enter(
          STATES.codelessHeld,
          added.some((h) => h.code === ''),
        )
        break
      case 'keyup': {
        const name = keyName(action.key)
        enter(
          STATES.pairedByCode,
          action.code !== '' &&
            gone.some((h) => h.code === action.code && h.name !== name),
        )
        enter(
          STATES.codelessRelease,
          action.code === '' && gone.some((h) => h.code !== ''),
        )
        enter(
          STATES.macCommand,
          live &&
            name === 'Meta' &&
            plan.platform === 'mac' &&
            gone.some((h) => !isModifier(h.name)),
        )
        enter(
          STATES.otherCommand,
          live && name === 'Meta' && plan.platform !== 'mac' && nonModAfter,
        )
        enter(
          STATES.modifierTap,
          live && isModifier(name) && name !== 'Meta' && nonModAfter,
        )
        enter(
          STATES.keyupRecovery,
          gone.some(
            (h) =>
              isModifier(h.name) && h.code !== action.code && h.name !== name,
          ),
        )
        enter(
          STATES.otherSide,
          isModifier(name) &&
            action.code !== '' &&
            after.some((h) => h.name === name && h.code !== action.code),
        )
        enter(
          STATES.strayKeyup,
          live &&
            action.code !== '' &&
            !before.some((h) => h.code === action.code),
        )
        break
      }
      case 'mousemove':
      case 'mousedown':
        enter(STATES.mouseRecovery, gone.length > 0)
        enter(STATES.mouseStopped, action.stop && gone.length > 0)
        enter(
          STATES.syntheticMouse,
          live && !action.trusted && before.some((h) => isModifier(h.name)),
        )
        enter(STATES.quietMouse, live && gone.length === 0)
        break
      case 'contextmenu':
        enter(
          STATES.nativeMenu,
          action.trusted &&
            !action.prevented &&
            gone.some((h) => !isModifier(h.name)) &&
            after.length > 0,
        )
        enter(
          STATES.menuRecovery,
          action.trusted &&
            !action.prevented &&
            gone.some((h) => isModifier(h.name)),
        )
        enter(
          STATES.pageMenu,
          live && action.trusted && action.prevented && before.length > 0,
        )
        enter(
          STATES.syntheticMenu,
          live && !action.trusted && before.length > 0,
        )
        break
      case 'blur':
        enter(STATES.windowBlur, gone.length > 0)
        break
      case 'focusMove':
        enter(STATES.focusMove, live && before.length > 0)
        break
      case 'visibility':
        enter(STATES.hidden, action.hidden && gone.length > 0)
        enter(
          STATES.hiddenStopped,
          action.hidden && action.stop && gone.length > 0,
        )
        enter(STATES.shown, live && !action.hidden && before.length > 0)
        break
      case 'destroy':
        enter(STATES.destroyedHeld, live && before.length > 0)
        break
      case 'reset':
        resetSeen = true
        break
      case 'silent':
        break
    }
    if (
      (action.type === 'keydown' ||
        action.type === 'keyup' ||
        action.type === 'mousemove' ||
        action.type === 'mousedown') &&
      live
    ) {
      enter(
        STATES.stopped,
        action.stop && (gone.length > 0 || added.length > 0),
      )
      const trusted = 'trusted' in action ? action.trusted : true
      enter(
        STATES.notInferred,
        trusted &&
          Object.entries(MODIFIER_FLAGS).some(
            ([name, flag]) =>
              action.mods[flag] &&
              !before.some((h) => h.name === name) &&
              // A modifier's own keydown reports its flag
              !(action.type === 'keydown' && keyName(action.key) === name),
          ),
      )
    }
    enter(STATES.sharedName, after.length > namesOf(after).length)
    for (const h of after) everHeld.add(identity(h))
    if (live) {
      const names = namesOf(after)
      enter(
        STATES.otherCase,
        plan.queries.some(
          (q) =>
            q !== keyName(q) &&
            /^\p{L}$/u.test(q) &&
            names.includes(keyName(q)),
        ),
      )
      enter(
        STATES.spaceQuery,
        names.includes('Space') && plan.queries.includes(' '),
      )
    }
    state = next
  }
  return reached
}

// ---------------------------------------------------------------------------
// Constructed histories: each reaches its states on every base.
// ---------------------------------------------------------------------------

function s(kind: StepKind, slot = 0, extra: Partial<Step> = {}): Step {
  return {
    kind,
    slot,
    variant: 0,
    onElement: false,
    stop: false,
    trusted: true,
    prevented: false,
    ...extra,
  }
}

/** Keeps the base's layout and keys, and replaces its steps with `steps`. */
function script(
  steps: Array<Step>,
  platform?: (base: HotkeyPlatform) => HotkeyPlatform,
): (base: History) => History {
  return (base) => {
    // Take each step's placement from the base, so the scripts run on the
    // document and on elements.
    const placed = steps.map((st, i) => ({
      ...st,
      onElement: base.steps[i]?.onElement ?? st.onElement,
    }))
    return {
      ...base,
      platform: platform ? platform(base.platform) : base.platform,
      steps: placed,
    }
  }
}

/** Sets char0 to the layout's Digit1, whose Shift level reports another name. */
function withDigit(base: History): History {
  const codes = typedCodes(layoutOf(base))
  return {
    ...base,
    chars: [
      { code: codes.indexOf('Digit1'), level: 0 },
      ...base.chars.slice(1),
    ],
  }
}

/** Uses the platform's first layout (US) and its KeyA as char0, a cased letter. */
function withLetter(base: History): History {
  const codes = typedCodes(layoutsFor(base.platform)[0]!)
  return {
    ...base,
    layout: 0,
    chars: [{ code: codes.indexOf('KeyA'), level: 0 }, ...base.chars.slice(1)],
  }
}

/** The keyup variant of Digit1 whose name differs from its plain level. */
function digitShiftVariant(base: History): number {
  const levels = layoutOf(base)
    .keys.get('Digit1')!
    .filter((name) => name !== '')
  return levels.findIndex((name) => keyName(name) !== keyName(levels[0]!))
}

const offMac = (p: HotkeyPlatform): HotkeyPlatform =>
  p === 'mac' ? 'linux' : p

const constructed: Array<{
  name: string
  enters: Array<StateName>
  build: (base: History) => History
}> = [
  {
    name: 'digit released under its Shift name',
    enters: [STATES.pairedByCode],
    build: (base) => {
      const digit = withDigit(base)
      return script([
        s('press', SLOT.char0),
        s('release', SLOT.char0, { variant: digitShiftVariant(digit) }),
      ])(digit)
    },
  },
  {
    name: 'code-less keyup of a coded key',
    // keyupPool starts with each slot's press name, so variant = slot index
    enters: [STATES.codelessRelease],
    build: script([
      s('press', SLOT.char0),
      s('codelessRelease', 0, { variant: SLOT.char0 }),
    ]),
  },
  {
    name: 'both Shift keys',
    enters: [STATES.sharedName, STATES.otherSide],
    build: script([
      s('press', SLOT.ShiftLeft),
      s('press', SLOT.ShiftRight),
      s('release', SLOT.ShiftRight),
      s('release', SLOT.ShiftLeft),
    ]),
  },
  {
    name: 'focus moves, then the window blurs',
    enters: [STATES.focusMove, STATES.windowBlur],
    build: script([s('press', SLOT.char0), s('focusMove'), s('blur')]),
  },
  {
    name: 'tab shown, then hidden',
    enters: [STATES.shown, STATES.hidden],
    build: script([s('press', SLOT.char0), s('show'), s('hide')]),
  },
  {
    name: 'hidden page with a listener that stops the event',
    enters: [STATES.hiddenStopped],
    build: script([s('press', SLOT.char0), s('hide', 0, { stop: true })]),
  },
  {
    name: 'native context menu with Shift down',
    enters: [STATES.nativeMenu],
    build: script([
      s('press', SLOT.ShiftLeft),
      s('press', SLOT.ContextMenu),
      s('contextmenu'),
    ]),
  },
  {
    name: 'context menus the page shows or dispatches',
    enters: [STATES.pageMenu, STATES.syntheticMenu],
    build: script([
      s('press', SLOT.char0),
      s('contextmenu', 0, { prevented: true }),
      s('contextmenu', 0, { trusted: false }),
    ]),
  },
  {
    name: 'Cmd+S on macOS',
    enters: [STATES.macCommand],
    build: script(
      [
        s('press', SLOT.MetaLeft),
        s('press', SLOT.char0),
        s('lose', SLOT.char0),
        s('release', SLOT.MetaLeft),
      ],
      () => 'mac',
    ),
  },
  {
    name: 'Meta released off macOS',
    enters: [STATES.otherCommand],
    build: script(
      [
        s('press', SLOT.char0),
        s('press', SLOT.MetaLeft),
        s('release', SLOT.MetaLeft),
      ],
      offMac,
    ),
  },
  {
    name: 'Shift tapped while a key is held',
    enters: [STATES.modifierTap],
    build: script([
      s('press', SLOT.char0),
      s('press', SLOT.ShiftLeft),
      s('release', SLOT.ShiftLeft),
    ]),
  },
  {
    name: 'missed Shift release, then a key press',
    enters: [STATES.keyRecovery],
    build: script([
      s('press', SLOT.ShiftLeft),
      s('lose', SLOT.ShiftLeft),
      s('press', SLOT.char0),
    ]),
  },
  {
    name: 'missed Alt release, then mouse events',
    enters: [STATES.syntheticMouse, STATES.mouseRecovery],
    build: script([
      s('press', SLOT.AltLeft),
      s('lose', SLOT.AltLeft),
      s('mousemove', 0, { trusted: false }),
      s('mousedown'),
    ]),
  },
  {
    name: 'key events the page stops',
    enters: [STATES.stopped],
    build: script([
      s('press', SLOT.char0, { stop: true }),
      s('release', SLOT.char0, { stop: true }),
    ]),
  },
  {
    name: 'destroyed, then reset',
    enters: [STATES.destroyedHeld, STATES.deadEvent, STATES.resetTracks],
    build: script([
      s('press', SLOT.char0),
      s('destroy'),
      s('press', SLOT.char1),
      s('reset'),
      s('lose', SLOT.char1),
      s('press', SLOT.char1),
    ]),
  },
  {
    name: 'released key pressed again',
    enters: [STATES.pressedAgain],
    build: script([
      s('press', SLOT.char0),
      s('press', SLOT.char1),
      s('release', SLOT.char0),
      s('press', SLOT.char0),
    ]),
  },
  {
    name: 'Shift down before the page saw it',
    enters: [STATES.notInferred, STATES.quietMouse],
    build: script([
      s('grab', SLOT.ShiftLeft),
      s('press', SLOT.char0),
      s('mousemove'),
    ]),
  },
  {
    name: 'keyup of a key never pressed',
    enters: [STATES.strayKeyup],
    build: script([s('release', SLOT.char0)]),
  },
  {
    name: 'code-less key pressed',
    enters: [STATES.codelessHeld],
    // codeless[0] is always 'Unidentified'; the pool index after the slots' names
    build: script([s('codelessPress', 0, { variant: 0 })]),
  },
  {
    name: 'letter queried in another case',
    enters: [STATES.otherCase],
    build: (base) => script([s('press', SLOT.char0)])(withLetter(base)),
  },
  {
    name: 'Space queried as a space',
    enters: [STATES.spaceQuery],
    build: script([s('press', SLOT.Space)]),
  },
  {
    name: 'missed Shift release, then a keyup',
    enters: [STATES.keyupRecovery],
    build: script([
      s('press', SLOT.char0),
      s('press', SLOT.ShiftLeft),
      s('lose', SLOT.ShiftLeft),
      s('release', SLOT.char0),
    ]),
  },
  {
    name: 'missed Control release, then a native context menu',
    enters: [STATES.menuRecovery],
    build: script([
      s('press', SLOT.ControlLeft),
      s('lose', SLOT.ControlLeft),
      s('contextmenu'),
    ]),
  },
  {
    name: 'mouse events the page stops',
    enters: [STATES.mouseStopped],
    build: script([
      s('press', SLOT.AltLeft),
      s('lose', SLOT.AltLeft),
      s('mousemove', 0, { stop: true }),
      s('press', SLOT.ShiftLeft),
      s('lose', SLOT.ShiftLeft),
      s('mousedown', 0, { stop: true }),
    ]),
  },
]

// ---------------------------------------------------------------------------
// The driver: real events through the real tracker.
// ---------------------------------------------------------------------------

const USER_AGENTS: Record<HotkeyPlatform, string> = {
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  linux: 'Mozilla/5.0 (X11; Linux x86_64)',
}

/**
 * What a caller reads off the store. Values of the promised shape are
 * copied; anything else is recorded as it is, so a wrong shape is compared
 * by the checks instead of crashing the driver.
 */
interface Snapshot {
  heldKeys: unknown
  heldCodes: unknown
}
interface StepObservation extends Snapshot {
  index: number
  getHeldKeys: unknown
  published: Array<Snapshot>
  queries: Array<boolean>
  any: Array<boolean>
  all: Array<boolean>
  error: string | null
}

function trusted<T extends Event>(event: T): T {
  Object.defineProperty(event, 'isTrusted', { value: true })
  return event
}

function copy(value: unknown): unknown {
  if (Array.isArray(value)) return [...(value as Array<unknown>)]
  if (value !== null && typeof value === 'object') return { ...value }
  return value
}

function snapshot(tracker: KeyStateTracker): Snapshot {
  const state = tracker.store.state as Partial<Snapshot> | undefined
  return { heldKeys: copy(state?.heldKeys), heldCodes: copy(state?.heldCodes) }
}

const describeError = (caught: unknown) =>
  caught instanceof Error ? `${caught.name}: ${caught.message}` : String(caught)

/**
 * A tracker created where a document exists without a window, as server DOM
 * shims do (changelog for #262: "sets up no listeners where a `document`
 * exists without a `window`"). It must report no held keys and not throw.
 */
function serverTracker(shim: boolean): {
  heldKeys: unknown
  error: string | null
} {
  let result: { heldKeys: unknown; error: string | null }
  try {
    KeyStateTracker.resetInstance()
    vi.stubGlobal('window', undefined)
    // A server DOM shim's document is a bare event target
    if (shim) vi.stubGlobal('document', new EventTarget())
    result = {
      heldKeys: copy(KeyStateTracker.getInstance().getHeldKeys()),
      error: null,
    }
  } catch (caught) {
    result = { heldKeys: null, error: describeError(caught) }
  }
  vi.unstubAllGlobals()
  try {
    KeyStateTracker.resetInstance()
  } catch (caught) {
    result.error ??= describeError(caught)
  }
  return result
}

function driver(
  plan: Plan,
  observe: (checkpoint: string, value: unknown) => void,
): void {
  vi.stubGlobal('navigator', {
    platform: '',
    userAgent: USER_AGENTS[plan.platform],
  })
  let hidden = false
  const hiddenSpy = vi
    .spyOn(document, 'hidden', 'get')
    .mockImplementation(() => hidden)
  const element = document.createElement('div')
  document.body.append(element)
  let published: Array<Snapshot> = []
  let tracker: KeyStateTracker | undefined
  let subscription: { unsubscribe: () => void } | undefined
  const listen = (next: KeyStateTracker) => {
    subscription = next.store.subscribe(() => published.push(snapshot(next)))
  }
  /** The tracker `getInstance()` returns, and whether both accessors agree. */
  const instance = () => {
    const next = KeyStateTracker.getInstance()
    return {
      next,
      stable:
        getKeyStateTracker() === next && KeyStateTracker.getInstance() === next,
    }
  }

  /** Dispatches on the document or the element, with the page's listener. */
  const dispatch = (
    event: Event,
    onElement: boolean,
    page?: (event: Event) => void,
  ) => {
    const target: EventTarget = onElement ? element : document
    if (page) target.addEventListener(event.type, page)
    try {
      target.dispatchEvent(event)
    } finally {
      if (page) target.removeEventListener(event.type, page)
    }
  }
  const stopper = (stop: boolean) =>
    stop ? (event: Event) => event.stopPropagation() : undefined

  const perform = (action: Action) => {
    switch (action.type) {
      case 'keydown':
      case 'keyup': {
        const event = new KeyboardEvent(action.type, {
          bubbles: true,
          cancelable: true,
          key: action.key,
          code: action.code,
          repeat: action.repeat,
          ...action.mods,
        })
        dispatch(trusted(event), action.onElement, stopper(action.stop))
        break
      }
      case 'mousemove':
      case 'mousedown': {
        const event = new MouseEvent(action.type, {
          bubbles: true,
          cancelable: true,
          ...action.mods,
        })
        dispatch(
          action.trusted ? trusted(event) : event,
          action.onElement,
          stopper(action.stop),
        )
        break
      }
      case 'contextmenu': {
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          ...action.mods,
        })
        dispatch(
          action.trusted ? trusted(event) : event,
          action.onElement,
          action.prevented ? (e) => e.preventDefault() : undefined,
        )
        break
      }
      case 'visibility':
        hidden = action.hidden
        dispatch(
          new Event('visibilitychange', { bubbles: true }),
          false,
          stopper(action.stop),
        )
        break
      case 'blur':
        window.dispatchEvent(new Event('blur'))
        break
      case 'focusMove':
        // An element losing focus to another: its blur does not bubble
        element.dispatchEvent(new FocusEvent('blur'))
        break
      case 'destroy':
        tracker?.destroy()
        break
      case 'reset': {
        subscription?.unsubscribe()
        const old = tracker
        KeyStateTracker.resetInstance()
        const { next, stable } = instance()
        observe('instance', { fresh: next !== old, stable })
        tracker = next
        listen(next)
        break
      }
      case 'silent':
        break
    }
  }

  /** Records the step: state, published states, queries, and the first error. */
  const record = (index: number, error: string | null) => {
    const ask = <T>(fn: () => T, fallback: T): T => {
      try {
        return fn()
      } catch (caught) {
        error ??= describeError(caught)
        return fallback
      }
    }
    const current = tracker
    const observation: StepObservation = {
      index,
      ...ask(
        () =>
          current ? snapshot(current) : { heldKeys: null, heldCodes: null },
        {
          heldKeys: null,
          heldCodes: null,
        },
      ),
      getHeldKeys: ask(() => copy(current?.getHeldKeys()), null),
      published,
      queries: plan.queries.map((q) =>
        ask(() => current?.isKeyHeld(q) ?? false, false),
      ),
      any: plan.lists.map((list) =>
        ask(() => current?.isAnyKeyHeld(list) ?? false, false),
      ),
      all: plan.lists.map((list) =>
        ask(() => current?.areAllKeysHeld(list) ?? false, false),
      ),
      error,
    }
    observe('step', observation)
  }

  try {
    // Step 0 is the new tracker, before any event.
    let error: string | null = null
    try {
      KeyStateTracker.resetInstance()
      const { next, stable } = instance()
      observe('instance', { fresh: null, stable })
      tracker = next
      listen(next)
    } catch (caught) {
      error = describeError(caught)
    }
    record(0, error)
    plan.actions.forEach((action, i) => {
      published = []
      let stepError: string | null = null
      try {
        perform(action)
      } catch (caught) {
        stepError = describeError(caught)
      }
      record(i + 1, stepError)
    })
  } finally {
    subscription?.unsubscribe()
    element.remove()
    hiddenSpy.mockRestore()
    vi.unstubAllGlobals()
    let error: string | null = null
    try {
      KeyStateTracker.resetInstance()
    } catch (caught) {
      error = describeError(caught)
    }
    observe('cleanup', { error })
  }
}

// ---------------------------------------------------------------------------
// The checks, one per law, over the shared trace.
// ---------------------------------------------------------------------------

function stepsOf(trace: ReadonlyArray<Observation>): Array<StepObservation> {
  return trace
    .filter((o) => o.checkpoint === 'step')
    .map((o) => o.value as StepObservation)
}

/** Judges each recorded step with `judge`, then the trace's completeness. */
function judgeSteps(
  law: string,
  trace: ReadonlyArray<Observation>,
  expected: Array<Expected>,
  judge: (observed: StepObservation, owed: Expected) => Verdict | undefined,
): Verdict {
  const steps = stepsOf(trace)
  for (const observed of steps) {
    const owed = expected[observed.index]
    if (!owed)
      return violation('step', `step ${observed.index} was not planned`, law)
    const verdict = judge(observed, owed)
    if (verdict) return verdict
  }
  return steps.length === expected.length
    ? pass
    : violation(
        'complete',
        `${steps.length} of ${expected.length} steps recorded`,
        law,
      )
}

const at = (observed: StepObservation) => `step ${observed.index}`

const LAWS = {
  heldKeys: 'held keys',
  heldCodes: 'held codes',
  queries: 'key queries',
  publication: 'publication',
  lifecycle: 'lifecycle',
  noThrow: 'no throw',
  server: 'server rendering',
} as const

const SOURCES = {
  resets:
    'docs/guides/sensible-defaults.md:494-498 "Held keys reset when the window loses focus": "marks a key as held on keydown and releases it on keyup", "cleared when the window loses focus, and when the page is hidden", "opening one ... clears every held key except the modifiers the event still reports. A context menu the page shows itself ... clears nothing", "Releasing Command on macOS clears any other keys ... Other modifiers, and Command on other platforms, keep their keyups", "the next key press, mouse movement, or click releases any modifier it reports as up. Only real user input counts"',
  pairing:
    'tests/key-state-tracker.test.ts:95 "pairs keyup by code when the logical key changes", :374 "keeps the other physical modifier held until its own release"; src/key-state-tracker.ts:131 "Code-less keyup events can only be paired by their logical key"; :173-175 "no hotkey or widget can hide keys from the tracker"; CHANGELOG.md:125 (#256), :232 (#216), :392 (#161)',
  order:
    'docs/framework/react/guides/held-key-state-helpers.md:13 "returns the held keys in the order they were pressed"; src/key-state-tracker.ts:11-12 "Array of currently held key names (normalized ...)"',
  codes:
    'docs/framework/react/guides/held-key-state-helpers.md:58 "maps each held key to the physical key that\'s down, from event.code"; src/key-state-tracker.ts:15-18',
  queries:
    'src/key-state-tracker.ts:266-300 JSDoc of isKeyHeld ("Letters match in any case. Other key names are case-sensitive"), isAnyKeyHeld, areAllKeysHeld; docs/framework/react/guides/held-key-state-helpers.md:54; src/constants.ts:118-136 JSDoc of normalizeKeyName',
  publication:
    'tests/key-state-tracker.test.ts:396 "publishes one final state per keyboard event", :436 "publishes mouse recovery once", :361 and :426 (store state unchanged by a mouse event that releases nothing); src/key-state-tracker.ts:53 "Subscribe to changes"; :303 "Destroys the tracker and removes all listeners"',
  lifecycle:
    'src/key-state-tracker.ts:85-103 (getInstance, resetInstance), :303 "Destroys the tracker and removes all listeners", :312-318 getKeyStateTracker; tests/key-state-tracker.test.ts:62-73',
}

const COMMON_LIMITS =
  "Not generated: page-dispatched keyboard events, events with an empty key, AltGraph, a keydown of a held key that reports a new name, a coded keyup of a code-less key's name, a page listener that stops a contextmenu event, and a page-dispatched window blur or visibilitychange. Key names on keydown follow the press level chosen for the history, not the modifiers held at that moment."

function generated(states: Array<StateName>) {
  const required = new Set(states)
  return {
    arbitrary: historyArb,
    states,
    measured: ALL_STATES.filter((state) => !required.has(state)),
    runs: 60,
    fixedSeeds: [20261121],
    constructed: constructed
      .filter((c) => c.enters.some((state) => required.has(state)))
      .map((c) => ({
        name: c.name,
        enters: c.enters.filter((state) => required.has(state)),
        build: c.build,
      })),
  }
}

const reached = (plan: Plan) => reachOf(plan)

const firstHistory = (law: string) => ({
  constructed: constructed.find((c) => c.enters.includes(law as StateName))!
    .name,
})

oracleProperty<History, Array<Expected>, Plan>({
  id: 'key-state.held-keys',
  law: {
    statement:
      'For every history of keyboard, mouse, focus, visibility and context menu events, after each event getHeldKeys() and store.state.heldKeys list the normalized names of the held keys, each once, in press order. A key is held from its keydown until a keyup of its physical key (whatever name it reports), a code-less keyup of its name, a window blur, a hidden page, a native context menu (which keeps the modifiers it reports), a Command keyup on macOS (non-modifiers only), or a real event that reports its modifier flag as up. Where the event was dispatched, and whether a page listener stopped it, changes nothing.',
    authority: `${SOURCES.resets}; ${SOURCES.pairing}; ${SOURCES.order}. ${APPROVAL}`,
    limits: COMMON_LIMITS,
  },
  histories: generated([
    STATES.pairedByCode,
    STATES.codelessRelease,
    STATES.windowBlur,
    STATES.focusMove,
    STATES.hidden,
    STATES.shown,
    STATES.hiddenStopped,
    STATES.nativeMenu,
    STATES.pageMenu,
    STATES.syntheticMenu,
    STATES.macCommand,
    STATES.otherCommand,
    STATES.modifierTap,
    STATES.keyRecovery,
    STATES.keyupRecovery,
    STATES.menuRecovery,
    STATES.mouseStopped,
    STATES.mouseRecovery,
    STATES.syntheticMouse,
    STATES.otherSide,
    STATES.stopped,
    STATES.pressedAgain,
    STATES.notInferred,
    STATES.strayKeyup,
    STATES.codelessHeld,
  ]),
  resolve,
  model,
  reached,
  driver,
  check: (_plan, trace, expected) =>
    judgeSteps(
      LAWS.heldKeys,
      trace,
      expected,
      (observed, owed) =>
        differs(
          at(observed),
          LAWS.heldKeys,
          observed.heldKeys,
          owed.names,
          'store.state.heldKeys',
        ) ??
        differs(
          at(observed),
          LAWS.heldKeys,
          observed.getHeldKeys,
          owed.names,
          'getHeldKeys()',
        ),
    ),
  calibrations: [
    {
      name: 'blur keeps the held keys',
      law: LAWS.heldKeys,
      history: firstHistory(STATES.windowBlur),
      corrupt: (trace) => {
        const steps = stepsOf(trace)
        const last = steps[steps.length - 1]
        const before = steps[steps.length - 2]
        if (!last || !before) return undefined
        return trace.map((o) =>
          o.value === last
            ? { ...o, value: { ...last, heldKeys: before.heldKeys } }
            : o,
        )
      },
    },
  ],
  owns: ['src/key-state-tracker.ts'],
})

oracleProperty<History, Array<Expected>, Plan>({
  id: 'key-state.held-codes',
  law: {
    statement:
      'For every history, after each event store.state.heldCodes has exactly the held names as keys, and maps each to the event.code of a held key with that name: the empty code for a key whose events had none, and either code when two held keys share a name, such as Left and Right Shift.',
    authority: `${SOURCES.codes}; ${SOURCES.pairing}. ${APPROVAL}`,
    limits: `${COMMON_LIMITS} Which code is shown when two held keys share a name is not decided, so either is accepted.`,
  },
  histories: generated([
    STATES.sharedName,
    STATES.otherSide,
    STATES.codelessHeld,
  ]),
  resolve,
  model,
  reached,
  driver,
  check: (_plan, trace, expected) =>
    judgeSteps(LAWS.heldCodes, trace, expected, (observed, owed) => {
      const codes = observed.heldCodes
      if (codes === null || typeof codes !== 'object' || Array.isArray(codes))
        return violation(
          at(observed),
          'heldCodes is not an object',
          LAWS.heldCodes,
          {
            actual: codes,
            expected: owed.codes,
          },
        )
      const keys = Object.keys(codes).sort()
      const owedKeys = Object.keys(owed.codes).sort()
      const names = differs(
        at(observed),
        LAWS.heldCodes,
        keys,
        owedKeys,
        'heldCodes names',
      )
      if (names) return names
      for (const [name, code] of Object.entries(
        codes as Record<string, unknown>,
      )) {
        if (!owed.codes[name]!.includes(code as string))
          return violation(
            at(observed),
            `heldCodes[${JSON.stringify(name)}] is ${JSON.stringify(code)}, not the code of a held key: ${JSON.stringify(owed.codes[name])}`,
            LAWS.heldCodes,
            { actual: code, expected: owed.codes[name] },
          )
      }
      return undefined
    }),
  calibrations: [
    {
      name: 'a released Shift code stays',
      law: LAWS.heldCodes,
      history: firstHistory(STATES.otherSide),
      corrupt: (trace) =>
        trace.map((o) => {
          const v = o.value as StepObservation
          return o.checkpoint === 'step' && v.index === 3
            ? { ...o, value: { ...v, heldCodes: { Shift: 'ShiftRight' } } }
            : o
        }),
    },
  ],
  owns: ['src/key-state-tracker.ts'],
})

oracleProperty<History, Array<Expected>, Plan>({
  id: 'key-state.key-queries',
  law: {
    statement:
      'For every history and every query string k, after each event isKeyHeld(k) is true exactly when k names a held key under the key-name rule (a single letter in any case, the space character as Space, every other name case-sensitive), and isAnyKeyHeld(keys) and areAllKeysHeld(keys) are some and every of isKeyHeld over keys, so false and true for an empty list.',
    authority: `${SOURCES.queries}. ${APPROVAL}`,
    limits: `${COMMON_LIMITS} The queries are the history's key names in three cases, Space, a code, and the empty string.`,
  },
  histories: generated([STATES.otherCase, STATES.spaceQuery]),
  resolve,
  model,
  reached,
  driver,
  check: (_plan, trace, expected) =>
    judgeSteps(
      LAWS.queries,
      trace,
      expected,
      (observed, owed) =>
        differs(
          at(observed),
          LAWS.queries,
          observed.queries,
          owed.queries,
          'isKeyHeld',
        ) ??
        differs(
          at(observed),
          LAWS.queries,
          observed.any,
          owed.any,
          'isAnyKeyHeld',
        ) ??
        differs(
          at(observed),
          LAWS.queries,
          observed.all,
          owed.all,
          'areAllKeysHeld',
        ),
    ),
  calibrations: [
    {
      name: 'a held letter not found in lowercase',
      law: LAWS.queries,
      history: firstHistory(STATES.otherCase),
      corrupt: (trace) =>
        trace.map((o) => {
          const v = o.value as StepObservation
          return o.checkpoint === 'step'
            ? { ...o, value: { ...v, queries: v.queries.map(() => false) } }
            : o
        }),
    },
  ],
  owns: ['src/key-state-tracker.ts'],
})

oracleProperty<History, Array<Expected>, Plan>({
  id: 'key-state.publication',
  law: {
    statement:
      'For every history, each event publishes at most one store state, and every published state is the state after the event: exactly one when the held names change, none for a mouse event that releases no key, none for an event after destroy(), and zero or one otherwise.',
    authority: `${SOURCES.publication}. ${APPROVAL}`,
    limits: `${COMMON_LIMITS} Whether a keyboard, focus, visibility or context menu event that changes no held name publishes is not decided, so zero or one is accepted.`,
  },
  histories: generated([
    STATES.mouseRecovery,
    STATES.quietMouse,
    STATES.strayKeyup,
    STATES.deadEvent,
  ]),
  resolve,
  model,
  reached,
  driver,
  check: (_plan, trace, expected) =>
    judgeSteps(LAWS.publication, trace, expected, (observed, owed) => {
      const [min, max] = owed.publish
      const count = observed.published.length
      if (count < min || count > max)
        return violation(
          at(observed),
          `published ${count} states, owed ${min === max ? min : `${min} to ${max}`}`,
          LAWS.publication,
          { actual: count, expected: owed.publish },
        )
      const final = {
        heldKeys: observed.heldKeys,
        heldCodes: observed.heldCodes,
      }
      for (const state of observed.published) {
        const wrong = differs(
          at(observed),
          LAWS.publication,
          state,
          final,
          'a published state is not the final state',
        )
        if (wrong) return wrong
      }
      return undefined
    }),
  calibrations: [
    {
      name: 'a quiet mouse event publishes',
      law: LAWS.publication,
      history: firstHistory(STATES.quietMouse),
      corrupt: (trace) => {
        const steps = stepsOf(trace)
        const last = steps[steps.length - 1]
        if (!last) return undefined
        return trace.map((o) =>
          o.value === last
            ? {
                ...o,
                value: {
                  ...last,
                  published: [
                    { heldKeys: last.heldKeys, heldCodes: last.heldCodes },
                  ],
                },
              }
            : o,
        )
      },
    },
  ],
  owns: ['src/key-state-tracker.ts'],
})

oracleProperty<History, Array<Expected>, Plan>({
  id: 'key-state.lifecycle',
  law: {
    statement:
      'For every history, getKeyStateTracker() and getInstance() return the same tracker; destroy() leaves it with no held keys, empty heldKeys and heldCodes, and no reaction to later events; after resetInstance(), getInstance() returns a new tracker with no held keys that tracks the events that follow.',
    authority: `${SOURCES.lifecycle}. ${APPROVAL}`,
    limits: `${COMMON_LIMITS} What getInstance() returns after destroy() without resetInstance() is not observed.`,
  },
  histories: generated([
    STATES.destroyedHeld,
    STATES.deadEvent,
    STATES.resetTracks,
  ]),
  resolve,
  model,
  reached,
  driver,
  check: (_plan, trace, expected) => {
    for (const o of trace) {
      if (o.checkpoint !== 'instance') continue
      const v = o.value as { fresh: boolean | null; stable: boolean }
      if (!v.stable)
        return violation(
          'instance',
          'getKeyStateTracker() and getInstance() disagree',
          LAWS.lifecycle,
        )
      if (v.fresh === false)
        return violation(
          'instance',
          'resetInstance() kept the old tracker',
          LAWS.lifecycle,
        )
    }
    return judgeSteps(LAWS.lifecycle, trace, expected, (observed, owed) =>
      owed.listening
        ? undefined
        : (differs(
            at(observed),
            LAWS.lifecycle,
            observed.heldKeys,
            [],
            'destroyed tracker heldKeys',
          ) ??
          differs(
            at(observed),
            LAWS.lifecycle,
            observed.heldCodes,
            {},
            'destroyed tracker heldCodes',
          ) ??
          differs(
            at(observed),
            LAWS.lifecycle,
            observed.queries.some(Boolean),
            false,
            'destroyed tracker reports a held key',
          )),
    )
  },
  calibrations: [
    {
      name: 'reset keeps the old tracker',
      law: LAWS.lifecycle,
      history: firstHistory(STATES.resetTracks),
      corrupt: (trace) =>
        trace.map((o) =>
          o.checkpoint === 'instance' &&
          (o.value as { fresh: unknown }).fresh === true
            ? { ...o, value: { fresh: false, stable: true } }
            : o,
        ),
    },
  ],
  owns: ['src/key-state-tracker.ts'],
})

oracleProperty<History, Array<Expected>, Plan>({
  id: 'key-state.no-throw',
  law: {
    statement:
      'For every history, every dispatched event and every call to getHeldKeys, isKeyHeld, isAnyKeyHeld, areAllKeysHeld, destroy, resetInstance and getInstance returns without throwing.',
    authority: `${SOURCES.queries}; ${SOURCES.lifecycle}: each returns a value or nothing. ${APPROVAL}`,
    limits: COMMON_LIMITS,
  },
  histories: generated([STATES.codelessRelease, STATES.resetTracks]),
  resolve,
  model,
  reached,
  driver,
  check: (_plan, trace, expected) => {
    const steps = judgeSteps(LAWS.noThrow, trace, expected, (observed) =>
      observed.error === null
        ? undefined
        : violation(at(observed), `threw ${observed.error}`, LAWS.noThrow, {
            actual: observed.error,
            expected: null,
          }),
    )
    if (steps.kind !== 'pass') return steps
    const cleanup = trace.find((o) => o.checkpoint === 'cleanup')?.value as
      | { error: string | null }
      | undefined
    return cleanup?.error
      ? violation(
          'cleanup',
          `resetInstance() threw ${cleanup.error}`,
          LAWS.noThrow,
        )
      : pass
  },
  calibrations: [
    {
      name: 'an event throws',
      law: LAWS.noThrow,
      history: firstHistory(STATES.codelessRelease),
      corrupt: (trace) =>
        trace.map((o) =>
          o.checkpoint === 'step'
            ? {
                ...o,
                value: {
                  ...(o.value as StepObservation),
                  error: 'Error: boom',
                },
              }
            : o,
        ),
    },
  ],
  owns: ['src/key-state-tracker.ts'],
})

oracleProperty<{ shim: boolean }, { heldKeys: Array<string>; error: null }>({
  id: 'key-state.server',
  law: {
    statement:
      "For every environment with no window, with the test DOM's document or a server shim's bare EventTarget as document, getInstance() returns a tracker whose getHeldKeys() is [] without throwing, and resetInstance() then returns without throwing.",
    authority: `CHANGELOG.md:119 (#262) "The core key state tracker now sets up no listeners where a \`document\` exists without a \`window\`" (before, "reading held keys threw"); src/key-state-tracker.ts:109-110; tests/key-state-tracker-ssr.test.ts:19-23. ${APPROVAL}`,
    limits:
      'Runs in the test DOM with window removed, not in a server runtime; that no listener is added anywhere is not observed beyond the absence of an error.',
  },
  histories: [{ shim: false }, { shim: true }],
  label: (history) =>
    history.shim ? 'server shim document' : 'test document, no window',
  model: () => ({ heldKeys: [], error: null }),
  driver: (history, observe) => observe('server', serverTracker(history.shim)),
  check: (_history, trace, expected) => {
    const server = trace.find((o) => o.checkpoint === 'server')
    if (!server) return violation('server', 'nothing recorded', LAWS.server)
    return (
      differs(
        'server',
        LAWS.server,
        server.value,
        expected,
        'a tracker without a window',
      ) ?? pass
    )
  },
  calibrations: [
    {
      name: 'a server tracker reports a key',
      law: LAWS.server,
      history: { enumerated: 0 },
      corrupt: (trace) =>
        trace.map((o) =>
          o.checkpoint === 'server'
            ? { ...o, value: { heldKeys: ['A'], error: null } }
            : o,
        ),
    },
  ],
  owns: ['src/key-state-tracker.ts'],
})
