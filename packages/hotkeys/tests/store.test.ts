import { describe, expect, it, vi } from 'vitest'
import { Store as TanStackStore } from '@tanstack/store'
import { createStore as createHotkeysStore } from '../src/_store'
import type { Store } from '../src/_store'

// The same tests run against TanStack Store, so the two can't drift apart.
describe.each<[string, <T>(value: T) => Store<T>]>([
  ['createStore', createHotkeysStore],
  ['TanStack Store', (value) => new TanStackStore(value)],
])('%s', (_, createStore) => {
  it('reads state through state and get', () => {
    const store = createStore({ count: 0 })
    expect(store.state).toEqual({ count: 0 })
    expect(store.get()).toBe(store.state)
    store.setState((prev) => ({ count: prev.count + 1 }))
    expect(store.get()).toEqual({ count: 1 })
  })

  it('notifies listeners synchronously with the new state', () => {
    const store = createStore(0)
    const listener = vi.fn()
    store.subscribe(listener)
    store.setState(() => 1)
    expect(listener).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('accepts an observer object', () => {
    const store = createStore(0)
    const seen: Array<number> = []
    store.subscribe({ next: (value) => seen.push(value) })
    store.setState(() => 2)
    expect(seen).toEqual([2])
  })

  it('skips updates to an equal value', () => {
    const store = createStore(Number.NaN)
    const listener = vi.fn()
    store.subscribe(listener)
    store.setState((prev) => prev)
    store.setState(() => Number.NaN)
    expect(listener).not.toHaveBeenCalled()
  })

  it('calls a function subscribed twice once per subscription', () => {
    const store = createStore(0)
    const listener = vi.fn()
    store.subscribe(listener)
    store.subscribe(listener)
    store.setState(() => 1)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('stops notifying after unsubscribe, even mid-notification', () => {
    const store = createStore(0)
    const second = vi.fn()
    const first = vi.fn(() => subscription.unsubscribe())
    store.subscribe(first)
    const subscription = store.subscribe(second)
    store.setState(() => 1)
    expect(first).toHaveBeenCalledOnce()
    expect(second).not.toHaveBeenCalled()
  })

  it('runs waiting listeners when a listener updates another store', () => {
    const a = createStore(0)
    const b = createStore(0)
    const order: Array<string> = []
    a.subscribe((value) => {
      order.push(`a1:${value}`)
      b.setState(() => value * 10)
      order.push('a1 done')
    })
    a.subscribe((value) => order.push(`a2:${value}`))
    b.subscribe((value) => order.push(`b:${value}`))
    a.setState(() => 1)
    expect(order).toEqual(['a1:1', 'a2:1', 'b:10', 'a1 done'])
  })

  it('notifies a listener queued twice once, with the latest state', () => {
    const a = createStore(0)
    const b = createStore(0)
    const seen: Array<number> = []
    a.subscribe(() => b.setState((value) => value + 1))
    b.subscribe((value) => seen.push(value))
    a.subscribe(() => b.setState((value) => value + 1))
    a.setState(() => 1)
    expect(seen).toEqual([2])
  })

  it('keeps working after a listener throws', () => {
    const store = createStore(0)
    store.subscribe(() => {
      throw new Error('listener failed')
    })
    expect(() => store.setState(() => 1)).toThrow('listener failed')
    const listener = vi.fn()
    store.subscribe(listener)
    expect(() => store.setState(() => 2)).toThrow('listener failed')
    expect(store.state).toBe(2)
  })
})
