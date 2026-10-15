import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import Harness from './AppHotkeysHarness.svelte'
import type { ChildApi } from './AppHotkeysChild.svelte'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'palette.open': { hotkey: null },
  'nav.home': { hotkey: ['G', 'H'], options: { timeout: 400 } },
})

function press(key: string, init: KeyboardEventInit = {}) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, bubbles: true, ...init }),
  )
}

function registrations() {
  return [...HotkeyManager.getInstance().registrations.state.values()]
}

afterEach(() => {
  HotkeyManager.resetInstance()
})

describe('app hotkeys', () => {
  it('registers app hotkeys, follows custom hotkeys, and lists status', async () => {
    const onCustomHotkeysChange = vi.fn()
    let api!: ChildApi
    const component = mount(Harness, {
      target: document.body,
      props: {
        appHotkeys,
        customHotkeys: { 'nav.home': ['G', 'G'] },
        onCustomHotkeysChange,
        ready: (value: ChildApi) => (api = value),
      },
    })
    flushSync()
    try {
      expect(registrations().map((r) => r.hotkey)).toEqual([
        'Mod+S',
        ['G', 'G'],
      ])
      expect(registrations()[0]!.options).toMatchObject({
        meta: { name: 'Save' },
        appHotkeyId: 'doc.save',
      })
      expect(
        api.list.current.map((item) => [item.appHotkey.id, item.status]),
      ).toEqual([
        ['doc.save', 'active'],
        ['palette.open', 'unbound'],
        ['nav.home', 'active'],
      ])
      press('s', { metaKey: true })
      expect(api.save()).toBe(1)

      api.custom.setCustomHotkey('doc.save', 'Alt+S')
      flushSync()
      expect(
        registrations().find((r) => r.options.appHotkeyId === 'doc.save')
          ?.hotkey,
      ).toBe('Alt+S')
      expect(api.hotkeys.current['doc.save']!.hotkey).toBe('Alt+S')
      expect(onCustomHotkeysChange).toHaveBeenLastCalledWith({
        'nav.home': ['G', 'G'],
        'doc.save': 'Alt+S',
      })
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Alt',
          code: 'AltLeft',
          altKey: true,
          bubbles: true,
        }),
      )
      expect(api.hint.visible).toBe(true)
      window.dispatchEvent(new Event('blur'))
    } finally {
      await unmount(component)
    }
    expect(registrations()).toHaveLength(0)
  })
})
