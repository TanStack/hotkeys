import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import fc from 'fast-check'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  createSequenceMatcher,
  toHotkeyRegistrationView,
} from '../../src'
import type { HotkeySequenceRegistrationView } from '../../src'

// Random key presses, releases, repeats and pauses against sequences on fake
// timers. A small model of the documented rules says what should fire:
// - each step must follow the last one within `timeout` ms;
// - a key that doesn't continue a sequence starts it over, and begins a new
//   attempt if it is the first step;
// - repeats and modifier presses neither advance nor reset a sequence;
// - a sequence registered for keyup advances on releases instead of presses.

const RUNS = {
  seed: Number(process.env.HOTKEYS_FUZZ_SEED ?? 20261108),
  numRuns: Number(process.env.HOTKEYS_FUZZ_RUNS ?? 150),
}
const TIMEOUT = 300
const KEYS = ['A', 'B', 'C'] as const
type Key = (typeof KEYS)[number]

type Action =
  | { type: 'down'; key: Key | 'Shift'; repeat: boolean }
  | { type: 'up'; key: Key | 'Shift' }
  | { type: 'wait'; ms: number }

const action: fc.Arbitrary<Action> = fc.oneof(
  {
    weight: 4,
    arbitrary: fc.record({
      type: fc.constant('down' as const),
      key: fc.constantFrom<Key | 'Shift'>(...KEYS, 'Shift'),
      repeat: fc.boolean(),
    }),
  },
  {
    weight: 3,
    arbitrary: fc.record({
      type: fc.constant('up' as const),
      key: fc.constantFrom<Key | 'Shift'>(...KEYS, 'Shift'),
    }),
  },
  {
    weight: 2,
    arbitrary: fc.record({
      type: fc.constant('wait' as const),
      // Gaps cluster around the timeout, where off-by-one errors live
      ms: fc.oneof(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: TIMEOUT - 2, max: TIMEOUT + 2 }),
        fc.integer({ min: 0, max: TIMEOUT * 3 }),
      ),
    }),
  },
)

const sequence = fc.array(fc.constantFrom(...KEYS), {
  minLength: 2,
  maxLength: 4,
})

const registrations = fc.array(
  fc.record({
    steps: sequence,
    eventType: fc.constantFrom('keydown' as const, 'keyup' as const),
  }),
  { minLength: 1, maxLength: 3 },
)

/** Reference model of one sequence registration. */
class Model {
  index = 0
  last = 0
  fired = 0

  constructor(
    readonly steps: ReadonlyArray<Key>,
    readonly eventType: 'keydown' | 'keyup',
  ) {}

  /** Steps matched in the current attempt at `now`. */
  progress(now: number): number {
    return this.index > 0 && now - this.last > TIMEOUT ? 0 : this.index
  }

  step(key: Key, now: number): void {
    this.index = this.progress(now)
    if (key === this.steps[this.index]) {
      this.index++
      this.last = now
      if (this.index === this.steps.length) {
        this.index = 0
        this.fired++
      }
    } else if (this.index > 0) {
      this.index = key === this.steps[0] ? 1 : 0
      if (this.index) this.last = now
    }
  }
}

const CODES: Record<Key | 'Shift', string> = {
  A: 'KeyA',
  B: 'KeyB',
  C: 'KeyC',
  Shift: 'ShiftLeft',
}

beforeEach(() => {
  vi.useFakeTimers({ now: 1_000_000 })
})

afterEach(() => {
  HotkeyManager.resetInstance()
  vi.useRealTimers()
})

function view(id: string): HotkeySequenceRegistrationView {
  const registration = HotkeyManager.getInstance().registrations.state.get(id)!
  return toHotkeyRegistrationView(
    registration,
  ) as HotkeySequenceRegistrationView
}

