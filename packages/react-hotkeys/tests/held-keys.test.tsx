import {
  HotkeyManager,
  KeyStateTracker,
  getKeyStateTracker,
} from '@tanstack/hotkeys'
import { keydown } from '@tanstack/hotkeys-test-utils'
import { act, cleanup, render } from '@testing-library/react'
import React, { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHeldKeyCodes, useHeldKeys, useKeyHold } from '../src'

// The shared held-key cases run in conformance.test.tsx. This file keeps
// React-only lifecycle checks.

function HeldKeysView() {
  const keys = useHeldKeys()
  const codes = useHeldKeyCodes()
  const held = useKeyHold('Shift')
  return (
    <output data-testid="held">
      {String(held)} {keys.length} {Object.keys(codes).length}
    </output>
  )
}

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

beforeEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

describe('held keys in StrictMode', () => {
  it('keeps one subscription per hook after the StrictMode remount', () => {
    const active = trackSubscriptions()
    const view = render(
      <StrictMode>
        <HeldKeysView />
      </StrictMode>,
    )
    expect(active()).toBe(3)
    act(
      () =>
        void keydown({
          target: document,
          key: 'Shift',
          code: 'ShiftLeft',
          shiftKey: true,
        }),
    )
    expect(view.getByTestId('held').textContent).toBe('true 1 1')
    view.unmount()
    expect(active()).toBe(0)
  })
})
