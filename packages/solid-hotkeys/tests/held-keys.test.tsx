import { cleanup, render } from '@solidjs/testing-library'
import {
  HotkeyManager,
  KeyStateTracker,
  getKeyStateTracker,
} from '@tanstack/hotkeys'
import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHeldKeyCodes, createHeldKeys, createKeyHold } from '../src'
import type { IndividualKey } from '@tanstack/hotkeys'
import type { KeyOptions } from '@tanstack/hotkeys-test-utils'

// Adapter harness. The cases below are shared word for word with the other
// adapters' held-keys tests, so keep adapter details in this section.

function mountHeldKeys(watch: IndividualKey = 'Shift') {
  const [key, setKey] = createSignal<IndividualKey>(watch)
  const view = render(() => {
    const keys = createHeldKeys()
    const codes = createHeldKeyCodes()
    const held = createKeyHold(key)
    return (
      <div>
        <output data-testid="keys">{JSON.stringify(keys())}</output>
        <output data-testid="codes">{JSON.stringify(codes())}</output>
        <output data-testid="held">{String(held())}</output>
      </div>
    )
  })
  const text = (id: string) => view.getByTestId(id).textContent ?? ''
  return {
    keys: (): Array<string> => JSON.parse(text('keys')),
    codes: (): Record<string, string> => JSON.parse(text('codes')),
    held: (): boolean => text('held') === 'true',
    setKey: (next: IndividualKey) => void setKey(() => next),
    unmount: () => view.unmount(),
  }
}

const press = (options: KeyOptions) =>
  void keydown({ target: document, ...options })
const release = (options: KeyOptions) =>
  void keyup({ target: document, ...options })
const blurWindow = () => void window.dispatchEvent(new Event('blur'))

beforeEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

// Shared cases

/** Counts the live subscriptions on the tracker's store. */
function trackSubscriptions() {
  const store = getKeyStateTracker().store
  const subscribe = store.subscribe.bind(store)
  let active = 0
  vi.spyOn(store, 'subscribe').mockImplementation((listener) => {
    const subscription = subscribe(listener)
    let live = true
    active++
    return {
      unsubscribe() {
        if (live) active--
        live = false
        subscription.unsubscribe()
      },
    }
  })
  return () => active
}

const SHIFT = { key: 'Shift', code: 'ShiftLeft', shiftKey: true }
const SHIFT_UP = { key: 'Shift', code: 'ShiftLeft' }
const CONTROL = { key: 'Control', code: 'ControlLeft', ctrlKey: true }
const CONTROL_UP = { key: 'Control', code: 'ControlLeft' }

describe('held keys', () => {
  it('starts with no held keys', () => {
    const view = mountHeldKeys()
    expect(view.keys()).toEqual([])
    expect(view.codes()).toEqual({})
  })

  it('lists a key while it is held and drops it on release', () => {
    const view = mountHeldKeys()
    press({ key: 'a', code: 'KeyA' })
    expect(view.keys()).toEqual(['A'])
    expect(view.codes()).toEqual({ A: 'KeyA' })
    release({ key: 'a', code: 'KeyA' })
    expect(view.keys()).toEqual([])
    expect(view.codes()).toEqual({})
  })

  it('lists the keys of a combination in press order', () => {
    const view = mountHeldKeys()
    press(CONTROL)
    press({ ...SHIFT, ctrlKey: true })
    press({ key: 'S', code: 'KeyS', ctrlKey: true, shiftKey: true })
    expect(view.keys()).toEqual(['Control', 'Shift', 'S'])
    release({ key: 'S', code: 'KeyS', ctrlKey: true, shiftKey: true })
    expect(view.keys()).toEqual(['Control', 'Shift'])
    release({ ...SHIFT_UP, ctrlKey: true })
    expect(view.keys()).toEqual(['Control'])
    release(CONTROL_UP)
    expect(view.keys()).toEqual([])
  })

  it.each([
    ['Control', 'ControlLeft'],
    ['Alt', 'AltLeft'],
    ['Shift', 'ShiftLeft'],
    ['Meta', 'MetaLeft'],
  ])('adds and removes the %s modifier', (key, code) => {
    const view = mountHeldKeys()
    press({ key, code })
    expect(view.keys()).toEqual([key])
    expect(view.codes()).toEqual({ [key]: code })
    release({ key, code })
    expect(view.keys()).toEqual([])
  })

  it('maps each held key to its physical code', () => {
    const view = mountHeldKeys()
    press({ key: 'Shift', code: 'ShiftRight', shiftKey: true })
    press({ key: 'A', code: 'KeyA', shiftKey: true })
    expect(view.codes()).toEqual({ Shift: 'ShiftRight', A: 'KeyA' })
  })

  it('names a key by event.key, not its physical code', () => {
    const view = mountHeldKeys()
    // AZERTY: the key labeled Q sits where QWERTY has A.
    press({ key: 'q', code: 'KeyA' })
    expect(view.keys()).toEqual(['Q'])
    expect(view.codes()).toEqual({ Q: 'KeyA' })
  })

  it('keeps a modifier held until both of its physical keys are released', () => {
    const view = mountHeldKeys()
    press(SHIFT)
    press({ key: 'Shift', code: 'ShiftRight', shiftKey: true })
    expect(view.keys()).toEqual(['Shift'])
    release({ key: 'Shift', code: 'ShiftLeft', shiftKey: true })
    expect(view.keys()).toEqual(['Shift'])
    expect(view.codes()).toEqual({ Shift: 'ShiftRight' })
    release({ key: 'Shift', code: 'ShiftRight' })
    expect(view.keys()).toEqual([])
  })

  it('lists a repeated key once', () => {
    const view = mountHeldKeys()
    press({ key: 'a', code: 'KeyA' })
    press({ key: 'a', code: 'KeyA', repeat: true })
    expect(view.keys()).toEqual(['A'])
  })

  it('clears every held key when the window loses focus', () => {
    const view = mountHeldKeys()
    press(CONTROL)
    press({ key: 'a', code: 'KeyA', ctrlKey: true })
    blurWindow()
    expect(view.keys()).toEqual([])
    expect(view.codes()).toEqual({})
  })

  // BUG-065: issues/bugs/BUG-065-modifier-release-clears-held-letters.md
  it.skip('BUG-065: keeps a held letter when a modifier is tapped', () => {
    const view = mountHeldKeys()
    press({ key: 'w', code: 'KeyW' })
    press(SHIFT)
    release(SHIFT_UP)
    expect(view.keys()).toEqual(['W'])
  })
})

