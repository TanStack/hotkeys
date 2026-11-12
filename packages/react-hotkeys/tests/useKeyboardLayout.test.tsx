// @vitest-environment happy-dom

import { HotkeyManager, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { act, cleanup, render } from '@testing-library/react'
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useFormatForDisplay } from '../src/useFormatForDisplay'
import { useKeyboardLayout } from '../src/useKeyboardLayout'
import type { ReactNode } from 'react'

const AZERTY = new Map([['KeyQ', 'a']])
const QWERTZ = new Map([['KeyQ', 'q']])

function Label() {
  const format = useFormatForDisplay()
  return <kbd>{format('Mod+[KeyQ]')}</kbd>
}

function App({
  keyboardLayout,
  children = <Label />,
}: {
  keyboardLayout?: boolean
  children?: ReactNode
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
    await act(async () => {})
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
    await act(async () => {})
    expect(container.textContent).toBe('A')
  })

  it('reads the layout once for many labels', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    render(
      <App>
        <Label />
        <Label />
        <Label />
      </App>,
    )
    await act(async () => {})
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
    await act(async () => {})
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(container.textContent).toBe('Ctrl+Q')
    expect(seen).toEqual([null])
  })

  it('follows keyboardLayout when it changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container, rerender } = render(<App keyboardLayout={false} />)
    await act(async () => {})
    expect(container.textContent).toBe('Ctrl+Q')
    rerender(<App />)
    await act(async () => {})
    expect(container.textContent).toBe('Ctrl+A')
    rerender(<App keyboardLayout={false} />)
    expect(container.textContent).toBe('Ctrl+Q')
    // Switched off, the label no longer keeps the layout fresh
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('does not render a switched-off label when something else loads the layout', async () => {
    let renders = 0
    function Counted() {
      renders++
      return <Label />
    }
    render(
      <App keyboardLayout={false}>
        <Counted />
      </App>,
    )
    await act(async () => {
      getKeyboardLayoutStore().setState(() => AZERTY)
    })
    expect(renders).toBe(1)
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
    await act(async () => {})
    expect(container.textContent).toBe('Ctrl+A')
  })

  it('hydrates with the server label, then shows the layout label', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const html = renderToString(<App />)
    expect(html).toContain('Ctrl+Q')
    expect(getLayoutMap).not.toHaveBeenCalled()

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    let root!: ReturnType<typeof hydrateRoot>
    await act(async () => {
      root = hydrateRoot(container, <App />)
    })
    expect(container.textContent).toBe('Ctrl+A')

    // A root that hydrates after the layout loaded still starts from the
    // server label, so its HTML matches.
    const late = document.createElement('div')
    late.innerHTML = html
    document.body.append(late)
    let lateRoot!: ReturnType<typeof hydrateRoot>
    await act(async () => {
      lateRoot = hydrateRoot(late, <App />)
    })
    expect(late.textContent).toBe('Ctrl+A')
    expect(errors).not.toHaveBeenCalled()

    await act(async () => {
      root.unmount()
      lateRoot.unmount()
    })
  })

  it('shows the loaded layout at once to a label that mounts later', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const first = render(<App />)
    await act(async () => {})
    first.unmount()
    // Such as a tooltip that opens again: no flash of the US label
    const second = render(<App />)
    expect(second.container.textContent).toBe('Ctrl+A')
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const { container } = render(<App />)
    await act(async () => {})
    expect(container.textContent).toBe('Ctrl+A')
    layout = QWERTZ
    await act(async () => {
      window.dispatchEvent(new Event('focus'))
    })
    expect(container.textContent).toBe('Ctrl+Q')
  })

  it('stops reading the layout on focus once no label is mounted', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { unmount } = render(<App />)
    await act(async () => {})
    unmount()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps conventional labels where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const { container } = render(<App />)
    await act(async () => {})
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
    await act(async () => {})
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
    await act(async () => {})
    expect(seen).toEqual([undefined, 'a'])
  })
})
