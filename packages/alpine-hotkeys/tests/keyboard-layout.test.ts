import Alpine from 'alpinejs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createHotkeysScope,
  formatForDisplay,
  getKeyboardLayoutStore,
} from '../src'
import type { DefaultHotkeysOptions } from '../src'

const AZERTY = new Map([['KeyQ', 'a']])
const QWERTZ = new Map([['KeyQ', 'q']])
const CUSTOM = new Map([['KeyQ', 'x']])

/** The scope defaults that the next `layoutLabel` component uses. */
let defaults: DefaultHotkeysOptions | (() => DefaultHotkeysOptions) = {}

Alpine.data('layoutLabel', () => {
  const hotkeys = createHotkeysScope(defaults)
  const layout = hotkeys.createKeyboardLayout()

  return {
    get label() {
      return formatForDisplay('Mod+[KeyQ]', {
        platform: 'windows',
        layoutMap: layout.value ?? undefined,
      })
    },
    get custom() {
      return formatForDisplay('[KeyQ]', { layoutMap: CUSTOM })
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

/** Adds one label component to the page. */
function mount() {
  const element = document.createElement('div')
  element.setAttribute('x-data', 'layoutLabel')
  element.innerHTML = `<kbd x-text="label"></kbd><kbd x-text="custom"></kbd>`
  document.body.append(element)
  Alpine.initTree(element)
  return element
}

function unmount(element: HTMLElement) {
  Alpine.destroyTree(element)
  element.remove()
}

/** Lets a pending `getLayoutMap()` settle, then waits for Alpine's effects. */
async function settle() {
  await new Promise((resolve) => setTimeout(resolve))
  await Alpine.nextTick()
}

const text = (element: HTMLElement) => element.children[0]!.textContent

afterEach(() => {
  // Destroys every scope, which ends its interest in the layout
  for (const element of [...document.body.children]) {
    unmount(element as HTMLElement)
  }
  // The layout outlives the components that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  defaults = {}
})

describe('createKeyboardLayout', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const element = mount()
    expect(text(element)).toBe('Ctrl+Q')
    await settle()
    expect(text(element)).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('reads the layout once for many components', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const elements = [mount(), mount(), mount()]
    await settle()
    expect(elements.map(text)).toEqual(['Ctrl+A', 'Ctrl+A', 'Ctrl+A'])
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    defaults = { keyboardLayout: false }
    const element = mount()
    await settle()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(text(element)).toBe('Ctrl+Q')

    const hotkeys = createHotkeysScope({ keyboardLayout: false })
    expect(hotkeys.createKeyboardLayout().value).toBeNull()
    hotkeys.destroy()
  })

  it('follows a defaults getter that turns the layout on and off', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const settings = Alpine.reactive({ keyboardLayout: false })
    defaults = () => ({ keyboardLayout: settings.keyboardLayout })
    const element = mount()
    await settle()
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(text(element)).toBe('Ctrl+Q')

    settings.keyboardLayout = true
    await settle()
    expect(getLayoutMap).toHaveBeenCalledOnce()
    expect(text(element)).toBe('Ctrl+A')

    settings.keyboardLayout = false
    await settle()
    expect(text(element)).toBe('Ctrl+Q')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('shows the loaded layout at once to a component that mounts later', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const first = mount()
    await settle()
    unmount(first)
    // Such as a menu that opens again: no flash of the US label
    const second = mount()
    expect(text(second)).toBe('Ctrl+A')
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const element = mount()
    await settle()
    expect(text(element)).toBe('Ctrl+A')

    layout = QWERTZ
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect(text(element)).toBe('Ctrl+Q')
  })

  it('stops reading the layout on focus once no scope is left', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const element = mount()
    await settle()
    unmount(element)
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('stays null where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const hotkeys = createHotkeysScope()
    const layout = hotkeys.createKeyboardLayout()
    await settle()
    expect(layout.value).toBeNull()
    hotkeys.destroy()
  })

  it('lets a layoutMap passed to formatForDisplay win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const element = mount()
    await settle()
    expect(text(element)).toBe('Ctrl+A')
    expect(element.children[1]!.textContent).toBe('X')
  })

  it('returns the layout through value, and stops when the scope is destroyed', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const hotkeys = createHotkeysScope()
    const value = hotkeys.createKeyboardLayout()
    const seen: Array<string | undefined> = []
    const runner = Alpine.effect(() => {
      seen.push(value.value?.get('KeyQ'))
    })
    await settle()
    expect(seen).toEqual([undefined, 'a'])

    hotkeys.destroy()
    // Another scope keeps the layout fresh, and this one no longer follows it
    const other = createHotkeysScope()
    other.createKeyboardLayout()
    layout = QWERTZ
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect(getKeyboardLayoutStore().state?.get('KeyQ')).toBe('q')
    expect(seen).toEqual([undefined, 'a'])
    other.destroy()
    Alpine.release(runner)
  })
})
