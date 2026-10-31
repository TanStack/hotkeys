import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createRoot,
  delegateEvents,
  drainPassiveEffects,
  flushSync,
} from 'octane'
import {
  HotkeyManager,
  KeyStateTracker,
  getHotkeyManager,
} from '@tanstack/hotkeys'
import {
  AppHotkeysFixture,
  Fixture,
  ForwardedOptionsFixture,
  OptionalHotkeyFixture,
  ProviderFixture,
  SavedHotkeysFixture,
  ScopesFixture,
  appCapture,
  capture,
  optionalCapture,
  scopeCapture,
} from './fixture.tsrx'
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
  // Three chords and two sequences, all in the one manager.
  expect(getHotkeyManager().registrations.state.size).toBe(5)
  flush()
})
afterEach(() => {
  root.unmount()
  flush()
  container.remove()
  HotkeyManager.resetInstance()
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
    click('#enabled')
    expect(value('#hint')).toBe('false')
    click('#enabled')
    expect(value('#hint')).toBe('true')
    click('#binding')
    expect(value('#hint')).toBe('false')
    key('Control', 'keyup')
    expect(value('#held')).toBe('')
  })

  it('renders the scopes state when an exclusive scope activates', () => {
    expect(value('#scopes')).toBe('none:')
    let release: () => void = () => {}
    flushSync(() => {
      release = getHotkeyManager().activateScope('dialog', { exclusive: true })
    })
    flush()
    expect(value('#scopes')).toBe('dialog:global')
    flushSync(() => release())
    flush()
    expect(value('#scopes')).toBe('none:')
  })

  it('soft-disables a binding while removing dynamic list entries', () => {
    const id = [...getHotkeyManager().registrations.state.values()].find(
      (entry) => entry.kind === 'chord' && entry.parsedChord.ctrl,
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
    expect(capture.records).toEqual(['Control+S', 'G'])
    capture.recorder!.startRecording()
    root.unmount()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    flush()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
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
    [...getHotkeyManager().registrations.state.values()].find(
      (entry) => entry.kind === 'sequence',
    )?.options,
  ).toMatchObject({ timeout: 321 })
  click('#provider-record')
  key('k', 'keydown', { code: 'KeyK' })
  expect(capture.records.at(-1)).toBe('K')
  click('#provider-sequence')
  key('g', 'keydown', { code: 'KeyG' })
  key('g', 'keyup', { code: 'KeyG' })
  key('Enter', 'keydown', { code: 'Enter' })
  expect(capture.records.at(-1)).toEqual('G')
})

it('registers app hotkeys, lists status, and follows custom hotkeys', () => {
  // Earlier tests record keys without releasing them; blur clears those guards.
  window.dispatchEvent(new Event('blur'))
  appCapture.changes = []
  flushSync(() => root.render(AppHotkeysFixture))
  flush()
  expect(value('#app-statuses')).toBe('active,unbound,active')
  expect(
    [...getHotkeyManager().registrations.state.values()].map(
      (r) => r.options.appHotkeyId,
    ),
  ).toEqual(['doc.save', 'nav.home'])
  key('s', 'keydown', { ctrlKey: true })
  expect(value('#app-count')).toBe('1')

  flushSync(() => {
    appCapture.custom!.setCustomHotkey('doc.save', ['G', 'S'])
    appCapture.custom!.setCustomHotkey('palette.open', 'Control+K')
  })
  flush()
  expect(value('#app-statuses')).toBe('active,active,active')
  expect(appCapture.changes.at(-1)).toEqual({
    'nav.home': ['G', 'G'],
    'doc.save': ['G', 'S'],
    'palette.open': 'Control+K',
  })
  key('g')
  key('s')
  expect(value('#app-count')).toBe('2')
})

