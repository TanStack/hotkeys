// @vitest-environment happy-dom
import { act, cleanup, renderHook } from '@testing-library/preact'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import {
  useAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
} from '../src/useAppHotkeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyHint } from '../src/useHotkeyHint'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import { useHotkeys } from '../src/useHotkeys'
import type { AppHotkeys, CustomHotkeys, Hotkey } from '@tanstack/hotkeys'
import type { ComponentChildren } from 'preact'

const appHotkeys = defineAppHotkeys({
  'doc.save': {
    hotkey: 'Mod+S',
    meta: { name: 'Save' },
    options: { preventDefault: false },
  },
  'doc.find': { hotkey: 'Mod+F' },
  'palette.open': { hotkey: null },
  'nav.home': {
    hotkey: ['G', 'H'],
    meta: { name: 'Go home' },
    options: { timeout: 400 },
  },
})

function wrapperWith(
  props: {
    customHotkeys?: CustomHotkeys<typeof appHotkeys>
    onCustomHotkeysChange?: (custom: CustomHotkeys<typeof appHotkeys>) => void
  } = {},
) {
  return ({ children }: { children: ComponentChildren }) => (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      defaultOptions={{ hotkey: { platform: 'mac' } }}
      {...props}
    >
      {children}
    </HotkeysProvider>
  )
}

function press(key: string, init: KeyboardEventInit = {}) {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
    )
    document.dispatchEvent(
      new KeyboardEvent('keyup', { key, bubbles: true, ...init }),
    )
  })
}

function registrations() {
  return [...HotkeyManager.getInstance().registrations.state.values()]
}

/** Renders hooks and the custom hotkey actions in the same provider. */
function renderWithCustom<T>(hook: () => T, wrapper = wrapperWith()) {
  return renderHook(() => ({ value: hook(), custom: useCustomHotkeys() }), {
    wrapper,
  })
}

beforeEach(() => HotkeyManager.resetInstance())
afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  vi.restoreAllMocks()
})

describe('useHotkey with app hotkeys', () => {
  it('registers with declared meta, options, and id', () => {
    const callback = vi.fn()
    renderHook(() => useHotkey(appHotkeys['doc.save'], callback), {
      wrapper: wrapperWith(),
    })
    expect(registrations()[0]).toMatchObject({
      hotkey: 'Mod+S',
      options: {
        meta: { name: 'Save' },
        preventDefault: false,
        appHotkeyId: 'doc.save',
      },
    })
    press('s', { metaKey: true })
    expect(callback).toHaveBeenCalledOnce()
  })

  it('works without a provider using the default hotkey', () => {
    renderHook(() =>
      useHotkey(appHotkeys['nav.home'], () => {}, { platform: 'mac' }),
    )
    expect(registrations()[0]).toMatchObject({
      kind: 'sequence',
      hotkey: ['G', 'H'],
      options: { timeout: 400 },
    })
  })

  it('applies starting custom hotkeys, including a change of kind', () => {
    const save = vi.fn()
    renderHook(() => useHotkey(appHotkeys['doc.save'], save), {
      wrapper: wrapperWith({ customHotkeys: { 'doc.save': ['Mod+K', 'S'] } }),
    })
    expect(registrations()[0]).toMatchObject({
      kind: 'sequence',
      hotkey: ['Mod+K', 'S'],
    })
    // The declared preventDefault still applies; requireReset/timeout follow the kind.
    expect(registrations()[0]!.options.preventDefault).toBe(false)
    press('k', { metaKey: true })
    press('s')
    expect(save).toHaveBeenCalledOnce()
  })

  it('moves registrations when a custom hotkey changes', () => {
    const { result } = renderWithCustom(() =>
      useHotkey(appHotkeys['doc.save'], () => {}),
    )
    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+S'])
    act(() => {
      result.current.custom.setCustomHotkey('doc.save', 'Mod+Shift+S')
    })
    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+Shift+S'])
  })

  it('registers nothing while unbound', () => {
    const { result } = renderWithCustom(() =>
      useHotkey(appHotkeys['palette.open'], () => {}),
    )
    expect(registrations()).toHaveLength(0)
    act(() => {
      result.current.custom.setCustomHotkey('palette.open', 'Mod+K')
    })
    expect(registrations().map((r) => r.hotkey)).toEqual(['Mod+K'])
    act(() => {
      result.current.custom.setCustomHotkey('palette.open', null)
    })
    expect(registrations()).toHaveLength(0)
  })

  it('types call-site options by the declared default kind', () => {
    renderHook(
      () => {
        useHotkey(appHotkeys['doc.save'], () => {}, { requireReset: true })
        useHotkey(appHotkeys['nav.home'], () => {}, { timeout: 300 })
        useHotkey(appHotkeys['palette.open'], () => {}, {
          requireReset: true,
          timeout: 300,
        })
        // @ts-expect-error timeout applies only to sequence defaults
        useHotkey(appHotkeys['doc.save'], () => {}, { timeout: 300 })
        // @ts-expect-error meta belongs in the declaration
        useHotkey(appHotkeys['doc.save'], () => {}, { meta: { name: 'x' } })
      },
      { wrapper: wrapperWith() },
    )
  })

  it('drops call-site options for the old kind after a rebind', () => {
    renderHook(
      () => useHotkey(appHotkeys['doc.save'], () => {}, { requireReset: true }),
      { wrapper: wrapperWith({ customHotkeys: { 'doc.save': ['G', 'S'] } }) },
    )
    expect(registrations()[0]!.kind).toBe('sequence')
    expect(registrations()[0]!.options).not.toHaveProperty('requireReset')
  })
})

