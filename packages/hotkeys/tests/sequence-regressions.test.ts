import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import { createSequenceMatcher } from '../src/match'
import type { HotkeySequence } from '../src/hotkey.types'

/** Keeps logical output independent from physical position in layout fixtures. */
function keyEvent(key: string, code: string, options: KeyboardEventInit = {}) {
  return new KeyboardEvent('keydown', { key, code, bubbles: true, ...options })
}

/** Dispatches a sequence step through the manager's document listener. */
function press(key: string, code: string, options: KeyboardEventInit = {}) {
  document.dispatchEvent(keyEvent(key, code, options))
}

afterEach(() => {
  HotkeyManager.resetInstance()
  vi.useRealTimers()
})

describe('sequence match priority', () => {
  it.each([false, true])(
    'prefers exact output regardless of registration order (%s)',
    (reverse) => {
      const manager = HotkeyManager.getInstance()
      const exact = vi.fn()
      const fallback = vi.fn()
      const registrations: Array<[HotkeySequence, typeof exact]> = [
        [['G', '/'], exact],
        [['G', 'Q'], fallback],
      ]
      for (const [sequence, callback] of reverse
        ? registrations.reverse()
        : registrations)
        manager.register(sequence, callback)
      press('g', 'KeyG')
      press('/', 'KeyQ')
      expect(exact).toHaveBeenCalledOnce()
      expect(fallback).not.toHaveBeenCalled()
      // A losing match must not leave progress that can fire on the next key.
      press('q', 'KeyQ')
      expect(fallback).not.toHaveBeenCalled()
    },
  )

  it('prefers physical matches over logical fallbacks on an intermediate step', () => {
    const manager = HotkeyManager.getInstance()
    const exact = vi.fn()
    const fallback = vi.fn()
    manager.register(['G', '[KeyQ]', 'X'], exact)
    manager.register(['G', 'Q', 'X'], fallback)
    press('g', 'KeyG')
    press('/', 'KeyQ')
    press('x', 'KeyX')
    expect(exact).toHaveBeenCalledOnce()
    expect(fallback).not.toHaveBeenCalled()
  })

  it('keeps equally strong matches and permits fallback when no exact match is eligible', () => {
    const manager = HotkeyManager.getInstance()
    const logical = vi.fn()
    const physical = vi.fn()
    const disabled = vi.fn()
    manager.register(['G', 'Q'], logical)
    manager.register(['G', '[KeyQ]'], physical)
    manager.register(['G', '/'], disabled, { enabled: false })
    press('g', 'KeyG')
    press('q', 'KeyQ')
    expect(logical).toHaveBeenCalledOnce()
    expect(physical).toHaveBeenCalledOnce()
    HotkeyManager.resetInstance()
    const nextManager = HotkeyManager.getInstance()
    nextManager.register(['G', 'Q'], logical)
    nextManager.register(['G', '/'], disabled, { enabled: false })
    press('g', 'KeyG')
    press('/', 'KeyQ')
    expect(logical).toHaveBeenCalledTimes(2)
    expect(disabled).not.toHaveBeenCalled()
  })
})

describe.each(['key', 'code'] as const)(
  'sequence event filtering (%s)',
  (mode) => {
    const g = mode === 'key' ? 'G' : '[KeyG]'
    const c = mode === 'key' ? 'Shift+C' : 'Shift+[KeyC]'

    it.each(['modifier', 'composition'] as const)(
      'standalone matcher ignores %s events without losing progress',
      (kind) => {
        const matcher = createSequenceMatcher([g, c])
        matcher.match(keyEvent('g', 'KeyG'))
        const ignored =
          kind === 'modifier'
            ? keyEvent('Shift', 'ShiftLeft', { shiftKey: true })
            : keyEvent('Process', 'KeyA', { isComposing: true })
        expect(matcher.match(ignored)).toBe(false)
        expect(matcher.getProgress()).toBe(1)
        expect(matcher.match(keyEvent('C', 'KeyC', { shiftKey: true }))).toBe(
          true,
        )
      },
    )

    it('ignoring events does not extend the standalone timeout', () => {
      vi.useFakeTimers()
      const matcher = createSequenceMatcher([g, c], { timeout: 100 })
      matcher.match(keyEvent('g', 'KeyG'))
      vi.advanceTimersByTime(90)
      matcher.match(keyEvent('Shift', 'ShiftLeft', { shiftKey: true }))
      vi.advanceTimersByTime(20)
      expect(matcher.match(keyEvent('C', 'KeyC', { shiftKey: true }))).toBe(
        false,
      )
    })

    it('requires separate presses in the manager and standalone matcher', () => {
      const callback = vi.fn()
      const manager = HotkeyManager.getInstance()
      manager.register([g, g], callback)
      const matcher = createSequenceMatcher([g, g])
      press('g', 'KeyG')
      matcher.match(keyEvent('g', 'KeyG'))
      press('g', 'KeyG', { repeat: true })
      expect(matcher.match(keyEvent('g', 'KeyG', { repeat: true }))).toBe(false)
      expect(callback).not.toHaveBeenCalled()
      expect(matcher.getProgress()).toBe(1)
      document.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'g', code: 'KeyG', bubbles: true }),
      )
      press('g', 'KeyG')
      expect(matcher.match(keyEvent('g', 'KeyG'))).toBe(true)
      expect(callback).toHaveBeenCalledOnce()
    })
  },
)

