// @vitest-environment happy-dom
import { act, cleanup, render } from '@testing-library/preact'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useFormatForDisplay } from '../src/useFormatForDisplay'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import type { Hotkey } from '@tanstack/hotkeys'
import type { ComponentChildren } from 'preact'
import type { PreactHotkeyRecorder } from '../src/useHotkeyRecorder'

type Platform = 'mac' | 'windows' | 'linux'

// preact-render-to-string is not installed, so a server runtime's navigator
// stands in for the server.
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

function withPlatform(
  platform: Platform | undefined,
  children: ComponentChildren,
) {
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
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
})

describe('useFormatForDisplay', () => {
  it.each([
    ['mac', '⌘ S'],
    ['windows', 'Ctrl+S'],
  ] as const)(
    'renders with the provider platform %s on a server runtime',
    (platform, label) => {
      vi.stubGlobal('navigator', SERVER)
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = render(withPlatform(platform, <Label />))
      expect(container.innerHTML).toBe(`<kbd>${label}</kbd>`)
      expect(warn).not.toHaveBeenCalled()
    },
  )

  it('lets a platform passed to format win over the provider', () => {
    const { container } = render(
      withPlatform('mac', <Label platform="windows" />),
    )
    expect(container.textContent).toBe('Ctrl+S')
  })

  it('uses linux and warns on a server runtime without a platform', () => {
    vi.stubGlobal('navigator', SERVER)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Label />)
    expect(container.textContent).toBe('Ctrl+S')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('detects the platform without a provider', () => {
    vi.stubGlobal('navigator', MAC)
    const { container } = render(<Label />)
    expect(container.textContent).toBe('⌘ S')
  })

  it('returns a stable function while the platform is unchanged', () => {
    const formats: Array<unknown> = []
    function Capture({ n }: { n: number }) {
      formats.push(useFormatForDisplay())
      return <span>{n}</span>
    }
    const { rerender } = render(withPlatform('mac', <Capture n={1} />))
    rerender(withPlatform('mac', <Capture n={2} />))
    expect(formats).toHaveLength(2)
    expect(formats[1]).toBe(formats[0])
  })
})

describe('provider platform', () => {
  function Save({
    onSave,
    platform,
  }: {
    onSave: () => void
    platform?: Platform
  }) {
    useHotkey('Mod+S', onSave, { platform })
    return null
  }

  it.each([
    ['mac', { metaKey: true }, { ctrlKey: true }],
    ['windows', { ctrlKey: true }, { metaKey: true }],
  ] as const)('matches Mod on %s', (platform, fires, ignored) => {
    vi.stubGlobal('navigator', OTHER[platform])
    const callback = vi.fn()
    render(withPlatform(platform, <Save onSave={callback} />))
    press('s', ignored)
    expect(callback).not.toHaveBeenCalled()
    press('s', fires)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('lets a hotkey platform win over the provider', () => {
    vi.stubGlobal('navigator', MAC)
    const callback = vi.fn()
    render(withPlatform('mac', <Save onSave={callback} platform="windows" />))
    press('s', { ctrlKey: true })
    expect(callback).toHaveBeenCalledOnce()
  })

  it.each([
    ['mac', { metaKey: true }],
    ['windows', { ctrlKey: true }],
  ] as const)('records Mod on %s', (platform, init) => {
    vi.stubGlobal('navigator', OTHER[platform])
    const onRecord = vi.fn<(hotkey: Hotkey) => void>()
    let recorder: PreactHotkeyRecorder | undefined
    function Recorder() {
      recorder = useHotkeyRecorder({ onRecord, recordBy: 'key' })
      return null
    }
    render(withPlatform(platform, <Recorder />))
    act(() => recorder!.startRecording())
    press('s', { code: 'KeyS', ...init })
    expect(onRecord).toHaveBeenCalledExactlyOnceWith('Mod+S')
  })
})
