// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'
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
})