describe('sequence timing under random input', () => {
  it('the manager fires, advances and resets sequences as the model does', () => {
    fc.assert(
      fc.property(
        registrations,
        fc.array(action, { maxLength: 40 }),
        (specs, actions) => {
          HotkeyManager.resetInstance()
          const manager = HotkeyManager.getInstance()
          const live = specs.map(({ steps, eventType }) => {
            const model = new Model(steps, eventType)
            const callback = vi.fn()
            const handle = manager.register(steps, callback, {
              eventType,
              timeout: TIMEOUT,
              conflictBehavior: 'allow',
            })
            return { model, callback, handle }
          })
          for (const act of actions) {
            if (act.type === 'wait') {
              vi.advanceTimersByTime(act.ms)
            } else {
              const shift = act.key === 'Shift'
              const init = {
                key: shift ? 'Shift' : act.key.toLowerCase(),
                code: CODES[act.key],
                shiftKey: shift && act.type === 'down',
              }
              if (act.type === 'down') {
                keydown({ ...init, repeat: act.repeat, target: document })
              } else {
                keyup({ ...init, target: document })
              }
              const now = Date.now()
              for (const { model } of live) {
                const counts =
                  !shift &&
                  (act.type === 'down'
                    ? model.eventType === 'keydown' && !act.repeat
                    : model.eventType === 'keyup')
                if (counts) model.step(act.key as Key, now)
              }
            }
            const now = Date.now()
            for (const { model, callback, handle } of live) {
              expect(callback).toHaveBeenCalledTimes(model.fired)
              // The view resets once the timeout passes, without another key
              expect(view(handle.id).matchedStepCount).toBe(model.progress(now))
            }
          }
          for (const { handle } of live) handle.unregister()
        },
      ),
      RUNS,
    )
  })

  it('a chord skips a key that continues a sequence in progress, with its repeats', () => {
    fc.assert(
      fc.property(
        sequence,
        fc.constantFrom(...KEYS),
        fc.array(action, { maxLength: 40 }),
        (steps, chordKey, actions) => {
          HotkeyManager.resetInstance()
          const manager = HotkeyManager.getInstance()
          const model = new Model(steps, 'keydown')
          const sequenceCallback = vi.fn()
          const chordCallback = vi.fn()
          manager.register(steps, sequenceCallback, {
            timeout: TIMEOUT,
            conflictBehavior: 'allow',
          })
          manager.register(chordKey, chordCallback, {
            conflictBehavior: 'allow',
          })
          // Keys whose press continued the sequence: their repeats belong to it too
          const owned = new Set<Key>()
          let chordFires = 0
          for (const act of actions) {
            if (act.type === 'wait') {
              vi.advanceTimersByTime(act.ms)
              continue
            }
            const shift = act.key === 'Shift'
            const init = {
              key: shift ? 'Shift' : act.key.toLowerCase(),
              code: CODES[act.key],
              shiftKey: shift && act.type === 'down',
              target: document,
            }
            const now = Date.now()
            if (act.type === 'up') {
              keyup(init)
              if (!shift) owned.delete(act.key as Key)
            } else {
              if (!shift) {
                const key = act.key as Key
                if (!act.repeat) {
                  const progress = model.progress(now)
                  if (progress > 0 && steps[progress] === key) owned.add(key)
                  else owned.delete(key)
                }
                if (key === chordKey && !owned.has(key)) chordFires++
                if (!act.repeat) model.step(key, now)
              }
              keydown({ ...init, repeat: act.repeat })
            }
            expect(sequenceCallback).toHaveBeenCalledTimes(model.fired)
            expect(chordCallback).toHaveBeenCalledTimes(chordFires)
          }
        },
      ),
      RUNS,
    )
  })

  it('createSequenceMatcher follows the same model', () => {
    fc.assert(
      fc.property(
        sequence,
        fc.array(action, { maxLength: 40 }),
        (steps, actions) => {
          const matcher = createSequenceMatcher(steps, { timeout: TIMEOUT })
          const model = new Model(steps, 'keydown')
          let fired = 0
          for (const act of actions) {
            if (act.type === 'wait') {
              vi.advanceTimersByTime(act.ms)
              continue
            }
            if (act.type === 'up') continue
            const shift = act.key === 'Shift'
            const event = keydown({
              key: shift ? 'Shift' : act.key.toLowerCase(),
              code: CODES[act.key],
              shiftKey: shift,
              repeat: act.repeat,
            })
            if (matcher.match(event)) fired++
            if (!shift && !act.repeat) model.step(act.key as Key, Date.now())
            expect(fired).toBe(model.fired)
            expect(matcher.getProgress()).toBe(
              // The matcher resets lazily, on the next key press
              model.index,
            )
          }
        },
      ),
      RUNS,
    )
  })

  it('a completed or abandoned attempt leaves nothing behind for the next one', () => {
    fc.assert(
      fc.property(
        sequence,
        fc.array(action, { maxLength: 30 }),
        (steps, noise) => {
          HotkeyManager.resetInstance()
          const callback = vi.fn()
          const handle = HotkeyManager.getInstance().register(steps, callback, {
            timeout: TIMEOUT,
          })
          for (const act of noise) {
            if (act.type === 'wait') vi.advanceTimersByTime(act.ms)
            else if (act.type === 'down')
              keydown({
                key: act.key,
                code: CODES[act.key],
                repeat: act.repeat,
                target: document,
              })
            else keyup({ key: act.key, code: CODES[act.key], target: document })
          }
          // After a pause longer than the timeout, the sequence starts fresh
          vi.advanceTimersByTime(TIMEOUT + 1)
          expect(view(handle.id).matchedStepCount).toBe(0)
          const before = callback.mock.calls.length
          for (const key of steps) {
            keydown({
              key: key.toLowerCase(),
              code: CODES[key],
              target: document,
            })
            keyup({
              key: key.toLowerCase(),
              code: CODES[key],
              target: document,
            })
            vi.advanceTimersByTime(TIMEOUT)
          }
          expect(callback).toHaveBeenCalledTimes(before + 1)
          handle.unregister()
        },
      ),
      RUNS,
    )
  })
})

