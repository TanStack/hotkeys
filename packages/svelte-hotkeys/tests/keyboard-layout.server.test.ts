// @vitest-environment node
import { getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { render } from 'svelte/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import KeyboardLayoutHarness from './KeyboardLayoutHarness.svelte'
import { SERVER_HTML } from './keyboard-layout-server-html'

afterEach(() => {
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
})

describe('keyboard layout labels on the server', () => {
  it('runs without a document', () => {
    expect(typeof document).toBe('undefined')
  })

  it('renders the conventional label and never loads the keyboard layout', () => {
    const getLayoutMap = vi.fn(() => Promise.resolve(new Map([['KeyQ', 'a']])))
    vi.stubGlobal('navigator', { keyboard: { getLayoutMap } })
    // Another request, or a store shared with the browser in a test, may
    // have left a layout behind
    getKeyboardLayoutStore().setState(() => new Map([['KeyQ', 'a']]))
    const { body } = render(KeyboardLayoutHarness)
    expect(body).toBe(SERVER_HTML)
    expect(getLayoutMap).not.toHaveBeenCalled()
  })
})
