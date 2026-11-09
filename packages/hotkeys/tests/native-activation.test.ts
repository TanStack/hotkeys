import { keyEvent, keydown } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, toHotkeyRegistrationView } from '../src/hotkey-manager'
import type { HotkeyChord, HotkeyOptions } from '../src'
import type { HotkeySequenceRegistrationView } from '../src/hotkey-manager'

function focusControl(markup = '<button>Action</button>') {
  document.body.innerHTML = markup
  const element = document.body.firstElementChild as HTMLElement
  element.focus()
  return element
}

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

describe.each(['hotkey', 'sequence'] as const)(
  '%s native activation',
  (kind) => {
    // Sequences end with the hotkey under test, so the activation key is
    // checked as a later sequence step rather than collapsing to a chord.
    function register(hotkey: HotkeyChord, options: HotkeyOptions = {}) {
      const callback = vi.fn()
      if (kind === 'hotkey') {
        HotkeyManager.getInstance().register(hotkey, callback, options)
      } else {
        HotkeyManager.getInstance().register(['G', hotkey], callback, options)
      }
      return callback
    }

    function press(
      element: EventTarget,
      key: string,
      options: KeyboardEventInit = {},
      type: 'keydown' | 'keyup' = 'keydown',
    ) {
      if (kind === 'sequence')
        keyEvent(type, { key: 'g', composed: true, target: element })
      return keyEvent(type, {
        key,
        composed: true,
        ...options,
        target: element,
      })
    }

    it.each([
      '<button>Action</button>',
      '<input type="button">',
      '<input type="submit">',
      '<input type="reset">',
    ])('preserves Space and Enter on %s', (markup) => {
      const element = focusControl(markup)
      const space = register('Space')
      const enter = register('Enter')

      expect(press(element, ' ').defaultPrevented).toBe(false)
      expect(press(element, 'Enter').defaultPrevented).toBe(false)
      expect(space).not.toHaveBeenCalled()
      expect(enter).not.toHaveBeenCalled()
    })

    it('preserves Enter on links but still handles Space', () => {
      const element = focusControl('<a href="#destination">Link</a>')
      const enter = register('Enter')
      const space = register('Space')

      expect(press(element, 'Enter').defaultPrevented).toBe(false)
      expect(enter).not.toHaveBeenCalled()
      expect(press(element, ' ').defaultPrevented).toBe(true)
      expect(space).toHaveBeenCalledOnce()
    })

    it('still handles Enter on an anchor without href', () => {
      const element = focusControl('<a tabindex="0">Placeholder</a>')
      const callback = register('Enter')
      press(element, 'Enter')
      expect(callback).toHaveBeenCalledOnce()
    })

    it.each(['keydown', 'keyup'] as const)(
      'preserves activation for %s listeners',
      (eventType) => {
        const element = focusControl()
        const callback = register('Space', { eventType })
        expect(press(element, ' ', {}, eventType).defaultPrevented).toBe(false)
        expect(callback).not.toHaveBeenCalled()
        element.blur()
        press(document.body, ' ', {}, eventType)
        expect(callback).toHaveBeenCalledOnce()
      },
    )

    it('preserves explicit ignoreInputs: false', () => {
      const element = focusControl()
      const callback = register('Space', { ignoreInputs: false })
      expect(press(element, ' ').defaultPrevented).toBe(true)
      expect(callback).toHaveBeenCalledOnce()
    })

    it('lets a hotkey targeted at the control handle its activation keys', () => {
      const element = focusControl()
      const callback = register('Enter', { target: element })
      expect(press(element, 'Enter').defaultPrevented).toBe(true)
      expect(callback).toHaveBeenCalledOnce()
    })

    it('preserves activation for a button inside an element target', () => {
      // An Enter "confirm" hotkey on a dialog must not swallow Enter on its Cancel button
      const dialog = focusControl(
        '<div tabindex="0"><button>Cancel</button></div>',
      )
      const cancel = dialog.firstElementChild as HTMLElement
      const callback = register('Enter', { target: dialog })

      cancel.focus()
      expect(press(cancel, 'Enter').defaultPrevented).toBe(false)
      expect(callback).not.toHaveBeenCalled()

      dialog.focus()
      press(dialog, 'Enter')
      expect(callback).toHaveBeenCalledOnce()
    })

    it.each(['Space', 'Enter'] as const)(
      'preserves %s on a summary element',
      (hotkey) => {
        const details = focusControl(
          '<details><summary>More</summary>Content</details>',
        )
        const summary = details.firstElementChild as HTMLElement
        summary.focus()
        const callback = register(hotkey)
        expect(
          press(summary, hotkey === 'Space' ? ' ' : 'Enter').defaultPrevented,
        ).toBe(false)
        expect(callback).not.toHaveBeenCalled()
      },
    )

    it.each([
      ['K', 'k', {}],
      ['Escape', 'Escape', {}],
      ['Mod+S', 's', { metaKey: true }],
      ['Shift+Space', ' ', { shiftKey: true }],
      ['Alt+Enter', 'Enter', { altKey: true, code: 'Enter' }],
      ['Control+Enter', 'Enter', { ctrlKey: true }],
      ['Meta+Enter', 'Enter', { metaKey: true }],
    ] as const)('preserves %s on buttons', (hotkey, key, modifiers) => {
      const element = focusControl()
      const callback = register(hotkey, { platform: 'mac' })
      press(element, key, modifiers)
      expect(callback).toHaveBeenCalledOnce()
    })

    it('protects a button in an open shadow root', () => {
      const host = focusControl('<div></div>')
      const shadow = host.attachShadow({ mode: 'open' })
      const button = document.createElement('button')
      shadow.append(button)
      button.focus()
      const callback = register('Enter')
      expect(press(button, 'Enter').defaultPrevented).toBe(false)
      expect(callback).not.toHaveBeenCalled()
    })

    it('still handles activation keys when no native control has focus', () => {
      const element = focusControl('<div tabindex="0">Content</div>')
      const callback = register('Space')
      press(element, ' ')
      expect(callback).toHaveBeenCalledOnce()
    })
  },
)