describe('useHotkey with chords and sequences', () => {
  it('types options by kind', () => {
    renderHook(() => {
      useHotkey('Mod+S', () => {}, { requireReset: true })
      useHotkey(['G', 'G'], () => {}, { timeout: 500 })
      // @ts-expect-error timeout applies only to sequences
      useHotkey('Mod+S', () => {}, { timeout: 500 })
      // @ts-expect-error requireReset applies only to chords
      useHotkey(['G', 'G'], () => {}, { requireReset: true })
      useHotkeys([
        {
          hotkey: 'Mod+S',
          callback: () => {},
          options: { requireReset: true },
        },
        { hotkey: ['D', 'D'], callback: () => {}, options: { timeout: 300 } },
        // @ts-expect-error timeout applies only to sequences
        { hotkey: 'Mod+F', callback: () => {}, options: { timeout: 300 } },
      ])
      const saved = 'Mod+S' as Hotkey
      useHotkeys([
        { hotkey: saved, callback: () => {}, options: { enabled: true } },
        // @ts-expect-error kind-specific options need a known kind
        { hotkey: saved, callback: () => {}, options: { timeout: 300 } },
      ])
    })
  })

  it('registers a one-step sequence as its chord', () => {
    renderHook(() => useHotkey(['Escape'], () => {}))
    expect(registrations()[0]).toMatchObject({
      kind: 'chord',
      hotkey: 'Escape',
    })
  })

  it('applies provider defaults to the matching kind only', () => {
    renderHook(
      () => {
        useHotkey('Mod+S', () => {})
        useHotkey(['G', 'G'], () => {})
      },
      {
        wrapper: ({ children }: { children: ComponentChildren }) => (
          <HotkeysProvider
            defaultOptions={{ hotkey: { requireReset: true, timeout: 250 } }}
          >
            {children}
          </HotkeysProvider>
        ),
      },
    )
    const [chord, sequence] = registrations()
    expect(chord!.options).toMatchObject({ requireReset: true })
    expect(chord!.options).not.toHaveProperty('timeout')
    expect(sequence!.options).toMatchObject({ timeout: 250 })
    expect(sequence!.options).not.toHaveProperty('requireReset')
  })
})

