import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import { SequenceManager } from '../src/sequence-manager'
import type { Hotkey, HotkeyOptions } from '../src'

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
  SequenceManager.resetInstance()
  document.body.innerHTML = ''
})

describe.each(['hotkey', 'sequence'] as const)(
  '%s native activation',
  (kind) => {
    function register(hotkey: Hotkey, options: HotkeyOptions = {}) {
      const callback = vi.fn()
      if (kind === 'hotkey') {
        HotkeyManager.getInstance().register(hotkey, callback, options)
      } else {
        SequenceManager.getInstance().register([hotkey], callback, options)
      }
      return callback
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

      expect(dispatchKey(element, ' ').defaultPrevented).toBe(false)
      expect(dispatchKey(element, 'Enter').defaultPrevented).toBe(false)
      expect(space).not.toHaveBeenCalled()
      expect(enter).not.toHaveBeenCalled()
    })

    it('preserves Enter on links but still handles Space', () => {
      const element = focusControl('<a href="#destination">Link</a>')
      const enter = register('Enter')
      const space = register('Space')

      expect(dispatchKey(element, 'Enter').defaultPrevented).toBe(false)
      expect(enter).not.toHaveBeenCalled()
      expect(dispatchKey(element, ' ').defaultPrevented).toBe(true)
      expect(space).toHaveBeenCalledOnce()
    })

    it('still handles Enter on an anchor without href', () => {
      const element = focusControl('<a tabindex="0">Placeholder</a>')
      const callback = register('Enter')
      dispatchKey(element, 'Enter')
      expect(callback).toHaveBeenCalledOnce()
    })

    it.each(['keydown', 'keyup'] as const)(
      'preserves activation for %s listeners',
      (eventType) => {
        const element = focusControl()
        const callback = register('Space', { eventType })
        expect(dispatchKey(element, ' ', {}, eventType).defaultPrevented).toBe(
          false,
        )
        expect(callback).not.toHaveBeenCalled()
        element.blur()
        dispatchKey(document.body, ' ', {}, eventType)
        expect(callback).toHaveBeenCalledOnce()
      },
    )

    it('preserves explicit ignoreInputs: false', () => {
      const element = focusControl()
      const callback = register('Space', { ignoreInputs: false })
      expect(dispatchKey(element, ' ').defaultPrevented).toBe(true)
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
        expect(dispatchKey(element, 'Enter').defaultPrevented).toBe(true)
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
      dispatchKey(element, key, modifiers)
      expect(callback).toHaveBeenCalledOnce()
    })

    it('protects a button in an open shadow root', () => {
      const host = focusControl('<div></div>')
      const shadow = host.attachShadow({ mode: 'open' })
      const button = document.createElement('button')
      shadow.append(button)
      button.focus()
      const callback = register('Enter')
      expect(dispatchKey(button, 'Enter').defaultPrevented).toBe(false)
      expect(callback).not.toHaveBeenCalled()
    })

    it('still handles activation keys when no native control has focus', () => {
      const element = focusControl('<div tabindex="0">Content</div>')
      const callback = register('Space')
      dispatchKey(element, ' ')
      expect(callback).toHaveBeenCalledOnce()
    })
  },
)

it('does not consume native activation as a sequence step', () => {
  const element = focusControl()
  const callback = vi.fn()
  const manager = SequenceManager.getInstance()
  const handle = manager.register(['Space', 'G'], callback)
  dispatchKey(element, ' ')
  expect(manager.registrations.state.get(handle.id)?.matchedStepCount).toBe(0)
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