it('applies saved custom hotkeys that load after the first render', () => {
  window.dispatchEvent(new Event('blur'))
  appCapture.changes = []
  flushSync(() => root.render(SavedHotkeysFixture))
  flush()
  expect(value('#saved-custom')).toBe('{}')

  click('#saved-load')
  expect(value('#saved-custom')).toBe('{"doc.save":"Control+E"}')
  expect(appCapture.changes).toEqual([])

  // A re-render with the same saved value keeps the user's change.
  flushSync(() => {
    appCapture.custom!.setCustomHotkey('palette.open', 'Control+K')
  })
  flush()
  click('#saved-load')
  expect(value('#saved-custom')).toBe(
    '{"doc.save":"Control+E","palette.open":"Control+K"}',
  )

  click('#saved-switch')
  expect(value('#saved-custom')).toBe('{"nav.home":["G","G"]}')
})

it('scopes hotkeys through nested, exclusive, and disabled providers', () => {
  window.dispatchEvent(new Event('blur'))
  scopeCapture.fired = {}
  flushSync(() => root.render(ScopesFixture))
  flush()
  const scopes = Object.fromEntries(
    [...getHotkeyManager().registrations.state.values()].map((r) => [
      r.options.meta?.name ?? r.options.appHotkeyId,
      r.options.scope,
    ]),
  )
  expect(scopes).toEqual({
    palette: 'global',
    page: 'page',
    panel: 'panel',
    'doc.save': 'panel',
  })

  // A nested scope beats its ancestor; nested providers share app hotkeys.
  key('s', 'keydown', { ctrlKey: true })
  key('e', 'keydown', { ctrlKey: true })
  expect(scopeCapture.fired).toEqual({ panel: 1, app: 1 })
  expect(value('#scope-statuses')).toBe('active')

  // An exclusive scope suspends the rest, except the scopes it allows.
  click('#scope-open')
  key('s', 'keydown', { ctrlKey: true })
  key('k', 'keydown', { ctrlKey: true })
  key('e', 'keydown', { ctrlKey: true })
  expect(scopeCapture.fired).toEqual({
    panel: 1,
    app: 1,
    dialog: 1,
    palette: 1,
  })
  expect(value('#scope-statuses')).toBe('suspended')

  // Disabling an ancestor deactivates nested scopes.
  click('#scope-open')
  click('#scope-enabled')
  key('s', 'keydown', { ctrlKey: true })
  expect(scopeCapture.fired.panel).toBe(1)
  expect(getHotkeyManager().isScopeActive('panel')).toBe(false)
})

it('registers nothing for an unset hotkey, and re-registers when it is set again', () => {
  optionalCapture.count = 0
  flushSync(() => root.render(OptionalHotkeyFixture))
  flush()
  const size = () => getHotkeyManager().registrations.state.size
  // Only the plural's 'A' registers while the shortcut is unset.
  expect(size()).toBe(1)
  key('Control', 'keydown', { ctrlKey: true })
  expect(value('#optional-hint')).toBe('false')
  key('Control', 'keyup')

  click('#optional-set')
  expect(size()).toBe(3)
  click('#optional-clear')
  expect(size()).toBe(1)
  key('k', 'keydown', { ctrlKey: true })
  expect(optionalCapture.count).toBe(0)

  click('#optional-set')
  expect(size()).toBe(3)
  key('k', 'keydown', { ctrlKey: true })
  expect(optionalCapture.count).toBe(2)
})

it('options forwarded as undefined keep their defaults', () => {
  flushSync(() => root.render(ForwardedOptionsFixture))
  flush()
  let reachedWindow = false
  const listener = () => (reachedWindow = true)
  window.addEventListener('keydown', listener)
  const event = new KeyboardEvent('keydown', {
    key: 's',
    code: 'KeyS',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  })
  document.body.dispatchEvent(event)
  window.removeEventListener('keydown', listener)
  expect({ defaultPrevented: event.defaultPrevented, reachedWindow }).toEqual({
    defaultPrevented: true,
    reachedWindow: false,
  })
})
