import { HotkeyManager } from '@tanstack/hotkeys'
import { act, cleanup, render } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useHotkey } from '../src/useHotkey'
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
  describe('inline meta with arrays, elements and functions', () => {
    const inlineMeta = (name: string) => ({
      name,
      ...({
        keywords: ['file', 'write'],
        icon: <svg aria-hidden />,
        run: () => {},
      } as object),
    })

    it('settles when the component that registers also lists', () => {
      let renders = 0
      function SaveButton() {
        if (++renders > 20) throw new Error('did not settle')
        useHotkey('Mod+S', () => {}, { meta: inlineMeta('Save') })
        const registrations = useHotkeyRegistrations()
        return <output>{registrations[0]?.options.meta?.name ?? 'none'}</output>
      }

      const view = render(<SaveButton />)

      expect(view.getByText('Save')).toBeTruthy()
      expect(renders).toBeLessThanOrEqual(3)
    })

    it('settles when a parent lists and a child registers', () => {
      let renders = 0
      function Child() {
        useHotkey('Mod+S', () => {}, { meta: inlineMeta('Save') })
        return null
      }
      function Palette() {
        if (++renders > 20) throw new Error('did not settle')
        const registrations = useHotkeyRegistrations()
        return (
          <>
            <output>{registrations.length} hotkeys</output>
            <Child />
          </>
        )
      }

      const view = render(<Palette />)

      expect(view.getByText('1 hotkeys')).toBeTruthy()
      expect(renders).toBeLessThanOrEqual(3)
    })

    it('shows a meta change that alters content', () => {
      let renders = 0
      function SaveButton({ name }: { name: string }) {
        if (++renders > 20) throw new Error('did not settle')
        useHotkey('Mod+S', () => {}, { meta: inlineMeta(name) })
        const registrations = useHotkeyRegistrations()
        return <output>{registrations[0]?.options.meta?.name ?? 'none'}</output>
      }

      const view = render(<SaveButton name="Save" />)
      view.rerender(<SaveButton name="Save as" />)

      expect(view.getByText('Save as')).toBeTruthy()
    })
  })
})
