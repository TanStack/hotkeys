// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@solidjs/testing-library'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { HotkeysProvider } from '../src/HotkeysProvider'
import {
  createAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
} from '../src/appHotkeys'
import { createHotkey } from '../src/createHotkey'
import { createHotkeys } from '../src/createHotkeys'
import { createHotkeyRecorder } from '../src/createHotkeyRecorder'
import { createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
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

function withProvider(
  children: () => JSX.Element,
  props: {
    customHotkeys?: CustomHotkeys<typeof appHotkeys>
    onCustomHotkeysChange?: (custom: CustomHotkeys) => void
  } = {},
) {
  return render(() => (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      defaultOptions={{ hotkey: { platform: 'mac' } }}
      {...props}
    >
      {children()}
    </HotkeysProvider>
  ))
}

afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
})

describe('app hotkeys', () => {
  it('registers app hotkeys and follows custom hotkeys', () => {
    const save = vi.fn()
    let custom!: ReturnType<typeof useCustomHotkeys>
    withProvider(() => {
      custom = useCustomHotkeys()
      createHotkey(appHotkeys['doc.save'], save)
      createHotkey(appHotkeys['palette.open'], () => {})
      return null
    })
    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+S'])
    expect(registrations()[0]!.options).toMatchObject({
      meta: { name: 'Save' },
      appHotkeyId: 'doc.save',
    })
    press('s', { metaKey: true })
    expect(save).toHaveBeenCalledOnce()

    custom.setCustomHotkey('doc.save', ['G', 'S'])
    custom.setCustomHotkey('palette.open', 'Mod+K')
    expect(registrations().map((r) => r.hotkey)).toEqual([['G', 'S'], 'Mod+K'])
    press('g')
    press('s')
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('lists app hotkeys with live status and reports changes', () => {
    const onCustomHotkeysChange = vi.fn()
    let list!: ReturnType<typeof createAppHotkeyList>
    let hotkeys!: ReturnType<typeof useAppHotkeys>
    withProvider(
      () => {
        list = createAppHotkeyList()
        hotkeys = useAppHotkeys()
        createHotkeys([{ hotkey: appHotkeys['nav.home'], callback: () => {} }])
        return null
      },
      { customHotkeys: { 'doc.save': 'Mod+Shift+S' }, onCustomHotkeysChange },
    )
    expect(list().map((item) => [item.appHotkey.id, item.status])).toEqual([
      ['doc.save', 'inactive'],
      ['palette.open', 'unbound'],
      ['nav.home', 'active'],
    ])
    expect(list()[0]!.isCustom).toBe(true)
    expect(hotkeys()['doc.save']!.hotkey).toBe('Mod+Shift+S')
    expect(registrations()[0]!.options).toMatchObject({ timeout: 400 })
  })

  it('throws without app hotkeys', () => {
    expect(() =>
      render(() => {
        useAppHotkeys()
        return null
      }),
    ).toThrow('useAppHotkeys requires a HotkeysProvider')
  })

  it('types options by kind', () => {
    render(() => {
      createHotkey('Mod+S', () => {}, { requireReset: true })
      createHotkey(['G', 'G'], () => {}, { timeout: 500 })
      createHotkey(appHotkeys['nav.home'], () => {}, { timeout: 300 })
      // @ts-expect-error timeout applies only to sequences
      createHotkey('Mod+S', () => {}, { timeout: 500 })
      // @ts-expect-error requireReset applies only to chords
      createHotkey(['G', 'G'], () => {}, { requireReset: true })
      // @ts-expect-error timeout applies only to sequence defaults
      createHotkey(appHotkeys['doc.save'], () => {}, { timeout: 300 })
      return null
    })
  })
})

describe('HotkeysProvider customHotkeys prop', () => {
  it('applies saved data that changes after the first render', () => {
    const [saved, setSaved] = createSignal<CustomHotkeys<
      typeof appHotkeys
    > | null>(null)
    const onCustomHotkeysChange = vi.fn()
    let custom!: ReturnType<typeof useCustomHotkeys>
    render(() => (
      <HotkeysProvider
        appHotkeys={appHotkeys}
        customHotkeys={saved()}
        onCustomHotkeysChange={onCustomHotkeysChange}
      >
        {/* A nested provider without appHotkeys shares the store. */}
        <HotkeysProvider scope="nested">
          {(() => {
            custom = useCustomHotkeys()
            return null
          })()}
        </HotkeysProvider>
      </HotkeysProvider>
    ))

    setSaved({ 'doc.save': 'Mod+Shift+S' })
    expect(custom.customHotkeys()).toEqual({ 'doc.save': 'Mod+Shift+S' })
    expect(onCustomHotkeysChange).not.toHaveBeenCalled()

    // The same value again keeps the user's change.
    custom.setCustomHotkey('palette.open', 'Mod+K')
    setSaved({ 'doc.save': 'Mod+Shift+S' })
    expect(custom.customHotkeys()).toEqual({
      'doc.save': 'Mod+Shift+S',
      'palette.open': 'Mod+K',
    })

    // Another user's data replaces it.
    setSaved({ 'nav.home': ['G', 'G'] })
    expect(custom.customHotkeys()).toEqual({ 'nav.home': ['G', 'G'] })
  })
})

describe('createHotkeyRecorder', () => {
  it('records up to maxSteps', () => {
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    let recorder!: ReturnType<typeof createHotkeyRecorder>
    render(() => {
      recorder = createHotkeyRecorder({
        maxSteps: 2,
        onRecord,
        recordBy: 'key',
      })
      return null
    })
    recorder.startRecording()
    press('g', { code: 'KeyG' })
    expect(recorder.steps()).toEqual(['G'])
    press('h', { code: 'KeyH' })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith(['G', 'H'])
    expect(recorder.recordedHotkey()).toEqual(['G', 'H'])
  })
})