it('applies match priority when restarting a partially matched sequence', () => {
  const manager = HotkeyManager.getInstance()
  const exact = vi.fn()
  const fallback = vi.fn()
  manager.register(['/', 'X'], exact)
  manager.register(['Q', 'Y'], fallback)
  press('q', 'KeyQ')
  press('/', 'KeyQ')
  press('y', 'KeyY')
  expect(fallback).not.toHaveBeenCalled()
  press('/', 'KeyQ')
  press('x', 'KeyX')
  expect(exact).toHaveBeenCalledOnce()
})

it('uses priority for keyup sequences without letting keydown registrations suppress them', () => {
  const manager = HotkeyManager.getInstance()
  const exact = vi.fn()
  const fallback = vi.fn()
  const keydown = vi.fn()
  manager.register(['G', '/'], exact, { eventType: 'keyup' })
  manager.register(['G', 'Q'], fallback, { eventType: 'keyup' })
  manager.register(['G', '[KeyQ]'], keydown)
  for (const [key, code] of [
    ['g', 'KeyG'],
    ['/', 'KeyQ'],
  ])
    document.dispatchEvent(
      new KeyboardEvent('keyup', { key, code, bubbles: true }),
    )
  expect(exact).toHaveBeenCalledOnce()
  expect(fallback).not.toHaveBeenCalled()
  expect(keydown).not.toHaveBeenCalled()
})

it('repeat events neither begin a sequence nor extend its timeout', () => {
  vi.useFakeTimers()
  const callback = vi.fn()
  const manager = HotkeyManager.getInstance()
  manager.register(['[KeyG]', '[KeyG]'], callback, { timeout: 100 })
  const matcher = createSequenceMatcher(['[KeyG]', '[KeyG]'], { timeout: 100 })
  press('g', 'KeyG', { repeat: true })
  matcher.match(keyEvent('g', 'KeyG', { repeat: true }))
  expect(matcher.getProgress()).toBe(0)
  press('g', 'KeyG')
  matcher.match(keyEvent('g', 'KeyG'))
  expect(callback).not.toHaveBeenCalled()
  vi.advanceTimersByTime(90)
  press('g', 'KeyG', { repeat: true })
  matcher.match(keyEvent('g', 'KeyG', { repeat: true }))
  vi.advanceTimersByTime(20)
  press('g', 'KeyG')
  expect(matcher.match(keyEvent('g', 'KeyG'))).toBe(false)
  expect(callback).not.toHaveBeenCalled()
})

