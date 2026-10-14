import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { provideHotkeys } from '../src/hotkeys-provider'
import {
  injectAppHotkeyList,
  injectAppHotkeys,
  injectCustomHotkeys,
} from '../src/injectAppHotkeys'
import { injectHotkey } from '../src/injectHotkey'
import { injectHotkeyRecorder } from '../src/injectHotkeyRecorder'
import { injectHotkeys } from '../src/injectHotkeys'
import type { CustomHotkeys, Hotkey } from '@tanstack/hotkeys'

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

function configure(
  customHotkeys?: CustomHotkeys<typeof appHotkeys>,
  onCustomHotkeysChange?: (custom: CustomHotkeys) => void,
) {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHotkeys({
        appHotkeys,
        customHotkeys,
        onCustomHotkeysChange,
        defaultOptions: { hotkey: { platform: 'mac' } },
      }),
    ],
  })
}

afterEach(() => {
  TestBed.resetTestingModule()
  HotkeyManager.resetInstance()
})

describe('app hotkeys', () => {
  it('registers app hotkeys and follows custom hotkeys', () => {
    const save = vi.fn()
    const onChange = vi.fn()
    configure(undefined, onChange)
    const custom = TestBed.runInInjectionContext(() => {
      injectHotkey(appHotkeys['doc.save'], save)
      injectHotkey(appHotkeys['palette.open'], () => {})
      return injectCustomHotkeys()
    })
    TestBed.flushEffects()
    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+S'])
    expect(registrations()[0]!.options).toMatchObject({
      meta: { name: 'Save' },
      appHotkeyId: 'doc.save',
    })
    press('s', { metaKey: true })
    expect(save).toHaveBeenCalledOnce()

    custom.setCustomHotkey('doc.save', ['G', 'S'])
    custom.setCustomHotkey('palette.open', 'Mod+K')
    TestBed.flushEffects()
    expect(registrations().map((r) => r.hotkey)).toEqual([['G', 'S'], 'Mod+K'])
    expect(onChange).toHaveBeenLastCalledWith({
      'doc.save': ['G', 'S'],
      'palette.open': 'Mod+K',
    })
    expect(custom.customHotkeys()).toEqual({
      'doc.save': ['G', 'S'],
      'palette.open': 'Mod+K',
    })
    press('g')
    press('s')
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('lists app hotkeys with live status', () => {
    configure({ 'doc.save': 'Mod+Shift+S' })
    const { list, hotkeys } = TestBed.runInInjectionContext(() => {
      injectHotkeys([{ hotkey: appHotkeys['nav.home'], callback: () => {} }])
      return { list: injectAppHotkeyList(), hotkeys: injectAppHotkeys() }
    })
    TestBed.flushEffects()
    expect(list().map((item) => [item.appHotkey.id, item.status])).toEqual([
      ['doc.save', 'inactive'],
      ['palette.open', 'unbound'],
      ['nav.home', 'active'],
    ])
    expect(list()[0]!.isCustom).toBe(true)
    expect(hotkeys()['doc.save']!.hotkey).toBe('Mod+Shift+S')
    expect(registrations()[0]!.options).toMatchObject({ timeout: 400 })
  })

  it('types options by kind', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
    TestBed.runInInjectionContext(() => {
      injectHotkey('Mod+S', () => {}, { requireReset: true })
      injectHotkey(['G', 'G'], () => {}, { timeout: 500 })
      // @ts-expect-error timeout applies only to sequences
      injectHotkey('Mod+F', () => {}, { timeout: 500 })
      // @ts-expect-error requireReset applies only to chords
      injectHotkey(['D', 'D'], () => {}, { requireReset: true })
    })
  })
})

describe('injectHotkeyRecorder', () => {
  it('records up to maxSteps', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    const recorder = TestBed.runInInjectionContext(() =>
      injectHotkeyRecorder({ maxSteps: 2, onRecord, recordBy: 'key' }),
    )
    TestBed.flushEffects()
    recorder.startRecording()
    press('g', { code: 'KeyG' })
    expect(recorder.steps()).toEqual(['G'])
    press('h', { code: 'KeyH' })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith(['G', 'H'])
  })
})
