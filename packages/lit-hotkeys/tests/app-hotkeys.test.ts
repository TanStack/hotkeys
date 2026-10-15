import { afterEach, describe, expect, it, vi } from 'vitest'
import { LitElement } from 'lit'
import {
  HotkeyManager,
  defineAppHotkeys,
  provideAppHotkeys,
} from '@tanstack/hotkeys'
import { AppHotkeysController } from '../src/controllers/app-hotkeys'
import { HotkeyController } from '../src/controllers/hotkey'
import { HotkeyRecorderController } from '../src/controllers/hotkey-recorder'
import type { Hotkey } from '@tanstack/hotkeys'

class AppHost extends LitElement {}
customElements.define('app-hotkeys-host', AppHost)

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
  document.body.replaceChildren()
  HotkeyManager.resetInstance()
})

describe('app hotkeys', () => {
  it('registers app hotkeys and follows custom hotkeys', async () => {
    const onCustomHotkeysChange = vi.fn()
    provideAppHotkeys(appHotkeys, {
      customHotkeys: { 'nav.home': ['G', 'G'] },
      onCustomHotkeysChange,
    })
    const host = new AppHost()
    const save = vi.fn()
    host.addController(
      new HotkeyController(host, appHotkeys['doc.save'], save, {
        platform: 'mac',
      }),
    )
    host.addController(
      new HotkeyController(host, appHotkeys['nav.home'], () => {}),
    )
    const app = new AppHotkeysController(host)
    document.body.append(host)
    await host.updateComplete

    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+S', ['G', 'G']])
    expect(
      app.list.map((item) => [item.appHotkey.id, item.status, item.isCustom]),
    ).toEqual([
      ['doc.save', 'active', false],
      ['palette.open', 'unbound', false],
      ['nav.home', 'active', true],
    ])
    press('s', { metaKey: true })
    expect(save).toHaveBeenCalledOnce()

    app.setCustomHotkey('doc.save', ['G', 'S'])
    expect(
      registrations().find((r) => r.options.appHotkeyId === 'doc.save')?.hotkey,
    ).toEqual(['G', 'S'])
    expect(onCustomHotkeysChange).toHaveBeenLastCalledWith({
      'nav.home': ['G', 'G'],
      'doc.save': ['G', 'S'],
    })
    press('g')
    press('s')
    expect(save).toHaveBeenCalledTimes(2)
    expect(app.appHotkeys['doc.save']!.hotkey).toEqual(['G', 'S'])
  })

  it('types options by kind', () => {
    const host = new AppHost()
    new HotkeyController(host, 'Mod+S', () => {}, { requireReset: true })
    new HotkeyController(host, ['G', 'G'], () => {}, { timeout: 500 })
    new HotkeyController(host, appHotkeys['nav.home'], () => {}, {
      timeout: 300,
    })
    expect(host).toBeDefined()
  })
})

describe('HotkeyRecorderController', () => {
  it('records up to maxSteps', async () => {
    const host = new AppHost()
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    const recorder = new HotkeyRecorderController(host, {
      maxSteps: 2,
      onRecord,
      recordBy: 'key',
    })
    document.body.append(host)
    await host.updateComplete
    recorder.startRecording()
    press('g', { code: 'KeyG' })
    expect(recorder.steps).toEqual(['G'])
    press('h', { code: 'KeyH' })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith(['G', 'H'])
  })
})
