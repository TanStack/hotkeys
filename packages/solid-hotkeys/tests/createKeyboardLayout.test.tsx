import { cleanup, render } from '@solidjs/testing-library'
import { HotkeyManager, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { Show, createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { createFormatForDisplay } from '../src/createFormatForDisplay'
import { createKeyboardLayout } from '../src/createKeyboardLayout'
import type { JSX } from 'solid-js'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])

function Label(props: { onLabel?: (label: string) => void }) {
  const format = createFormatForDisplay()
  const label = () => {
    const value = format('Mod+[KeyQ]')
    props.onLabel?.(value)
    return value
  }
  return <kbd>{label()}</kbd>
}

function App(props: { keyboardLayout?: boolean; children?: JSX.Element }) {
  return (
    <HotkeysProvider
      defaultOptions={{
        platform: 'windows',
        keyboardLayout: props.keyboardLayout,
      }}
    >
      {props.children ?? <Label />}
    </HotkeysProvider>
  )
}

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

/** Lets a layout request resolve. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve))

afterEach(() => {
  cleanup()
  // The layout outlives the components that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
})

describe('keyboard layout labels', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container } = render(() => <App />)
    expect(container.textContent).toBe('Ctrl+Q')
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('does not format a label again when it names no physical key', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    let formatted = 0
    function Logical() {
      const format = createFormatForDisplay()
      const label = () => {
        formatted++
        return format('Mod+Q')
      }
      return <kbd>{label()}</kbd>
    }
    const { container } = render(() => (
      <App>
        <Logical />
        <Label />
      </App>
    ))
    await settle()
    // The physical label followed the layout; the other one never ran again
    expect(container.textContent).toBe('Ctrl+QCtrl+A')
    expect(formatted).toBe(1)
  })

  it('loads the layout without a provider', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    function Bare() {
      const format = createFormatForDisplay()
      return <kbd>{format('[KeyQ]')}</kbd>
    }
    const { container } = render(() => <Bare />)
    await settle()
    expect(container.textContent).toBe('A')
  })

  it('reads the layout once for many labels', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container } = render(() => (
      <App>
        <Label />
        <Label />
        <Label />
      </App>
    ))
    await settle()
    expect(container.textContent).toBe('Ctrl+ACtrl+ACtrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    let layoutMap!: ReturnType<typeof createKeyboardLayout>
    function Reader() {
      layoutMap = createKeyboardLayout()
      return null
    }
    const { container } = render(() => (
      <App keyboardLayout={false}>
        <Label />
        <Reader />
      </App>
    ))
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(container.textContent).toBe('Ctrl+Q')
    expect(layoutMap()).toBeNull()
  })

  it('lets a nested provider turn the layout back on', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const { container } = render(() => (
      <App keyboardLayout={false}>
        <HotkeysProvider defaultOptions={{ keyboardLayout: true }}>
          <Label />
        </HotkeysProvider>
      </App>
    ))
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
  })

  it('starts and stops loading when keyboardLayout changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const [keyboardLayout, setKeyboardLayout] = createSignal(false)
    const { container } = render(() => (
      <App keyboardLayout={keyboardLayout()} />
    ))
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()

    setKeyboardLayout(true)
    await settle()
    expect(container.textContent).toBe('Ctrl+A')

    setKeyboardLayout(false)
    expect(container.textContent).toBe('Ctrl+Q')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps loading when another default option changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const [platform, setPlatform] = createSignal<'mac' | 'windows'>('mac')
    const { container } = render(() => (
      <HotkeysProvider defaultOptions={{ platform: platform() }}>
        <Label />
      </HotkeysProvider>
    ))
    await settle()
    expect(container.textContent).toBe('⌘ A')
    setPlatform('windows')
    expect(container.textContent).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('renders the conventional label first when the layout has already loaded', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    render(() => <App />)
    await settle()
    expect(getKeyboardLayoutStore().state).toEqual(AZERTY)

    // Hydration renders what the server rendered, and a server never has a
    // layout. See createKeyboardLayout.server.test.tsx for the server HTML.
    const labels: Array<string> = []
    const { container } = render(() => (
      <App>
        <Label onLabel={(label) => labels.push(label)} />
      </App>
    ))
    expect(labels).toEqual(['Ctrl+Q', 'Ctrl+A'])
    expect(container.textContent).toBe('Ctrl+A')
  })

  it('shows the loaded layout at once to a label that mounts later', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const first = render(() => <App />)
    await settle()
    first.unmount()
    // Such as a tooltip that opens again. The label updates while it mounts,
    // before the browser paints.
    const second = render(() => <App />)
    expect(second.container.textContent).toBe('Ctrl+A')
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const { container } = render(() => <App />)
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect(container.textContent).toBe('Ctrl+B')
  })

  it('stops reading the layout on focus once no label is mounted', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const [show, setShow] = createSignal(true)
    render(() => (
      <App>
        <Show when={show()}>
          <Label />
        </Show>
      </App>
    ))
    await settle()
    setShow(false)
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps conventional labels where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const { container } = render(() => <App />)
    await settle()
    expect(container.textContent).toBe('Ctrl+Q')
  })

  it('lets an explicit layoutMap option win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    function Custom() {
      const format = createFormatForDisplay()
      return (
        <kbd>{format('[KeyQ]', { layoutMap: new Map([['KeyQ', 'x']]) })}</kbd>
      )
    }
    const { container } = render(() => <Custom />)
    await settle()
    expect(getKeyboardLayoutStore().state).toEqual(AZERTY)
    expect(container.textContent).toBe('X')
  })

  it('returns the layout from createKeyboardLayout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    let layoutMap!: ReturnType<typeof createKeyboardLayout>
    function Reader() {
      layoutMap = createKeyboardLayout()
      return null
    }
    const { unmount } = render(() => <Reader />)
    expect(layoutMap()).toBeNull()
    await settle()
    expect(layoutMap()?.get('KeyQ')).toBe('a')

    // A disposed owner keeps its last layout and stops following the store
    unmount()
    getKeyboardLayoutStore().setState(() => BEPO)
    expect(layoutMap()?.get('KeyQ')).toBe('a')
  })
})
