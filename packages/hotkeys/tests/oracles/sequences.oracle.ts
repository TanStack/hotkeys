import { createSequenceMatcher } from '@tanstack/hotkeys'
/**
 * This oracle owns `createSequenceMatcher`'s promise about time and order:
 * which key presses advance a sequence, start it over, leave it alone, or
 * complete it, checked on what `match` returns and on `getProgress()` after
 * every call. It owns `src/match.ts#createSequenceMatcher`.
 *
 * ```ts
 * const m = createSequenceMatcher(['G', 'H'])
 * m.match(g); m.match(h) // → false, then true; getProgress() 1, then 0
 * m.match(g); wait(1001); m.match(h) // → false: more than 1000 ms between steps
 * m.match(g); m.match(Shift); m.match(h) // → true: a modifier press is not a step
 * m.match(g); m.match(CapsLock); m.match(h) // → true: a lock key that matches no step keeps progress
 * m.match(g); m.reset(); m.match(h) // → false: reset starts over
 * ```
 *
 * Why does `G G G H` not complete `['G', 'G', 'H']`? The third `G` does not
 * continue the sequence, so it starts it over, and as the first step it
 * begins a new attempt with one step matched. `H` then does not continue that
 * attempt. The matcher never looks for a later start inside the keys already
 * pressed.
 *
 * Three parts decide every call. The attempt is the number of steps matched so
 * far, which `getProgress()` reports. The step time is when the last step that
 * counted was pressed; the next step must come within `timeout` ms of it. The
 * kind of press decides whether a press is a step at all: auto-repeats,
 * modifier presses, and presses an input method editor reads are not steps;
 * lock keys and dead keys are steps only when they match one.
 *
 * The laws, each one property below:
 *
 * - steps in order: a press that matches the next step, in time, advances the
 *   attempt by one, and the press that matches the last step makes `match`
 *   return true and the attempt go back to 0. Every other call returns false.
 * - timeout: a press more than `timeout` ms after the step time is judged as
 *   the start of a new attempt; exactly `timeout` ms is still in time. The
 *   default is 1000 ms.
 * - wrong key restarts: a press that does not continue the attempt starts it
 *   over, at 1 when it matches the first step (and the step time moves to it),
 *   else at 0.
 * - not a step: an auto-repeat, a modifier press, or an IME press changes
 *   neither the attempt nor the step time.
 * - lock and dead keys: CapsLock, NumLock, and a dead key advance the attempt
 *   when they match the next step, and otherwise leave the attempt and the
 *   step time alone.
 * - reset: `reset()` makes the attempt 0, so the next press is judged against
 *   the first step.
 * - no throw: creating the matcher and every call return.
 *
 * The model steps the attempt and the step time through the plan, with the
 * single-chord match relation written as a table from the guides (each step
 * is matched as its own chord, which the key-matching oracle owns). The
 * platform matters twice: `Mod+K` and a French AZERTY Option press for
 * `Alt+A` match differently on macOS, and the matcher must use the platform
 * it was given, or else the one the browser reports. Histories mix steps,
 * presses that are not steps, lock and dead keys, waits at the timeout and
 * one or two ms either side of it, and resets, over sequences of zero to four
 * steps, timeouts from 0 to 1000 ms and the default. The driver runs the real
 * matcher on a virtual `Date.now()` and records each return value, each
 * `getProgress()`, and any throw. The check finds the first call where
 * production leaves the model and reports the law that decides that call: a
 * press at or past the timeout belongs to the timeout law, unless a skipped
 * key or a restart is what would have kept it in time, and then it belongs
 * to that key's law. A work bound holds two fast paths: the platform is
 * resolved once, and a press from 0 is matched against the first step once.
 * Two points the documentation does not settle are allowed sets: the model
 * predicts both readings of each, and production must follow one reading
 * through the whole history.
 *
 * Limits. `getProgress()` read after the timeout has passed, before the next
 * press, may report the old attempt or 0. A lock or dead key that matches the
 * first step mid-sequence, and not the next step, may start a new attempt or
 * keep the old one. An empty sequence's `match` may return either boolean; it
 * must return and keep progress at 0. Timeouts below 0 and `NaN` are not
 * generated. Every event is a `keydown`, as the JSDoc's listener passes;
 * keyup events are not generated. Fn, FnLock, and ScrollLock are not
 * generated; CapsLock and NumLock stand for the lock keys.
 */
import {
  keydown,
  setTestPlatform,
  testPlatform,
} from '@tanstack/hotkeys-test-utils'
import { oracleProperty, pass, violation } from '@tanstack/oracles'
import fc from 'fast-check'
import { vi } from 'vitest'
import type {
  HotkeyPlatform,
  RegisterableHotkeySequence,
} from '@tanstack/hotkeys'
import type { Observation, Verdict } from '@tanstack/oracles'

const APPROVAL =
  'Proposed by an agent for Kevin Van Cott (KevinVandy) on 2026-11-21, pending his approval; see .tasks/tanstack-oracles/decisions.md.'

// ---------------------------------------------------------------------------
// The alphabet: sequence steps and key presses
// ---------------------------------------------------------------------------

/** Steps a sequence can have. The last is the chord object `{ key: 'K', mod: true }`. */
const STEPS = [
  'G',
  'H',
  'Shift+G',
  'CapsLock',
  '[Quote]',
  'Mod+K',
  'object Mod+K',
  'Alt+A',
] as const
type Step = (typeof STEPS)[number]

