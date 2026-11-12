import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Harness from './AppHotkeysHarness.svelte'
import PropHarness from './CustomHotkeysPropHarness.svelte'
import LateNestedHarness from './LateNestedAppHotkeysHarness.svelte'
import type { CustomHotkeys } from '@tanstack/hotkeys'
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

describe('HotkeysProvider customHotkeys prop', () => {
  it('applies saved data that changes after the first render', () => {
    const onCustomHotkeysChange = vi.fn()
    let api!: ChildApi
    let setSaved!: (next: CustomHotkeys | null) => void
    const component = mount(PropHarness, {
      target: document.body,
      props: {
        appHotkeys,
        onCustomHotkeysChange,
        ready: (value: ChildApi) => (api = value),
        setSaved: (set: (next: CustomHotkeys | null) => void) =>
          (setSaved = set),
      },
    })
    flushSync()
    try {
      setSaved({ 'doc.save': 'Mod+Shift+S' })
      flushSync()
      expect(api.custom.current).toEqual({ 'doc.save': 'Mod+Shift+S' })
      expect(onCustomHotkeysChange).not.toHaveBeenCalled()

      // The same value again keeps the user's change.
      api.custom.setCustomHotkey('palette.open', 'Mod+K')
      setSaved({ 'doc.save': 'Mod+Shift+S' })
      flushSync()
      expect(api.custom.current).toEqual({
        'doc.save': 'Mod+Shift+S',
        'palette.open': 'Mod+K',
      })

      // Another user's data replaces it.
      setSaved({ 'nav.home': ['G', 'G'] })
      flushSync()
      expect(api.custom.current).toEqual({ 'nav.home': ['G', 'G'] })
    } finally {
      unmount(component)
    }
  })
})

describe('app hotkeys and the provider platform', () => {
  it('compares custom hotkeys on the provider platform', () => {
    let api!: ChildApi
    let setPlatform!: (next: 'mac' | 'windows') => void
    const component = mount(Harness, {
      target: document.body,
      props: {
        appHotkeys,
        customHotkeys: { 'doc.save': 'Meta+S' },
        platform: 'mac',
        setPlatform: (set: (next: 'mac' | 'windows') => void) =>
          (setPlatform = set),
        ready: (value: ChildApi) => (api = value),
      },
    })
    flushSync()
    try {
      // Meta+S is Mod+S only on macOS, which the test environment never detects
      expect(api.list.current[0]!.isCustom).toBe(false)
      expect(
        api.custom.findConflicts('palette.open', 'Meta+S').map((a) => a.id),
      ).toEqual(['doc.save'])
      // A recorded position conflicts through the key press that recorded it
      const recordedWith = {
        event: new KeyboardEvent('keydown', {
          key: 's',
          code: 'KeyS',
          metaKey: true,
        }),
      }
      expect(api.custom.findConflicts('palette.open', 'Meta+[KeyS]')).toEqual(
        [],
      )
      expect(
        api.custom
          .findConflicts('palette.open', 'Meta+[KeyS]', recordedWith)
          .map((a) => a.id),
      ).toEqual(['doc.save'])

      setPlatform('windows')
      flushSync()
      expect(api.list.current[0]!.isCustom).toBe(true)
    } finally {
      unmount(component)
    }
  })
})

describe('a nested provider whose app hotkeys arrive late', () => {
  it("gets its own store and leaves its parent's alone", () => {
    let api!: ChildApi
    let setNested!: (next: ReturnType<typeof defineAppHotkeys>) => void
    const component = mount(LateNestedHarness, {
      target: document.body,
      props: {
        appHotkeys,
        customHotkeys: { 'doc.save': 'Mod+E' },
        ready: (value: ChildApi) => (api = value),
        setNested: (set) => (setNested = set),
      },
    })
    flushSync()
    try {
      setNested(defineAppHotkeys({ 'file.open': { hotkey: 'Mod+O' } }))
      flushSync()

      expect(api.list.current.map((item) => item.appHotkey.id)).toEqual([
        'doc.save',
        'palette.open',
        'nav.home',
      ])
      expect(api.custom.current).toEqual({ 'doc.save': 'Mod+E' })
      expect(registrations().map((r) => r.hotkey)).toEqual([
        'Mod+E',
        ['G', 'H'],
      ])
      // The nested provider's own store, published for the devtools
      const published = HotkeyManager.getInstance().appHotkeys.state
      expect(Object.keys(published?.appHotkeys ?? {})).toEqual(['file.open'])
    } finally {
      unmount(component)
    }
  })
})

describe('publishing the store for the devtools', () => {
  it('publishes once, not again when another provider prop changes', () => {
    let setSaved!: (next: CustomHotkeys | null) => void
    const component = mount(PropHarness, {
      target: document.body,
      props: {
        appHotkeys,
        ready: () => {},
        setSaved: (set) => (setSaved = set),
      },
    })
    flushSync()
    try {
      const published = vi.fn()
      const subscription =
        HotkeyManager.getInstance().appHotkeys.subscribe(published)
      setSaved({ 'doc.save': 'Mod+E' })
      flushSync()
      subscription.unsubscribe()

      expect(registrations().map((r) => r.hotkey)).toContain('Mod+E')
      expect(published).not.toHaveBeenCalled()
    } finally {
      unmount(component)
    }
  })
})
