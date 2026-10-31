import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createHotkeyBindings,
  mergeHotkeysProviderDefaults,
  prepareHotkeyDefinitions,
} from '../src/adapter'
import { HotkeyManager, getHotkeyManager } from '../src/hotkey-manager'
import { matchesKeyboardEvent } from '../src/match'
import { matchesHeldModifiers } from '../src/hint'
import type { HotkeyChordOptions, HotkeySequenceOptions } from '../src'

type AnyOptions = HotkeyChordOptions & HotkeySequenceOptions

/** Presses Ctrl+S on the body and reports what happened to the event. */
function pressCtrlS() {
  let reachedWindow = false
  const listener = () => (reachedWindow = true)
  window.addEventListener('keydown', listener)
  const event = new KeyboardEvent('keydown', {
    key: 's',
    code: 'KeyS',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  })
  document.body.dispatchEvent(event)
  window.removeEventListener('keydown', listener)
  return { defaultPrevented: event.defaultPrevented, reachedWindow }
}

function press(key: string, init: KeyboardEventInit = {}) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, bubbles: true, ...init }),
  )
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

describe('empty hotkeys', () => {
  it.each([
    ['empty string', ''],
    ['blank string', '  '],
    ['chord object with an empty key', { key: '' }],
    ['sequence with an empty step', ['G', '']],
  ])('register throws for an %s', (_, hotkey) => {
    expect(() =>
      getHotkeyManager().register(hotkey as never, () => {}),
    ).toThrow(/has no key/)
    expect(getHotkeyManager().registrations.state.size).toBe(0)
  })

  it('adapter bindings register nothing, and a cleared hotkey unregisters', () => {
    const callback = vi.fn()
    const bindings = createHotkeyBindings()
    bindings.update([{ hotkey: 'K', callback }])
    expect(getHotkeyManager().registrations.state.size).toBe(1)
    bindings.update([{ hotkey: '' as never, callback }])
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '' }))
    document.dispatchEvent(new Event('keydown'))
    press('k')
    expect(callback).not.toHaveBeenCalled()
    bindings.destroy()
  })

  it('never match a key-less event', () => {
    expect(
      matchesKeyboardEvent(
        new KeyboardEvent('keydown', { key: '' }),
        '' as never,
      ),
    ).toBe(false)
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
    'register throws a clear error for %s',
    (hotkey) => {
      expect(() =>
        getHotkeyManager().register(hotkey as never, () => {}),
      ).toThrow('A hotkey is required')
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
    { key: '', ctrl: true },
    { key: '', shift: true },
    ['G', { key: '', mod: true }],
  ])('adapter bindings skip %j', (hotkey) => {
    const bindings = createHotkeyBindings()
    bindings.update([{ hotkey: hotkey as never, callback: () => {} }])
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    bindings.destroy()
  })
})