/** Presses that can match a step. */
const STEP_PRESSES = [
  'g',
  'h',
  'Shift+g',
  'CapsLock',
  'Dead',
  'Quote',
  'Control+k',
  'Meta+k',
  'Alt+a',
  'AZERTY Option+a',
] as const
/** Presses that match no step: a wrong key, a lock key, and the presses that are not steps. */
const OTHER_PRESSES = [
  'x',
  'NumLock',
  'Shift',
  'Control',
  'AltGraph',
  'repeat g',
  'repeat Control+k',
  'IME',
] as const
type Press = (typeof STEP_PRESSES)[number] | (typeof OTHER_PRESSES)[number]

/** The keydown each press sends, as a browser reports it. */
const EVENTS: Record<Press, Parameters<typeof keydown>[0]> = {
  g: { key: 'g', code: 'KeyG' },
  h: { key: 'h', code: 'KeyH' },
  'Shift+g': { key: 'G', code: 'KeyG', shiftKey: true },
  x: { key: 'x', code: 'KeyX' },
  CapsLock: { key: 'CapsLock', code: 'CapsLock' },
  NumLock: { key: 'NumLock', code: 'NumLock' },
  // US International: the apostrophe key starts a composed character
  Dead: { key: 'Dead', code: 'Quote' },
  Quote: { key: "'", code: 'Quote' },
  'Control+k': { key: 'k', code: 'KeyK', ctrlKey: true },
  'Meta+k': { key: 'k', code: 'KeyK', metaKey: true },
  'Alt+a': { key: 'a', code: 'KeyA', altKey: true },
  // French AZERTY Mac: Option on the key labeled A, in the US Q position
  'AZERTY Option+a': { key: 'æ', code: 'KeyQ', altKey: true, keyCode: 65 },
  Shift: { key: 'Shift', code: 'ShiftLeft', shiftKey: true },
  Control: { key: 'Control', code: 'ControlLeft', ctrlKey: true },
  AltGraph: { key: 'AltGraph', code: 'AltRight', altGraph: true },
  'repeat g': { key: 'g', code: 'KeyG', repeat: true },
  'repeat Control+k': { key: 'k', code: 'KeyK', ctrlKey: true, repeat: true },
  IME: { key: 'Process', code: 'KeyA', isComposing: true },
}

/**
 * One keydown per press, made when the file loads. The matcher only reads an
 * event, so presses share it. Making a happy-dom event reads
 * `performance.now()`, and a test that reads the clock has work the gap
 * check cannot compare, which would turn the work bound off.
 */
const KEYDOWNS = Object.fromEntries(
  Object.entries(EVENTS).map(([name, init]) => [name, keydown(init)]),
) as Record<Press, KeyboardEvent>

/**
 * Presses that are not steps: "Modifier presses, auto-repeats, and keys an
 * input method editor reads are not steps" (src/match.ts JSDoc).
 */
const NOT_STEPS: ReadonlySet<Press> = new Set([
  'Shift',
  'Control',
  'AltGraph',
  'repeat g',
  'repeat Control+k',
  'IME',
])
/**
 * Lock keys and dead keys: "Lock keys such as CapsLock and NumLock, Fn, and
 * dead keys count only when they match a step" (docs/framework/react/guides/sequences.md:77).
 */
const LOCK_AND_DEAD: ReadonlySet<Press> = new Set([
  'CapsLock',
  'NumLock',
  'Dead',
])

/**
 * Which presses match each step: the single-chord match relation, from the
 * guides, which the key-matching oracle owns. Each step has its own modifiers
 * (sequences.md:54), so `g` with Shift is `Shift+G`, not `G`. A physical
 * `[Quote]` matches `event.code` exactly, whatever the key types, a dead key
 * included (src/match.ts matchesKeyboardEvent JSDoc; sequences.md:52). `Mod` is Command on macOS and Control elsewhere
 * (docs/guides/sensible-defaults.md:32). On macOS, an Option press matches
 * the letter on the keycap: "on a French AZERTY Mac, `Alt+A` fires on the key
 * labeled A, which sits in the US Q position" (sensible-defaults.md:45);
 * elsewhere that press is the Q position, which no step here names.
 */
function matches(step: Step, press: Press, platform: HotkeyPlatform): boolean {
  switch (step) {
    case 'G':
      return press === 'g'
    case 'H':
      return press === 'h'
    case 'Shift+G':
      return press === 'Shift+g'
    case 'CapsLock':
      return press === 'CapsLock'
    case '[Quote]':
      return press === 'Dead' || press === 'Quote'
    case 'Mod+K':
    case 'object Mod+K':
      return press === (platform === 'mac' ? 'Meta+k' : 'Control+k')
    case 'Alt+A':
      return (
        press === 'Alt+a' || (platform === 'mac' && press === 'AZERTY Option+a')
      )
  }
}

/** The press that matches a step, for histories that name a step to press. */
function pressFor(
  step: Step,
  alternate: boolean,
  platform: HotkeyPlatform,
): Press {
  switch (step) {
    case 'G':
      return 'g'
    case 'H':
      return 'h'
    case 'Shift+G':
      return 'Shift+g'
    case 'CapsLock':
      return 'CapsLock'
    case '[Quote]':
      return alternate ? 'Dead' : 'Quote'
    case 'Mod+K':
    case 'object Mod+K':
      return platform === 'mac' ? 'Meta+k' : 'Control+k'
    case 'Alt+A':
      return alternate ? 'AZERTY Option+a' : 'Alt+a'
  }
}

