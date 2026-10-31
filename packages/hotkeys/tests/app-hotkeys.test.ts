import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  AppHotkeysStore,
  HotkeyManager,
  defineAppHotkeys,
  getAppHotkeyRegistrationOptions,
  isAppHotkey,
  isCustomHotkey,
  resolveAppHotkey,
  toHotkeyRegistrationView,
} from '../src'
import type {
  AppHotkey,
  CustomHotkeys,
  HotkeyChord,
  HotkeySequence,
} from '../src'

const appHotkeys = defineAppHotkeys({
  'doc.save': {
    hotkey: 'Mod+S',
    meta: { name: 'Save', group: 'Document' },
    options: { requireReset: true },
  },
  'doc.find': { hotkey: 'Mod+F', scope: 'editor' },
  'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
  'nav.home': {
    hotkey: ['G', 'H'],
    meta: { name: 'Go home' },
    options: { timeout: 500 },
  },
  'nav.single': { hotkey: ['Escape'] },
})

afterEach(() => {
  HotkeyManager.resetInstance()
  vi.restoreAllMocks()
})

describe('defineAppHotkeys', () => {
  it('brands each entry and records its id and default hotkey', () => {
    expect(appHotkeys['doc.save']).toMatchObject({
      '~appHotkey': true,
      id: 'doc.save',
      hotkey: 'Mod+S',
      defaultHotkey: 'Mod+S',
      meta: { name: 'Save', group: 'Document' },
      options: { requireReset: true },
    })
    expect(appHotkeys['nav.home'].hotkey).toEqual(['G', 'H'])
    expect(appHotkeys['palette.open'].hotkey).toBeNull()
  })

  it('stores a one-step sequence as its chord', () => {
    expect(appHotkeys['nav.single'].hotkey).toBe('Escape')
  })

  it('types entries by id and rejects options for the other kind', () => {
    expectTypeOf(appHotkeys['doc.save']).toEqualTypeOf<
      AppHotkey<'doc.save', HotkeyChord>
    >()
    expectTypeOf(appHotkeys['nav.home']).toEqualTypeOf<
      AppHotkey<'nav.home', HotkeySequence>
    >()
    expectTypeOf(appHotkeys['nav.single']).toEqualTypeOf<
      AppHotkey<'nav.single', HotkeyChord>
    >()
    expectTypeOf(appHotkeys['palette.open']).toEqualTypeOf<
      AppHotkey<'palette.open', null>
    >()
    defineAppHotkeys({
      // @ts-expect-error timeout applies only to sequences
      a: { hotkey: 'Mod+S', options: { timeout: 500 } },
    })
    defineAppHotkeys({
      // @ts-expect-error requireReset applies only to chords
      b: { hotkey: ['G', 'H'], options: { requireReset: true } },
    })
    defineAppHotkeys({
      // @ts-expect-error not a hotkey
      c: { hotkey: 'Mod+NotAKey' },
    })
  })

  it('isAppHotkey distinguishes app hotkeys from hotkeys', () => {
    expect(isAppHotkey(appHotkeys['doc.save'])).toBe(true)
    expect(isAppHotkey('Mod+S')).toBe(false)
    expect(isAppHotkey({ key: 'S', mod: true })).toBe(false)
    expect(isAppHotkey(['G', 'H'])).toBe(false)
  })
})

