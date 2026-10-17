// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { createAppHotkeyList } from '../src/appHotkeys'
import { createHotkey } from '../src/createHotkey'
import type { JSX } from 'solid-js'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S' },
  'palette.open': { hotkey: 'Mod+K', scope: 'global' },
})

function press(key: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true }),
  )
  document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

function Root(props: { children: JSX.Element }) {
  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={{ 'doc.save': 'Mod+E' }}
      defaultOptions={{ hotkey: { platform: 'mac' } }}
    >
      {props.children}
    </HotkeysProvider>
  )
}

function Save(props: { onSave: () => void }) {
  createHotkey(appHotkeys['doc.save'], () => props.onSave())
  return null
}

function Palette(props: { onOpen: () => void }) {
  createHotkey(appHotkeys['palette.open'], () => props.onOpen())
  return null
}

function scopesByName() {
  return Object.fromEntries(
    [...HotkeyManager.getInstance().registrations.state.values()].map((r) => [
      r.options.meta?.name,
      r.options.scope,
    ]),
  )
}

describe('HotkeysProvider scopes', () => {
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  it('inherits app hotkeys, custom hotkeys, and defaults in nested providers', () => {
    const save = vi.fn()
    render(() => (
      <Root>
        <HotkeysProvider scope="editor">
          <Save onSave={save} />
        </HotkeysProvider>
      </Root>
    ))
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
    function Plain(props: { id: string }) {
      createHotkey('Mod+P', () => {}, { meta: { name: props.id } })
      return null
    }
    render(() => (
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
      </Root>
    ))
    expect(scopesByName()).toEqual({
      root: 'global',
      page: 'page',
      unscoped: 'page',
      panel: 'panel',
    })
  })

  it('lets a nested provider handle a hotkey its ancestor shares', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(() => (
      <Root>
        <HotkeysProvider scope="page">
          <Save onSave={outer} />
          <HotkeysProvider scope="panel">
            <Save onSave={inner} />
          </HotkeysProvider>
        </HotkeysProvider>
      </Root>
    ))
    press('e')
    expect([outer.mock.calls.length, inner.mock.calls.length]).toEqual([0, 1])
  })

  it('suspends other scopes while an exclusive provider is mounted', () => {
    const editorSave = vi.fn()
    const dialogSave = vi.fn()
    const palette = vi.fn()
    const [open, setOpen] = createSignal(false)
    render(() => (
      <Root>
        <HotkeysProvider scope="editor">
          <Save onSave={editorSave} />
          <Palette onOpen={palette} />
          {open() && (
            <HotkeysProvider scope="dialog" exclusive>
              <Save onSave={dialogSave} />
            </HotkeysProvider>
          )}
        </HotkeysProvider>
      </Root>
    ))
    const calls = () =>
      [editorSave, dialogSave, palette].map((f) => f.mock.calls.length)

    press('e')
    press('k')
    expect(calls()).toEqual([1, 0, 1])

    setOpen(true)
    press('e')
    press('k')
    expect(calls()).toEqual([1, 1, 1])

    setOpen(false)
    press('e')
    expect(calls()).toEqual([2, 1, 1])
  })

  it('keeps allowed scopes active and does not reactivate for a new object', () => {
    const editorSave = vi.fn()
    const palette = vi.fn()
    const [allow, setAllow] = createSignal(['global'])
    render(() => (
      <Root>
        <HotkeysProvider scope="editor">
          <Save onSave={editorSave} />
        </HotkeysProvider>
        <Palette onOpen={palette} />
        <HotkeysProvider scope="dialog" exclusive={{ allow: allow() }}>
          {null}
        </HotkeysProvider>
      </Root>
    ))
    const activate = vi.spyOn(HotkeyManager.getInstance(), 'activateScope')
    setAllow(['global'])
    expect(activate).not.toHaveBeenCalled()

    press('e')
    press('k')
    expect([editorSave, palette].map((f) => f.mock.calls.length)).toEqual([
      0, 1,
    ])
  })

  it('deactivates nested scopes when an ancestor is disabled', () => {
    const save = vi.fn()
    const [enabled, setEnabled] = createSignal(true)
    render(() => (
      <Root>
        <HotkeysProvider scope="workspace" enabled={enabled()}>
          <HotkeysProvider scope="editor">
            <Save onSave={save} />
          </HotkeysProvider>
        </HotkeysProvider>
      </Root>
    ))
    press('e')
    setEnabled(false)
    press('e')
    expect(save).toHaveBeenCalledTimes(1)
    expect(HotkeyManager.getInstance().isScopeActive('editor')).toBe(false)
  })

  it('lists app hotkeys suspended by an exclusive scope', () => {
    let list: ReturnType<typeof createAppHotkeyList> = () => []
    const [open, setOpen] = createSignal(false)
    function List() {
      list = createAppHotkeyList()
      return null
    }
    render(() => (
      <Root>
        <Save onSave={() => {}} />
        <Palette onOpen={() => {}} />
        {open() && (
          <HotkeysProvider scope="dialog" exclusive>
            {null}
          </HotkeysProvider>
        )}
        <List />
      </Root>
    ))
    expect(list().map((item) => item.status)).toEqual(['active', 'active'])
    setOpen(true)
    expect(list().map((item) => item.status)).toEqual([
      'suspended',
      'suspended',
    ])
  })
})
