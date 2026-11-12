// @vitest-environment happy-dom

import { cleanup, render } from '@solidjs/testing-library'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import {
  createAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
} from '../src/appHotkeys'
import { createHotkey } from '../src/createHotkey'
import { createHotkeyRecorder } from '../src/createHotkeyRecorder'
import { createHotkeys } from '../src/createHotkeys'
import type { AppHotkeys, CustomHotkeys, Hotkey } from '@tanstack/hotkeys'
import type { JSX } from 'solid-js'

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
    expect(onRecord).toHaveBeenCalledExactlyOnceWith(
      ['G', 'H'],
      expect.anything(),
    )
    expect(recorder.recordedHotkey()).toEqual(['G', 'H'])
  })
})

describe('app hotkeys and the provider platform', () => {
  it('compares custom hotkeys on the provider platform', () => {
    const [platform, setPlatform] = createSignal<'mac' | 'windows'>('mac')
    let list!: ReturnType<typeof createAppHotkeyList>
    let custom!: ReturnType<typeof useCustomHotkeys>
    render(() => (
      <HotkeysProvider
        appHotkeys={appHotkeys}
        customHotkeys={{ 'doc.save': 'Meta+S' }}
        defaultOptions={{ platform: platform() }}
      >
        {(() => {
          list = createAppHotkeyList()
          custom = useCustomHotkeys()
          return null
        })()}
      </HotkeysProvider>
    ))

    // Meta+S is Mod+S only on macOS, which the test environment never detects
    expect(list()[0]!.isCustom).toBe(false)
    expect(
      custom.findConflicts('palette.open', 'Meta+S').map((a) => a.id),
    ).toEqual(['doc.save'])
    // A recorded position conflicts through the key press that recorded it
    const recordedWith = {
      event: new KeyboardEvent('keydown', {
        key: 's',
        code: 'KeyS',
        metaKey: true,
      }),
    }
    expect(custom.findConflicts('palette.open', 'Meta+[KeyS]')).toEqual([])
    expect(
      custom
        .findConflicts('palette.open', 'Meta+[KeyS]', recordedWith)
        .map((a) => a.id),
    ).toEqual(['doc.save'])

    setPlatform('windows')
    expect(list()[0]!.isCustom).toBe(true)
  })
})

describe('a nested provider whose app hotkeys arrive late', () => {
  it("gets its own store and leaves its parent's alone", () => {
    const nestedHotkeys = defineAppHotkeys({ 'file.open': { hotkey: 'Mod+O' } })
    const [nested, setNested] = createSignal<AppHotkeys>()
    const lists: Record<string, ReturnType<typeof createAppHotkeyList>> = {}
    function List(props: { name: string }) {
      lists[props.name] = createAppHotkeyList()
      return null
    }
    render(() => (
      <HotkeysProvider appHotkeys={appHotkeys}>
        <List name="root" />
        <HotkeysProvider appHotkeys={nested()}>
          <List name="nested" />
        </HotkeysProvider>
      </HotkeysProvider>
    ))
    const ids = (name: string) =>
      lists[name]!().map((item) => item.appHotkey.id)
    const rootIds = Object.keys(appHotkeys)
    // Until its own declarations arrive, it shares its parent's store.
    expect([ids('root'), ids('nested')]).toEqual([rootIds, rootIds])

    setNested(nestedHotkeys)
    expect([ids('root'), ids('nested')]).toEqual([rootIds, ['file.open']])
  })
})