describe('AppHotkeysStore', () => {
  it('applies saved custom hotkeys and keeps unchanged entries', () => {
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.save': ['Mod+K', 'S'], 'doc.find': null },
    })
    expect(store.appHotkeys['doc.save']).toMatchObject({
      hotkey: ['Mod+K', 'S'],
      defaultHotkey: 'Mod+S',
    })
    expect(store.appHotkeys['doc.find'].hotkey).toBeNull()
    expect(store.appHotkeys['nav.home']).toBe(appHotkeys['nav.home'])
  })

  it('ignores unknown ids and invalid saved hotkeys with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: {
        removed: 'Mod+R',
        'doc.save': 'Hyper+S',
        'nav.home': [],
        'doc.find': ['Mod+G'],
      } as unknown as CustomHotkeys<typeof appHotkeys>,
    })
    expect(warn).toHaveBeenCalledTimes(3)
    expect(store.customHotkeys).toEqual({ 'doc.find': 'Mod+G' })
  })

  it('sets, unbinds, and resets custom hotkeys, saving only differences', () => {
    const onCustomHotkeysChange = vi.fn()
    const store = new AppHotkeysStore(appHotkeys, {
      onCustomHotkeysChange,
      platform: 'mac',
    })

    expect(store.setCustomHotkey('doc.save', 'Mod+Shift+S')).toEqual([])
    expect(store.setCustomHotkey('palette.open', ['Mod+P'])).toEqual([])
    expect(store.setCustomHotkey('doc.find', null)).toEqual([])
    expect(onCustomHotkeysChange).toHaveBeenLastCalledWith({
      'doc.save': 'Mod+Shift+S',
      'palette.open': 'Mod+P',
      'doc.find': null,
    })

    // Setting the default again removes the customization.
    store.setCustomHotkey('doc.save', 'Meta+S')
    expect(store.customHotkeys).not.toHaveProperty('doc.save')

    store.resetCustomHotkey('palette.open')
    expect(store.appHotkeys['palette.open'].hotkey).toBeNull()

    store.resetCustomHotkeys()
    expect(onCustomHotkeysChange).toHaveBeenLastCalledWith({})
    expect(store.appHotkeys['doc.find'].hotkey).toBe('Mod+F')
  })

  it('rejects conflicting custom hotkeys without changing anything', () => {
    const onCustomHotkeysChange = vi.fn()
    const store = new AppHotkeysStore(appHotkeys, { onCustomHotkeysChange })
    const conflicts = store.setCustomHotkey('palette.open', 'Mod+S')
    expect(conflicts.map((c) => c.id)).toEqual(['doc.save'])
    expect(onCustomHotkeysChange).not.toHaveBeenCalled()
    expect(store.appHotkeys['palette.open'].hotkey).toBeNull()
  })

  it('treats scopes and sequence prefixes when finding conflicts', () => {
    const store = new AppHotkeysStore(
      defineAppHotkeys({
        top: { hotkey: ['G', 'G'] },
        grid: { hotkey: 'G', scope: 'grid' },
        modalClose: { hotkey: 'Escape', scope: 'modal' },
        editorClose: { hotkey: 'Mod+W', scope: 'editor' },
      }),
    )
    expect(store.findConflicts('grid', 'G').map((c) => c.id)).toEqual(['top'])
    expect(store.findConflicts('editorClose', 'Escape')).toEqual([])
    expect(store.findConflicts('top', ['G']).map((c) => c.id)).toEqual(['grid'])
  })

  it('keeps custom hotkeys for remaining ids when declarations change', () => {
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.save': 'Mod+Shift+S', 'doc.find': 'Mod+G' },
    })
    const next = defineAppHotkeys({ 'doc.save': { hotkey: 'Mod+S' } })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    store.setAppHotkeys(next as never)
    expect(store.customHotkeys).toEqual({ 'doc.save': 'Mod+Shift+S' })
  })

  it('lists every app hotkey with live status', () => {
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'nav.home': ['G', 'G'] },
      platform: 'mac',
    })
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', () => {}, { appHotkeyId: 'doc.save' })
    manager.register('Mod+S', () => {}, {
      appHotkeyId: 'doc.save',
      conflictBehavior: 'allow',
      target: document.body,
    })
    manager.register('Mod+F', () => {}, {
      appHotkeyId: 'doc.find',
      enabled: false,
    })
    manager.register('Mod+P', () => {}, { appHotkeyId: 'palette.open' })

    const list = store.getList(
      [...manager.registrations.state.values()].map(toHotkeyRegistrationView),
    )
    expect(
      list.map((item) => [item.appHotkey.id, item.status, item.isCustom]),
    ).toEqual([
      ['doc.save', 'active', false],
      ['doc.find', 'disabled', false],
      ['palette.open', 'unbound', false],
      ['nav.home', 'inactive', true],
      ['nav.single', 'inactive', false],
    ])
    expect(list[0]!.registrations).toHaveLength(2)
  })
})

