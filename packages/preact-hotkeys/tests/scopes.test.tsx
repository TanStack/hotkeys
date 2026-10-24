// @vitest-environment happy-dom
import { act, cleanup, render } from '@testing-library/preact'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { useState } from 'preact/hooks'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useAppHotkeyList } from '../src/useAppHotkeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyScopesState } from '../src/useHotkeyScopesState'
import type { HotkeyScopesState } from '@tanstack/hotkeys'
import type { ComponentChildren } from 'preact'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S' },
  'palette.open': { hotkey: 'Mod+K', scope: 'global' },
})

function press(key: string) {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true }),
    )
    document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
  })
}

function Root({ children }: { children: ComponentChildren }) {
  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={{ 'doc.save': 'Mod+E' }}
      defaultOptions={{ hotkey: { platform: 'mac' } }}
    >
      {children}
    </HotkeysProvider>
  )
}

function Save({ onSave }: { onSave: () => void }) {
  useHotkey(appHotkeys['doc.save'], onSave)
  return null
}

function Palette({ onOpen }: { onOpen: () => void }) {
  useHotkey(appHotkeys['palette.open'], onOpen)
  return null
}

describe('HotkeysProvider scopes', () => {
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  it('inherits app hotkeys, custom hotkeys, and defaults in nested providers', () => {
    const save = vi.fn()
    render(
      <Root>
        <HotkeysProvider scope="editor">
          <Save onSave={save} />
        </HotkeysProvider>
      </Root>,
    )
    press('e')
    expect(save).toHaveBeenCalledTimes(1)
    const [registration] =
      HotkeyManager.getInstance().registrations.state.values()
    expect(registration?.options).toMatchObject({
      scope: 'editor',
      platform: 'mac',
    })
  })

  it('registers plain hotkeys in the nearest provider scope', () => {
    function Plain({ id }: { id: string }) {
      useHotkey('Mod+P', () => {}, { meta: { name: id } })
      return null
    }
    render(
      <Root>
        <Plain id="root" />
        <HotkeysProvider scope="page">
          <Plain id="page" />
          <HotkeysProvider defaultOptions={{ hotkey: { requireReset: true } }}>
            <Plain id="unscoped" />
          </HotkeysProvider>
          <HotkeysProvider scope="panel">
            <Plain id="panel" />
          </HotkeysProvider>
        </HotkeysProvider>
      </Root>,
    )
    const scopes = Object.fromEntries(
      [...HotkeyManager.getInstance().registrations.state.values()].map((r) => [
        r.options.meta?.name,
        r.options.scope,
      ]),
    )
    expect(scopes).toEqual({
      root: 'global',
      page: 'page',
      unscoped: 'page',
      panel: 'panel',
    })
  })

  it('lets a nested provider handle a hotkey its ancestor shares', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(
      <Root>
        <HotkeysProvider scope="page">
          <Save onSave={outer} />
          <HotkeysProvider scope="panel">
            <Save onSave={inner} />
          </HotkeysProvider>
        </HotkeysProvider>
      </Root>,
    )
    press('e')
    expect([outer.mock.calls.length, inner.mock.calls.length]).toEqual([0, 1])
  })

  it('suspends other scopes while an exclusive provider is mounted', () => {
    const editorSave = vi.fn()
    const dialogSave = vi.fn()
    const palette = vi.fn()
    let setOpen: (open: boolean) => void = () => {}
    function App() {
      const [open, set] = useState(false)
      setOpen = set
      return (
        <HotkeysProvider scope="editor">
          <Save onSave={editorSave} />
          <Palette onOpen={palette} />
          {open && (
            <HotkeysProvider scope="dialog" exclusive>
              <Save onSave={dialogSave} />
            </HotkeysProvider>
          )}
        </HotkeysProvider>
      )
    }
    render(
      <Root>
        <App />
      </Root>,
    )

    press('e')
    press('k')
    expect(
      [editorSave, dialogSave, palette].map((f) => f.mock.calls.length),
    ).toEqual([1, 0, 1])

    act(() => setOpen(true))
    press('e')
    press('k')
    expect(
      [editorSave, dialogSave, palette].map((f) => f.mock.calls.length),
    ).toEqual([1, 1, 1])

    act(() => setOpen(false))
    press('e')
    expect([editorSave, dialogSave].map((f) => f.mock.calls.length)).toEqual([
      2, 1,
    ])
  })

  it('keeps allowed scopes active and does not reactivate on rerender', () => {
    const editorSave = vi.fn()
    const palette = vi.fn()
    let rerender: () => void = () => {}
    function App() {
      const [, set] = useState(0)
      rerender = () => set((n) => n + 1)
      return (
        <>
          <HotkeysProvider scope="editor">
            <Save onSave={editorSave} />
          </HotkeysProvider>
          <Palette onOpen={palette} />
          <HotkeysProvider scope="dialog" exclusive={{ allow: ['global'] }}>
            {null}
          </HotkeysProvider>
        </>
      )
    }
    render(
      <Root>
        <App />
      </Root>,
    )
    const activate = vi.spyOn(HotkeyManager.getInstance(), 'activateScope')
    act(() => rerender())
    expect(activate).not.toHaveBeenCalled()

    press('e')
    press('k')
    expect([editorSave, palette].map((f) => f.mock.calls.length)).toEqual([
      0, 1,
    ])
  })

  it('deactivates nested scopes when an ancestor is disabled', () => {
    const save = vi.fn()
    let setEnabled: (enabled: boolean) => void = () => {}
    function Workspace() {
      const [enabled, set] = useState(true)
      setEnabled = set
      return (
        <HotkeysProvider scope="workspace" enabled={enabled}>
          <HotkeysProvider scope="editor">
            <Save onSave={save} />
          </HotkeysProvider>
        </HotkeysProvider>
      )
    }
    render(
      <Root>
        <Workspace />
      </Root>,
    )
    press('e')
    act(() => setEnabled(false))
    press('e')
    expect(save).toHaveBeenCalledTimes(1)
    expect(HotkeyManager.getInstance().isScopeActive('editor')).toBe(false)
  })

  it('lists app hotkeys suspended by an exclusive scope', () => {
    let statuses: Array<string> = []
    function List() {
      statuses = useAppHotkeyList().map((item) => item.status)
      return null
    }
    let setOpen: (open: boolean) => void = () => {}
    function App() {
      const [open, set] = useState(false)
      setOpen = set
      return (
        <>
          <Save onSave={() => {}} />
          <Palette onOpen={() => {}} />
          {open && (
            <HotkeysProvider scope="dialog" exclusive>
              {null}
            </HotkeysProvider>
          )}
          <List />
        </>
      )
    }
    render(
      <Root>
        <App />
      </Root>,
    )
    expect(statuses).toEqual(['active', 'active'])
    act(() => setOpen(true))
    expect(statuses).toEqual(['suspended', 'suspended'])
  })
  it('re-renders with the scopes state when an exclusive scope activates', () => {
    let state: HotkeyScopesState | undefined
    function Reader() {
      state = useHotkeyScopesState()
      return null
    }
    render(<Reader />)
    expect(state?.exclusive).toBeNull()

    let release: () => void = () => {}
    act(() => {
      release = HotkeyManager.getInstance().activateScope('dialog', {
        exclusive: true,
      })
    })
    expect(state).toMatchObject({
      active: ['dialog'],
      exclusive: 'dialog',
      suspended: ['global'],
    })

    act(() => release())
    expect(state).toMatchObject({ exclusive: null, suspended: [] })
  })
})