// ---------------------------------------------------------------------------
// Histories
// ---------------------------------------------------------------------------

/** "1000 by default" (sequences.md:63; sensible-defaults.md:445). */
const DEFAULT_TIMEOUT_MS = 1000
const PLATFORMS = ['mac', 'windows', 'linux'] as const
const MAX_ACTIONS = 40

type WaitBase = 'zero' | 'half' | 'timeout' | 'double'
type HistoryAction =
  | { kind: 'press'; press: Press }
  /**
   * A press that matches step `step` (modulo the length) on the matcher's
   * platform. `alternate` picks the dead key for `[Quote]` and the AZERTY
   * Option press for `Alt+A`, which matches only on macOS.
   */
  | { kind: 'press step'; step: number; alternate: boolean }
  /** A wait placed against the timeout: `base` plus `delta` ms, at least 0. */
  | { kind: 'wait'; base: WaitBase; delta: number }
  | { kind: 'reset' }

interface History {
  steps: Array<Step>
  /** The `timeout` option; undefined leaves it out. */
  timeout: number | undefined
  /** The `platform` option; undefined leaves it to detection. */
  platform: HotkeyPlatform | undefined
  /** The platform the browser reports, which detection reads. */
  detected: HotkeyPlatform
  /** Call `createSequenceMatcher(steps)` with no options object, when both options are undefined. */
  omitOptions: boolean
  actions: Array<HistoryAction>
}

type Action =
  | { kind: 'press'; press: Press }
  | { kind: 'wait'; ms: number }
  | { kind: 'reset' }

interface Plan {
  steps: Array<Step>
  timeout: number | undefined
  platform: HotkeyPlatform | undefined
  detected: HotkeyPlatform
  omitOptions: boolean
  actions: Array<Action>
}

const historyAction: fc.Arbitrary<HistoryAction> = fc.oneof(
  {
    weight: 3,
    arbitrary: fc.record({
      kind: fc.constant('press' as const),
      press: fc.oneof(
        { weight: 3, arbitrary: fc.constantFrom(...STEP_PRESSES) },
        { weight: 2, arbitrary: fc.constantFrom(...OTHER_PRESSES) },
      ),
    }),
  },
  {
    weight: 3,
    arbitrary: fc.record({
      kind: fc.constant('press step' as const),
      step: fc.integer({ min: 0, max: 3 }),
      alternate: fc.boolean(),
    }),
  },
  {
    weight: 2,
    arbitrary: fc.record({
      kind: fc.constant('wait' as const),
      base: fc.constantFrom<WaitBase>('zero', 'half', 'timeout', 'double'),
      delta: fc.integer({ min: -2, max: 2 }),
    }),
  },
  { weight: 1, arbitrary: fc.record({ kind: fc.constant('reset' as const) }) },
)

const historyArbitrary: fc.Arbitrary<History> = fc.record({
  steps: fc.oneof(
    {
      weight: 1,
      arbitrary: fc.array(fc.constantFrom(...STEPS), { maxLength: 0 }),
    },
    {
      weight: 12,
      arbitrary: fc.array(fc.constantFrom(...STEPS), {
        minLength: 1,
        maxLength: 4,
      }),
    },
  ),
  timeout: fc.constantFrom(undefined, 0, 1, 2, 50, 300, 1000),
  platform: fc.constantFrom(undefined, ...PLATFORMS),
  detected: fc.constantFrom(...PLATFORMS),
  omitOptions: fc.boolean(),
  actions: fc.array(historyAction, { maxLength: MAX_ACTIONS }),
})

/** The platform the matcher resolves `Mod` on: the option, or the detected one. */
const platformOf = (
  plan: Pick<Plan, 'platform' | 'detected'>,
): HotkeyPlatform => plan.platform ?? plan.detected

/** Names concrete presses and wait lengths; the plan keeps every action. */
function resolve(history: History): Plan {
  const timeout = history.timeout ?? DEFAULT_TIMEOUT_MS
  const platform = platformOf(history)
  const base: Record<WaitBase, number> = {
    zero: 0,
    half: Math.floor(timeout / 2),
    timeout,
    double: timeout * 2,
  }
  return {
    steps: history.steps,
    timeout: history.timeout,
    platform: history.platform,
    detected: history.detected,
    omitOptions: history.omitOptions,
    actions: history.actions.map((action): Action => {
      switch (action.kind) {
        case 'press':
          return action
        case 'press step': {
          const step =
            history.steps[action.step % Math.max(history.steps.length, 1)]
          return {
            kind: 'press',
            press:
              step === undefined
                ? 'x'
                : pressFor(step, action.alternate, platform),
          }
        }
        case 'wait':
          return {
            kind: 'wait',
            ms: Math.max(0, base[action.base] + action.delta),
          }
        case 'reset':
          return action
      }
    }),
  }
}

// ---------------------------------------------------------------------------
// The model
// ---------------------------------------------------------------------------