describe('key hold', () => {
  it('is true only while a named key is held', () => {
    const view = mountHeldKeys('Shift')
    expect(view.held()).toBe(false)
    press(SHIFT)
    expect(view.held()).toBe(true)
    release(SHIFT_UP)
    expect(view.held()).toBe(false)
  })

  it('is true for a letter pressed with or without Shift', () => {
    const view = mountHeldKeys('A')
    press({ key: 'a', code: 'KeyA' })
    expect(view.held()).toBe(true)
    release({ key: 'a', code: 'KeyA' })
    expect(view.held()).toBe(false)
    press(SHIFT)
    press({ key: 'A', code: 'KeyA', shiftKey: true })
    expect(view.held()).toBe(true)
  })

  it('folds the case of a letter like core isKeyHeld', () => {
    const view = mountHeldKeys('a' as IndividualKey)
    press({ key: 'A', code: 'KeyA', shiftKey: true })
    expect(getKeyStateTracker().isKeyHeld('a')).toBe(true)
    expect(view.held()).toBe(true)
  })

  // BUG-067: issues/bugs/BUG-067-key-hold-case-rules-differ-across-adapters.md
  it.skip('BUG-067: matches named keys case-sensitively like core isKeyHeld', () => {
    const view = mountHeldKeys('escape' as IndividualKey)
    press({ key: 'Escape', code: 'Escape' })
    expect(getKeyStateTracker().isKeyHeld('escape')).toBe(false)
    expect(view.held()).toBe(false)
  })

  it('tracks the space bar as Space', () => {
    const view = mountHeldKeys('Space')
    press({ key: ' ', code: 'Space' })
    expect(view.held()).toBe(true)
  })

  it('follows event.key, not the physical code', () => {
    const view = mountHeldKeys('Q')
    press({ key: 'q', code: 'KeyA' })
    expect(view.held()).toBe(true)
    view.setKey('A')
    expect(view.held()).toBe(false)
    view.setKey('KeyA' as IndividualKey)
    expect(view.held()).toBe(false)
  })

  it('reads a key that was already held when it mounts', () => {
    getKeyStateTracker()
    press(SHIFT)
    const view = mountHeldKeys('Shift')
    expect(view.held()).toBe(true)
    expect(view.keys()).toEqual(['Shift'])
  })
})

describe('held keys lifecycle', () => {
  it('unsubscribes from the key state tracker on unmount', () => {
    const active = trackSubscriptions()
    const view = mountHeldKeys()
    expect(active()).toBeGreaterThan(0)
    view.unmount()
    expect(active()).toBe(0)
  })

  it('does not add subscriptions when remounted', () => {
    const active = trackSubscriptions()
    const first = mountHeldKeys()
    const mounted = active()
    first.unmount()
    const second = mountHeldKeys()
    expect(active()).toBe(mounted)
    press(SHIFT)
    expect(second.held()).toBe(true)
  })

  it('does not add subscriptions when the watched key changes', () => {
    const active = trackSubscriptions()
    const view = mountHeldKeys('Shift')
    const mounted = active()
    view.setKey('Control')
    view.setKey('Alt')
    view.setKey('Shift')
    expect(active()).toBe(mounted)
    view.unmount()
    expect(active()).toBe(0)
  })
})

describe('held keys reactivity', () => {
  it('updates the rendered output as keys change', () => {
    const view = mountHeldKeys('Control')
    press(CONTROL)
    expect(view.keys()).toEqual(['Control'])
    expect(view.held()).toBe(true)
    release(CONTROL_UP)
    expect(view.keys()).toEqual([])
    expect(view.held()).toBe(false)
  })

  it('switches the tracked key when the watched key changes', () => {
    const view = mountHeldKeys('Shift')
    press(SHIFT)
    expect(view.held()).toBe(true)
    view.setKey('Control')
    expect(view.held()).toBe(false)
    press({ ...CONTROL, shiftKey: true })
    expect(view.held()).toBe(true)
    view.setKey('Shift')
    expect(view.held()).toBe(true)
    release({ ...SHIFT_UP, ctrlKey: true })
    expect(view.held()).toBe(false)
  })
})
