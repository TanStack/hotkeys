import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createHotkeyBindings,
  createHotkeySequenceBindings,
} from '../src/adapter'
import { HotkeyManager, getHotkeyManager } from '../src/hotkey-manager'
import { SequenceManager, getSequenceManager } from '../src/sequence-manager'

function press(
  key: string,
  target: EventTarget = document,
  options: KeyboardEventInit = {},
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...options }),
  )
  target.dispatchEvent(
    new KeyboardEvent('keyup', { key, bubbles: true, ...options }),
  )
}

afterEach(() => {
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  document.body.replaceChildren()
})

describe('adapter bindings', () => {
  it('retains handles for callback and enabled updates, restores omitted defaults', () => {
    const bindings = createHotkeyBindings()
    const first = vi.fn()
    const latest = vi.fn()
    bindings.update([
      { hotkey: 'A', callback: first, options: { enabled: false } },
    ])
    const id = [...getHotkeyManager().registrations.state.keys()][0]
    press('a')
    expect(first).not.toHaveBeenCalled()
    bindings.update([{ hotkey: 'A', callback: latest }])
    expect([...getHotkeyManager().registrations.state.keys()]).toEqual([id])
    press('a')
    expect(latest).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
    bindings.destroy()
    press('a')
    expect(latest).toHaveBeenCalledOnce()
  })

  it('moves targets, respects null targets, and removes stale dynamic entries', () => {
    const bindings = createHotkeyBindings()
    const callback = vi.fn()
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)
    bindings.update(
      [
        { hotkey: 'A', callback },
        { hotkey: 'B', callback },
      ],
      { target: a },
    )
    bindings.update([{ hotkey: 'B', callback }], { target: b })
    press('b', a)
    press('a', b)
    expect(callback).not.toHaveBeenCalled()
    press('b', b)
    expect(callback).toHaveBeenCalledOnce()
    bindings.update([{ hotkey: 'B', callback }], { target: null })
    expect(getHotkeyManager().registrations.state.size).toBe(0)
  })

  it('resolves raw Mod shortcuts and platform changes, including input defaults', () => {
    const bindings = createHotkeyBindings()
    const callback = vi.fn()
    const input = document.createElement('input')
    document.body.append(input)
    bindings.update([{ hotkey: { key: 'S', mod: true }, callback }], {
      platform: 'windows',
    })
    press('s', input, { ctrlKey: true })
    expect(callback).toHaveBeenCalledOnce()
    bindings.update([{ hotkey: { key: 'S', mod: true }, callback }], {
      platform: 'mac',
    })
    press('s', input, { ctrlKey: true })
    expect(callback).toHaveBeenCalledOnce()
    press('s', input, { metaKey: true })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('keeps sequence progress through callback updates and cleans up timers', () => {
    const bindings = createHotkeySequenceBindings()
    const first = vi.fn()
    const latest = vi.fn()
    bindings.update([
      { sequence: ['G', 'G'], callback: first },
      { sequence: [], callback: first },
    ])
    const id = [...getSequenceManager().registrations.state.keys()][0]
    press('g')
    bindings.update([{ sequence: ['G', 'G'], callback: latest }])
    press('g')
    expect(latest).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
    expect([...getSequenceManager().registrations.state.keys()]).toEqual([id])
    bindings.destroy()
    bindings.destroy()
    expect(getSequenceManager().registrations.state.size).toBe(0)
  })
})
