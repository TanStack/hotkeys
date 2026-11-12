// @vitest-environment happy-dom

import { HotkeyManager, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { act, cleanup, render } from '@testing-library/preact'
import { hydrate, render as preactRender } from 'preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useFormatForDisplay } from '../src/useFormatForDisplay'
import { useKeyboardLayout } from '../src/useKeyboardLayout'
import type { ComponentChildren } from 'preact'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])

function Label({ onRender }: { onRender?: (label: string) => void }) {
  const format = useFormatForDisplay()
  const label = format('Mod+[KeyQ]')
  onRender?.(label)
  return <kbd>{label}</kbd>
}

function App({
  keyboardLayout,
  children = <Label />,
}: {
  keyboardLayout?: boolean
  children?: ComponentChildren
}) {
  return (
    <HotkeysProvider defaultOptions={{ platform: 'windows', keyboardLayout }}>
      {children}
    </HotkeysProvider>
  )
}

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

/** Lets a layout request resolve, then renders. */
const settle = () => act(async () => {})

afterEach(() => {
  cleanup()
  // The layout outlives the components that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

describe('keyboard layout labels', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container } = render(<App />)
    expect(container.textContent).toBe('Ctrl+Q')
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('loads the layout without a provider', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    function Bare() {
      const format = useFormatForDisplay()
      return <kbd>{format('[KeyQ]')}</kbd>
    }
    const { container } = render(<Bare />)
    await settle()
    expect(container.textContent).toBe('A')
  })

  it('reads the layout once for many labels', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container } = render(
      <App>
        <Label />
        <Label />
        <Label />
      </App>,
    )
    await settle()
    expect(container.textContent).toBe('Ctrl+ACtrl+ACtrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    const seen: Array<unknown> = []
    function Reader() {
      seen.push(useKeyboardLayout())
      return null
    }
    const { container } = render(
      <App keyboardLayout={false}>
        <Label />
        <Reader />
      </App>,
    )
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(container.textContent).toBe('Ctrl+Q')
    expect(seen).toEqual([null])
  })

  it('lets a nested provider turn the layout back on', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const { container } = render(
      <App keyboardLayout={false}>
        <HotkeysProvider defaultOptions={{ keyboardLayout: true }}>
          <Label />
        </HotkeysProvider>
      </App>,
    )
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
  })

  it('starts and stops loading when keyboardLayout changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container, rerender } = render(<App keyboardLayout={false} />)
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()

    rerender(<App keyboardLayout />)
    await settle()
    expect(container.textContent).toBe('Ctrl+A')

    rerender(<App keyboardLayout={false} />)
    expect(container.textContent).toBe('Ctrl+Q')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('hydrates with the server label, then shows the layout label', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    // preact-render-to-string is not installed, so this is the HTML a server
    // would send: a server never has a layout.
    const html = '<kbd>Ctrl+Q</kbd>'

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    const labels: Array<string> = []
    await act(async () => {
      hydrate(
        <App>
          <Label onRender={(label) => labels.push(label)} />
        </App>,
        container,
      )
    })
    await settle()
    expect(labels).toEqual(['Ctrl+Q', 'Ctrl+A'])
    expect(container.textContent).toBe('Ctrl+A')

    // A root that hydrates after the layout loaded still starts from the
    // server label, so its HTML matches.
    const late = document.createElement('div')
    late.innerHTML = html
    document.body.append(late)
    const kbd = late.querySelector('kbd')
    const lateLabels: Array<string> = []
    await act(async () => {
      hydrate(
        <App>
          <Label onRender={(label) => lateLabels.push(label)} />
        </App>,
        late,
      )
    })
    expect(lateLabels).toEqual(['Ctrl+Q', 'Ctrl+A'])
    expect(late.textContent).toBe('Ctrl+A')
    expect(late.querySelector('kbd')).toBe(kbd)
    expect(getLayoutMap).toHaveBeenCalledOnce()
    expect(errors).not.toHaveBeenCalled()

    preactRender(null, container)
    preactRender(null, late)
  })

  it('shows the loaded layout at once to a label that mounts later', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const first = render(<App />)
    await settle()
    first.unmount()
    // Such as a tooltip that opens again. The label updates in the commit
    // that mounts it, before the browser paints.
    const second = render(<App />)
    expect(second.container.textContent).toBe('Ctrl+A')
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const { container } = render(<App />)
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
    layout = BEPO
    await act(async () => {
      window.dispatchEvent(new Event('focus'))
    })
    expect(container.textContent).toBe('Ctrl+B')
  })

  it('stops reading the layout on focus once no label is mounted', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { unmount } = render(<App />)
    await settle()
    unmount()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps conventional labels where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const { container } = render(<App />)
    await settle()
    expect(container.textContent).toBe('Ctrl+Q')
  })

  it('lets a layoutMap passed to format win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    function Custom() {
      const format = useFormatForDisplay()
      return (
        <kbd>{format('[KeyQ]', { layoutMap: new Map([['KeyQ', 'x']]) })}</kbd>
      )
    }
    const { container } = render(<Custom />)
    await settle()
    expect(getKeyboardLayoutStore().state).toEqual(AZERTY)
    expect(container.textContent).toBe('X')
  })

  it('returns the layout from useKeyboardLayout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const seen: Array<string | undefined> = []
    function Reader() {
      seen.push(useKeyboardLayout()?.get('KeyQ'))
      return null
    }
    render(<Reader />)
    await settle()
    expect(seen).toEqual([undefined, 'a'])
  })
})
