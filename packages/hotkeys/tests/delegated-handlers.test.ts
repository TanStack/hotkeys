import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import type { HotkeyChordOptions, Target } from '../src/hotkey-manager'

// React, Svelte and Octane run declarative key handlers from one listener on
// the app's root container, and Solid from one on the document. These tests
// stand in for that with a listener that calls each element's handler from the
// event's target outwards, as those frameworks do.

const log: Array<string> = []
const cleanups: Array<() => void> = []

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
  log.length = 0
})

type Handler = (event: KeyboardEvent) => void

/** A root container whose listener runs handlers set with `on`, inner first. */
function delegatingRoot(listenOn?: Document) {
  const root = document.createElement('div')
  document.body.append(root)
  const handlers = new WeakMap<EventTarget, Handler>()
  const node: EventTarget = listenOn ?? root
  const listener = (event: Event) => {
    for (const element of event.composedPath()) {
      if (element === node || event.cancelBubble) break
      handlers.get(element)?.(event as KeyboardEvent)
    }
  }
  node.addEventListener('keydown', listener)
  cleanups.push(() => node.removeEventListener('keydown', listener))
  return {
    root,
    on: (element: EventTarget, handler: Handler) =>
      handlers.set(element, handler),
  }
}

/** A focusable panel with a child, both with delegated handlers. */
function panelWithChild(listenOn?: Document) {
  const { root, on } = delegatingRoot(listenOn)
  const panel = document.createElement('div')
  const child = document.createElement('span')
  panel.tabIndex = 0
  child.tabIndex = 0
  panel.append(child)
  root.append(panel)
  return { root, panel, child, on }
}

function press(element: Element, key = 'k', init: KeyboardEventInit = {}) {
  element.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      composed: true,
      ...init,
    }),
  )
}

function register(
  name: string,
  target: Target,
  options: HotkeyChordOptions = {},
  hotkey = 'K',
) {
  return HotkeyManager.getInstance().register(
    hotkey as 'K',
    () => log.push(name),
    { target, afterDelegatedHandlers: true, ...options },
  )
}

describe('afterDelegatedHandlers', () => {
  it("runs an element target's hotkey after delegated handlers inside it", () => {
    const { panel, child, on } = panelWithChild()
    on(child, () => log.push('child'))
    on(panel, () => log.push('panel'))
    register('hotkey', panel)

    child.focus()
    press(child)

    expect(log).toEqual(['child', 'panel', 'hotkey'])
  })

  it('skips the hotkey when a delegated handler stops propagation', () => {
    const { panel, child, on } = panelWithChild()
    on(child, (event) => {
      log.push('child')
      event.stopPropagation()
    })
    register('hotkey', panel)

    child.focus()
    press(child)

    expect(log).toEqual(['child'])
  })

  it('skips the hotkey when a handler on the document stops propagation first', () => {
    // Solid delegates to the document, where its listener runs before ours.
    const { panel, child, on } = panelWithChild(document)
    on(child, (event) => {
      log.push('child')
      event.stopPropagation()
    })
    register('element hotkey', panel)
    register('document hotkey', document, {}, 'J')

    child.focus()
    press(child)
    press(child, 'j')

    expect(log).toEqual(['child', 'child'])
  })

  it('ignores events outside the target', () => {
    const { panel, root } = panelWithChild()
    const outside = document.createElement('button')
    root.append(outside)
    register('hotkey', panel)

    outside.focus()
    press(outside)

    expect(log).toEqual([])
  })

  it('runs before document hotkeys, and its stop skips them', () => {
    const { panel, child } = panelWithChild()
    register('document hotkey', document)
    register('panel hotkey', panel, { conflictBehavior: 'allow' })

    child.focus()
    press(child)

    expect(log).toEqual(['panel hotkey'])
  })

  it('lets document hotkeys run after it when it does not stop propagation', () => {
    const { panel, child } = panelWithChild()
    register('document hotkey', document)
    register('panel hotkey', panel, {
      conflictBehavior: 'allow',
      stopPropagation: false,
    })

    child.focus()
    press(child)

    expect(log).toEqual(['panel hotkey', 'document hotkey'])
  })

  it('runs nested targets inner first, and an inner stop skips the outer', () => {
    const { panel, child } = panelWithChild()
    register('outer', panel)
    register('inner', child, { conflictBehavior: 'allow' })

    child.focus()
    press(child)
    expect(log).toEqual(['inner'])

    log.length = 0
    HotkeyManager.resetInstance()
    register('outer', panel, { stopPropagation: false })
    register('inner', child, { stopPropagation: false })
    press(child)
    expect(log).toEqual(['inner', 'outer'])
  })

  it('still skips keys that a control inside the target uses', () => {
    const { panel } = panelWithChild()
    const input = document.createElement('input')
    panel.append(input)
    register('hotkey', panel)

    input.focus()
    press(input)

    expect(log).toEqual([])
  })

  it('keeps capture registrations on the target', () => {
    const { panel, child, on } = panelWithChild()
    on(child, () => log.push('child'))
    register('hotkey', panel, { capture: true, stopPropagation: false })

    child.focus()
    press(child)

    expect(log).toEqual(['hotkey', 'child'])
  })

  it('moves between listeners when options change, and stops after unregister', () => {
    const { panel, child, on } = panelWithChild()
    on(child, () => log.push('child'))
    const handle = register('hotkey', panel, { stopPropagation: false })

    child.focus()
    press(child)
    handle.setOptions({ capture: true })
    press(child)
    handle.setOptions({ capture: false })
    press(child)
    handle.setOptions({ afterDelegatedHandlers: false })
    press(child)
    handle.unregister()
    press(child)

    expect(log).toEqual([
      'child',
      'hotkey',
      'hotkey',
      'child',
      'child',
      'hotkey',
      'hotkey',
      'child',
      'child',
    ])
  })

  it('without the option, keeps the element listener', () => {
    const { panel, child, on } = panelWithChild()
    on(child, () => log.push('child'))
    register('hotkey', panel, {
      afterDelegatedHandlers: false,
      stopPropagation: false,
    })

    child.focus()
    press(child)

    expect(log).toEqual(['hotkey', 'child'])
  })
})

