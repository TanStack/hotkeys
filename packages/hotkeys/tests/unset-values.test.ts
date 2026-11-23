import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createHotkeyBindings,
  mergeHotkeysProviderDefaults,
  prepareHotkeyDefinitions,
} from '../src/adapter'
import { matchesHeldModifiers } from '../src/hint'
import { HotkeyManager, getHotkeyManager } from '../src/hotkey-manager'
import { matchesKeyboardEvent } from '../src/match'
import type { HotkeyChordOptions, HotkeySequenceOptions } from '../src'

type AnyOptions = HotkeyChordOptions & HotkeySequenceOptions

/** Presses Ctrl+S on the body and reports what happened to the event. */
function pressCtrlS() {
  let reachedWindow = false
  const listener = () => (reachedWindow = true)
  window.addEventListener('keydown', listener)
  const event = keydown({
    key: 's',
    code: 'KeyS',
    ctrlKey: true,
    target: document.body,
  })
  window.removeEventListener('keydown', listener)
  return { defaultPrevented: event.defaultPrevented, reachedWindow }
}

function press(key: string, init: KeyboardEventInit = {}) {
  keydown({ key, ...init, target: document })
  keyup({ key, ...init, target: document })
}

const DEFAULT_RESULT = { defaultPrevented: true, reachedWindow: false }

const unset = {
  preventDefault: undefined,
  stopPropagation: undefined,
  eventType: undefined,
  enabled: undefined,
  capture: undefined,
  ignoreInputs: undefined,
  scope: undefined,
  conflictBehavior: undefined,
  requireReset: undefined,
} as unknown as AnyOptions

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

describe('undefined options keep their defaults', () => {
  it('register', () => {
    const callback = vi.fn()
    const handle = getHotkeyManager().register('Control+S', callback, unset)
    expect(pressCtrlS()).toEqual(DEFAULT_RESULT)
    expect(callback).toHaveBeenCalledOnce()
    const { options } = getHotkeyManager().registrations.state.get(handle.id)!
    expect(options).toMatchObject({
      preventDefault: true,
      stopPropagation: true,
      eventType: 'keydown',
      enabled: true,
      capture: false,
      ignoreInputs: 'auto',
      scope: 'global',
      conflictBehavior: 'warn',
      requireReset: false,
    })
  })

  it('register a sequence with timeout: undefined', () => {
    const callback = vi.fn()
    const handle = getHotkeyManager().register(['G', 'H'], callback, {
      timeout: undefined,
    })
    expect(
      (
        getHotkeyManager().registrations.state.get(handle.id)!
          .options as AnyOptions
      ).timeout,
    ).toBe(1000)
    press('g')
    press('h')
    expect(callback).toHaveBeenCalledOnce()
  })

  it('setOptions resets an undefined option to its default', () => {
    const handle = getHotkeyManager().register('Control+S', () => {}, {
      preventDefault: false,
      stopPropagation: false,
      scope: 'editor',
    })
    getHotkeyManager().activateScope('editor')
    expect(pressCtrlS()).toEqual({
      defaultPrevented: false,
      reachedWindow: true,
    })
    handle.setOptions({
      preventDefault: undefined,
      stopPropagation: undefined,
      scope: undefined,
    })
    expect(pressCtrlS()).toEqual(DEFAULT_RESULT)
    expect(
      getHotkeyManager().registrations.state.get(handle.id)!.options.scope,
    ).toBe('global')
  })

  it('setOptions removes an undefined option that has no default', () => {
    const handle = getHotkeyManager().register('K', () => {}, {
      meta: { name: 'Open' },
    })
    handle.setOptions({ meta: undefined })
    expect(
      'meta' in getHotkeyManager().registrations.state.get(handle.id)!.options,
    ).toBe(false)
  })

  it('adapter bindings', () => {
    const bindings = createHotkeyBindings()
    bindings.update([
      { hotkey: 'Control+S', callback: () => {}, options: unset },
    ])
    expect(pressCtrlS()).toEqual(DEFAULT_RESULT)
    bindings.update(
      [{ hotkey: 'Control+S', callback: () => {}, options: unset }],
      unset,
    )
    expect(pressCtrlS()).toEqual(DEFAULT_RESULT)
    bindings.destroy()
  })

  it('later layers do not overwrite earlier ones with undefined', () => {
    const [definition] = prepareHotkeyDefinitions(
      [
        {
          hotkey: 'K',
          callback: () => {},
          options: { preventDefault: undefined, scope: undefined },
        },
      ],
      {
        defaults: { preventDefault: false, scope: 'dialog' },
        commonOptions: { preventDefault: undefined },
      },
    )
    expect(definition!.options).toEqual({
      preventDefault: false,
      scope: 'dialog',
    })
  })

  it('provider defaults with undefined keep the parent defaults', () => {
    const merged = mergeHotkeysProviderDefaults(
      {
        hotkey: { preventDefault: false },
        hotkeyRecorder: { ignoreInputs: false },
      },
      {
        hotkey: { preventDefault: undefined },
        hotkeyRecorder: { ignoreInputs: undefined },
      },
      undefined,
    )
    expect(merged).toEqual({
      hotkey: { preventDefault: false },
      hotkeyRecorder: { ignoreInputs: false },
    })
  })
})

