import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, toHotkeyRegistrationView } from '../src/hotkey-manager'
import type { HotkeySequenceRegistrationView } from '../src/hotkey-manager'
import type { HotkeyChord, HotkeyOptions } from '../src'

function focusControl(markup = '<button>Action</button>') {
  document.body.innerHTML = markup
  const element = document.body.firstElementChild as HTMLElement
  element.focus()
  return element
}

function dispatchKey(
  element: EventTarget,
  key: string,
  options: KeyboardEventInit = {},
  type = 'keydown',
) {
  const event = new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
    composed: true,
    ...options,
  })
  element.dispatchEvent(event)
  return event
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
      type = 'keydown',
    ) {
      if (kind === 'sequence') dispatchKey(element, 'g', {}, type)
      return dispatchKey(element, key, options, type)
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

    it.each(['control', 'container'] as const)(
      'preserves explicit %s targets',
      (scope) => {
        const container = focusControl('<div><button>Action</button></div>')
        const element = container.firstElementChild as HTMLElement
        element.focus()
        const callback = register('Enter', {
          target: scope === 'control' ? element : container,
        })
        expect(press(element, 'Enter').defaultPrevented).toBe(true)
        expect(callback).toHaveBeenCalledOnce()
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
  dispatchKey(element, ' ')
  const view = toHotkeyRegistrationView(
    manager.registrations.state.get(handle.id)!,
  ) as HotkeySequenceRegistrationView
  expect(view.matchedStepCount).toBe(0)
  element.blur()
  dispatchKey(document.body, 'g')
  expect(callback).not.toHaveBeenCalled()
})

it('preserves native activation for a physical-code binding', () => {
  const element = focusControl()
  const callback = vi.fn()
  HotkeyManager.getInstance().register({ code: 'NumpadEnter' }, callback)
  expect(
    dispatchKey(element, 'Enter', { code: 'NumpadEnter' }).defaultPrevented,
  ).toBe(false)
  expect(callback).not.toHaveBeenCalled()
})