const LAWS = {
  steps: 'steps in order',
  timeout: 'timeout',
  restart: 'wrong key restarts',
  notStep: 'not a step',
  lockDead: 'lock and dead keys',
  reset: 'reset',
  noThrow: 'no throw',
} as const
type Law = (typeof LAWS)[keyof typeof LAWS]

/** The states histories reach, by the law that needs them. */
const STATES = {
  [LAWS.steps]: ['completes', 'one-step sequence completes'],
  [LAWS.timeout]: [
    'in time at exactly the timeout',
    'past the timeout',
    'default timeout boundary',
  ],
  [LAWS.restart]: [
    'wrong key restarts at the first step',
    'wrong key starts over',
    'restart moves the step time',
  ],
  [LAWS.notStep]: [
    'non-step in progress',
    'non-step does not extend the timeout',
  ],
  [LAWS.lockDead]: [
    'lock or dead key keeps progress',
    'lock or dead key advances',
    'lock or dead key does not extend the timeout',
  ],
  [LAWS.reset]: ['reset in progress'],
  [LAWS.noThrow]: ['empty sequence'],
} as const satisfies Record<Law, ReadonlyArray<string>>
/** States of the allowed sets, counted but owed by no law. */
const OPEN_STATES = [
  'progress read after the timeout',
  'lock or dead key matches the first step mid-sequence',
] as const

/**
 * One reading of each point the documentation leaves open. Production must
 * follow one reading through a whole history.
 *
 * - `progress`: after the timeout has passed and before the next step,
 *   `getProgress()` reports the old attempt (`lazy`, as
 *   tests/invariants/sequence-fuzz.test.ts:274 asserts) or 0 (`eager`, as
 *   sensible-defaults.md:453 says of sequences).
 * - `firstStep`: a lock or dead key that matches the first step mid-sequence,
 *   and not the next one, starts a new attempt (`restart`, as
 *   sequence-fuzz.test.ts:411-416 and the restart rule of sequences.md:74
 *   say) or keeps the attempt (`keep`, as the JSDoc's "otherwise keep its
 *   progress" says).
 */
interface Reading {
  progress: 'lazy' | 'eager'
  firstStep: 'restart' | 'keep'
}
const READINGS: ReadonlyArray<Reading> = [
  { progress: 'lazy', firstStep: 'restart' },
  { progress: 'eager', firstStep: 'restart' },
  { progress: 'lazy', firstStep: 'keep' },
  { progress: 'eager', firstStep: 'keep' },
]

/** What one call owes: its return (`none` for reset and waits), the progress after it, and its law. */
interface Owed {
  returned: boolean | 'none' | 'either'
  progress: number
  law: Law
}
interface Expected {
  /** One owed trace per reading, in `READINGS` order. */
  readings: Array<{ create: number; actions: Array<Owed> }>
  /** The states the history enters, under the first reading. */
  states: Array<string>
}

/**
 * Steps the attempt and the step time through the plan under one reading.
 * Each rule cites its authority in the law block and the properties below.
 */
function simulate(
  plan: Plan,
  reading: Reading,
  states: Set<string> | undefined,
): { create: number; actions: Array<Owed> } {
  const timeout = plan.timeout ?? DEFAULT_TIMEOUT_MS
  const platform = platformOf(plan)
  const { steps } = plan
  let attempt = 0
  let now = 0
  // The step time, and the law of the press that set it. A restart also
  // keeps the step time it replaced: a later press in time only because the
  // restart moved the step time is judged by the restart's law.
  let stepTime = 0
  let setBy: Law = LAWS.steps
  let replaced: number | undefined
  // The last press since the step time that left the attempt alone, with its
  // law: a later press past the timeout that would be in time counted from
  // it is judged by that law, which says it does not extend the timeout.
  let skipped: { at: number; law: Law } | undefined
  const late = () => attempt > 0 && now - stepTime > timeout
  const progress = () => (reading.progress === 'eager' && late() ? 0 : attempt)
  const moveStepTime = (law: Law) => {
    replaced = law === LAWS.restart && attempt > 0 ? stepTime : undefined
    stepTime = now
    setBy = law
    skipped = undefined
  }
  const actions = plan.actions.map((action): Owed => {
    switch (action.kind) {
      case 'wait':
        now += action.ms
        if (late()) states?.add('progress read after the timeout')
        return { returned: 'none', progress: progress(), law: LAWS.timeout }
      case 'reset':
        if (attempt > 0) states?.add('reset in progress')
        attempt = 0
        return { returned: 'none', progress: 0, law: LAWS.reset }
      case 'press': {
        const { press } = action
        if (NOT_STEPS.has(press)) {
          if (late()) states?.add('progress read after the timeout')
          else if (attempt > 0) {
            states?.add('non-step in progress')
            skipped = { at: now, law: LAWS.notStep }
          }
          return { returned: false, progress: progress(), law: LAWS.notStep }
        }
        if (steps.length === 0) {
          states?.add('empty sequence')
          return { returned: 'either', progress: 0, law: LAWS.steps }
        }
        const passive = LOCK_AND_DEAD.has(press)
        const gap = now - stepTime
        // Past the timeout, the press is judged as a new attempt
        const timedOut = late()
        const at = timedOut ? 0 : attempt
        const next = steps[at]!
        const continues = matches(next, press, platform)
        const startsOver = at > 0 && !continues
        const first = startsOver && matches(steps[0]!, press, platform)
        // The law that decides this press
        let law: Law = passive
          ? LAWS.lockDead
          : startsOver
            ? LAWS.restart
            : LAWS.steps
        if (attempt > 0) {
          if (gap === timeout) states?.add('in time at exactly the timeout')
          if (plan.timeout === undefined && (gap === 1000 || gap === 1001))
            states?.add('default timeout boundary')
          if (
            timedOut &&
            skipped !== undefined &&
            now - skipped.at <= timeout
          ) {
            states?.add(
              skipped.law === LAWS.notStep
                ? 'non-step does not extend the timeout'
                : 'lock or dead key does not extend the timeout',
            )
            law = skipped.law
          } else if (gap >= timeout) law = LAWS.timeout
          else if (
            setBy === LAWS.restart &&
            replaced !== undefined &&
            now - replaced > timeout
          ) {
            states?.add('restart moves the step time')
            law = LAWS.restart
          }
          if (timedOut) states?.add('past the timeout')
        }
        let returned = false
        if (continues) {
          if (passive) states?.add('lock or dead key advances')
          moveStepTime(LAWS.steps)
          if (at + 1 === steps.length) {
            states?.add(
              steps.length === 1 ? 'one-step sequence completes' : 'completes',
            )
            attempt = 0
            returned = true
          } else attempt = at + 1
        } else if (startsOver) {
          if (passive && first)
            states?.add('lock or dead key matches the first step mid-sequence')
          if (first && !(passive && reading.firstStep === 'keep')) {
            if (!passive) states?.add('wrong key restarts at the first step')
            moveStepTime(LAWS.restart)
            attempt = 1
          } else if (passive) {
            states?.add('lock or dead key keeps progress')
            skipped = { at: now, law: LAWS.lockDead }
          } else {
            states?.add('wrong key starts over')
            attempt = 0
          }
        } else attempt = 0
        return { returned, progress: progress(), law }
      }
    }
  })
  return { create: 0, actions }
}

