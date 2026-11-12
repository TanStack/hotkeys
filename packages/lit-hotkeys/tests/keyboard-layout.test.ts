// @vitest-environment happy-dom

import { formatForDisplay, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { LitElement, html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KeyboardLayoutController } from '../src/controllers/keyboard-layout'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])

/** Labels a physical key with the layout from its controller. */
class LayoutLabel extends LitElement {
  layout = new KeyboardLayoutController(this)
  /** The `KeyQ` entry seen by each render. */
  seen: Array<string | undefined> = []

  override render() {
    const layoutMap = this.layout.value ?? undefined
    this.seen.push(layoutMap?.get('KeyQ'))
    return html`<kbd
      >${formatForDisplay('Mod+[KeyQ]', { platform: 'windows', layoutMap })}</kbd
    >`
  }
}
customElements.define('layout-label', LayoutLabel)

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

async function mount() {
  const host = new LayoutLabel()
  document.body.append(host)
  await settle(host)
  return host
}

/** Lets a pending `getLayoutMap()` settle, then waits for the host's updates. */
async function settle(host: LayoutLabel) {
  await new Promise((resolve) => setTimeout(resolve))
  while (!(await host.updateComplete));
}

const text = (host: LayoutLabel) => host.renderRoot.textContent.trim()

afterEach(() => {
  // Disconnects every host, which ends its interest in the layout
  document.body.replaceChildren()
  // The layout outlives the hosts that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
})

describe('KeyboardLayoutController', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const host = new LayoutLabel()
    document.body.append(host)
    await host.updateComplete
    expect(text(host)).toBe('Ctrl+Q')
    expect(host.seen).toEqual([undefined])

    await settle(host)
    expect(text(host)).toBe('Ctrl+A')
    expect(host.layout.value).toBe(getKeyboardLayoutStore().state)
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('reads the layout once for many hosts', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const hosts = [await mount(), await mount(), await mount()]
    expect(hosts.map(text)).toEqual(['Ctrl+A', 'Ctrl+A', 'Ctrl+A'])
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('asks the browser for nothing until a host connects', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const host = new LayoutLabel()
    await new Promise((resolve) => setTimeout(resolve))
    expect(getLayoutMap).not.toHaveBeenCalled()

    document.body.append(host)
    await settle(host)
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('renders first without a layout that has already loaded, then shows it', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const first = await mount()
    first.remove()
    expect(getKeyboardLayoutStore().state).not.toBeNull()

    // A hydrating element must first render what the server did
    const host = new LayoutLabel()
    document.body.append(host)
    await host.updateComplete
    expect(host.seen).toEqual([undefined])
    expect(text(host)).toBe('Ctrl+Q')

    // The second update follows at once, before the browser answers again
    while (!(await host.updateComplete));
    expect(host.seen).toEqual([undefined, 'a'])
    expect(text(host)).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledTimes(2)
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const host = await mount()
    expect(text(host)).toBe('Ctrl+A')

    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle(host)
    expect(text(host)).toBe('Ctrl+B')
    expect(host.layout.value?.get('KeyQ')).toBe('b')
  })

  it('stops reading the layout on focus once no host is connected', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const host = await mount()
    host.remove()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('stays null where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const host = await mount()
    expect(host.layout.value).toBeNull()
    expect(text(host)).toBe('Ctrl+Q')
  })

  it('lets a layoutMap passed to formatForDisplay win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const host = await mount()
    expect(host.layout.value?.get('KeyQ')).toBe('a')
    expect(
      formatForDisplay('[KeyQ]', { layoutMap: new Map([['KeyQ', 'x']]) }),
    ).toBe('X')
  })

  it('stops updating a disconnected host, and reads the layout when it reconnects', async () => {
    let layout = AZERTY
    const getLayoutMap = stubLayout(() => Promise.resolve(layout))
    const host = await mount()
    const other = await mount()
    host.remove()
    const renders = host.seen.length

    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle(other)
    expect(text(other)).toBe('Ctrl+B')
    expect(host.seen).toHaveLength(renders)

    document.body.append(host)
    await settle(host)
    expect(text(host)).toBe('Ctrl+B')
    expect(host.seen.at(-1)).toBe('b')
    // Another host was connected throughout, so reconnecting reads nothing
    expect(getLayoutMap).toHaveBeenCalledTimes(2)
  })

  it('stops updating the host and reading the layout after dispose', async () => {
    let layout = AZERTY
    const getLayoutMap = stubLayout(() => Promise.resolve(layout))
    const host = await mount()
    host.layout.dispose()
    const renders = host.seen.length

    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle(host)
    expect(host.seen).toHaveLength(renders)
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('subscribes and loads once when the controller is added again', () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const host = {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    }
    const store = getKeyboardLayoutStore()
    const subscribe = vi.spyOn(store, 'subscribe')
    const layout = new KeyboardLayoutController(host)
    layout.hostConnected()
    layout.hostConnected()
    expect(subscribe).toHaveBeenCalledOnce()
    expect(getLayoutMap).toHaveBeenCalledOnce()

    layout.hostDisconnected()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
    subscribe.mockRestore()
  })
})
