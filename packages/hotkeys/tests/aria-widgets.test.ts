import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import type { HotkeyChord, HotkeyOptions } from '../src'

function render(markup: string) {
  document.body.innerHTML = markup
}

function focus(selector: string) {
  const element = document.querySelector<HTMLElement>(selector)!
  element.focus()
  return element
}

function dispatchKey(
  element: EventTarget,
  key: string,
  options: KeyboardEventInit = {},
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    composed: true,
    ...options,
  })
  element.dispatchEvent(event)
  return event
}

/** Letter keys are typed lowercase but registered uppercase. */
function toHotkey(key: string) {
  return (key.length === 1 ? key.toUpperCase() : key) as HotkeyChord
}

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

describe.each(['hotkey', 'sequence'] as const)('%s in ARIA widgets', (kind) => {
  // Sequences end with the hotkey under test, so the widget key is checked as
  // a later sequence step rather than collapsing to a chord. They start with
  // F2 because typeahead widgets own letter keys.
  function register(hotkey: HotkeyChord, options: HotkeyOptions = {}) {
    const callback = vi.fn()
    if (kind === 'hotkey') {
      HotkeyManager.getInstance().register(hotkey, callback, options)
    } else {
      HotkeyManager.getInstance().register(['F2', hotkey], callback, options)
    }
    return callback
  }

  function press(
    element: EventTarget,
    key: string,
    options: KeyboardEventInit = {},
  ) {
    if (kind === 'sequence') dispatchKey(element, 'F2')
    return dispatchKey(element, key, options)
  }

  // [markup, focused selector, keys the widget owns, keys it leaves alone]
  it.each([
    [
      'menu item',
      '<div role="menu"><div role="menuitem" tabindex="0">Copy</div></div>',
      '[role="menuitem"]',
      ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'k'],
      ['PageDown', 'Delete'],
    ],
    [
      'menubar item',
      '<div role="menubar"><div role="menuitem" tabindex="0">File</div></div>',
      '[role="menuitem"]',
      ['ArrowRight', 'ArrowDown', 'Home', 'f'],
      ['PageDown'],
    ],
    [
      'vertical listbox',
      '<div role="listbox" tabindex="0"><div role="option">One</div></div>',
      '[role="listbox"]',
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'o'],
      ['ArrowLeft', 'ArrowRight'],
    ],
    [
      'horizontal listbox',
      '<div role="listbox" aria-orientation="horizontal" tabindex="0"></div>',
      '[role="listbox"]',
      ['ArrowLeft', 'ArrowRight'],
      ['ArrowDown', 'ArrowUp'],
    ],
    [
      'horizontal tablist',
      '<div role="tablist"><button role="tab">One</button></div>',
      '[role="tab"]',
      ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
      ['ArrowDown', 'ArrowUp', 'k'],
    ],
    [
      'vertical tablist',
      '<div role="tablist" aria-orientation="vertical"><button role="tab">One</button></div>',
      '[role="tab"]',
      ['ArrowDown', 'ArrowUp'],
      ['ArrowLeft', 'ArrowRight'],
    ],
    [
      'tree item',
      '<div role="tree"><div role="treeitem" tabindex="0">Node</div></div>',
      '[role="treeitem"]',
      ['ArrowDown', 'ArrowRight', 'Home', 'n'],
      ['PageDown'],
    ],
    [
      'grid cell',
      '<div role="grid"><div role="row"><div role="gridcell" tabindex="0">A1</div></div></div>',
      '[role="gridcell"]',
      ['ArrowDown', 'ArrowRight', 'Home', 'PageDown', 'PageUp'],
      ['k'],
    ],
    [
      'treegrid row',
      '<div role="treegrid"><div role="row" tabindex="0">Row</div></div>',
      '[role="row"]',
      ['ArrowLeft', 'PageDown'],
      ['k'],
    ],
    [
      'horizontal toolbar',
      '<div role="toolbar"><button>Bold</button></div>',
      'button',
      ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
      ['ArrowDown', 'k'],
    ],
    [
      'vertical toolbar',
      '<div role="toolbar" aria-orientation="vertical"><button>Bold</button></div>',
      'button',
      ['ArrowDown', 'ArrowUp'],
      ['ArrowLeft'],
    ],
    [
      'radio group',
      '<div role="radiogroup"><div role="radio" tabindex="0">A</div></div>',
      '[role="radio"]',
      ['ArrowDown', 'ArrowLeft'],
      ['Home', 'k'],
    ],
    [
      'slider',
      '<div role="slider" tabindex="0"></div>',
      '[role="slider"]',
      ['ArrowUp', 'ArrowRight', 'Home', 'End', 'PageUp'],
      ['k'],
    ],
    [
      'spinbutton',
      '<div role="spinbutton" tabindex="0"></div>',
      '[role="spinbutton"]',
      ['ArrowUp', 'ArrowDown', 'PageDown'],
      ['ArrowLeft', 'k'],
    ],
    [
      'select-only combobox',
      '<div role="combobox" tabindex="0">Choose</div>',
      '[role="combobox"]',
      ['ArrowDown', 'ArrowUp', 'c'],
      ['ArrowLeft'],
    ],
  ] as const)('%s', (_, markup, selector, owned, notOwned) => {
    render(markup)
    const element = focus(selector)

    for (const key of owned) {
      const callback = register(toHotkey(key))
      expect(press(element, key).defaultPrevented, key).toBe(false)
      expect(callback, key).not.toHaveBeenCalled()
      HotkeyManager.resetInstance()
    }
    for (const key of notOwned) {
      const callback = register(toHotkey(key))
      press(element, key)
      expect(callback, key).toHaveBeenCalledOnce()
      HotkeyManager.resetInstance()
    }
  })

  it.each([
    ['button', ['Enter', 'Space'], []],
    ['link', ['Enter'], ['Space']],
    ['checkbox', ['Space'], ['Enter']],
    ['switch', ['Space'], ['Enter']],
    ['tab', ['Enter', 'Space'], []],
    ['option', ['Enter', 'Space'], []],
    ['menuitemcheckbox', ['Enter', 'Space'], []],
  ] as const)('role="%s" activation', (role, owned, notOwned) => {
    render(`<div role="${role}" tabindex="0">Control</div>`)
    const element = focus('div')

    for (const key of owned) {
      const callback = register(key)
      press(element, key === 'Space' ? ' ' : key)
      expect(callback, key).not.toHaveBeenCalled()
      HotkeyManager.resetInstance()
    }
    for (const key of notOwned) {
      const callback = register(key)
      press(element, key === 'Space' ? ' ' : key)
      expect(callback, key).toHaveBeenCalledOnce()
      HotkeyManager.resetInstance()
    }
  })

  it('uses the role over the native element', () => {
    // A link styled as a button handles Space as well as Enter
    render('<a href="#x" role="button">Open</a>')
    const element = focus('a')
    const callback = register('Space')
    press(element, ' ')
    expect(callback).not.toHaveBeenCalled()
  })

  it('reads only the first role token', () => {
    render('<div role="menu button" tabindex="0"></div>')
    const element = focus('div')
    const callback = register('ArrowDown')
    press(element, 'ArrowDown')
    expect(callback).not.toHaveBeenCalled()
  })

  it('treats aria-activedescendant widgets as focused on the container', () => {
    render(
      '<div role="listbox" tabindex="0" aria-activedescendant="b"><div role="option" id="a">A</div><div role="option" id="b">B</div></div>',
    )
    const element = focus('[role="listbox"]')
    const callback = register('ArrowDown')
    press(element, 'ArrowDown')
    expect(callback).not.toHaveBeenCalled()
  })

  it('allows Shift for navigation keys but not for activation keys', () => {
    render(
      '<div role="listbox" tabindex="0"></div><div role="button" tabindex="0"></div>',
    )
    const listbox = focus('[role="listbox"]')
    const extend = register('Shift+ArrowDown')
    press(listbox, 'ArrowDown', { shiftKey: true })
    expect(extend).not.toHaveBeenCalled()

    const button = focus('[role="button"]')
    const shiftEnter = register('Shift+Enter')
    press(button, 'Enter', { shiftKey: true })
    expect(shiftEnter).toHaveBeenCalledOnce()
  })

  it.each([
    ['Mod+ArrowDown', { metaKey: true }],
    ['Control+ArrowDown', { ctrlKey: true }],
    ['Alt+ArrowDown', { altKey: true }],
  ] as const)('never owns %s', (hotkey, modifiers) => {
    render('<div role="menu" tabindex="0"></div>')
    const element = focus('[role="menu"]')
    const callback = register(hotkey, { platform: 'mac', ignoreInputs: true })
    press(element, 'ArrowDown', modifiers)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('still fires Escape and modifier shortcuts in a menu by default', () => {
    render('<div role="menu" tabindex="0"></div>')
    const element = focus('[role="menu"]')
    const escape = register('Escape')
    press(element, 'Escape')
    expect(escape).toHaveBeenCalledOnce()

    HotkeyManager.resetInstance()
    const save = register('Mod+S', { platform: 'mac' })
    press(element, 's', { metaKey: true })
    expect(save).toHaveBeenCalledOnce()
  })

  it('handles widget keys with ignoreInputs: false', () => {
    render('<div role="menu" tabindex="0"></div>')
    const element = focus('[role="menu"]')
    const callback = register('ArrowDown', { ignoreInputs: false })
    expect(press(element, 'ArrowDown').defaultPrevented).toBe(true)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('lets a hotkey targeted at the widget handle its keys', () => {
    render(
      '<div role="listbox" tabindex="0"><div role="option" tabindex="-1">A</div></div>',
    )
    const listbox = document.querySelector<HTMLElement>('[role="listbox"]')!
    const option = focus('[role="option"]')
    const callback = register('ArrowDown', { target: listbox })
    press(option, 'ArrowDown')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('lets a hotkey targeted inside the widget handle the widget keys', () => {
    render(
      '<div role="grid"><div role="row"><div role="gridcell" tabindex="0">A1</div></div></div>',
    )
    const cell = focus('[role="gridcell"]')
    const callback = register('ArrowDown', { target: cell })
    press(cell, 'ArrowDown')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('skips widget keys for a widget inside an element target', () => {
    render(
      '<section tabindex="0"><div role="menu"><div role="menuitem" tabindex="0">Copy</div></div></section>',
    )
    const section = document.querySelector<HTMLElement>('section')!
    const item = focus('[role="menuitem"]')
    const callback = register('ArrowDown', { target: section })
    press(item, 'ArrowDown')
    expect(callback).not.toHaveBeenCalled()

    section.focus()
    press(section, 'ArrowDown')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('does not treat tab panel content as part of the tablist', () => {
    render(
      '<div role="tablist"><button role="tab">One</button></div><div role="tabpanel"><button>Inside</button></div>',
    )
    const button = focus('[role="tabpanel"] button')
    const callback = register('ArrowRight')
    press(button, 'ArrowRight')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('skips keys owned by an outer widget around an inner one', () => {
    // A menu inside a grid cell: the grid still owns PageDown
    render(
      '<div role="grid"><div role="row"><div role="gridcell"><div role="menu"><div role="menuitem" tabindex="0">Copy</div></div></div></div></div>',
    )
    const item = focus('[role="menuitem"]')
    const callback = register('PageDown')
    press(item, 'PageDown')
    expect(callback).not.toHaveBeenCalled()
  })

  it('detects a widget inside an open shadow root', () => {
    render('<div></div>')
    const host = document.querySelector('div')!
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML =
      '<div role="menu"><div role="menuitem" tabindex="0">Copy</div></div>'
    const item = shadow.querySelector<HTMLElement>('[role="menuitem"]')!
    item.focus()
    const callback = register('ArrowDown')
    press(item, 'ArrowDown')
    expect(callback).not.toHaveBeenCalled()
  })

  it('fires once focus leaves the widget', () => {
    render(
      '<div role="menu"><div role="menuitem" tabindex="0">Copy</div></div><div tabindex="0" id="outside"></div>',
    )
    const item = focus('[role="menuitem"]')
    const callback = register('ArrowDown')
    press(item, 'ArrowDown')
    expect(callback).not.toHaveBeenCalled()

    const outside = focus('#outside')
    press(outside, 'ArrowDown')
    expect(callback).toHaveBeenCalledOnce()
  })
})
