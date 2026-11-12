import { getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { renderToString } from 'solid-js/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { createFormatForDisplay } from '../src/createFormatForDisplay'
import { createKeyboardLayout } from '../src/createKeyboardLayout'

function Label() {
  const format = createFormatForDisplay()
  const layoutMap = createKeyboardLayout()
  return <kbd data-layout={String(layoutMap())}>{format('Mod+[KeyQ]')}</kbd>
}

const render = () =>
  renderToString(() => (
    <HotkeysProvider defaultOptions={{ platform: 'windows' }}>
      <Label />
    </HotkeysProvider>
  ))

afterEach(() => {
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
})

describe('keyboard layout on the server', () => {
  it('renders the conventional label and never asks for a layout', () => {
    const getLayoutMap = vi.fn(() => Promise.resolve(new Map()))
    vi.stubGlobal('navigator', { keyboard: { getLayoutMap } })
    const html = render()
    expect(html).toContain('data-layout="null"')
    expect(html).toContain('>Ctrl+Q</kbd>')
    expect(getLayoutMap).not.toHaveBeenCalled()
  })

  it('ignores a layout that is already in the store', () => {
    getKeyboardLayoutStore().setState(() => new Map([['KeyQ', 'a']]))
    const html = render()
    expect(html).toContain('data-layout="null"')
    expect(html).toContain('>Ctrl+Q</kbd>')
  })
})
