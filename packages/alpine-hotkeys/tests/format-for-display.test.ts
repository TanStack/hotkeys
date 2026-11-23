import { formatForDisplay as coreFormatForDisplay } from '@tanstack/hotkeys'
import Alpine from 'alpinejs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as adapter from '../src'
import {
  createHotkeyRecorder,
  createHotkeysScope,
  detectPlatform,
  getKeyboardLayoutStore,
} from '../src'
import type { DefaultHotkeysOptions } from '../src'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])
const CUSTOM = new Map([['KeyQ', 'x']])

/** The scope defaults that the next `formatLabel` component uses. */
let defaults: DefaultHotkeysOptions | (() => DefaultHotkeysOptions) = {
  platform: 'windows',
}

Alpine.data('formatLabel', () => {
  const hotkeys = createHotkeysScope(defaults)
  const formatForDisplay = hotkeys.createFormatForDisplay()

  return {
    // The template calls it, as `x-text="formatForDisplay(hotkey)"` would
    formatForDisplay,
    get label() {
      return formatForDisplay('Mod+[KeyQ]')
    },
    get custom() {
      return formatForDisplay('Mod+[KeyQ]', { layoutMap: CUSTOM })
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
  element.setAttribute('x-data', 'formatLabel')
  element.innerHTML = `<kbd x-text="label"></kbd><kbd x-text="custom"></kbd><kbd x-text="formatForDisplay('Shift+[KeyQ]')"></kbd>`
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

const text = (element: HTMLElement, index = 0) =>
  element.children[index]!.textContent

afterEach(() => {
  // Destroys every scope, which ends its interest in the layout
  for (const element of [...document.body.children]) {
    unmount(element as HTMLElement)
  }
  // The layout outlives the components that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  defaults = { platform: 'windows' }
})

describe('createFormatForDisplay', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const element = mount()
    expect(text(element)).toBe('Ctrl+Q')
    expect(text(element, 2)).toBe('Shift+Q')
    await settle()
    expect(text(element)).toBe('Ctrl+A')
    // An expression in the template follows the layout too
    expect(text(element, 2)).toBe('Shift+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('reads the layout once for many components', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const elements = [mount(), mount(), mount()]
    await settle()
    expect(elements.map((element) => text(element))).toEqual([
      'Ctrl+A',
      'Ctrl+A',
      'Ctrl+A',
    ])
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it("uses the scope's platform, and lets a platform passed to the function win", () => {
    const hotkeys = createHotkeysScope({ platform: 'mac' })
    const formatForDisplay = hotkeys.createFormatForDisplay()
    expect(formatForDisplay('Mod+S')).toBe('⌘ S')
    expect(formatForDisplay('Mod+S', { platform: 'windows' })).toBe('Ctrl+S')
    hotkeys.destroy()
  })

  it('detects the platform without a scope platform', () => {
    const hotkeys = createHotkeysScope()
    const formatForDisplay = hotkeys.createFormatForDisplay()
    expect(formatForDisplay('Mod+Shift+S')).toBe(
      coreFormatForDisplay('Mod+Shift+S', { platform: detectPlatform() }),
    )
    hotkeys.destroy()
  })

  it('follows a defaults getter that changes the platform', async () => {
    const settings = Alpine.reactive<DefaultHotkeysOptions>({ platform: 'mac' })
    defaults = () => ({ platform: settings.platform })
    const element = mount()
    expect(text(element)).toBe('⌘ Q')

    settings.platform = 'windows'
    await settle()
    expect(text(element)).toBe('Ctrl+Q')
  })

  it('lets a layoutMap passed to the function win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const element = mount()
    await settle()
    expect(text(element)).toBe('Ctrl+A')
    expect(text(element, 1)).toBe('Ctrl+X')
  })

  it('keeps the other options and the overloads of formatForDisplay', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const hotkeys = createHotkeysScope({ platform: 'windows' })
    const formatForDisplay = hotkeys.createFormatForDisplay()
    await settle()
    const parts: Array<string> = formatForDisplay('Mod+[KeyQ]', { parts: true })
    expect(parts).toEqual(['Ctrl', 'A'])
    expect(
      formatForDisplay(['Mod+[KeyQ]', 'G'], { sequenceSeparator: ' then ' }),
    ).toBe('Ctrl+A then G')
    hotkeys.destroy()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    defaults = { platform: 'windows', keyboardLayout: false }
    const element = mount()
    await settle()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(text(element)).toBe('Ctrl+Q')
  })

  it('follows a defaults getter that turns the layout on and off', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const settings = Alpine.reactive({ keyboardLayout: false })
    defaults = () => ({
      platform: 'windows',
      keyboardLayout: settings.keyboardLayout,
    })
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

    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle()
    expect(text(element)).toBe('Ctrl+B')
  })

  it('stops reading the layout on focus once no scope is left', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const element = mount()
    await settle()
    unmount(element)
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps the fallback where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const element = mount()
    await settle()
    expect(text(element)).toBe('Ctrl+Q')
  })

  it('runs a label again for the layout only when it names a position', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const hotkeys = createHotkeysScope({ platform: 'windows' })
    const formatForDisplay = hotkeys.createFormatForDisplay()
    const seen = {
      character: [] as Array<string>,
      position: [] as Array<string>,
    }
    const runners = [
      Alpine.effect(() => {
        seen.character.push(formatForDisplay('Mod+Q'))
      }),
      Alpine.effect(() => {
        seen.position.push(formatForDisplay('Mod+[KeyQ]'))
      }),
    ]
    await settle()
    expect(seen.character).toEqual(['Ctrl+Q'])
    expect(seen.position).toEqual(['Ctrl+Q', 'Ctrl+A'])
    for (const runner of runners) Alpine.release(runner)
    hotkeys.destroy()
  })

  it('is available on the $hotkeys magic', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const element = document.createElement('div')
    element.setAttribute(
      'x-data',
      '{ formatForDisplay: $hotkeys.createFormatForDisplay() }',
    )
    element.innerHTML = `<kbd x-text="formatForDisplay('Shift+[KeyQ]')"></kbd>`
    document.body.append(element)
    Alpine.initTree(element)
    expect(text(element)).toBe('Shift+Q')
    await settle()
    expect(text(element)).toBe('Shift+A')
  })
})

