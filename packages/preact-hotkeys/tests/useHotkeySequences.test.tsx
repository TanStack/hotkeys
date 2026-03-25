// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/preact'
import { SequenceManager } from '@tanstack/hotkeys'
import { useHotkeySequences } from '../src/useHotkeySequences'
import type { UseHotkeySequenceDefinition } from '../src/useHotkeySequences'

function dispatchKey(key: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

function SequencesComponent({
  definitions,
}: {
  definitions: Array<UseHotkeySequenceDefinition>
}) {
  useHotkeySequences(definitions)
  return null
}

describe('useHotkeySequences', () => {
  beforeEach(() => {
    SequenceManager.resetInstance()
  })

  afterEach(() => {
    SequenceManager.resetInstance()
    cleanup()
  })

  it('should register multiple sequence handlers', () => {
    const a = vi.fn()
    const b = vi.fn()

    render(
      <SequencesComponent
        definitions={[
          { sequence: ['G', 'G'], callback: a },
          { sequence: ['D', 'D'], callback: b },
        ]}
      />,
    )

    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(2)
  })

  it('should call the correct callback for each sequence', () => {
    const gg = vi.fn()
    const dd = vi.fn()

    render(
      <SequencesComponent
        definitions={[
          { sequence: ['G', 'G'], callback: gg },
          { sequence: ['D', 'D'], callback: dd },
        ]}
      />,
    )

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
    const { unmount } = render(
      <SequencesComponent
        definitions={[
          { sequence: ['G', 'G'], callback: vi.fn() },
          { sequence: ['D', 'D'], callback: vi.fn() },
        ]}
      />,
    )

    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(2)
    unmount()
    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(0)
  })

  it('should handle an empty array as a no-op', () => {
    render(<SequencesComponent definitions={[]} />)
    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(0)
  })

  it('should skip definitions with an empty sequence', () => {
    render(
      <SequencesComponent
        definitions={[
          { sequence: [], callback: vi.fn() },
          { sequence: ['G', 'G'], callback: vi.fn() },
        ]}
      />,
    )
    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(1)
  })

  it('should register disabled sequences and keep them in the manager', () => {
    const enabledCb = vi.fn()
    const disabledCb = vi.fn()

    render(
      <SequencesComponent
        definitions={[
          { sequence: ['G', 'G'], callback: enabledCb },
          {
            sequence: ['D', 'D'],
            callback: disabledCb,
            options: { enabled: false },
          },
        ]}
      />,
    )

    dispatchKey('g')
    dispatchKey('g')
    dispatchKey('d')
    dispatchKey('d')
    expect(enabledCb).toHaveBeenCalledTimes(1)
    expect(disabledCb).not.toHaveBeenCalled()

    const manager = SequenceManager.getInstance()
    expect(manager.getRegistrationCount()).toBe(2)
    const disabledView = [...manager.registrations.state.values()].find(
      (r) => r.sequence[0] === 'D' && r.sequence[1] === 'D',
    )
    expect(disabledView?.options.enabled).toBe(false)
  })

  it('should move a sequence registration when only the target changes', () => {
    const callback = vi.fn()
    const targetA = document.createElement('div')
    const targetB = document.createElement('div')

    const { rerender } = render(
      <SequencesComponent
        definitions={[
          { sequence: ['G', 'G'], callback, options: { target: targetA } },
        ]}
      />,
    )

    targetA.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
    )
    targetA.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
    )
    expect(callback).toHaveBeenCalledTimes(1)

    rerender(
      <SequencesComponent
        definitions={[
          { sequence: ['G', 'G'], callback, options: { target: targetB } },
        ]}
      />,
    )
    expect(SequenceManager.getInstance().getRegistrationCount()).toBe(1)

    targetA.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
    )
    targetA.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
    )
    expect(callback).toHaveBeenCalledTimes(1)

    targetB.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
    )
    targetB.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', bubbles: true }),
    )
    expect(callback).toHaveBeenCalledTimes(2)
  })

  describe('stale closure prevention', () => {
    it('should sync enabled option on every render', () => {
      const callback = vi.fn()

      function EnabledSequences({ enabled }: { enabled: boolean }) {
        useHotkeySequences([
          { sequence: ['G', 'G'], callback, options: { enabled } },
        ])
        return null
      }

      const { rerender } = render(<EnabledSequences enabled={true} />)

      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)

      rerender(<EnabledSequences enabled={false} />)
      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(1)

      rerender(<EnabledSequences enabled={true} />)
      dispatchKey('g')
      dispatchKey('g')
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should preserve registration id when toggling enabled', () => {
      const callback = vi.fn()
      const manager = SequenceManager.getInstance()

      function EnabledSequences({ enabled }: { enabled: boolean }) {
        useHotkeySequences([
          { sequence: ['G', 'G'], callback, options: { enabled } },
        ])
        return null
      }

      const { rerender } = render(<EnabledSequences enabled={true} />)

      const idBefore = [...manager.registrations.state.keys()][0]
      expect(manager.getRegistrationCount()).toBe(1)

      rerender(<EnabledSequences enabled={false} />)
      expect(manager.getRegistrationCount()).toBe(1)
      expect([...manager.registrations.state.keys()][0]).toBe(idBefore)

      rerender(<EnabledSequences enabled={true} />)
      expect([...manager.registrations.state.keys()][0]).toBe(idBefore)
    })
  })
})
