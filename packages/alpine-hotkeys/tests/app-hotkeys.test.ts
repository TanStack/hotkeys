import Alpine from 'alpinejs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  createHotkeysScope,
  defineAppHotkeys,
  provideAppHotkeys,
} from '../src'
import type { AlpineHotkeys } from '../src'

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

async function flush() {
  await Alpine.nextTick()
}

function registrations() {
  return [...HotkeyManager.getInstance().registrations.state.values()]
}

const scopes: Array<AlpineHotkeys> = []

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.destroy())
  HotkeyManager.resetInstance()
})

describe('app hotkeys', () => {
  it('registers app hotkeys, follows custom hotkeys, and lists status', async () => {
    const onCustomHotkeysChange = vi.fn()
    provideAppHotkeys(appHotkeys, {
      customHotkeys: { 'nav.home': ['G', 'G'] },
      onCustomHotkeysChange,
    })
    const hotkeys = createHotkeysScope({ hotkey: { platform: 'mac' } })
    scopes.push(hotkeys)
    const save = vi.fn()
    hotkeys.createHotkey(appHotkeys['doc.save'], save)
    hotkeys.createHotkeys([
      { hotkey: appHotkeys['nav.home'], callback: () => {} },
      { hotkey: appHotkeys['palette.open'], callback: () => {} },
    ])
    const list = hotkeys.createAppHotkeyList()
    const custom = hotkeys.createCustomHotkeys()

    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+S', ['G', 'G']])
    expect(
      list.value.map((item) => [item.appHotkey.id, item.status, item.isCustom]),
    ).toEqual([
      ['doc.save', 'active', false],
      ['palette.open', 'unbound', false],
      ['nav.home', 'active', true],
    ])
    press('s', { metaKey: true })
    expect(save).toHaveBeenCalledOnce()

    custom.setCustomHotkey('doc.save', ['G', 'S'])
    custom.setCustomHotkey('palette.open', 'Mod+K')
    await flush()
    expect(registrations().map((r) => r.options.appHotkeyId)).toHaveLength(3)
    expect(
      registrations().find((r) => r.options.appHotkeyId === 'doc.save')?.hotkey,
    ).toEqual(['G', 'S'])
    expect(onCustomHotkeysChange).toHaveBeenLastCalledWith({
      'nav.home': ['G', 'G'],
      'doc.save': ['G', 'S'],
      'palette.open': 'Mod+K',
    })
    press('g')
    press('s')
    expect(save).toHaveBeenCalledTimes(2)
    expect(hotkeys.createAppHotkeys().value['doc.save']!.hotkey).toEqual([
      'G',
      'S',
    ])
  })

  it('types options by kind', () => {
    const hotkeys = createHotkeysScope()
    scopes.push(hotkeys)
    hotkeys.createHotkey('Mod+S', () => {}, { requireReset: true })
    hotkeys.createHotkey(['G', 'G'], () => {}, { timeout: 500 })
    // @ts-expect-error timeout applies only to sequences
    hotkeys.createHotkey('Mod+F', () => {}, { timeout: 500 })
    // @ts-expect-error requireReset applies only to chords
    hotkeys.createHotkey(['D', 'D'], () => {}, { requireReset: true })
    expect(registrations()).toHaveLength(4)
  })
})
