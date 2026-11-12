// @vitest-environment happy-dom

import {
  formatForDisplay as coreFormatForDisplay,
  detectPlatform,
  getKeyboardLayoutStore,
} from '@tanstack/hotkeys'
import { LitElement, html } from 'lit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as adapter from '../src'
import { FormatForDisplayController } from '../src/controllers/format-for-display'
import type { FormatForDisplayControllerOptions } from '../src/controllers/format-for-display'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])

type Options =
  | FormatForDisplayControllerOptions
  | (() => FormatForDisplayControllerOptions)

/** The options that the next `FormatLabel` passes to its controller. */
let nextOptions: Options = { platform: 'windows' }

/** Labels a physical key with the function from its controller. */
class FormatLabel extends LitElement {
  formatForDisplay = new FormatForDisplayController(this, nextOptions)
  /** The label that each render showed. */
  seen: Array<string> = []

  override render() {
    const label = this.formatForDisplay.format('Mod+[KeyQ]')
    this.seen.push(label)
    return html`<kbd>${label}</kbd>`
  }
}
customElements.define('format-label', FormatLabel)

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

async function mount(options: Options = { platform: 'windows' }) {
  nextOptions = options
  const host = new FormatLabel()
  document.body.append(host)
  await settle(host)
  return host
}

/** Lets a pending `getLayoutMap()` settle, then waits for the host's updates. */
async function settle(host: FormatLabel) {
  await new Promise((resolve) => setTimeout(resolve))
  while (!(await host.updateComplete));
}

const text = (host: FormatLabel) => host.renderRoot.textContent.trim()

afterEach(() => {
  // Disconnects every host, which ends its interest in the layout
  document.body.replaceChildren()
  // The layout outlives the hosts that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  nextOptions = { platform: 'windows' }
})