describe("the scope's platform", () => {
  const press = (init: KeyboardEventInit) =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, ...init }),
    )
  const metaS = { key: 's', code: 'KeyS', metaKey: true }
  const ctrlS = { key: 's', code: 'KeyS', ctrlKey: true }

  it('is the default platform for hotkeys, and hotkey.platform wins', () => {
    const mac = createHotkeysScope({ platform: 'mac' })
    const onMac = vi.fn()
    mac.createHotkey('Mod+S', onMac)
    const windows = createHotkeysScope({
      platform: 'mac',
      hotkey: { platform: 'windows' },
    })
    const onWindows = vi.fn()
    windows.createHotkey('Mod+S', onWindows)

    press(metaS)
    expect(onMac).toHaveBeenCalledOnce()
    expect(onWindows).not.toHaveBeenCalled()
    press(ctrlS)
    expect(onMac).toHaveBeenCalledOnce()
    expect(onWindows).toHaveBeenCalledOnce()
    mac.destroy()
    windows.destroy()
  })

  it('is the default platform for recorders, and hotkeyRecorder.platform wins', () => {
    const record = (options: DefaultHotkeysOptions) => {
      const hotkeys = createHotkeysScope(options)
      const onRecord = vi.fn()
      const recorder = createHotkeyRecorder(hotkeys, { onRecord })
      recorder.startRecording()
      press(metaS)
      hotkeys.destroy()
      return onRecord.mock.calls[0]?.[0]
    }
    expect(record({ platform: 'mac' })).toBe('Mod+S')
    expect(
      record({ platform: 'mac', hotkeyRecorder: { platform: 'windows' } }),
    ).toBe('Meta+S')
  })
})

describe('the deprecated formatForDisplay export', () => {
  it('is the core function', () => {
    expect(adapter.formatForDisplay).toBe(coreFormatForDisplay)
  })
})
