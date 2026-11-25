// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, getHotkeyManager, getKeyStateTracker } from '../src'
import { isHotkeyHintVisible } from '../src/adapter'
import { KeyStateTracker } from '../src/key-state-tracker'

describe('KeyStateTracker on a server', () => {
  afterEach(() => {
    KeyStateTracker.resetInstance()
    vi.unstubAllGlobals()
  })

  it('creates a tracker without a document', () => {
    expect(typeof document).toBe('undefined')
    expect(KeyStateTracker.getInstance().getHeldKeys()).toEqual([])
  })

  // Server DOM shims, such as the one in @lit-labs/ssr, define a `document`
  // and no window.
  it('creates a tracker with a document and no window', () => {
    vi.stubGlobal('document', new EventTarget())
    expect(typeof window).toBe('undefined')
    expect(KeyStateTracker.getInstance().getHeldKeys()).toEqual([])
  })

  // FastBoot's sandbox global is also `window`, with no event methods and no
  // document.
  it('creates a tracker with a window that cannot listen', () => {
    vi.stubGlobal('window', globalThis)
    expect(typeof window.addEventListener).toBe('undefined')
    const tracker = KeyStateTracker.getInstance()
    expect(tracker.getHeldKeys()).toEqual([])
    expect(() => KeyStateTracker.resetInstance()).not.toThrow()
  })

  // What held-key and hint readers in adapters call during a server render.
  it('reads held keys and hints with a window that cannot listen', () => {
    vi.stubGlobal('window', globalThis)
    const tracker = getKeyStateTracker()
    const subscription = tracker.store.subscribe(() => {})
    const manager = getHotkeyManager()
    expect(manager.register('Mod+S', () => {}).isActive).toBe(false)
    expect(manager.hasActiveRegistration('Mod+S')).toBe(false)
    expect(
      isHotkeyHintVisible('Mod+S', tracker.store.state.heldKeys, {}, null),
    ).toBe(false)
    subscription.unsubscribe()
    HotkeyManager.resetInstance()
  })
})