it('does not consume native activation as a sequence step', () => {
  const element = focusControl()
  const callback = vi.fn()
  const manager = HotkeyManager.getInstance()
  const handle = manager.register(['Space', 'G'], callback)
  keydown({ key: ' ', target: element })
  const view = toHotkeyRegistrationView(
    manager.registrations.state.get(handle.id)!,
  ) as HotkeySequenceRegistrationView
  expect(view.matchedStepCount).toBe(0)
  element.blur()
  keydown({ key: 'g', target: document.body })
  expect(callback).not.toHaveBeenCalled()
})

it('preserves native activation for a physical-code binding', () => {
  const element = focusControl()
  const callback = vi.fn()
  HotkeyManager.getInstance().register({ code: 'NumpadEnter' }, callback)
  expect(
    keydown({ key: 'Enter', code: 'NumpadEnter', target: element })
      .defaultPrevented,
  ).toBe(false)
  expect(callback).not.toHaveBeenCalled()
})

// Keys the browser reports as Unidentified still match by position (#229)
it('preserves native activation for an Unidentified key', () => {
  const element = focusControl()
  const space = vi.fn()
  const physical = vi.fn()
  const enter = vi.fn()
  HotkeyManager.getInstance().register('Space', space)
  HotkeyManager.getInstance().register('Shift+[Space]', physical)
  HotkeyManager.getInstance().register('Enter', enter)
  keydown({ key: 'Unidentified', code: 'Space', target: element })
  keydown({
    key: 'Unidentified',
    code: 'Space',
    shiftKey: true,
    target: element,
  })
  keydown({ key: 'Unidentified', code: 'NumpadEnter', target: element })
  expect(space).not.toHaveBeenCalled()
  expect(enter).not.toHaveBeenCalled()

  // Shift+Space isn't activation, so the hotkey still fires
  expect(physical).toHaveBeenCalledOnce()

  // Named codes are read as their key names
  const enterCode = vi.fn()
  HotkeyManager.getInstance().register('[Enter]', enterCode)
  keydown({ key: 'Unidentified', code: 'Enter', target: element })
  expect(enterCode).not.toHaveBeenCalled()
})

it('lets a focused widget keep Unidentified navigation and typeahead keys', () => {
  const element = focusControl('<div role="listbox" tabindex="0"></div>')
  const arrow = vi.fn()
  const digit = vi.fn()
  HotkeyManager.getInstance().register('[ArrowDown]', arrow)
  HotkeyManager.getInstance().register('1', digit)
  keydown({ key: 'Unidentified', code: 'ArrowDown', target: element })
  keydown({ key: 'Unidentified', code: 'Digit1', target: element })
  expect(arrow).not.toHaveBeenCalled()
  expect(digit).not.toHaveBeenCalled()
})

it('preserves native activation in an iframe for an iframe document target', () => {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  const frameDocument = iframe.contentDocument!
  frameDocument.body.innerHTML =
    '<button>Action</button><div tabindex="0"></div>'
  // Real browsers give each frame its own DOM classes; happy-dom shares one set.
  for (const name of ['Document', 'HTMLElement', 'HTMLButtonElement']) {
    vi.stubGlobal(name, class {})
  }

  try {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('Enter', callback, {
      target: frameDocument,
    })
    const button = frameDocument.querySelector('button')!
    button.focus()
    expect(keydown({ key: 'Enter', target: button }).defaultPrevented).toBe(
      false,
    )
    expect(callback).not.toHaveBeenCalled()

    const panel = frameDocument.querySelector('div')!
    panel.focus()
    keydown({ key: 'Enter', target: panel })
    expect(callback).toHaveBeenCalledOnce()
  } finally {
    vi.unstubAllGlobals()
  }
})