describe('afterDelegatedHandlers listener bookkeeping', () => {
  it('removes the listener from the document it attached to after the target moves', () => {
    const { panel } = panelWithChild()
    const handle = register('hotkey', panel)
    const other = document.implementation.createHTMLDocument()
    other.body.append(other.adoptNode(panel))
    const remove = vi.spyOn(document, 'removeEventListener')

    handle.unregister()

    expect(remove.mock.calls.map(([type]) => type)).toEqual([
      'keydown',
      'keyup',
    ])
    remove.mockRestore()
  })

  it('moves the document listener after listeners added since, such as a framework that delegates later', () => {
    const { panel, child } = panelWithChild()
    // An earlier hotkey attached the document listener first.
    HotkeyManager.getInstance().register('X', () => {})
    const stop = (event: Event) => {
      log.push('delegated')
      event.stopPropagation()
    }
    document.addEventListener('keydown', stop)
    cleanups.push(() => document.removeEventListener('keydown', stop))
    register('hotkey', panel)

    child.focus()
    press(child)

    expect(log).toEqual(['delegated'])
  })
})

describe('afterDelegatedHandlers listener placement', () => {
  it('reaches an element that is not in a document', () => {
    const panel = document.createElement('div')
    const child = document.createElement('span')
    panel.append(child)
    register('hotkey', panel)

    press(child)

    expect(log).toEqual(['hotkey'])
  })

  it('does not move a shared capture listener', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('X', () => {}, { capture: true })
    const later = () => log.push('later capture listener')
    document.addEventListener('keydown', later, true)
    cleanups.push(() => document.removeEventListener('keydown', later, true))
    register('hotkey', document, { capture: true, stopPropagation: false })

    press(document.body)

    expect(log).toEqual(['hotkey', 'later capture listener'])
  })

  it('moves the listener when setOptions turns the option on', () => {
    const { child } = panelWithChild()
    const handle = register('hotkey', document, {
      afterDelegatedHandlers: false,
    })
    const stop = (event: Event) => {
      log.push('delegated')
      event.stopPropagation()
    }
    document.addEventListener('keydown', stop)
    cleanups.push(() => document.removeEventListener('keydown', stop))
    handle.setOptions({ afterDelegatedHandlers: true })

    child.focus()
    press(child)

    expect(log).toEqual(['delegated'])
  })
})
