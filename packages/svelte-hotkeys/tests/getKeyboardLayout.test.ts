import { HotkeyManager, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { flushSync, hydrate, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getFormatForDisplay } from '../src/getFormatForDisplay'
import { getKeyboardLayout } from '../src/getKeyboardLayout.svelte'
import KeyboardLayoutHarness from './KeyboardLayoutHarness.svelte'
import KeyboardLayoutLabel from './KeyboardLayoutLabel.svelte'
import { createSharedKeyboardLayout } from './keyboard-layout-root.svelte'
import { SERVER_HTML } from './keyboard-layout-server-html'
import type { ComponentProps } from 'svelte'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

const mounted: Array<Record<string, any>> = []

function render(props: ComponentProps<typeof KeyboardLayoutHarness> = {}) {
  const component = mount(KeyboardLayoutHarness, {
    target: document.body,
    props,
  })
  mounted.push(component)
  flushSync()
  return component
}

/** Lets the layout request resolve, then applies the update. */
async function settle() {
  await Promise.resolve()
  await Promise.resolve()
  flushSync()
}

/** Unmounts, and waits for the layout's last reader to stop. */
async function remove(component: Record<string, any>) {
  mounted.splice(mounted.indexOf(component), 1)
  await unmount(component)
  await settle()
}

const labels = (root: ParentNode = document) =>
  [...root.querySelectorAll('kbd')].map((kbd) => kbd.textContent)
const layoutKey = (root: ParentNode = document) =>
  root.querySelector('i')!.textContent

afterEach(async () => {
  for (const component of [...mounted]) await remove(component)
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
    render()
    expect(labels()).toEqual(['Ctrl+Q'])
    await settle()
    expect(labels()).toEqual(['Ctrl+A'])
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('loads the layout without a provider', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    mounted.push(
      mount(KeyboardLayoutLabel, {
        target: document.body,
        props: { hotkey: '[KeyQ]' },
      }),
    )
    flushSync()
    await settle()
    expect(labels()).toEqual(['A'])
  })

  it('reads the layout once for many labels', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    render({ count: 3 })
    await settle()
    expect(labels()).toEqual(['Ctrl+A', 'Ctrl+A', 'Ctrl+A'])
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    render({ keyboardLayout: false })
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(labels()).toEqual(['Ctrl+Q'])
    expect(layoutKey()).toBe('none')
  })

  it('lets a nested provider turn the layout back on', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    render({ keyboardLayout: false, nested: true })
    await settle()
    expect(labels()).toEqual(['Ctrl+A'])
  })

  it('follows the provider when keyboardLayout changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    let setKeyboardLayout!: (value: boolean) => void
    render({ keyboardLayout: false, ready: (set) => (setKeyboardLayout = set) })
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()

    setKeyboardLayout(true)
    flushSync()
    await settle()
    expect(labels()).toEqual(['Ctrl+A'])

    setKeyboardLayout(false)
    flushSync()
    await settle()
    expect(labels()).toEqual(['Ctrl+Q'])
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('hydrates with the server label, then shows the layout label', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const start = () => {
      const target = document.createElement('div')
      target.innerHTML = SERVER_HTML
      document.body.append(target)
      mounted.push(hydrate(KeyboardLayoutHarness, { target, props: {} }))
      return target
    }
    const first = start()
    expect(labels(first)).toEqual(['Ctrl+Q'])
    expect(getLayoutMap).not.toHaveBeenCalled()
    flushSync()
    await settle()
    expect(labels(first)).toEqual(['Ctrl+A'])

    // A root that hydrates after the layout loaded still starts from the
    // server label, so its HTML matches.
    const late = start()
    expect(late.innerHTML).toBe(SERVER_HTML)
    flushSync()
    expect(labels(late)).toEqual(['Ctrl+A'])
    expect(layoutKey(late)).toBe('a')
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })

  it('shows the loaded layout to a label that mounts later', async () => {
    // The browser never answers the second label's request
    let answer: Promise<Map<string, string>> = Promise.resolve(AZERTY)
    stubLayout(() => answer)
    const first = render()
    await settle()
    await remove(first)
    answer = new Promise(() => {})
    // Such as a tooltip that opens again. The label has the layout as soon
    // as it has mounted, without waiting for the browser.
    render()
    expect(labels()).toEqual(['Ctrl+A'])
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    render()
    await settle()
    expect(labels()).toEqual(['Ctrl+A'])
    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect(labels()).toEqual(['Ctrl+B'])
  })

  it('stops reading the layout on focus once no label is mounted', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const component = render()
    await settle()
    await remove(component)
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps conventional labels where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    render()
    await settle()
    expect(labels()).toEqual(['Ctrl+Q'])
  })

  it('lets a layoutMap passed to format win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    render({ layoutMap: new Map([['KeyQ', 'x']]) })
    await settle()
    expect(labels()).toEqual(['Ctrl+X'])
  })

  it('returns the layout from getKeyboardLayout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    render()
    expect(layoutKey()).toBe('none')
    await settle()
    expect(layoutKey()).toBe('a')
  })

  it('loads the layout in an $effect.root outside a component', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const { destroy, keyboard } = createSharedKeyboardLayout()
    expect(getLayoutMap).toHaveBeenCalledOnce()
    await settle()
    expect(keyboard.layout?.get('KeyQ')).toBe('a')

    destroy()
    await settle()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('reads a loaded layout right away outside any effect', () => {
    getKeyboardLayoutStore().setState(() => AZERTY)
    expect(getKeyboardLayout().layout?.get('KeyQ')).toBe('a')
    expect(getFormatForDisplay()('Mod+[KeyQ]', { platform: 'windows' })).toBe(
      'Ctrl+A',
    )
  })
})
