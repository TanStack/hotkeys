// @vitest-environment happy-dom
import { act, render, renderHook } from '@testing-library/react'
import { HotkeyManager } from '@tanstack/hotkeys'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useFormatForDisplay } from '../src/useFormatForDisplay'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import type { Hotkey } from '@tanstack/hotkeys'
import type { ReactNode } from 'react'

type Platform = 'mac' | 'windows' | 'linux'

const SERVER = { userAgent: 'Node.js/26', platform: '' }
const MAC = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  platform: 'MacIntel',
}
const WINDOWS = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  platform: 'Win32',
}
// Detection would pick the other platform, so a pass means the provider's won.
const OTHER = { mac: WINDOWS, windows: MAC }

function Label({ platform }: { platform?: Platform }) {
  const format = useFormatForDisplay()
  return <kbd>{format('Mod+S', { platform })}</kbd>
}

function withPlatform(platform: Platform | undefined, children: ReactNode) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>{children}</HotkeysProvider>
  )
}

function press(key: string, init: KeyboardEventInit) {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
    )
    document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  HotkeyManager.resetInstance()
})

describe('useFormatForDisplay', () => {
  it.each([
    ['mac', '⌘ S'],
    ['windows', 'Ctrl+S'],
  ] as const)(
    'server renders with the provider platform %s',
    (platform, label) => {
      vi.stubGlobal('navigator', SERVER)
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const html = renderToString(withPlatform(platform, <Label />))
      expect(html).toBe(`<kbd>${label}</kbd>`)
      expect(warn).not.toHaveBeenCalled()
    },
  )

  it('lets a platform passed to format win over the provider', () => {
    const { container } = render(
      withPlatform('mac', <Label platform="windows" />),
    )
    expect(container.textContent).toBe('Ctrl+S')
  })

  it('detects the platform without a provider', () => {
    vi.stubGlobal('navigator', MAC)
    const { container } = render(<Label />)
    expect(container.textContent).toBe('⌘ S')
  })

  it('returns a stable function while the platform is unchanged', () => {
    const { result, rerender } = renderHook(() => useFormatForDisplay(), {
      wrapper: ({ children }) => withPlatform('mac', children),
    })
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('hydrates without a mismatch, then shows the client platform', () => {
    vi.stubGlobal('navigator', SERVER)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = renderToString(<Label />)
    expect(html).toBe('<kbd>Ctrl+S</kbd>')
    expect(warn).toHaveBeenCalledOnce()

    vi.stubGlobal('navigator', MAC)
    const error = vi.spyOn(console, 'error')
    const onRecoverableError = vi.fn()
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    render(<Label />, { container, hydrate: true, onRecoverableError })
    expect(container.textContent).toBe('⌘ S')
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })
})

describe('provider platform', () => {
  it.each([
    ['mac', { metaKey: true }, { ctrlKey: true }],
    ['windows', { ctrlKey: true }, { metaKey: true }],
  ] as const)('matches Mod on %s', (platform, fires, ignored) => {
    vi.stubGlobal('navigator', OTHER[platform])
    const callback = vi.fn()
    renderHook(() => useHotkey('Mod+S', callback), {
      wrapper: ({ children }) => withPlatform(platform, children),
    })
    press('s', ignored)
    expect(callback).not.toHaveBeenCalled()
    press('s', fires)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('lets a hotkey platform win over the provider', () => {
    vi.stubGlobal('navigator', MAC)
    const callback = vi.fn()
    renderHook(() => useHotkey('Mod+S', callback, { platform: 'windows' }), {
      wrapper: ({ children }) => withPlatform('mac', children),
    })
    press('s', { ctrlKey: true })
    expect(callback).toHaveBeenCalledOnce()
  })

  it.each([
    ['mac', { metaKey: true }],
    ['windows', { ctrlKey: true }],
  ] as const)('records Mod on %s', (platform, init) => {
    vi.stubGlobal('navigator', OTHER[platform])
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    const { result } = renderHook(
      () => useHotkeyRecorder({ onRecord, recordBy: 'key' }),
      { wrapper: ({ children }) => withPlatform(platform, children) },
    )
    act(() => result.current.startRecording())
    press('s', { code: 'KeyS', ...init })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith('Mod+S')
  })
})
