// @vitest-environment node

import { afterEach, expect, it, vi } from 'vitest'
import { getKeyboardLayoutStore, loadKeyboardLayout } from '../src'

it('does nothing on a server', () => {
  expect(typeof window).toBe('undefined')
  const stop = loadKeyboardLayout()
  expect(getKeyboardLayoutStore().state).toBeNull()
  expect(() => stop()).not.toThrow()
})

afterEach(() => vi.unstubAllGlobals())

// Server DOM shims can define a `window` that has no event methods.
it('does nothing with a window that cannot listen', () => {
  vi.stubGlobal('window', {})
  const stop = loadKeyboardLayout()
  expect(() => stop()).not.toThrow()
  expect(getKeyboardLayoutStore().state).toBeNull()
})
