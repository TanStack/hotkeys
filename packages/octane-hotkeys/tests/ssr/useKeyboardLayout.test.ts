import { getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { renderToString } from 'octane/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LayoutFixture, LayoutReader } from '../keyboard-layout.tsrx'

afterEach(() => {
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
})

describe('keyboard layout on the server', () => {
  it('renders the conventional label and never asks for a layout', () => {
    const getLayoutMap = vi.fn(() => Promise.resolve(new Map()))
    vi.stubGlobal('navigator', { keyboard: { getLayoutMap } })
    // The hydration test in useKeyboardLayout.test.ts starts from this HTML.
    expect(renderToString(LayoutFixture, {}).html).toBe(
      '<!--3--><!--[--><!--[--><kbd>Ctrl+Q</kbd><!--]--><!--]-->',
    )
    expect(getLayoutMap).not.toHaveBeenCalled()
  })

  it('ignores a layout that is already in the store', () => {
    getKeyboardLayoutStore().setState(() => new Map([['KeyQ', 'a']]))
    expect(renderToString(LayoutFixture, {}).html).toContain(
      '<kbd>Ctrl+Q</kbd>',
    )
    expect(renderToString(LayoutReader, undefined).html).toContain(
      '<output>none</output>',
    )
  })
})