describe('null targets', () => {
  it('skip registration without resolveTarget', () => {
    const bindings = createHotkeyBindings()
    bindings.update(
      prepareHotkeyDefinitions([
        { hotkey: 'K', callback: () => {}, options: { target: null } },
      ]),
    )
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    bindings.update(
      prepareHotkeyDefinitions([{ hotkey: 'K', callback: () => {} }]),
    )
    expect(
      [...getHotkeyManager().registrations.state.values()][0]!.target,
    ).toBe(document)
    bindings.destroy()
  })
})

describe('unset targets', () => {
  const targets = () =>
    [...getHotkeyManager().registrations.state.values()].map(
      (registration) => registration.target,
    )

  it('wait when a target option is set to undefined', () => {
    const bindings = createHotkeyBindings()
    bindings.update(
      prepareHotkeyDefinitions([
        { hotkey: 'K', callback: () => {}, options: { target: undefined } },
      ]),
    )
    expect(targets()).toEqual([])
    bindings.update(
      prepareHotkeyDefinitions([{ hotkey: 'K', callback: () => {} }], {
        commonOptions: { target: undefined },
      }),
    )
    expect(targets()).toEqual([])
    bindings.destroy()
  })

  it('wait when resolveTarget returns undefined', () => {
    const bindings = createHotkeyBindings()
    const ref: { current?: HTMLElement } = {}
    const prepare = () =>
      prepareHotkeyDefinitions(
        [{ hotkey: 'K', callback: () => {}, options: { target: ref } }],
        { resolveTarget: (target) => target.current },
      )
    bindings.update(prepare())
    expect(targets()).toEqual([])
    ref.current = document.body.appendChild(document.createElement('div'))
    bindings.update(prepare())
    expect(targets()).toEqual([ref.current])
    bindings.destroy()
    ref.current.remove()
  })

  it('use the document only when no layer sets a target', () => {
    const bindings = createHotkeyBindings()
    bindings.update(
      prepareHotkeyDefinitions(
        [{ hotkey: 'K', callback: () => {}, options: { enabled: true } }],
        { defaults: { preventDefault: true }, commonOptions: {} },
      ),
    )
    expect(targets()).toEqual([document])
    bindings.destroy()
  })

  it('keep an earlier layer target when a later layer is undefined', () => {
    const element = document.body.appendChild(document.createElement('div'))
    const bindings = createHotkeyBindings()
    bindings.update(
      prepareHotkeyDefinitions(
        [{ hotkey: 'K', callback: () => {}, options: { target: undefined } }],
        { commonOptions: { target: element } },
      ),
    )
    expect(targets()).toEqual([element])
    bindings.destroy()
    element.remove()
  })
})

describe('empty hotkeys', () => {
  it.each([
    ['empty string', ''],
    ['blank string', '  '],
    ['chord object with an empty key', { key: '' }],
    ['chord object with an empty code', { code: '' }],
    ['sequence with an empty step', ['G', '']],
  ])('register returns an inactive handle for an %s', (_, hotkey) => {
    const callback = vi.fn()
    const handle = getHotkeyManager().register(hotkey as never, callback)
    expect(handle.isActive).toBe(false)
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    document.dispatchEvent(new Event('keydown'))
    keydown({ key: '', target: document })
    expect(callback).not.toHaveBeenCalled()
  })

  it('adapter bindings register nothing, and a cleared hotkey unregisters', () => {
    const callback = vi.fn()
    const bindings = createHotkeyBindings()
    bindings.update([{ hotkey: 'K', callback }])
    expect(getHotkeyManager().registrations.state.size).toBe(1)
    bindings.update([{ hotkey: '' as never, callback }])
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    keydown({ key: '', target: document })
    document.dispatchEvent(new Event('keydown'))
    press('k')
    expect(callback).not.toHaveBeenCalled()
    bindings.destroy()
  })

  it('never match a key-less event', () => {
    expect(matchesKeyboardEvent(keydown({ key: '' }), '' as never)).toBe(false)
  })
})

describe('nullish hotkeys', () => {
  it.each([undefined, null])('adapter bindings skip %s', (hotkey) => {
    const callback = vi.fn()
    const bindings = createHotkeyBindings()
    bindings.update(prepareHotkeyDefinitions([{ hotkey: 'K', callback }]))
    expect(getHotkeyManager().registrations.state.size).toBe(1)
    bindings.update(prepareHotkeyDefinitions([{ hotkey, callback }]))
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    press('k')
    expect(callback).not.toHaveBeenCalled()
    bindings.update(prepareHotkeyDefinitions([{ hotkey: 'K', callback }]))
    press('k')
    expect(callback).toHaveBeenCalledOnce()
    bindings.destroy()
  })

  it.each([undefined, null])(
    'register returns an inactive handle for %s',
    (hotkey) => {
      const handle = getHotkeyManager().register(hotkey as never, () => {})
      expect(handle.isActive).toBe(false)
      expect(getHotkeyManager().registrations.state.size).toBe(0)
      expect(() => handle.unregister()).not.toThrow()
    },
  )

  it.each([undefined, null, ''])(
    '%j has no hint and no active registration',
    (hotkey) => {
      expect(getHotkeyManager().hasActiveRegistration(hotkey as never)).toBe(
        false,
      )
      expect(matchesHeldModifiers(hotkey as never, ['Control'])).toBe(false)
    },
  )
})

describe('empty keys with modifiers', () => {
  it.each([
    [{ key: '', ctrl: true }],
    [{ key: '', shift: true }],
    [['G', { key: '', mod: true }]],
  ])('adapter bindings skip %j', (hotkey) => {
    const bindings = createHotkeyBindings()
    bindings.update([{ hotkey: hotkey as never, callback: () => {} }])
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    bindings.destroy()
  })
})
