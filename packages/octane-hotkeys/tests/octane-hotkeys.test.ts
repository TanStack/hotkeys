import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createRoot,
  delegateEvents,
  drainPassiveEffects,
  flushSync,
} from 'octane'
import {
  HotkeyManager,
  SequenceManager,
  KeyStateTracker,
  getHotkeyManager,
  getSequenceManager,
} from '@tanstack/hotkeys'
import { Fixture, ProviderFixture, capture } from './fixture.tsrx'
import type { Root } from 'octane'

delegateEvents(['click'])
let root: Root
let container: HTMLDivElement
function flush() {
  drainPassiveEffects()
  flushSync(() => {})
  drainPassiveEffects()
}
function key(key: string, type = 'keydown', options: KeyboardEventInit = {}) {
  flushSync(() => {
    document.dispatchEvent(
      new KeyboardEvent(type, { key, bubbles: true, ...options }),
    )
  })
  flush()
}
function click(id: string) {
  flushSync(() => {
    container.querySelector<HTMLButtonElement>(id)!.click()
  })
  flush()
}
function value(id: string) {
  return container.querySelector(id)?.textContent
}

beforeEach(() => {
  capture.records = []
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  flushSync(() => {
    root.render(Fixture)
  })
  expect(getHotkeyManager().registrations.state.size).toBe(3)
  flush()
})
afterEach(() => {
  root.unmount()
  flush()
  container.remove()
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  KeyStateTracker.resetInstance()
})

describe('compiled Octane hooks', () => {
  it('isolates repeated hook calls and refreshes callbacks after rerenders', () => {
    key('s', 'keydown', { ctrlKey: true })
    key('s', 'keyup', { ctrlKey: true })
    key('s', 'keydown', { ctrlKey: true })
    key('b')
    expect(value('#count')).toBe('2')
    expect(value('#other')).toBe('1')
    expect(value('#registrations')).toBe('3:2')
  })

  it('updates hints when a binding changes while a modifier remains held', () => {
    key('Control', 'keydown', { ctrlKey: true, code: 'ControlLeft' })
    expect(value('#hint')).toBe('true')
    expect(value('#other-hint')).toBe('false')
    expect(value('#hold')).toBe('true')
    expect(value('#codes')).toContain('ControlLeft')
    click('#binding')
    expect(value('#hint')).toBe('false')
    key('Control', 'keyup')
    expect(value('#held')).toBe('')
  })

  it('soft-disables a binding while removing dynamic list entries', () => {
    const id = [...getHotkeyManager().registrations.state.values()].find(
      (entry) => entry.parsedHotkey.ctrl,
    )?.id
    click('#enabled')
    expect(value('#registrations')).toBe('2:1')
    key('s', 'keydown', { ctrlKey: true })
    expect(value('#count')).toBe('0')
    expect(getHotkeyManager().registrations.state.has(id!)).toBe(true)
    click('#enabled')
    key('s', 'keydown', { ctrlKey: true })
    expect(value('#count')).toBe('1')
  })

  it('runs single and plural sequences', () => {
    key('g')
    key('g', 'keyup')
    key('g')
    key('d')
    key('d', 'keyup')
    key('d')
    expect(value('#count')).toBe('1')
    expect(value('#other')).toBe('1')
  })

  it('records without triggering registered shortcuts and cleans up on unmount', () => {
    click('#record')
    flush()
    expect(value('#recording')).toBe('true')
    key('s', 'keydown', { ctrlKey: true })
    expect(capture.records).toEqual(['Control+S'])
    expect(value('#count')).toBe('0')
    click('#record-sequence')
    key('g')
    key('g', 'keyup')
    expect(value('#steps')).toBe('G')
    click('#commit-sequence')
    expect(capture.records).toEqual(['Control+S', ['G']])
    capture.recorder!.startRecording()
    root.unmount()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    flush()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    expect(getSequenceManager().registrations.state.size).toBe(0)
    key('k')
    expect(capture.records).toHaveLength(2)
  })
})

it('inherits provider defaults, updates them, and respects nested and per-call overrides', () => {
  expect(value('#outside-context')).toBe('true')
  flushSync(() => root.render(ProviderFixture))
  flush()
  expect(value('#provider-default')).toBe('false')
  expect(value('#provider-context')).toBe('true')
  key('a')
  key('b')
  key('c')
  expect(capture.records).toEqual(['B', 'C'])
  const ids = [...getHotkeyManager().registrations.state.keys()]
  click('#provider-enable')
  expect(value('#provider-default')).toBe('true')
  expect([...getHotkeyManager().registrations.state.keys()]).toEqual(ids)
  key('a')
  expect(capture.records).toEqual(['B', 'C', 'A'])
  expect(
    [...getSequenceManager().registrations.state.values()][0]?.options.timeout,
  ).toBe(321)
  click('#provider-record')
  key('k', 'keydown', { code: 'KeyK' })
  expect(capture.records.at(-1)).toBe('K')
  click('#provider-sequence')
  key('g', 'keydown', { code: 'KeyG' })
  key('g', 'keyup', { code: 'KeyG' })
  key('Enter', 'keydown', { code: 'Enter' })
  expect(capture.records.at(-1)).toEqual(['G'])
})
