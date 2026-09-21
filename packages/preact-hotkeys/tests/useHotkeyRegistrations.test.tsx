import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/preact'
import { HotkeyManager, SequenceManager } from '@tanstack/hotkeys'
import { useHotkeyRegistrations } from '../src/useHotkeyRegistrations'

describe('useHotkeyRegistrations', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    SequenceManager.resetInstance()
  })

  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
    SequenceManager.resetInstance()
  })

  it('settles without registry updates and reflects registration changes', () => {
    let renders = 0
    function Registry() {
      if (++renders > 20) throw new Error('Registry did not settle')
      const { hotkeys, sequences } = useHotkeyRegistrations()
      return (
        <output>
          {hotkeys.length} hotkeys, {sequences.length} sequences
        </output>
      )
    }
    const view = render(<Registry />)
    expect(view.getByText('0 hotkeys, 0 sequences')).toBeTruthy()
    const hotkeys = HotkeyManager.getInstance()
    const sequences = SequenceManager.getInstance()
    act(() => {
      hotkeys.register('Alt+[KeyS]', () => {})
      sequences.register(['G', '[KeyI]'], () => {})
    })
    expect(view.getByText('1 hotkeys, 1 sequences')).toBeTruthy()
    act(() => {
      hotkeys.destroy()
      sequences.destroy()
    })
    expect(view.getByText('0 hotkeys, 0 sequences')).toBeTruthy()
  })
})
