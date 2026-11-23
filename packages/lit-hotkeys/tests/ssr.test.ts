// @vitest-environment node

import {
  getHotkeyManager,
  getKeyStateTracker,
  getKeyboardLayoutStore,
} from '@tanstack/hotkeys'
import { describe, expect, it, vi } from 'vitest'
import {
  AppHotkeysController,
  FormatForDisplayController,
  HeldKeyCodesController,
  HeldKeysController,
  HotkeyController,
  HotkeyHintController,
  HotkeyRecorderController,
  HotkeyRegistrationsController,
  HotkeyScopesStateController,
  KeyHoldController,
  KeyboardLayoutController,
} from '../src/controllers'

/** Live subscribers on each store, counted from when tracking starts. */
const live = new WeakMap<object, number>()

function trackSubscribers(store: {
  subscribe: (listener: () => void) => { unsubscribe: () => void }
}): void {
  const subscribe = store.subscribe.bind(store)
  live.set(store, 0)
  store.subscribe = (listener) => {
    live.set(store, live.get(store)! + 1)
    const subscription = subscribe(listener)
    let active = true
    return {
      unsubscribe: () => {
        if (active) live.set(store, live.get(store)! - 1)
        active = false
        subscription.unsubscribe()
      },
    }
  }
}

function subscriberCount(store: object): number {
  return live.get(store) ?? 0
}

for (const store of [
  getKeyStateTracker().store,
  getHotkeyManager().registrations,
  getHotkeyManager().scopes,
  getHotkeyManager().appHotkeys,
  getKeyboardLayoutStore(),
]) {
  trackSubscribers(store)
}

function snapshot() {
  const manager = getHotkeyManager()
  return {
    tracker: subscriberCount(getKeyStateTracker().store),
    registrations: subscriberCount(manager.registrations),
    scopes: subscriberCount(manager.scopes),
    appHotkeys: subscriberCount(manager.appHotkeys),
    keyboardLayout: subscriberCount(getKeyboardLayoutStore()),
  }
}

describe('server rendering', () => {
  it('runs without a document', () => {
    expect(typeof document).toBe('undefined')
  })

  // With `connectedCallback: true`, @lit-labs/ssr calls hostConnected on the
  // server and never calls hostDisconnected.
  it('connecting on the server subscribes to no store', () => {
    const before = snapshot()
    for (let i = 0; i < 100; i++) {
      const host = {
        addController: vi.fn(),
        removeController: vi.fn(),
        requestUpdate: vi.fn(),
        updateComplete: Promise.resolve(true),
      }
      const controllers = [
        new AppHotkeysController(host),
        new HeldKeyCodesController(host),
        new HeldKeysController(host),
        new HotkeyController(host, 'Mod+K', () => {}),
        new HotkeyHintController(host, 'Mod+K'),
        new HotkeyRecorderController(host, { onRecord: () => {} }),
        new HotkeyRegistrationsController(host),
        new HotkeyScopesStateController(host),
        new KeyHoldController(host, 'Shift'),
        new KeyboardLayoutController(host),
        new FormatForDisplayController(host),
      ]
      for (const controller of controllers) controller.hostConnected()
    }
    expect(snapshot()).toEqual(before)
  })
})