describe('FormatForDisplayController', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const host = new FormatLabel()
    document.body.append(host)
    await host.updateComplete
    expect(text(host)).toBe('Ctrl+Q')
    expect(host.seen).toEqual(['Ctrl+Q'])

    await settle(host)
    expect(text(host)).toBe('Ctrl+A')
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
    const host = new FormatLabel()
    await new Promise((resolve) => setTimeout(resolve))
    expect(getLayoutMap).not.toHaveBeenCalled()
    // Formatting loads nothing either
    expect(host.formatForDisplay.format('Mod+[KeyQ]')).toBe('Ctrl+Q')
    expect(getLayoutMap).not.toHaveBeenCalled()

    document.body.append(host)
    await settle(host)
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('renders first without a layout that has already loaded, then shows it', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const first = await mount()
    first.remove()
    expect(getKeyboardLayoutStore().state).not.toBeNull()

    // A hydrating element must first render what the server did
    const host = new FormatLabel()
    document.body.append(host)
    await host.updateComplete
    expect(host.seen).toEqual(['Ctrl+Q'])
    expect(text(host)).toBe('Ctrl+Q')

    // The second update follows at once, before the browser answers again
    while (!(await host.updateComplete));
    expect(host.seen).toEqual(['Ctrl+Q', 'Ctrl+A'])
    expect(text(host)).toBe('Ctrl+A')
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
  })

  it('keeps the fallback where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const host = await mount()
    expect(text(host)).toBe('Ctrl+Q')
  })

  it('uses the platform option, and lets a platform passed to format win', async () => {
    const host = await mount({ platform: 'mac' })
    // The function needs no `this`
    const formatForDisplay = host.formatForDisplay.format
    expect(text(host)).toBe('⌘ Q')
    expect(formatForDisplay('Mod+S')).toBe('⌘ S')
    expect(formatForDisplay('Mod+S', { platform: 'windows' })).toBe('Ctrl+S')
  })

  it('detects the platform without the option', async () => {
    const host = await mount({})
    expect(host.formatForDisplay.format('Mod+Shift+S')).toBe(
      coreFormatForDisplay('Mod+Shift+S', { platform: detectPlatform() }),
    )
  })

  it('reads a platform getter for each label', async () => {
    const settings: FormatForDisplayControllerOptions = { platform: 'mac' }
    const host = await mount(() => settings)
    expect(text(host)).toBe('⌘ Q')

    settings.platform = 'windows'
    host.requestUpdate()
    await host.updateComplete
    expect(text(host)).toBe('Ctrl+Q')
  })

  it('lets a layoutMap passed to format win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const host = await mount()
    expect(text(host)).toBe('Ctrl+A')
    const layoutMap = new Map([['KeyQ', 'x']])
    expect(host.formatForDisplay.format('Mod+[KeyQ]', { layoutMap })).toBe(
      'Ctrl+X',
    )
  })

  it('keeps the other options and the overloads of formatForDisplay', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const host = await mount()
    const formatForDisplay = host.formatForDisplay.format
    const parts: Array<string> = formatForDisplay('Mod+[KeyQ]', { parts: true })
    expect(parts).toEqual(['Ctrl', 'A'])
    expect(
      formatForDisplay(['Mod+[KeyQ]', 'G'], { sequenceSeparator: ' then ' }),
    ).toBe('Ctrl+A then G')
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    const host = await mount({ platform: 'windows', keyboardLayout: false })
    window.dispatchEvent(new Event('focus'))
    await settle(host)
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(text(host)).toBe('Ctrl+Q')
    expect(host.seen).toEqual(['Ctrl+Q'])
  })

  it('follows an options getter that turns the layout on and off', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const settings: FormatForDisplayControllerOptions = {
      platform: 'windows',
      keyboardLayout: false,
    }
    const host = await mount(() => settings)
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(text(host)).toBe('Ctrl+Q')

    settings.keyboardLayout = true
    host.requestUpdate()
    await settle(host)
    expect(getLayoutMap).toHaveBeenCalledOnce()
    expect(text(host)).toBe('Ctrl+A')

    settings.keyboardLayout = false
    host.requestUpdate()
    await settle(host)
    expect(text(host)).toBe('Ctrl+Q')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('stops reading the layout on focus once no host is connected', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const host = await mount()
    host.remove()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('reads the layout again when the host reconnects', async () => {
    let layout = AZERTY
    const getLayoutMap = stubLayout(() => Promise.resolve(layout))
    const host = await mount()
    host.remove()

    layout = BEPO
    document.body.append(host)
    await settle(host)
    expect(text(host)).toBe('Ctrl+B')
    expect(getLayoutMap).toHaveBeenCalledTimes(2)
  })

  it('stops updating the host and reading the layout after dispose', async () => {
    let layout = AZERTY
    const getLayoutMap = stubLayout(() => Promise.resolve(layout))
    const host = await mount()
    host.formatForDisplay.dispose()
    const renders = host.seen.length

    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle(host)
    expect(host.seen).toHaveLength(renders)
    expect(getLayoutMap).toHaveBeenCalledOnce()

    // Reconnecting must not load the layout again
    host.remove()
    document.body.append(host)
    await settle(host)
    expect(getLayoutMap).toHaveBeenCalledOnce()
    // A disposed controller formats without the layout
    expect(host.formatForDisplay.format('Mod+[KeyQ]')).toBe('Ctrl+Q')
  })

  it('subscribes and loads once when the controller is added again', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const store = getKeyboardLayoutStore()
    const subscribe = vi.spyOn(store, 'subscribe')
    const host = await mount()
    host.addController(host.formatForDisplay)
    await settle(host)
    expect(subscribe).toHaveBeenCalledOnce()
    expect(getLayoutMap).toHaveBeenCalledOnce()
    subscribe.mockRestore()
  })
})

describe('the deprecated formatForDisplay export', () => {
  it('is the core function', () => {
    expect(adapter.formatForDisplay).toBe(coreFormatForDisplay)
  })
})
