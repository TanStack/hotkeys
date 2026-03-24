// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@solidjs/testing-library'
import { SequenceManager } from '@tanstack/hotkeys'
import {
  createHotkeySequences,
  type CreateHotkeySequenceDefinition,
} from '../src/createHotkeySequences'
import { createSignal, type Component } from 'solid-js'

function dispatchKey(key: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

describe('createHotkeySequences', () => {
  beforeEach(() => {
    SequenceManager.resetInstance()
  })

  afterEach(() => {
    SequenceManager.resetInstance()
  })

  it('should register multiple sequence handlers', () => {
    const a = vi.fn()
    const b = vi.fn()

    const TestComponent: Component = () => {
      createHotkeySequences([
        { sequence: ['G', 'G'], callback: a },
        { sequence: ['D', 'D'], callback: b },
      ])
      return null
    }

    render(() => <TestComponent />)

    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(2)
  })

  it('should call the correct callback for each sequence', () => {
    const gg = vi.fn()
    const dd = vi.fn()

    const TestComponent: Component = () => {
      createHotkeySequences([
        { sequence: ['G', 'G'], callback: gg },
        { sequence: ['D', 'D'], callback: dd },
      ])
      return null
    }

    render(() => <TestComponent />)

    dispatchKey('g')
    dispatchKey('g')
    expect(gg).toHaveBeenCalledTimes(1)
    expect(dd).not.toHaveBeenCalled()

    dispatchKey('d')
    dispatchKey('d')
    expect(gg).toHaveBeenCalledTimes(1)
    expect(dd).toHaveBeenCalledTimes(1)
  })

  it('should unregister all sequences on unmount', () => {
    const TestComponent: Component = () => {
      createHotkeySequences([
        { sequence: ['G', 'G'], callback: vi.fn() },
        { sequence: ['D', 'D'], callback: vi.fn() },
      ])
      return null
    }

    const { unmount } = render(() => <TestComponent />)

    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(2)
    unmount()
    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(0)
  })

  it('should handle an empty array as a no-op', () => {
    const TestComponent: Component = () => {
      createHotkeySequences([])
      return null
    }

    render(() => <TestComponent />)
    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(0)
  })

  it('should skip definitions with an empty sequence', () => {
    const TestComponent: Component = () => {
      createHotkeySequences([
        { sequence: [], callback: vi.fn() },
        { sequence: ['G', 'G'], callback: vi.fn() },
      ])
      return null
    }

    render(() => <TestComponent />)
    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(1)
  })

  it('should handle dynamic accessor for definitions', () => {
    const gg = vi.fn()
    const yy = vi.fn()
    const [defs, setDefs] = createSignal<Array<CreateHotkeySequenceDefinition>>(
      [{ sequence: ['G', 'G'], callback: gg }],
    )

    const TestComponent: Component = () => {
      createHotkeySequences(() => defs())
      return null
    }

    render(() => <TestComponent />)

    dispatchKey('y')
    dispatchKey('y')
    expect(yy).not.toHaveBeenCalled()

    setDefs([
      { sequence: ['G', 'G'], callback: gg },
      { sequence: ['Y', 'Y'], callback: yy },
    ])

    dispatchKey('y')
    dispatchKey('y')
    expect(yy).toHaveBeenCalledTimes(1)
  })
})
