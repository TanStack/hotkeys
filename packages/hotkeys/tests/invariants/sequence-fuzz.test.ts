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
