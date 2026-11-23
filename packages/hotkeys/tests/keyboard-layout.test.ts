import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatForDisplay,
  getKeyboardLayoutStore,
  loadKeyboardLayout,
} from '../src'

const AZERTY = [
  ['KeyQ', 'a'],
  ['KeyA', 'q'],
] as const
const QWERTZ = [
  ['KeyY', 'z'],
  ['KeyZ', 'y'],
] as const

const stops: Array<() => void> = []
const load = () => {
  const stop = loadKeyboardLayout()
  stops.push(stop)
  return stop
}
/** Lets the pending `getLayoutMap()` promise settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve))

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(
  result: () => Promise<Iterable<readonly [string, string]>>,
) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { keyboard: { getLayoutMap } })
  return getLayoutMap
}

afterEach(() => {
  stops.splice(0).forEach((stop) => stop())
  // The layout outlives its callers, so clear it between tests
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
})

describe('loadKeyboardLayout', () => {
  it('loads nothing until it is called', () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(new Map(AZERTY)))
    expect(getKeyboardLayoutStore().state).toBeNull()
    expect(getLayoutMap).not.toHaveBeenCalled()
  })

  it("loads the browser's layout into the store", async () => {
    stubLayout(() => Promise.resolve(new Map(AZERTY)))
    const seen: Array<unknown> = []
    const { unsubscribe } = getKeyboardLayoutStore().subscribe((layout) =>
      seen.push(layout),
    )
    load()
    expect(getKeyboardLayoutStore().state).toBeNull()
    await settle()
    const layoutMap = getKeyboardLayoutStore().state!
    expect([...layoutMap]).toEqual(AZERTY)
    expect(seen).toEqual([layoutMap])
    expect(
      formatForDisplay('Mod+[KeyQ]', { platform: 'windows', layoutMap }),
    ).toBe('Ctrl+A')
    unsubscribe()
  })

  it('reads the layout again when the window regains focus', async () => {
    let entries: Iterable<readonly [string, string]> = AZERTY
    const getLayoutMap = stubLayout(() => Promise.resolve(new Map(entries)))
    load()
    await settle()
    const first = getKeyboardLayoutStore().state
    // An unchanged layout keeps its identity, so labels don't render again
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect(getLayoutMap).toHaveBeenCalledTimes(2)
    expect(getKeyboardLayoutStore().state).toBe(first)

    entries = QWERTZ
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect([...getKeyboardLayoutStore().state!]).toEqual(QWERTZ)
  })

  it('reads the layout once for callers that overlap', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(new Map(AZERTY)))
    load()
    load()
    load()
    await settle()
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('stops refreshing when the last caller stops, and keeps the layout', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(new Map(AZERTY)))
    const stopFirst = load()
    const stopSecond = load()
    await settle()
    stopFirst()
    // Stopping twice counts once
    stopFirst()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledTimes(2)

    stopSecond()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledTimes(2)
    // The next label has the layout at once
    expect([...getKeyboardLayoutStore().state!]).toEqual(AZERTY)
  })

  it('reads the layout again for the next first caller', async () => {
    let entries: Iterable<readonly [string, string]> = AZERTY
    stubLayout(() => Promise.resolve(new Map(entries)))
    load()()
    await settle()
    entries = QWERTZ
    load()
    expect([...getKeyboardLayoutStore().state!]).toEqual(AZERTY)
    await settle()
    expect([...getKeyboardLayoutStore().state!]).toEqual(QWERTZ)
  })

  it('keeps the newest layout when an older request settles last', async () => {
    const resolvers: Array<
      (value: Iterable<readonly [string, string]>) => void
    > = []
    stubLayout(() => new Promise((resolve) => resolvers.push(resolve)))
    load()
    window.dispatchEvent(new Event('focus'))
    resolvers[1]!(QWERTZ)
    await settle()
    resolvers[0]!(AZERTY)
    await settle()
    expect([...getKeyboardLayoutStore().state!]).toEqual(QWERTZ)
  })

  it('keeps an older layout when a newer read fails', async () => {
    const reads: Array<{
      resolve: (value: Iterable<readonly [string, string]>) => void
      reject: (reason: unknown) => void
    }> = []
    stubLayout(
      () => new Promise((resolve, reject) => reads.push({ resolve, reject })),
    )
    load()
    window.dispatchEvent(new Event('focus'))
    reads[0]!.resolve(AZERTY)
    reads[1]!.reject(new Error('gone'))
    await settle()
    expect([...getKeyboardLayoutStore().state!]).toEqual(AZERTY)
  })

  it('does not throw for a broken layout API, and still stops cleanly', async () => {
    const getLayoutMap = vi.fn(() => 'not a promise')
    vi.stubGlobal('navigator', { keyboard: { getLayoutMap } })
    const stop = load()
    await settle()
    expect(getKeyboardLayoutStore().state).toBeNull()
    stop()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it.each([
    ['has no keyboard API', () => vi.stubGlobal('navigator', {})],
    [
      'refuses, as in a cross-origin frame',
      () =>
        stubLayout(() =>
          Promise.reject(new DOMException('Not allowed', 'SecurityError')),
        ),
    ],
    [
      'throws',
      () =>
        vi.stubGlobal('navigator', {
          keyboard: {
            getLayoutMap: () => {
              throw new Error('Unsupported')
            },
          },
        }),
    ],
  ])('leaves the layout empty when the browser %s', async (_, stub) => {
    stub()
    load()
    await settle()
    expect(getKeyboardLayoutStore().state).toBeNull()
  })

  it('keeps the last layout when a later read fails', async () => {
    let fail = false
    stubLayout(() =>
      fail ? Promise.reject(new Error('gone')) : Promise.resolve(AZERTY),
    )
    load()
    await settle()
    fail = true
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect([...getKeyboardLayoutStore().state!]).toEqual(AZERTY)
  })
})
