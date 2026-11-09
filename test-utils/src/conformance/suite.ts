import {
  HotkeyManager,
  KeyStateTracker,
  getHotkeyManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import { keydown, keyup } from '../events'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'
import type { KeyOptions } from '../events'
import type {
  ConformanceFeature,
  ConformanceHarness,
  ConformanceRunner,
  Expect,
} from './types'

/** What every case receives. */
export interface CaseContext {
  harness: ConformanceHarness
  expect: Expect
  /** Dispatches a keydown (on the document unless `target` is set) and settles. */
  press: (options: KeyOptions) => Promise<KeyboardEvent>
  /** Dispatches a keyup and settles. */
  release: (options: KeyOptions) => Promise<KeyboardEvent>
  /** Fires a window blur and settles. */
  blurWindow: () => Promise<void>
  /** Runs a change and settles. */
  act: (change: () => unknown) => Promise<void>
  /** Counts the live subscriptions on a store from now on. */
  trackSubscriptions: (store: SubscribableStore) => () => number
}

interface SubscribableStore {
  subscribe: (listener: never) => { unsubscribe: () => void }
}

export interface ConformanceCase {
  title: string
  /** Features the case needs. It is skipped when the harness lacks one. */
  requires?: Array<ConformanceFeature>
  /** A bug every adapter shares. Adapter-only bugs go in `knownBugs`. */
  bug?: string
  run: (context: CaseContext) => Promise<void>
}

export interface ConformanceGroup {
  name: string
  requires?: Array<ConformanceFeature>
  cases: Array<ConformanceCase>
}

/** A function the suite can count calls of, without a runner's mock API. */
export interface Spy<TArgs extends Array<unknown> = Array<any>> {
  (...args: TArgs): void
  calls: Array<TArgs>
}

export function spy<TArgs extends Array<unknown> = Array<any>>(): Spy<TArgs> {
  const fn = ((...args: TArgs) => {
    fn.calls.push(args)
  }) as Spy<TArgs>
  fn.calls = []
  return fn
}

/** The manager's registrations, read from core. */
export function registered(): Array<HotkeyRegistrationView> {
  return Array.from(
    getHotkeyManager().registrations.state.values(),
    toHotkeyRegistrationView,
  )
}

/** Every registered case group, in order. */
const groups: Array<ConformanceGroup> = []

export function defineGroup(group: ConformanceGroup): void {
  groups.push(group)
}

function resetSingletons() {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
}

/**
 * Registers every shared case with `runner`, against `harness`. Each case
 * starts with fresh core singletons, and the harness unmounts its views
 * after it.
 */
export function runConformanceSuite(
  runner: ConformanceRunner,
  harness: ConformanceHarness,
): void {
  const restores: Array<() => void> = []
  const settle = async (change: () => unknown) => {
    await harness.act(change)
  }

  const context: CaseContext = {
    harness,
    expect: runner.expect,
    act: settle,
    press: async (options) => {
      let event!: KeyboardEvent
      await settle(() => (event = keydown({ target: document, ...options })))
      return event
    },
    release: async (options) => {
      let event!: KeyboardEvent
      await settle(() => (event = keyup({ target: document, ...options })))
      return event
    },
    blurWindow: () => settle(() => window.dispatchEvent(new Event('blur'))),
    trackSubscriptions(store) {
      const subscribe = store.subscribe
      const own = Object.prototype.hasOwnProperty.call(store, 'subscribe')
      let active = 0
      store.subscribe = (listener: never) => {
        const subscription = subscribe.call(store, listener)
        let live = true
        active++
        return {
          unsubscribe() {
            if (live) active--
            live = false
            subscription.unsubscribe()
          },
        }
      }
      restores.push(() => {
        if (own) store.subscribe = subscribe
        else delete (store as Partial<SubscribableStore>).subscribe
      })
      return () => active
    },
  }

  runner.describe(`${harness.name} conformance`, () => {
    runner.beforeEach(async () => {
      resetSingletons()
      await harness.setup?.()
    })
    runner.afterEach(async () => {
      await harness.cleanup()
      while (restores.length) restores.pop()!()
      resetSingletons()
    })

    for (const group of groups) {
      runner.describe(group.name, () => {
        for (const test of group.cases) {
          register(runner, harness, group, test, context)
        }
      })
    }
  })
}

function register(
  runner: ConformanceRunner,
  harness: ConformanceHarness,
  group: ConformanceGroup,
  test: ConformanceCase,
  context: CaseContext,
) {
  const body = () => test.run(context)
  const requires = [...(group.requires ?? []), ...(test.requires ?? [])]
  const missing = requires.find((feature) => harness.unsupported?.[feature])
  if (missing) {
    const reason = harness.unsupported![missing]!
    runner.skip(`${test.title} (no ${missing}: ${reason})`, body)
    return
  }
  const bug = test.bug ?? harness.knownBugs?.[caseKey(group, test)]
  if (bug) {
    const name = `${bug}: ${test.title}`
    if (runner.fails) runner.fails(name, body)
    else runner.skip(name, body)
    return
  }
  runner.it(test.title, body)
}

/** The key for a case in a harness's `knownBugs`: `'group > title'`. */
export function caseKey(
  group: Pick<ConformanceGroup, 'name'>,
  test: Pick<ConformanceCase, 'title'>,
): string {
  return `${group.name} > ${test.title}`
}

/** Every case key, so a harness can check its `knownBugs` for typos. */
export function conformanceCaseKeys(): Array<string> {
  return groups.flatMap((group) =>
    group.cases.map((test) => caseKey(group, test)),
  )
}

const callbackIds = new WeakMap<object, number>()
let nextCallbackId = 0

/**
 * A stable key for each entry, from its callback's identity. Harnesses whose
 * single-hotkey call keeps its first callback render one keyed component per
 * entry with it, so changing an entry's hotkey or options updates that
 * component, as an app would, instead of remounting it.
 */
export function entryKeys(
  entries: ReadonlyArray<{ callback: object }>,
): Array<string> {
  const seen = new Map<number, number>()
  return entries.map(({ callback }) => {
    let id = callbackIds.get(callback)
    if (id === undefined) callbackIds.set(callback, (id = nextCallbackId++))
    const count = seen.get(id) ?? 0
    seen.set(id, count + 1)
    return `${id}:${count}`
  })
}