function model(plan: Plan): Expected {
  const states = new Set<string>()
  const readings = READINGS.map((reading, index) =>
    simulate(plan, reading, index === 0 ? states : undefined),
  )
  return { readings, states: [...states] }
}

// ---------------------------------------------------------------------------
// The driver
// ---------------------------------------------------------------------------

/** What one call did: its return, `getProgress()` after it, and any throw. */
interface Did {
  returned: unknown
  progress: unknown
  threw: string | null
}

const stepValue = (step: Step): RegisterableHotkeySequence[number] =>
  step === 'object Mod+K' ? { key: 'K', mod: true } : step

const errorText = (error: unknown) =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error)

/** A wall-clock time to start each history at, as a browser's `Date.now()` reads. */
const START_MS = 1_700_000_000_000

/**
 * Runs the plan through the real matcher on a virtual clock. The matcher
 * reads time only from `Date.now()`, so the driver stubs that one read and
 * moves it by each wait. Installing fake timers (`useOracleClock`) reads the
 * real clock from inside the test, and the gap check then cannot compare the
 * test's work, which would turn the work bound off. Detection reads the
 * browser's user agent, so the driver sets it to the plan's detected platform
 * and puts the test platform back after.
 */
function driver(
  plan: Plan,
  observe: (checkpoint: string, value: unknown) => void,
) {
  let now = START_MS
  const clock = vi.spyOn(Date, 'now').mockImplementation(() => now)
  try {
    setTestPlatform(plan.detected)
    const steps = plan.steps.map(stepValue)
    let matcher: ReturnType<typeof createSequenceMatcher>
    try {
      matcher =
        plan.omitOptions &&
        plan.timeout === undefined &&
        plan.platform === undefined
          ? createSequenceMatcher(steps)
          : createSequenceMatcher(steps, {
              timeout: plan.timeout,
              platform: plan.platform,
            })
      observe('create', { progress: matcher.getProgress(), threw: null })
    } catch (error) {
      observe('create', { progress: null, threw: errorText(error) })
      return
    }
    for (const [index, action] of plan.actions.entries()) {
      let did: Did
      try {
        let returned: unknown = 'none'
        switch (action.kind) {
          case 'press':
            returned = matcher.match(KEYDOWNS[action.press])
            break
          case 'wait':
            now += action.ms
            break
          case 'reset':
            matcher.reset()
            break
        }
        did = { returned, progress: matcher.getProgress(), threw: null }
      } catch (error) {
        did = { returned: null, progress: null, threw: errorText(error) }
      }
      observe(`action ${index}`, did)
      if (did.threw !== null) return
    }
  } finally {
    setTestPlatform(testPlatform())
    clock.mockRestore()
  }
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

interface Divergence {
  at: number
  checkpoint: string
  law: Law
  actual: unknown
  expected: unknown
}

/** The first call where the trace leaves one reading's owed trace. */
function firstDivergence(
  plan: Plan,
  trace: ReadonlyArray<Observation>,
  owed: { create: number; actions: Array<Owed> },
): Divergence | undefined {
  const byCheckpoint = new Map(trace.map((o) => [o.checkpoint, o.value]))
  const created = byCheckpoint.get('create') as Did | undefined
  if (created === undefined || created.threw !== null)
    return {
      at: -1,
      checkpoint: 'create',
      law: LAWS.noThrow,
      actual: created,
      expected: 'returns',
    }
  if (created.progress !== owed.create)
    return {
      at: -1,
      checkpoint: 'create',
      law: LAWS.steps,
      actual: created.progress,
      expected: owed.create,
    }
  for (const [index, want] of owed.actions.entries()) {
    const checkpoint = `action ${index}`
    const did = byCheckpoint.get(checkpoint) as Did | undefined
    if (did === undefined || did.threw !== null)
      return {
        at: index,
        checkpoint,
        law: LAWS.noThrow,
        actual: did,
        expected: 'returns',
      }
    const returnedOk =
      want.returned === 'either'
        ? typeof did.returned === 'boolean'
        : did.returned === want.returned
    if (!returnedOk || did.progress !== want.progress)
      return {
        at: index,
        checkpoint,
        law: want.law,
        actual: { action: plan.actions[index], ...did },
        expected: {
          action: plan.actions[index],
          returned: want.returned,
          progress: want.progress,
        },
      }
  }
  return undefined
}

/**
 * Production passes when its trace follows some reading to the end.
 * Otherwise the reading it followed longest decides where it went wrong, and
 * the law of that call is the law it broke. Each property reports only its
 * own law, so a failure names one law.
 */
function checkLaw(law: Law) {
  return (
    plan: Plan,
    trace: ReadonlyArray<Observation>,
    expected: Expected,
  ): Verdict => {
    let worst: Divergence | undefined
    for (const owed of expected.readings) {
      const divergence = firstDivergence(plan, trace, owed)
      if (divergence === undefined) return pass
      if (worst === undefined || divergence.at > worst.at) worst = divergence
    }
    if (worst === undefined || worst.law !== law) return pass
    return violation(
      worst.checkpoint,
      `call ${worst.checkpoint} breaks '${law}': the matcher returned or reported something no reading of the law allows`,
      law,
      { actual: worst.actual, expected: worst.expected },
    )
  }
}

// ---------------------------------------------------------------------------
// Constructed histories: each enters the states its law needs, on any base
// ---------------------------------------------------------------------------

const press = (name: Press): HistoryAction => ({ kind: 'press', press: name })
const wait = (base: WaitBase, delta = 0): HistoryAction => ({
  kind: 'wait',
  base,
  delta,
})
const RESET: HistoryAction = { kind: 'reset' }

/**
 * A timeout above 0, so presses at the same ms are in time and belong to the
 * law the history is for, not to the timeout law.
 */
const aboveZero = (base: History): Partial<History> => ({
  timeout: base.timeout === 0 ? 300 : base.timeout,
})

/** A fresh matcher with these steps, then these actions, then the base's own actions. */
const opening =
  (
    steps: Array<Step>,
    actions: Array<HistoryAction>,
    options: (base: History) => Partial<History> = aboveZero,
  ) =>
  (base: History): History => ({
    ...base,
    ...options(base),
    steps,
    actions: [...actions, ...base.actions].slice(0, MAX_ACTIONS),
  })

/** A timeout long enough that half of it, plus 1 ms, is still less than it. */
const roomy = (base: History): Partial<History> => ({
  timeout: base.timeout !== undefined && base.timeout < 3 ? 300 : base.timeout,
})

const CONSTRUCTED: Record<string, (base: History) => History> = {
  completes: opening(['G', 'H'], [press('g'), press('h')]),
  'one-step sequence completes': opening(['Shift+G'], [press('Shift+g')]),
  'in time at exactly the timeout': opening(
    ['G', 'H'],
    [press('g'), wait('timeout'), press('h')],
    () => ({}),
  ),
  'past the timeout': opening(
    ['G', 'H'],
    [press('g'), wait('timeout', 1), press('h')],
    () => ({}),
  ),
  'default timeout boundary': opening(
    ['G', 'H'],
    [
      press('g'),
      wait('timeout'),
      press('h'),
      press('g'),
      wait('timeout', 1),
      press('h'),
    ],
    () => ({ timeout: undefined }),
  ),
  // The hook: G G G H does not complete ['G', 'G', 'H']
  'wrong key restarts at the first step': opening(
    ['G', 'G', 'H'],
    [press('g'), press('g'), press('g'), press('h')],
  ),
  'wrong key starts over': opening(
    ['G', 'H'],
    [press('g'), press('x'), press('h')],
  ),
  'restart moves the step time': opening(
    ['G', 'H'],
    [press('g'), wait('half', 1), press('g'), wait('half', 1), press('h')],
    roomy,
  ),
  'non-step in progress': opening(
    ['G', 'H'],
    [
      press('g'),
      press('Shift'),
      press('repeat g'),
      press('IME'),
      press('AltGraph'),
      press('h'),
    ],
  ),
  'non-step does not extend the timeout': opening(
    ['G', 'H'],
    [press('g'), wait('half', 1), press('Shift'), wait('half', 1), press('h')],
    roomy,
  ),
  'lock or dead key keeps progress': opening(
    ['G', 'H'],
    [
      press('g'),
      press('CapsLock'),
      press('Dead'),
      press('NumLock'),
      press('h'),
    ],
  ),
  'lock or dead key advances': opening(
    ['G', 'CapsLock', '[Quote]'],
    [press('g'), press('CapsLock'), press('Dead')],
  ),
  'lock or dead key does not extend the timeout': opening(
    ['G', 'H'],
    [
      press('g'),
      wait('half', 1),
      press('CapsLock'),
      wait('half', 1),
      press('h'),
    ],
    roomy,
  ),
  'reset in progress': opening(['G', 'H'], [press('g'), RESET, press('h')]),
  'empty sequence': opening(
    [],
    [press('g'), press('CapsLock'), press('Shift'), RESET, press('x')],
  ),
}

const ALL_STATES = [...Object.values(STATES).flat(), ...OPEN_STATES]

/** The generated source of one law's property: its states are declared, the others measured. */
function historiesFor(law: Law) {
  const own: ReadonlyArray<string> = STATES[law]
  return {
    arbitrary: historyArbitrary,
    states: own,
    measured: ALL_STATES.filter((state) => !own.includes(state)),
    runs: 100,
    fixedSeeds: [20261121],
    constructed: own.map((name) => ({
      name,
      enters: [name],
      build: CONSTRUCTED[name]!,
    })),
    fixed: law === LAWS.lockDead ? [FIRST_STEP_MID_SEQUENCE] : [],
  }
}

/**
 * The open case of a lock key that matches the first step mid-sequence,
 * where the two readings differ: a new attempt leaves progress at 2 after the
 * next `g`, and keeping the attempt completes on it.
 */
const FIRST_STEP_MID_SEQUENCE = {
  name: 'CapsLock on the first step mid-sequence',
  enters: ['lock or dead key matches the first step mid-sequence'],
  history: {
    steps: ['CapsLock', 'G', 'H'] as Array<Step>,
    timeout: 300,
    platform: 'linux' as const,
    detected: 'linux' as const,
    omitOptions: false,
    actions: [
      press('CapsLock'),
      press('g'),
      press('CapsLock'),
      press('g'),
      press('h'),
    ],
  } satisfies History,
}

/** A wrong answer at the first call of this law in a history: the check must reject it. */
function wrongAt(law: Law, history: string) {
  return {
    name: `wrong answer under '${law}'`,
    law,
    history: { constructed: history },
    corrupt: (trace: ReadonlyArray<Observation>, plan: Plan) => {
      const owed = model(plan).readings[0]!
      // A planted throw goes on the first call; other wrong answers go on the
      // first call that the law decides (a new matcher's progress for steps)
      const index =
        law === LAWS.noThrow
          ? 0
          : law === LAWS.steps
            ? -1
            : owed.actions.findIndex((call) => call.law === law)
      const checkpoint = index === -1 ? 'create' : `action ${index}`
      if (law !== LAWS.steps && index === -1) return undefined
      return trace.map((o) =>
        o.checkpoint !== checkpoint
          ? o
          : {
              ...o,
              value:
                law === LAWS.noThrow
                  ? { returned: null, progress: null, threw: 'Error: planted' }
                  : { ...(o.value as Did), progress: 99 },
            },
      )
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

// ---------------------------------------------------------------------------
// The laws
// ---------------------------------------------------------------------------

oracleProperty({
  ...shared,
  id: 'sequence matcher: steps in order',
  owns: ['src/match.ts#createSequenceMatcher'],
  law: {
    statement:
      "For every sequence of one or more steps and every stream of key presses, a new matcher's getProgress() is 0; a press that matches the next step, in time, adds one to getProgress(), and the press that matches the last step makes match return true and getProgress() return to 0; every other call to match returns false.",
    authority: `src/match.ts createSequenceMatcher JSDoc example ("if (matcher.match(event)) ... 'Sequence matched!'"); docs/framework/react/guides/hotkey-manager.md:142 ("getProgress() returns the number of steps matched so far, and reset() starts over"); tests/sequence-manager.test.ts:898-908 ("should match sequence": progress 1, then true and progress 0). ${APPROVAL}`,
    limits:
      'An empty sequence may return either boolean from match; it is held only to progress 0 and to returning. The match relation of each step is a table of documented cases; the key-matching oracle owns it.',
  },
  histories: historiesFor(LAWS.steps),
  check: checkLaw(LAWS.steps),
  // Two fast paths keep the same answers with less work: the platform is
  // resolved once, when the matcher is created, not on every press; and a
  // press that does not match the first step from 0 is not matched against
  // the first step a second time.
  work: { ratio: 1 },
  calibrations: [wrongAt(LAWS.steps, 'completes')],
})

oracleProperty({
  ...shared,
  id: 'sequence matcher: timeout',
  owns: ['src/match.ts#createSequenceMatcher'],
  law: {
    statement:
      'For every timeout t from 0 up (1000 when the option is left out), a press more than t ms after the last press that counted as a step is judged as the start of a new attempt, and a press exactly t ms after it is still in time.',
    authority: `docs/framework/react/guides/sequences.md:63 ("Each step must follow the previous one within timeout milliseconds, 1000 by default"); docs/guides/sensible-defaults.md:445 ("completes when each step follows the previous one within 1 second"); tests/sequence-manager.test.ts:930-937 ("should respect timeout"); tests/invariants/sequence-fuzz.test.ts:88 (the model's "now - this.last > TIMEOUT"). ${APPROVAL}`,
    limits:
      'getProgress() read after the timeout has passed, before the next press, may report the old attempt or 0: the guide says progress clears when the timeout passes, and the matcher fuzz test says it clears on the next press. Timeouts below 0 and NaN are not generated.',
  },
  histories: historiesFor(LAWS.timeout),
  check: checkLaw(LAWS.timeout),
  calibrations: [wrongAt(LAWS.timeout, 'past the timeout')],
})

oracleProperty({
  ...shared,
  id: 'sequence matcher: wrong key restarts',
  owns: ['src/match.ts#createSequenceMatcher'],
  law: {
    statement:
      'For every press that is a step and does not continue the attempt in progress, getProgress() becomes 1 when the press matches the first step, with the next step timed from this press, and 0 otherwise.',
    authority: `docs/framework/react/guides/sequences.md:74 ("A key that doesn't continue the sequence starts it over. If that key is the sequence's first step, it begins a new attempt, so G X G G completes ['G', 'G']"); docs/guides/sensible-defaults.md:452; tests/sequence-manager.test.ts:910-918 ("should reset on wrong key"). ${APPROVAL}`,
    limits:
      'The matcher never looks for a later start inside the presses already made; the law says so by restarting only at the press that breaks the attempt.',
  },
  histories: historiesFor(LAWS.restart),
  check: checkLaw(LAWS.restart),
  calibrations: [wrongAt(LAWS.restart, 'wrong key restarts at the first step')],
})

oracleProperty({
  ...shared,
  id: 'sequence matcher: not a step',
  owns: ['src/match.ts#createSequenceMatcher'],
  law: {
    statement:
      'For every auto-repeat, modifier press (Shift, Control, AltGraph), or press an input method editor reads, match returns false, getProgress() stays as it was, and the next step is still timed from the last press that counted.',
    authority: `src/match.ts createSequenceMatcher JSDoc ("Modifier presses, auto-repeats, and keys an input method editor reads are not steps"); docs/framework/react/guides/sequences.md:75-76; docs/guides/sensible-defaults.md:449,451; tests/sequence-manager.test.ts:1186-1198 ("ignoring events does not extend the standalone timeout") and 1254-1276 ("repeat events neither begin a sequence nor extend its timeout"); .changeset history: altgr-sequence-steps ("An AltGr press is now skipped like a Control, Shift, Alt, or Meta press ... in createSequenceMatcher"). ${APPROVAL}`,
    limits:
      'Only keydown events are generated, so a keyup repeat is not tried.',
  },
  histories: historiesFor(LAWS.notStep),
  check: checkLaw(LAWS.notStep),
  calibrations: [wrongAt(LAWS.notStep, 'non-step in progress')],
})

oracleProperty({
  ...shared,
  id: 'sequence matcher: lock and dead keys',
  owns: ['src/match.ts#createSequenceMatcher'],
  law: {
    statement:
      'For every CapsLock, NumLock, or dead-key press, the press advances the attempt when it matches the next step (the first step, from 0), and when it matches neither the next step nor the first step it leaves getProgress() and the step timing as they were.',
    authority: `src/match.ts createSequenceMatcher JSDoc ("Lock keys such as CapsLock and NumLock, Fn, and dead keys advance the sequence when they match the next step and otherwise keep its progress"); docs/framework/react/guides/sequences.md:77; docs/guides/sensible-defaults.md:450; .changeset history: sequence-lock-and-dead-keys ("These keys now count only when they match a step ... in createSequenceMatcher"); tests/sequence-manager.test.ts:740-767; tests/invariants/sequence-fuzz.test.ts:404-421. ${APPROVAL}`,
    limits:
      'A lock or dead key that matches the first step mid-sequence, and not the next step, may start a new attempt (the fuzz test and the guide\'s restart rule) or keep the attempt (the JSDoc\'s "otherwise keep its progress"). Fn, FnLock, and ScrollLock are not generated.',
  },
  histories: historiesFor(LAWS.lockDead),
  check: checkLaw(LAWS.lockDead),
  calibrations: [wrongAt(LAWS.lockDead, 'lock or dead key keeps progress')],
})

oracleProperty({
  ...shared,
  id: 'sequence matcher: reset',
  owns: ['src/match.ts#createSequenceMatcher'],
  law: {
    statement:
      'For every state of the matcher, reset() makes getProgress() 0, and the next press is judged against the first step.',
    authority: `docs/framework/react/guides/hotkey-manager.md:142 ("reset() starts over"); tests/sequence-manager.test.ts:920-928 ("should reset manually"). ${APPROVAL}`,
    limits: 'None beyond the shared limits in the file header.',
  },
  histories: historiesFor(LAWS.reset),
  check: checkLaw(LAWS.reset),
  calibrations: [wrongAt(LAWS.reset, 'reset in progress')],
})

oracleProperty({
  ...shared,
  id: 'sequence matcher: no throw',
  owns: ['src/match.ts#createSequenceMatcher'],
  law: {
    statement:
      'For every sequence of the generated steps, empty included, and every keydown press, createSequenceMatcher, match, reset, and getProgress return without throwing.',
    authority: `The signature of createSequenceMatcher in src/match.ts: it returns { match: (event) => boolean, reset: () => void, getProgress: () => number }. ${APPROVAL}`,
    limits: 'Only the steps and presses of this file are generated.',
  },
  histories: historiesFor(LAWS.noThrow),
  check: checkLaw(LAWS.noThrow),
  calibrations: [wrongAt(LAWS.noThrow, 'empty sequence')],
})
