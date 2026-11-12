import {
  HotkeyManager,
  KeyStateTracker,
  getKeyboardLayoutStore,
} from '@tanstack/hotkeys'
import { render } from 'solid-js/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HotkeysDevtools from '../src/components/index'

// Stable class names let these tests inspect the real UI without coupling to CSS generation.
vi.mock('../src/styles/use-styles', () => ({
  useStyles: () => () => new Proxy({}, { get: (_, key) => key }),
}))

const AZERTY = new Map([
  ['KeyQ', 'a'],
  ['KeyA', 'q'],
  ['KeyS', 's'],
  ['Digit1', '&'],
])

let dispose: (() => void) | undefined

function mountPanel() {
  const container = document.createElement('div')
  document.body.append(container)
  dispose = render(() => <HotkeysDevtools theme="dark" />, container)
  return container
}

const text = (node: Element | null | undefined) =>
  node?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
const chip = (ui: Element) => ui.querySelector('.layoutChip')!
/** The chip's status, next to its "Layout" caption. */
const chipStatus = (ui: Element) =>
  text(chip(ui).querySelector('span:last-child'))
const details = (ui: Element) => ui.querySelector('.stateDetails')!
const click = (el: Element) =>
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
/** Lets the pending `getLayoutMap()` promise settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve))

function stubLayout() {
  const getLayoutMap = vi.fn(() => Promise.resolve(AZERTY))
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

afterEach(() => {
  dispose?.()
  dispose = undefined
  // The layout outlives the panel that loaded it
  getKeyboardLayoutStore().setState(() => null)
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('keyboard layout in devtools', () => {
  it('says the browser has no layout API', () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const ui = mountPanel()
    expect(chipStatus(ui)).toBe('Unsupported')
    click(chip(ui))
    expect(text(details(ui))).toContain('Only Chromium browsers do')
  })

  it('says the browser returned no layout', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      keyboard: {
        getLayoutMap: () =>
          Promise.reject(new DOMException('Not allowed', 'SecurityError')),
      },
    })
    const ui = mountPanel()
    await settle()
    expect(chipStatus(ui)).toBe('Unavailable')
    click(chip(ui))
    expect(text(details(ui))).toContain('returned no layout')
  })

  it('loads the layout and marks relabeled keys', async () => {
    const getLayoutMap = stubLayout()
    const ui = mountPanel()
    await settle()
    expect(getLayoutMap).toHaveBeenCalledOnce()
    expect(chipStatus(ui)).toBe('4 keys')

    click(chip(ui))
    expect(chip(ui).className).toContain('layoutChipSelected')
    expect(text(details(ui))).toContain('3 of 4 keys')
    const keys = Array.from(details(ui).querySelectorAll('.keyCap'), (key) => ({
      label: text(key.querySelector('span')),
      code: text(key.querySelector('.keyCapCode')),
      changed: key.className.includes('layoutKeyChanged'),
    }))
    expect(keys).toEqual([
      { label: '&', code: 'Digit1', changed: true },
      { label: 'A', code: 'KeyQ', changed: true },
      { label: 'Q', code: 'KeyA', changed: true },
      { label: 'S', code: 'KeyS', changed: false },
    ])
  })

  it('stops reading the layout on focus once the panel unmounts', async () => {
    const getLayoutMap = stubLayout()
    mountPanel()
    await settle()
    dispose?.()
    dispose = undefined
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })
})
