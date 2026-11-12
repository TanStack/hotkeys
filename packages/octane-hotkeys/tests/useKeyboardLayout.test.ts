import { HotkeyManager, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { createRoot, drainPassiveEffects, flushSync, hydrateRoot } from 'octane'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BareLabel,
  CustomLabel,
  DisabledLayoutFixture,
  LayoutFixture,
  LayoutReader,
  ManyLabelsFixture,
  NestedLayoutFixture,
  layoutCapture,
} from './keyboard-layout.tsrx'
import type { Root } from 'octane'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])
// The server HTML of LayoutFixture, from tests/ssr.
const SERVER_HTML = '<!--3--><!--[--><!--[--><kbd>Ctrl+Q</kbd><!--]--><!--]-->'

const roots: Array<Root> = []

function flush() {
  drainPassiveEffects()
  flushSync(() => {})
  drainPassiveEffects()
}
function mount(body: unknown, props: { keyboardLayout?: boolean } = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  roots.push(root)
  flushSync(() => root.render(body as never, props as never))
  flush()
  return { container, root }
}
function unmount(root: Root) {
  roots.splice(roots.indexOf(root), 1)
  root.unmount()
  flush()
}
/** Lets a layout request resolve, then renders. */
async function settle() {
  await new Promise((resolve) => setTimeout(resolve))
  flush()
}
/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

afterEach(() => {
  for (const root of roots.splice(0)) root.unmount()
  flush()
  document.body.innerHTML = ''
  // The layout outlives the components that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
  layoutCapture.labels = []
  layoutCapture.seen = []
})

describe('keyboard layout labels', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container } = mount(LayoutFixture)
    expect(container.textContent).toBe('Ctrl+Q')
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('loads the layout without a provider', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const { container } = mount(BareLabel)
    await settle()
    expect(container.textContent).toBe('A')
  })

  it('reads the layout once for many labels', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container } = mount(ManyLabelsFixture)
    await settle()
    expect(container.textContent).toBe('Ctrl+ACtrl+ACtrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    const { container } = mount(DisabledLayoutFixture)
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(container.textContent).toBe('Ctrl+Qnone')
    expect(layoutCapture.seen).toEqual([null])
  })

  it('lets a nested provider turn the layout back on', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const { container } = mount(NestedLayoutFixture)
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
  })

  it('starts and stops loading when keyboardLayout changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { container, root } = mount(LayoutFixture, { keyboardLayout: false })
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()

    flushSync(() => root.render(LayoutFixture, { keyboardLayout: true }))
    await settle()
    expect(container.textContent).toBe('Ctrl+A')

    flushSync(() => root.render(LayoutFixture, { keyboardLayout: false }))
    flush()
    expect(container.textContent).toBe('Ctrl+Q')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('hydrates with the server label, then shows the layout label', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const error = vi.spyOn(console, 'error')
    const onRecoverableError = vi.fn()
    function hydrate() {
      const container = document.createElement('div')
      container.innerHTML = SERVER_HTML
      document.body.append(container)
      const kbd = container.querySelector('kbd')
      flushSync(() => {
        roots.push(
          hydrateRoot(container, LayoutFixture, {}, { onRecoverableError }),
        )
      })
      flush()
      return { container, kbd }
    }

    const first = hydrate()
    expect(first.container.textContent).toBe('Ctrl+Q')
    await settle()
    expect(first.container.textContent).toBe('Ctrl+A')
    expect(first.container.querySelector('kbd')).toBe(first.kbd)

    // A root that hydrates after the layout loaded still starts from the
    // server label, so its HTML matches.
    layoutCapture.labels = []
    const late = hydrate()
    expect(layoutCapture.labels).toEqual(['Ctrl+Q', 'Ctrl+A'])
    expect(late.container.textContent).toBe('Ctrl+A')
    expect(late.container.querySelector('kbd')).toBe(late.kbd)
    expect(getLayoutMap).toHaveBeenCalledOnce()
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  it('shows the loaded layout at once to a label that mounts later', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const first = mount(LayoutFixture)
    await settle()
    unmount(first.root)
    // Such as a tooltip that opens again: no flash of the US label
    layoutCapture.labels = []
    const second = mount(LayoutFixture)
    expect(layoutCapture.labels).toEqual(['Ctrl+A'])
    expect(second.container.textContent).toBe('Ctrl+A')
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const { container } = mount(LayoutFixture)
    await settle()
    expect(container.textContent).toBe('Ctrl+A')
    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect(container.textContent).toBe('Ctrl+B')
  })

  it('stops reading the layout on focus once no label is mounted', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { root } = mount(LayoutFixture)
    await settle()
    unmount(root)
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps conventional labels where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const { container } = mount(LayoutFixture)
    await settle()
    expect(container.textContent).toBe('Ctrl+Q')
  })

  it('lets a layoutMap passed to format win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const { container } = mount(CustomLabel)
    await settle()
    expect(getKeyboardLayoutStore().state).toEqual(AZERTY)
    expect(container.textContent).toBe('X')
  })

  it('returns the layout from useKeyboardLayout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const { container } = mount(LayoutReader)
    expect(container.textContent).toBe('none')
    await settle()
    expect(container.textContent).toBe('a')
    expect(layoutCapture.seen).toEqual([null, AZERTY])
  })
})
