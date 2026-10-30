import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '@tanstack/hotkeys'
import { triggerRegistration } from '../src/_trigger'

afterEach(() => {
  HotkeyManager.resetInstance()
})

describe('triggerRegistration', () => {
  it('runs the callback with the registration context and counts it', () => {
    const manager = HotkeyManager.getInstance()
    const callback = vi.fn()
    const handle = manager.register('Mod+K', callback, { platform: 'windows' })
    const listener = vi.fn()
    manager.registrations.subscribe(listener)

    expect(triggerRegistration(handle.id)).toBe(true)
    expect(callback).toHaveBeenCalledOnce()
    const [event, context] = callback.mock.calls[0]!
    expect(event).toBeInstanceOf(KeyboardEvent)
    expect(event).toMatchObject({ key: 'K', ctrlKey: true, type: 'keydown' })
    const registration = manager.registrations.state.get(handle.id)!
    expect(context).toEqual({
      kind: 'chord',
      hotkey: 'Mod+K',
      parsedChord: registration.kind === 'chord' && registration.parsedChord,
    })
    expect(manager.registrations.state.get(handle.id)!.triggerCount).toBe(1)
    expect(listener).toHaveBeenCalled()
  })

  it('returns false for an unknown id', () => {
    expect(triggerRegistration('missing')).toBe(false)
  })

  it('marks a sequence as fired', () => {
    const manager = HotkeyManager.getInstance()
    const handle = manager.register(['G', 'G'], vi.fn())
    expect(manager.registrations.state.get(handle.id)!.hasFired).toBe(false)
    triggerRegistration(handle.id)
    expect(manager.registrations.state.get(handle.id)!.hasFired).toBe(true)
  })

  it('synthesizes the code rather than inventing a character for physical bindings', () => {
    const manager = HotkeyManager.getInstance()
    const single = vi.fn()
    const sequence = vi.fn()
    triggerRegistration(manager.register('Alt+[KeyS]', single).id)
    triggerRegistration(manager.register(['[KeyG]', 'Alt+[KeyS]'], sequence).id)
    for (const callback of [single, sequence]) {
      expect(callback.mock.calls[0]![0].code).toBe('KeyS')
      expect(callback.mock.calls[0]![0].key).toBe('')
    }
    expect(single.mock.calls[0]![1].parsedChord).not.toHaveProperty('key')
    expect(sequence.mock.calls[0]![1].parsedSequence[1]).not.toHaveProperty(
      'key',
    )
  })
})