describe('useAppHotkeys and useCustomHotkeys', () => {
  it('returns effective app hotkeys and throws without a provider', () => {
    const { result } = renderHook(() => useAppHotkeys(), {
      wrapper: wrapperWith({ customHotkeys: { 'doc.find': 'Mod+G' } }),
    })
    expect((result.current as AppHotkeys)['doc.find']!.hotkey).toBe('Mod+G')

    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAppHotkeys())).toThrow(
      'useAppHotkeys requires a HotkeysProvider',
    )
  })

  it('reports changes ready to save and rejects conflicts', () => {
    const onCustomHotkeysChange = vi.fn()
    const { result } = renderHook(() => useCustomHotkeys(), {
      wrapper: wrapperWith({ onCustomHotkeysChange }),
    })
    let conflicts: Array<{ id: string }> = []
    act(() => {
      conflicts = result.current.setCustomHotkey('palette.open', 'Mod+S')
    })
    expect(conflicts.map((c) => c.id)).toEqual(['doc.save'])
    expect(onCustomHotkeysChange).not.toHaveBeenCalled()

    act(() => {
      result.current.setCustomHotkey('palette.open', ['Mod+K', 'P'])
    })
    expect(onCustomHotkeysChange).toHaveBeenLastCalledWith({
      'palette.open': ['Mod+K', 'P'],
    })
    expect(result.current.customHotkeys).toEqual({
      'palette.open': ['Mod+K', 'P'],
    })

    act(() => result.current.resetCustomHotkeys())
    expect(onCustomHotkeysChange).toHaveBeenLastCalledWith({})
  })
})

describe('useAppHotkeyList', () => {
  it('lists unmounted app hotkeys and tracks status as they mount', () => {
    const wrapper = wrapperWith({ customHotkeys: { 'doc.find': 'Mod+G' } })
    const { result } = renderHook(() => useAppHotkeyList(), { wrapper })
    expect(
      result.current.map((item) => [item.appHotkey.id, item.status]),
    ).toEqual([
      ['doc.save', 'inactive'],
      ['doc.find', 'inactive'],
      ['palette.open', 'unbound'],
      ['nav.home', 'inactive'],
    ])
    expect(result.current[1]!.isCustom).toBe(true)

    const { unmount } = renderHook(
      () => {
        useHotkey(appHotkeys['doc.save'], () => {})
        useHotkey(appHotkeys['doc.find'], () => {}, { enabled: false })
        useHotkeys([
          { hotkey: appHotkeys['nav.home'], callback: () => {} },
          { hotkey: appHotkeys['palette.open'], callback: () => {} },
        ])
      },
      { wrapper },
    )
    expect(result.current.map((item) => item.status)).toEqual([
      'active',
      'disabled',
      'unbound',
      'active',
    ])

    act(() => unmount())
    expect(result.current.map((item) => item.status)).toEqual([
      'inactive',
      'inactive',
      'unbound',
      'inactive',
    ])
  })
})

describe('useHotkeyHint', () => {
  it('reveals an app hotkey by its effective hotkey', () => {
    const { result } = renderHook(
      () => useHotkeyHint(appHotkeys['doc.save'], { platform: 'mac' }),
      {
        wrapper: wrapperWith({ customHotkeys: { 'doc.save': 'Alt+S' } }),
      },
    )
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Alt',
          code: 'AltLeft',
          altKey: true,
          bubbles: true,
        }),
      )
    })
    expect(result.current).toBe(true)
    act(() => {
      window.dispatchEvent(new Event('blur'))
    })
  })
})

describe('useHotkeyRecorder', () => {
  it('records a chord by default', () => {
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    const { result } = renderHook(() =>
      useHotkeyRecorder({ onRecord, platform: 'mac', recordBy: 'key' }),
    )
    act(() => result.current.startRecording())
    press('s', { metaKey: true, code: 'KeyS' })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith('Mod+S')
    expect(result.current.recordedHotkey).toBe('Mod+S')
  })

  it('records up to maxSteps and exposes steps for preview', () => {
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    const { result } = renderHook(() =>
      useHotkeyRecorder({ maxSteps: 2, onRecord, recordBy: 'key' }),
    )
    act(() => result.current.startRecording())
    press('g', { code: 'KeyG' })
    expect(result.current.steps).toEqual(['G'])
    press('h', { code: 'KeyH' })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith(['G', 'H'])
    expect(result.current.isRecording).toBe(false)
  })

  it('only allows sequence commit options with maxSteps', () => {
    renderHook(() => {
      useHotkeyRecorder({ maxSteps: 3, idleTimeoutMs: 500, onRecord: () => {} })
      // @ts-expect-error idleTimeoutMs needs maxSteps above 1
      useHotkeyRecorder({ idleTimeoutMs: 500, onRecord: () => {} })
    })
  })
})
