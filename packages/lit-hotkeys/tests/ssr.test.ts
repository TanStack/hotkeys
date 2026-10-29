// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { getHotkeyManager, getKeyStateTracker } from '@tanstack/hotkeys'
import {
  AppHotkeysController,
  HeldKeyCodesController,
  HeldKeysController,
  HotkeyController,
  HotkeyHintController,
  HotkeyRecorderController,
  HotkeyRegistrationsController,
  HotkeyScopesStateController,
  KeyHoldController,
} from '../src/controllers'

/** Live subscribers on a store, read from its atom's subscriber list. */
function subscriberCount(store: object): number {
  let count = 0
  for (let link = (store as any).atom.subs; link; link = link.nextSub) count++
  return count
}

function snapshot() {
  const manager = getHotkeyManager()
  return {
    tracker: subscriberCount(getKeyStateTracker().store),
    registrations: subscriberCount(manager.registrations),
    scopes: subscriberCount(manager.scopes),
    appHotkeys: subscriberCount(manager.appHotkeys),
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
      ]
      for (const controller of controllers) controller.hostConnected()
    }
    expect(snapshot()).toEqual(before)
  })
})
