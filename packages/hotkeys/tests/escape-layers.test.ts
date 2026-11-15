import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import type { HotkeyOptions, RegisterableHotkey } from '../src'

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

/** Renders `markup`, focuses `#focus`, and returns it. */
function render(markup: string): HTMLElement {
  document.body.innerHTML = markup
  const focused = document.getElementById('focus')!
  focused.focus()
  return focused
}

function register(
  hotkey: RegisterableHotkey = 'Escape',
  options: Omit<HotkeyOptions, 'target'> & { target?: string } = {},
) {
  const callback = vi.fn()
  const target = options.target
    ? document.querySelector<HTMLElement>(options.target)!
    : undefined
  HotkeyManager.getInstance().register(hotkey, callback, {
    ...options,
    target,
  })
  return callback
}

/** Presses Escape on the focused element. Returns the event and whether `window` saw it. */
function pressEscape(key = 'Escape') {
  const reached = vi.fn()
  window.addEventListener('keydown', reached)
  const event = keydown({
    key,
    composed: true,
    target: document.activeElement!,
  })
  window.removeEventListener('keydown', reached)
  return { event, reachedWindow: reached.mock.calls.length > 0 }
}

const DIALOG =
  '<div id="dialog" role="dialog" aria-modal="true"><input id="focus"></div>'

describe('Escape inside an ARIA layer', () => {
  it.each([
    ['dialog', DIALOG],
    [
      'dialog without aria-modal',
      '<div role="dialog"><button id="focus">OK</button></div>',
    ],
    [
      'alertdialog',
      '<div role="alertdialog"><button id="focus">OK</button></div>',
    ],
    [
      'menu',
      '<div role="menu"><div role="menuitem" tabindex="0" id="focus">Copy</div></div>',
    ],
    [
      'expanded combobox',
      '<input id="focus" role="combobox" aria-expanded="true">',
    ],
    [
      'expanded combobox around its text field',
      '<div role="combobox" aria-expanded="true"><input id="focus"></div>',
    ],
    [
      'menu button with its menu open',
      '<button id="focus" aria-haspopup="menu" aria-expanded="true">Edit</button>',
    ],
    [
      'dialog in a shadow root',
      '<div id="host"></div>',
      () => {
        const root = document.getElementById('host')!.attachShadow({
          mode: 'open',
        })
        root.innerHTML = '<div role="dialog"><button>OK</button></div>'
        root.querySelector('button')!.focus()
      },
    ],
  ])(
    'a global Escape hotkey leaves Escape to a focused %s',
    (_, markup, setup?: () => void) => {
      document.body.innerHTML = markup
      document.getElementById('focus')?.focus()
      setup?.()
      const callback = register()

      const { event, reachedWindow } = pressEscape()

      expect(callback).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(false)
      expect(reachedWindow).toBe(true)
    },
  )

  it.each([
    [
      'collapsed combobox',
      '<input id="focus" role="combobox" aria-expanded="false">',
    ],
    [
      'expanded disclosure button',
      '<button id="focus" aria-expanded="true">Details</button>',
    ],
    [
      'button whose popup is closed',
      '<button id="focus" aria-haspopup="menu" aria-expanded="false">Edit</button>',
    ],
    [
      '<dialog> that the browser does not close, despite its role',
      '<dialog open role="dialog"><button id="focus">OK</button></dialog>',
    ],
    [
      'closed dialog left in the page, with focus outside it',
      '<div role="dialog" aria-modal="true" hidden><button>OK</button></div><button id="focus">Page</button>',
    ],
  ])('a global Escape hotkey still fires next to a %s', (_, markup) => {
    render(markup)
    const callback = register()

    const { event } = pressEscape()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('a hotkey targeted inside the dialog keeps Escape', () => {
    render(DIALOG)
    const callback = register('Escape', { target: '#dialog' })

    const { event } = pressEscape()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('a hotkey in a named scope keeps Escape, as a dialog with its own scope does', () => {
    render(DIALOG)
    HotkeyManager.getInstance().activateScope('dialog')
    const callback = register('Escape', { scope: 'dialog' })

    pressEscape()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['combobox', '<input id="focus" role="combobox" aria-expanded="true">'],
    [
      'menu',
      '<div role="menu"><div role="menuitem" tabindex="0" id="focus">Copy</div></div>',
    ],
  ])(
    "a dialog's scoped hotkey leaves Escape to an open %s inside it",
    (_, inner) => {
      render(`<div id="dialog" role="dialog">${inner}</div>`)
      HotkeyManager.getInstance().activateScope('dialog')
      const callback = register('Escape', { scope: 'dialog' })

      const { event } = pressEscape()

      expect(callback).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(false)
    },
  )

  it('a hotkey on an outer dialog leaves Escape to the dialog nested in it', () => {
    render(
      '<div id="outer" role="dialog"><div role="dialog"><button id="focus">OK</button></div></div>',
    )
    const callback = register('Escape', { target: '#outer' })

    pressEscape()

    expect(callback).not.toHaveBeenCalled()
  })

  it('other keys still reach global hotkeys inside the dialog', () => {
    render(DIALOG)
    const callback = register('Control+K')

    keydown({
      key: 'k',
      ctrlKey: true,
      composed: true,
      target: document.activeElement!,
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('a keyup Escape hotkey skips the release of the Escape the dialog took', () => {
    const focused = render(DIALOG)
    const callback = register('Escape', { eventType: 'keyup' })

    pressEscape()
    keyup({ key: 'Escape', composed: true, target: focused })

    expect(callback).not.toHaveBeenCalled()
  })

  it('reads the layer before a listener that closes it on the same press', () => {
    const focused = render(DIALOG)
    const callback = register()
    // Like Radix UI and the Angular CDK: close the dialog, and move focus out,
    // before the hotkey's document listener runs.
    const close = () => {
      document.getElementById('dialog')!.remove()
      document.body.focus()
    }
    document.addEventListener('keydown', close, { capture: true })

    keydown({ key: 'Escape', composed: true, target: focused })
    document.removeEventListener('keydown', close, { capture: true })

    expect(callback).not.toHaveBeenCalled()
  })

  it('keeps reading the layer early after a target moves into the page and unregisters', () => {
    const focused = render(DIALOG)
    const callback = register()
    // An element from a document without a window, moved in after registering.
    const moved = document.implementation
      .createHTMLDocument()
      .createElement('div')
    const handle = HotkeyManager.getInstance().register('Escape', vi.fn(), {
      target: moved,
    })
    document.body.append(moved)
    handle.unregister()
    const close = () => {
      document.getElementById('dialog')!.remove()
      document.body.focus()
    }
    document.addEventListener('keydown', close, { capture: true })

    keydown({ key: 'Escape', composed: true, target: focused })
    document.removeEventListener('keydown', close, { capture: true })

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('Escape next to a native dialog', () => {
  it('still fires in a browser without :modal', () => {
    render('<dialog open><button id="focus">OK</button></dialog>')
    const matches = Element.prototype.matches
    const spy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        if (selector === ':modal') throw new SyntaxError(selector)
        return matches.call(this, selector)
      })
    const callback = register()

    pressEscape()
    spy.mockRestore()

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