describe('adapter helpers', () => {
  it('resolves an app hotkey from the store by id', () => {
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.save': 'Mod+Shift+S' },
    })
    expect(resolveAppHotkey(appHotkeys['doc.save'], store).hotkey).toBe(
      'Mod+Shift+S',
    )
    expect(resolveAppHotkey(appHotkeys['doc.save'], null)).toBe(
      appHotkeys['doc.save'],
    )
  })

  it('builds registration options from declarations', () => {
    expect(getAppHotkeyRegistrationOptions(appHotkeys['doc.save'])).toEqual({
      requireReset: true,
      meta: { name: 'Save', group: 'Document' },
      appHotkeyId: 'doc.save',
    })
  })

  it('reports custom hotkeys using platform aliases', () => {
    const custom = { ...appHotkeys['doc.save'], hotkey: 'Meta+S' as const }
    expect(isCustomHotkey(custom, 'mac')).toBe(false)
    expect(isCustomHotkey(custom, 'windows')).toBe(true)
  })
})

describe('AppHotkeysStore.setOptions customHotkeys', () => {
  it('applies saved data that arrives after the store is created', () => {
    const onChange = vi.fn()
    const store = new AppHotkeysStore(appHotkeys, {
      onCustomHotkeysChange: onChange,
    })
    store.setOptions({ customHotkeys: { 'doc.save': 'Mod+Shift+S' } })
    expect(store.appHotkeys['doc.save'].hotkey).toBe('Mod+Shift+S')
    expect(store.customHotkeys).toEqual({ 'doc.save': 'Mod+Shift+S' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps user changes when the same saved data is passed again', () => {
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.save': 'Mod+Shift+S' },
    })
    store.setCustomHotkey('doc.find', 'Mod+G')
    store.setOptions({ customHotkeys: { 'doc.save': 'Mod+Shift+S' } })
    store.setOptions({})
    expect(store.customHotkeys).toEqual({
      'doc.save': 'Mod+Shift+S',
      'doc.find': 'Mod+G',
    })
  })

  it('treats null and {} as nothing saved', () => {
    const store = new AppHotkeysStore(appHotkeys)
    store.setCustomHotkey('doc.find', 'Mod+G')
    store.setOptions({ customHotkeys: null })
    store.setOptions({ customHotkeys: {} })
    expect(store.customHotkeys).toEqual({ 'doc.find': 'Mod+G' })
  })

  it('leaves custom hotkeys unchanged for undefined, such as during a refetch', () => {
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.save': 'Mod+Shift+S' },
    })
    store.setCustomHotkey('doc.find', 'Mod+G')
    store.setOptions({ customHotkeys: undefined })
    store.setOptions({ customHotkeys: { 'doc.save': 'Mod+Shift+S' } })
    expect(store.customHotkeys).toEqual({
      'doc.save': 'Mod+Shift+S',
      'doc.find': 'Mod+G',
    })
  })

  it("replaces custom hotkeys with another user's data", () => {
    const store = new AppHotkeysStore(appHotkeys, {
      customHotkeys: { 'doc.save': 'Mod+Shift+S' },
    })
    store.setOptions({ customHotkeys: { 'nav.home': ['G', 'G'] } })
    expect(store.customHotkeys).toEqual({ 'nav.home': ['G', 'G'] })
    expect(store.appHotkeys['doc.save'].hotkey).toBe('Mod+S')
    store.setOptions({ customHotkeys: null })
    expect(store.customHotkeys).toEqual({})
  })

  it('sees saved data changed in place', () => {
    const saved: CustomHotkeys<typeof appHotkeys> = {}
    const store = new AppHotkeysStore(appHotkeys, { customHotkeys: saved })
    saved['doc.save'] = 'Mod+Shift+S'
    store.setOptions({ customHotkeys: saved })
    expect(store.customHotkeys).toEqual({ 'doc.save': 'Mod+Shift+S' })
  })

  it('drops invalid entries and does not notify when nothing changes', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = new AppHotkeysStore(appHotkeys)
    const listener = vi.fn()
    store.store.subscribe(listener)
    store.setOptions({
      customHotkeys: { 'doc.save': 42 } as unknown as CustomHotkeys<
        typeof appHotkeys
      >,
    })
    expect(store.customHotkeys).toEqual({})
    expect(listener).not.toHaveBeenCalled()
  })
})
