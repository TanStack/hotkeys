import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import { isInputElement } from '../src/_event-target'
import type { HotkeyChord, HotkeyOptions } from '../src'

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

function register(hotkey: HotkeyChord, options: HotkeyOptions = {}) {
  const callback = vi.fn()
  HotkeyManager.getInstance().register(hotkey, callback, options)
  return callback
}

function renderAndFocus(markup: string, selector = 'input') {
  document.body.innerHTML = markup
  const element = document.querySelector<HTMLElement>(selector)!
  element.focus()
  return element
}

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

describe('native inputs that are not text fields', () => {
  it.each(['checkbox', 'radio', 'range', 'color', 'file', 'image'])(
    'single-key hotkeys fire on a focused %s input',
    (type) => {
      const input = renderAndFocus(`<input type="${type}">`)
      expect(isInputElement(input)).toBe(false)
      const k = register('K')
      dispatchKey(input, 'k')
      expect(k).toHaveBeenCalledOnce()
    },
  )

  it.each([
    ['checkbox', ['Space'], ['ArrowDown']],
    ['radio', ['Space', 'ArrowDown', 'ArrowRight'], ['Enter']],
    [
      'range',
      ['ArrowLeft', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown'],
      ['Space'],
    ],
    ['color', ['Enter', 'Space'], ['ArrowDown']],
    ['file', ['Enter', 'Space'], ['ArrowDown']],
    ['image', ['Enter', 'Space'], ['ArrowDown']],
  ] as const)(
    'a focused %s input keeps the keys it uses',
    (type, owned, free) => {
      const input = renderAndFocus(`<input type="${type}">`)
      for (const key of owned) {
        const callback = register(key)
        dispatchKey(input, key === 'Space' ? ' ' : key)
        expect(callback, key).not.toHaveBeenCalled()
      }
      for (const key of free) {
        const callback = register(key)
        dispatchKey(input, key)
        expect(callback, key).toHaveBeenCalledOnce()
      }
    },
  )

  it('single-key hotkeys fire on a read-only text input', () => {
    const input = renderAndFocus('<input type="text" readonly>')
    expect(isInputElement(input)).toBe(false)
    const k = register('K')
    dispatchKey(input, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('a read-only textarea lets single keys fire and keeps caret keys', () => {
    const area = renderAndFocus('<textarea readonly></textarea>', 'textarea')
    expect(isInputElement(area)).toBe(false)
    const k = register('K')
    const down = register('ArrowDown')
    dispatchKey(area, 'k')
    dispatchKey(area, 'ArrowDown')
    expect(k).toHaveBeenCalledOnce()
    expect(down).not.toHaveBeenCalled()
  })

  it('a read-only text input does not keep Up and Down', () => {
    const input = renderAndFocus('<input type="text" readonly>')
    const down = register('ArrowDown')
    dispatchKey(input, 'ArrowDown')
    expect(down).toHaveBeenCalledOnce()
  })

  it('a read-only text input keeps caret keys', () => {
    const input = renderAndFocus('<input type="text" readonly>')
    const home = register('Home')
    const left = register('ArrowLeft')
    dispatchKey(input, 'Home')
    dispatchKey(input, 'ArrowLeft')
    expect(home).not.toHaveBeenCalled()
    expect(left).not.toHaveBeenCalled()
  })

  it.each(['number', 'date', 'time', 'datetime-local', 'month', 'week', 'url'])(
    'a %s input still counts as a text field',
    (type) => {
      const input = renderAndFocus(`<input type="${type}">`)
      expect(isInputElement(input)).toBe(true)
    },
  )
})

describe('ARIA text roles', () => {
  it.each(['textbox', 'searchbox'])(
    'role="%s" blocks single keys but not Mod chords or Escape',
    (role) => {
      const element = renderAndFocus(
        `<div role="${role}" tabindex="0"></div>`,
        'div',
      )
      expect(isInputElement(element)).toBe(true)
      const k = register('K')
      const modK = register('Mod+K', { platform: 'linux' })
      const escape = register('Escape')
      dispatchKey(element, 'k')
      dispatchKey(element, 'k', { ctrlKey: true })
      dispatchKey(element, 'Escape')
      expect(k).not.toHaveBeenCalled()
      expect(modK).toHaveBeenCalledOnce()
      expect(escape).toHaveBeenCalledOnce()
    },
  )

  it('reads the first role token, ignoring surrounding whitespace', () => {
    const element = renderAndFocus(
      '<div role="  textbox  menu" tabindex="0"></div>',
      'div',
    )
    expect(isInputElement(element)).toBe(true)
  })

  it('a hotkey targeted at the text role element still fires', () => {
    const element = renderAndFocus(
      '<div role="textbox" tabindex="0"></div>',
      'div',
    )
    const k = register('K', { target: element })
    dispatchKey(element, 'k')
    expect(k).toHaveBeenCalledOnce()
  })
})

let tagId = 0
function defineElement(
  setup: (host: HTMLElement) => void,
  formAssociated = false,
) {
  const tag = `x-field-${++tagId}`
  customElements.define(
    tag,
    class extends HTMLElement {
      static formAssociated = formAssociated
      connectedCallback() {
        setup(this)
      }
    },
  )
  return tag
}

describe('custom elements whose contents are hidden', () => {
  it('a text field in a closed shadow root blocks single keys', () => {
    const tag = defineElement((host) => {
      const root = host.attachShadow({ mode: 'closed' })
      root.innerHTML = '<input type="text">'
      root.querySelector('input')!.focus()
    })
    document.body.innerHTML = `<${tag}></${tag}>`
    const host = document.querySelector(tag)!
    expect(document.activeElement).toBe(host)

    const k = register('K')
    const modK = register('Mod+K', { platform: 'linux' })
    dispatchKey(host, 'k')
    dispatchKey(host, 'k', { ctrlKey: true })
    expect(k).not.toHaveBeenCalled()
    expect(modK).toHaveBeenCalledOnce()
  })

  it('a form-associated element without a role blocks single keys', () => {
    const tag = defineElement((host) => (host.tabIndex = 0), true)
    document.body.innerHTML = `<${tag}></${tag}>`
    const host = document.querySelector<HTMLElement>(tag)!
    host.focus()
    const k = register('K')
    dispatchKey(host, 'k')
    expect(k).not.toHaveBeenCalled()
  })

  it('a form-associated element with a non-text role keeps only its keys', () => {
    const tag = defineElement((host) => (host.tabIndex = 0), true)
    document.body.innerHTML = `<${tag} role="checkbox"></${tag}>`
    const host = document.querySelector<HTMLElement>(tag)!
    host.focus()
    const k = register('K')
    dispatchKey(host, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('a focusable custom element without a shadow root does not block', () => {
    document.body.innerHTML = '<app-row tabindex="0"></app-row>'
    const row = document.querySelector<HTMLElement>('app-row')!
    row.focus()
    const k = register('K')
    dispatchKey(row, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('an open-root checkbox inside a form-associated host does not block', () => {
    const tag = defineElement((host) => {
      const root = host.attachShadow({ mode: 'open' })
      root.innerHTML = '<input type="checkbox">'
    }, true)
    document.body.innerHTML = `<${tag}></${tag}>`
    const inner = document
      .querySelector(tag)!
      .shadowRoot!.querySelector('input')!
    inner.focus()
    const k = register('K')
    dispatchKey(inner, 'k')
    expect(k).toHaveBeenCalledOnce()
  })
})

describe('hasActiveRegistration with shadow DOM focus', () => {
  function renderSlotted() {
    document.body.innerHTML = '<div id="host"><button>Slotted</button></div>'
    const host = document.getElementById('host')!
    const root = host.attachShadow({ mode: 'open' })
    root.innerHTML =
      '<div id="wrapper"><slot></slot><button id="inner">Inner</button></div>'
    const slotted = host.querySelector('button')!
    // happy-dom doesn't assign slots; browsers set this to the slot.
    Object.defineProperty(slotted, 'assignedSlot', {
      value: root.querySelector('slot'),
    })
    return {
      wrapper: root.getElementById('wrapper')!,
      slotted,
      inner: root.getElementById('inner')!,
    }
  }

  it('is true when focus is on content slotted into the target', () => {
    const { wrapper, slotted } = renderSlotted()
    register('Shift+Q', { target: wrapper })
    slotted.focus()
    expect(HotkeyManager.getInstance().hasActiveRegistration('Shift+Q')).toBe(
      true,
    )
  })

  it('is true when focus is on a shadow child of the target', () => {
    const { wrapper, inner } = renderSlotted()
    register('Shift+Q', { target: wrapper })
    inner.focus()
    expect(HotkeyManager.getInstance().hasActiveRegistration('Shift+Q')).toBe(
      true,
    )
  })

  it('is true when focus is in a nested open shadow root inside the target', () => {
    document.body.innerHTML = '<section><div id="outer"></div></section>'
    const target = document.querySelector('section')!
    const outer = document
      .getElementById('outer')!
      .attachShadow({ mode: 'open' })
    outer.innerHTML = '<div id="inner-host"></div>'
    const inner = outer
      .getElementById('inner-host')!
      .attachShadow({ mode: 'open' })
    inner.innerHTML = '<button>Deep</button>'
    register('Shift+Q', { target })
    inner.querySelector('button')!.focus()
    expect(HotkeyManager.getInstance().hasActiveRegistration('Shift+Q')).toBe(
      true,
    )
  })

  it('is false when focus is outside the target', () => {
    const { wrapper } = renderSlotted()
    document.body.insertAdjacentHTML(
      'beforeend',
      '<button id="out">Out</button>',
    )
    register('Shift+Q', { target: wrapper })
    document.getElementById('out')!.focus()
    expect(HotkeyManager.getInstance().hasActiveRegistration('Shift+Q')).toBe(
      false,
    )
  })
})

describe('what does not block a hotkey', () => {
  it('a radiogroup keeps Space but not letters', () => {
    const group = renderAndFocus(
      '<div role="radiogroup" tabindex="0"></div>',
      'div',
    )
    const space = register('Space')
    const k = register('K')
    dispatchKey(group, ' ')
    dispatchKey(group, 'k')
    expect(space).not.toHaveBeenCalled()
    expect(k).toHaveBeenCalledOnce()
  })

  it('an image map area with an href keeps Enter', () => {
    document.body.innerHTML =
      '<map name="m"><area id="with" href="#a"><area id="without"></map>'
    const enter = register('Enter')
    dispatchKey(document.getElementById('with')!, 'Enter')
    expect(enter).not.toHaveBeenCalled()
    dispatchKey(document.getElementById('without')!, 'Enter')
    expect(enter).toHaveBeenCalledOnce()
  })

  it('a hotkey targeted at a custom element with hidden contents still fires', () => {
    const tag = defineElement((host) => {
      const root = host.attachShadow({ mode: 'closed' })
      root.innerHTML = '<input type="text">'
      root.querySelector('input')!.focus()
    })
    document.body.innerHTML = `<${tag}></${tag}>`
    const host = document.querySelector<HTMLElement>(tag)!
    const k = register('K', { target: host })
    dispatchKey(host, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('a custom element with hidden contents outside the target does not block it', () => {
    const tag = defineElement((host) => {
      const root = host.attachShadow({ mode: 'closed' })
      root.innerHTML = '<input type="text">'
      root.querySelector('input')!.focus()
    })
    document.body.innerHTML = `<${tag}></${tag}><div id="panel" tabindex="0"></div>`
    const panel = document.getElementById('panel')!
    const k = register('K', { target: panel })
    // The event starts inside the target, so focus elsewhere doesn't matter
    dispatchKey(panel, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('a focused text field outside an element target does not block it', () => {
    document.body.innerHTML =
      '<input id="field" type="text"><div id="panel" tabindex="0"></div>'
    document.getElementById('field')!.focus()
    const panel = document.getElementById('panel')!
    const k = register('K', { target: panel })
    dispatchKey(panel, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('a text field inside the target blocks it, but the target itself does not', () => {
    document.body.innerHTML =
      '<div id="editor" contenteditable="true"><span id="inner"></span></div>'
    const editor = document.getElementById('editor')!
    const k = register('K', { target: editor })
    dispatchKey(document.getElementById('inner')!, 'k')
    expect(k).not.toHaveBeenCalled()
  })

  it('a key dispatched on the document checks the focused element', () => {
    const input = renderAndFocus('<input type="text">')
    const k = register('K')
    dispatchKey(document, 'k')
    expect(k).not.toHaveBeenCalled()
    input.blur()
    dispatchKey(document, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('a key dispatched on the document checks focus inside open shadow roots', () => {
    document.body.innerHTML = '<div id="host"></div>'
    const root = document.getElementById('host')!.attachShadow({ mode: 'open' })
    root.innerHTML =
      '<div role="menu"><div role="menuitem" tabindex="0"></div></div>'
    root.querySelector<HTMLElement>('[role="menuitem"]')!.focus()
    const down = register('ArrowDown')
    dispatchKey(document, 'ArrowDown')
    expect(down).not.toHaveBeenCalled()
  })
})

describe('keys dispatched by tests', () => {
  it('an unfocused custom element is not a hidden text field', () => {
    // Component tests often dispatch keys on a host element such as <app-root>
    document.body.innerHTML = '<app-root></app-root>'
    const k = register('K')
    dispatchKey(document.querySelector('app-root')!, 'k')
    expect(k).toHaveBeenCalledOnce()
  })

  it('a key dispatched on an ancestor of the focused text field is blocked', () => {
    document.body.innerHTML =
      '<div id="panel"><input id="field" type="text"></div>'
    document.getElementById('field')!.focus()
    const panel = document.getElementById('panel')!
    const k = register('K', { target: panel })
    dispatchKey(panel, 'k')
    expect(k).not.toHaveBeenCalled()
  })
})

describe('hotkeys in an iframe', () => {
  function renderFrame() {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument!
    doc.body.innerHTML = '<div id="panel"><input id="field" type="text"></div>'
    const field = doc.getElementById('field')!
    field.focus()
    return {
      doc,
      win: iframe.contentWindow!,
      panel: doc.getElementById('panel')!,
      field,
    }
  }

  it.each(['document', 'window', 'element'] as const)(
    'reads focus from the iframe for a %s target',
    (kind) => {
      const { doc, win, panel } = renderFrame()
      const target = kind === 'document' ? doc : kind === 'window' ? win : panel
      const k = register('K', { target })
      dispatchKey(kind === 'element' ? panel : doc, 'k')
      expect(k).not.toHaveBeenCalled()
    },
  )
})

describe('the keys each control keeps', () => {
  const KEYS = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    'Enter',
    'Space',
    'k',
  ] as const
  type Key = (typeof KEYS)[number]
  const ARROWS: Array<Key> = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  const UP_DOWN: Array<Key> = ['ArrowUp', 'ArrowDown']
  const LEFT_RIGHT: Array<Key> = ['ArrowLeft', 'ArrowRight']
  const EDGES: Array<Key> = ['Home', 'End']
  const PAGES: Array<Key> = ['PageUp', 'PageDown']
  const ACTIVATE: Array<Key> = ['Enter', 'Space']

  // [focused markup, keys it keeps]. Every other key in KEYS must fire.
  const CASES: Array<[string, Array<Key>]> = [
    ['<div role="menu">', [...ARROWS, ...EDGES, ...ACTIVATE, 'k']],
    ['<div role="menubar">', [...ARROWS, ...EDGES, ...ACTIVATE, 'k']],
    ['<div role="tree">', [...ARROWS, ...EDGES, ...ACTIVATE, 'k']],
    ['<div role="listbox">', [...UP_DOWN, ...EDGES, ...ACTIVATE, 'k']],
    [
      '<div role="listbox" aria-orientation="horizontal">',
      [...LEFT_RIGHT, ...EDGES, ...ACTIVATE, 'k'],
    ],
    ['<div role="combobox">', [...UP_DOWN, ...EDGES, ...ACTIVATE, 'k']],
    ['<div role="tablist">', [...LEFT_RIGHT, ...EDGES, ...ACTIVATE]],
    [
      '<div role="tablist" aria-orientation="vertical">',
      [...UP_DOWN, ...EDGES, ...ACTIVATE],
    ],
    ['<div role="toolbar">', [...LEFT_RIGHT, ...EDGES]],
    [
      '<div role="toolbar" aria-orientation="vertical">',
      [...UP_DOWN, ...EDGES],
    ],
    ['<div role="grid">', [...ARROWS, ...EDGES, ...PAGES, ...ACTIVATE]],
    ['<div role="treegrid">', [...ARROWS, ...EDGES, ...PAGES, ...ACTIVATE]],
    ['<div role="radiogroup">', [...ARROWS, 'Space']],
    ['<div role="slider">', [...ARROWS, ...EDGES, ...PAGES]],
    ['<div role="spinbutton">', [...UP_DOWN, ...EDGES, ...PAGES]],
    ['<div role="button">', ACTIVATE],
    ['<div role="tab">', ACTIVATE],
    ['<div role="option">', ACTIVATE],
    ['<div role="treeitem">', ACTIVATE],
    ['<div role="menuitem">', ACTIVATE],
    ['<div role="menuitemcheckbox">', ACTIVATE],
    ['<div role="menuitemradio">', ACTIVATE],
    ['<div role="link">', ['Enter']],
    ['<div role="checkbox">', ['Space']],
    ['<div role="switch">', ['Space']],
    ['<div role="radio">', ['Space']],
    ['<button>', ACTIVATE],
    ['<summary>', ACTIVATE],
    ['<a href="#x">', ['Enter']],
    ['<a>', []],
    ['<input type="button">', ACTIVATE],
    ['<input type="submit">', ACTIVATE],
    ['<input type="reset">', ACTIVATE],
    ['<input type="image">', ACTIVATE],
    ['<input type="color">', ACTIVATE],
    ['<input type="file">', ACTIVATE],
    ['<input type="checkbox">', ['Space']],
    ['<input type="radio">', [...ARROWS, 'Space']],
    ['<input type="range">', [...ARROWS, ...EDGES, ...PAGES]],
    ['<input type="text" readonly>', [...LEFT_RIGHT, ...EDGES]],
    ['<textarea readonly>', [...ARROWS, ...EDGES, ...PAGES]],
    ['<div>', []],
  ]

  it.each(CASES)('%s keeps %j', (markup, kept) => {
    const tag = /^<(\w+)/.exec(markup)![1]!
    const isVoid = tag === 'input'
    document.body.innerHTML = isVoid ? markup : `${markup}</${tag}>`
    const element = document.body.firstElementChild as HTMLElement
    element.tabIndex = 0
    element.focus()
    for (const key of KEYS) {
      const callback = register((key === 'k' ? 'K' : key) as HotkeyChord)
      dispatchKey(element, key === 'Space' ? ' ' : key)
      if (kept.includes(key)) expect(callback, key).not.toHaveBeenCalled()
      else expect(callback, key).toHaveBeenCalledOnce()
      HotkeyManager.resetInstance()
    }
  })
})
