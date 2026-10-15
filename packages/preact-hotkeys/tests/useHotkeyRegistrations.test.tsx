import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/preact'
import { HotkeyManager } from '@tanstack/hotkeys'
import { useHotkeyRegistrations } from '../src/useHotkeyRegistrations'

describe('useHotkeyRegistrations', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
  })

  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  it('settles without registry updates and reflects registration changes', () => {
    let renders = 0
    function Registry() {
      if (++renders > 20) throw new Error('Registry did not settle')
      const registrations = useHotkeyRegistrations()
      const sequences = registrations.filter((reg) => reg.kind === 'sequence')
      return (
        <output>
          {registrations.length - sequences.length} hotkeys, {sequences.length}{' '}
          sequences
        </output>
      )
    }
    const view = render(<Registry />)
    expect(view.getByText('0 hotkeys, 0 sequences')).toBeTruthy()
    const manager = HotkeyManager.getInstance()
    act(() => {
      manager.register('Alt+[KeyS]', () => {})
      manager.register(['G', '[KeyI]'], () => {})
    })
    expect(view.getByText('1 hotkeys, 1 sequences')).toBeTruthy()
    act(() => {
      manager.destroy()
    })
    expect(view.getByText('0 hotkeys, 0 sequences')).toBeTruthy()
  })
})