// Lock keys and dead keys between steps (#289): a CapsLock or dead-key event
// counts only when it matches a step of some sequence. One that matches no
// step leaves every sequence's progress alone; one that does is an ordinary
// key for every sequence of its event type.
describe('lock and dead keys under random input', () => {
  // `[Quote]` is a step a dead key on the US apostrophe position can match
  const STEP_KEYS = ['A', 'B', 'CapsLock', '[Quote]'] as const
  type PressKey = 'A' | 'B' | 'CapsLock' | 'Dead' | 'Quote' | 'Shift'
  type PassiveAction =
    | { type: 'down'; key: PressKey; repeat: boolean }
    | { type: 'up'; key: PressKey }
    | { type: 'wait'; ms: number }
  const INIT: Record<PressKey, { key: string; code: string }> = {
    A: { key: 'a', code: 'KeyA' },
    B: { key: 'b', code: 'KeyB' },
    CapsLock: { key: 'CapsLock', code: 'CapsLock' },
    Dead: { key: 'Dead', code: 'Quote' },
    Quote: { key: "'", code: 'Quote' },
    Shift: { key: 'Shift', code: 'ShiftLeft' },
  }
  /** The step a press matches, and whether it keeps progress when it matches none. */
  const STEP: Record<Exclude<PressKey, 'Shift'>, [string, boolean]> = {
    A: ['A', false],
    B: ['B', false],
    CapsLock: ['CapsLock', true],
    Dead: ['[Quote]', true],
    Quote: ['[Quote]', false],
  }
  const anyKey = fc.constantFrom<PressKey>(
    'A',
    'B',
    'CapsLock',
    'Dead',
    'Quote',
    'Shift',
  )
  const passiveAction: fc.Arbitrary<PassiveAction> = fc.oneof(
    {
      weight: 4,
      arbitrary: fc.record({
        type: fc.constant('down' as const),
        key: anyKey,
        repeat: fc.boolean(),
      }),
    },
    {
      weight: 3,
      arbitrary: fc.record({ type: fc.constant('up' as const), key: anyKey }),
    },
    {
      weight: 1,
      arbitrary: fc.record({
        type: fc.constant('wait' as const),
        ms: fc.oneof(
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: TIMEOUT - 2, max: TIMEOUT + 2 }),
        ),
      }),
    },
  )
  const passiveSpecs = fc.array(
    fc.record({
      steps: fc.array(fc.constantFrom(...STEP_KEYS), {
        minLength: 2,
        maxLength: 3,
      }),
      eventType: fc.constantFrom('keydown' as const, 'keyup' as const),
    }),
    { minLength: 1, maxLength: 3 },
  )

  /** Steps every model of one event type through a key, as the manager does. */
  function stepAll(
    models: Array<Model>,
    press: Exclude<PressKey, 'Shift'>,
    now: number,
  ): void {
    const [key, passive] = STEP[press]
    if (passive) {
      const matchesAStep = models.some((model) => {
        const index = model.progress(now)
        return (
          (model.steps[index] as string) === key ||
          (index > 0 && (model.steps[0] as string) === key)
        )
      })
      if (!matchesAStep) return
    }
    for (const model of models) model.step(key as Key, now)
  }

  it('the manager follows the model', () => {
    fc.assert(
      fc.property(
        passiveSpecs,
        // At least a few presses, so most runs reach a sequence in progress
        fc.array(passiveAction, { minLength: 8, maxLength: 40 }),
        (specs, actions) => {
          HotkeyManager.resetInstance()
          const manager = HotkeyManager.getInstance()
          const live = specs.map(({ steps, eventType }) => {
            const model = new Model(steps as never, eventType)
            const callback = vi.fn()
            const handle = manager.register(steps as never, callback, {
              eventType,
              timeout: TIMEOUT,
              conflictBehavior: 'allow',
            })
            return { model, callback, handle }
          })
          for (const act of actions) {
            if (act.type === 'wait') {
              vi.advanceTimersByTime(act.ms)
            } else {
              const shift = act.key === 'Shift'
              const init = {
                ...INIT[act.key],
                shiftKey: shift && act.type === 'down',
              }
              if (act.type === 'down') {
                keydown({ ...init, repeat: act.repeat, target: document })
              } else {
                keyup({ ...init, target: document })
              }
              const eventType = act.type === 'down' ? 'keydown' : 'keyup'
              if (act.key !== 'Shift' && !(act.type === 'down' && act.repeat)) {
                stepAll(
                  live
                    .map(({ model }) => model)
                    .filter((model) => model.eventType === eventType),
                  act.key,
                  Date.now(),
                )
              }
            }
            const now = Date.now()
            for (const { model, callback, handle } of live) {
              expect(callback).toHaveBeenCalledTimes(model.fired)
              expect(view(handle.id).matchedStepCount).toBe(model.progress(now))
            }
          }
          for (const { handle } of live) handle.unregister()
        },
      ),
      // A lock or dead key that completes one sequence while another is in
      // progress is rare
      { ...RUNS, numRuns: Math.max(RUNS.numRuns, 1000) },
    )
  })

  it('createSequenceMatcher follows the model', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...STEP_KEYS), { minLength: 2, maxLength: 3 }),
        // At least a few presses, so most runs reach a sequence in progress
        fc.array(passiveAction, { minLength: 8, maxLength: 40 }),
        (steps, actions) => {
          const matcher = createSequenceMatcher(steps as never, {
            timeout: TIMEOUT,
          })
          const model = new Model(steps as never, 'keydown')
          let fired = 0
          for (const act of actions) {
            if (act.type === 'wait') {
              vi.advanceTimersByTime(act.ms)
              continue
            }
            if (act.type === 'up') continue
            const shift = act.key === 'Shift'
            const event = keydown({
              ...INIT[act.key],
              shiftKey: shift,
              repeat: act.repeat,
            })
            if (matcher.match(event)) fired++
            if (act.key !== 'Shift' && !act.repeat)
              stepAll([model], act.key, Date.now())
            expect(fired).toBe(model.fired)
          }
        },
      ),
      RUNS,
    )
  })
})