describe('equivalent sequence conflicts', () => {
  it.each([
    [
      ['Control+S', 'Escape'],
      ['Ctrl+S', 'Esc'],
    ],
    [
      ['Ctrl+Shift+S', 'G'],
      ['Shift+Control+S', 'g'],
    ],
    [
      ['Control+[KeyS]', '[Enter]'],
      ['Ctrl+[KeyS]', '[Enter]'],
    ],
  ] as Array<[HotkeySequence, HotkeySequence]>)(
    'rejects equivalent steps %j and %j',
    (original, equivalent) => {
      const manager = HotkeyManager.getInstance()
      manager.register(original, vi.fn())
      expect(() =>
        manager.register(equivalent, vi.fn(), { conflictBehavior: 'error' }),
      ).toThrow(/already registered/)
      expect(manager.getRegistrationCount()).toBe(1)
    },
  )

  it('replaces the old callback while preserving the supplied sequence spelling', () => {
    const manager = HotkeyManager.getInstance()
    const oldCallback = vi.fn()
    const newCallback = vi.fn()
    const oldHandle = manager.register(['Control+S', 'Escape'], oldCallback)
    // Exercise runtime aliases accepted by the parser but omitted from canonical types.
    const sequence = ['Ctrl+S', 'Esc'] as unknown as HotkeySequence
    manager.register(sequence, newCallback, { conflictBehavior: 'replace' })
    expect(oldHandle.isActive).toBe(false)
    expect(manager.getRegistrationCount()).toBe(1)
    expect([...manager.registrations.state.values()][0]?.hotkey).toEqual(
      sequence,
    )
    expect(sequence).toEqual(['Ctrl+S', 'Esc'])
    press('s', 'KeyS', { ctrlKey: true })
    press('Escape', 'Escape')
    expect(oldCallback).not.toHaveBeenCalled()
    expect(newCallback).toHaveBeenCalledOnce()
  })

  it('warns for aliases by default and honors allow', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const manager = HotkeyManager.getInstance()
      manager.register(['Control+S', 'G'], vi.fn())
      manager.register(['Ctrl+S', 'G'] as HotkeySequence, vi.fn())
      expect(warn).toHaveBeenCalledOnce()
      manager.register(['Ctrl+S', 'G'] as HotkeySequence, vi.fn(), {
        conflictBehavior: 'allow',
      })
      expect(warn).toHaveBeenCalledOnce()
      expect(manager.getRegistrationCount()).toBe(3)
    } finally {
      warn.mockRestore()
    }
  })

  it('compares Mod using each registration’s resolved platform', () => {
    const manager = HotkeyManager.getInstance()
    manager.register(['Mod+S', 'G'], vi.fn(), { platform: 'mac' })
    expect(() =>
      manager.register(['Meta+S', 'G'], vi.fn(), {
        platform: 'windows',
        conflictBehavior: 'error',
      }),
    ).toThrow(/already registered/)
    expect(() =>
      manager.register(['Mod+S', 'G'], vi.fn(), {
        platform: 'windows',
        conflictBehavior: 'error',
      }),
    ).not.toThrow()
  })

  it('keeps different identities, step order, lengths, modifiers, and targets distinct', () => {
    const manager = HotkeyManager.getInstance()
    manager.register(['Ctrl+Enter', 'G'] as HotkeySequence, vi.fn())
    for (const sequence of [
      ['Ctrl+[Enter]', 'G'],
      ['Ctrl+Enter', 'G', 'G'],
      ['G', 'Ctrl+Enter'],
      ['Ctrl+Shift+Enter', 'G'],
    ] as Array<HotkeySequence>) {
      expect(() =>
        manager.register(sequence, vi.fn(), { conflictBehavior: 'error' }),
      ).not.toThrow()
    }
    expect(() =>
      manager.register(['Control+Enter', 'G'], vi.fn(), {
        target: document.createElement('div'),
        conflictBehavior: 'error',
      }),
    ).not.toThrow()
  })
})

describe('sequence steps before the last', () => {
  afterEach(() => {
    vi.useRealTimers()
    HotkeyManager.resetInstance()
  })

  function keydown(key: string, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...init,
    })
    document.dispatchEvent(event)
    return event
  }

  it('prevents the default of each step that advances, and stops propagation only on the last', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()
    const outer = vi.fn()
    window.addEventListener('keydown', outer)
    manager.register(['Mod+K', 'Mod+C'], callback, { platform: 'windows' })

    expect(keydown('k', { ctrlKey: true }).defaultPrevented).toBe(true)
    expect(outer).toHaveBeenCalledTimes(1)
    expect(keydown('c', { ctrlKey: true }).defaultPrevented).toBe(true)
    expect(outer).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledOnce()
    expect(keydown('x').defaultPrevented).toBe(false)
    window.removeEventListener('keydown', outer)
  })

  it('leaves earlier steps alone with preventDefault: false', () => {
    const manager = HotkeyManager.getInstance()
    manager.register(['G', 'H'], () => {}, { preventDefault: false })
    expect(keydown('g').defaultPrevented).toBe(false)
    expect(keydown('h').defaultPrevented).toBe(false)
  })

  it('clears progress and notifies subscribers once the timeout passes', () => {
    vi.useFakeTimers()
    const manager = HotkeyManager.getInstance()
    const handle = manager.register(['G', 'H'], () => {}, { timeout: 500 })
    const progress = () => {
      const registration = manager.registrations.state.get(handle.id)!
      return registration.kind === 'sequence' ? registration.currentIndex : -1
    }
    const listener = vi.fn()
    const subscription = manager.registrations.subscribe(listener)

    keydown('g')
    expect(progress()).toBe(1)
    listener.mockClear()
    vi.advanceTimersByTime(500)
    expect(progress()).toBe(1)
    expect(listener).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(progress()).toBe(0)
    expect(listener).toHaveBeenCalled()

    keydown('g')
    vi.advanceTimersByTime(400)
    keydown('h')
    expect(progress()).toBe(0)
    keydown('g')
    handle.unregister()
    expect(vi.getTimerCount()).toBe(0)
    subscription.unsubscribe()
  })
})
