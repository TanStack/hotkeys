import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRoot, drainPassiveEffects, flushSync, hydrateRoot } from 'octane'
import { HotkeyManager } from '@tanstack/hotkeys'
import { FormatLabel, PlatformFixture, platformCapture } from './fixture.tsrx'
import type { Root } from 'octane'

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

let root: Root | undefined
let container: HTMLDivElement

function flush() {
  drainPassiveEffects()
  flushSync(() => {})
  drainPassiveEffects()
}
function mount(body: typeof PlatformFixture | typeof FormatLabel, props = {}) {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  flushSync(() => root!.render(body, props))
  flush()
}
function press(key: string, init: KeyboardEventInit) {
  flushSync(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
    )
    document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
  })
  flush()
}

afterEach(() => {
  root?.unmount()
  root = undefined
  flush()
  container.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
  platformCapture.fired = 0
  platformCapture.records = []
})

describe('useFormatForDisplay', () => {
  it('lets a platform passed to format win over the provider', () => {
    mount(PlatformFixture, { platform: 'mac', label: 'windows' })
    expect(container.textContent).toBe('Ctrl+S')
  })

  it('detects the platform without a provider', () => {
    vi.stubGlobal('navigator', MAC)
    mount(FormatLabel)
    expect(container.textContent).toBe('⌘ S')
  })

  it('hydrates without a mismatch, then shows the client platform', () => {
    vi.stubGlobal('navigator', MAC)
    const error = vi.spyOn(console, 'error')
    const onRecoverableError = vi.fn()
    container = document.createElement('div')
    // The server HTML without a platform, from tests/ssr.
    container.innerHTML = '<kbd>Ctrl+S</kbd>'
    const kbd = container.firstChild
    document.body.append(container)
    flushSync(() => {
      root = hydrateRoot(container, FormatLabel, {}, { onRecoverableError })
    })
    flush()
    expect(container.textContent).toBe('⌘ S')
    expect(container.firstChild).toBe(kbd)
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
    mount(PlatformFixture, { platform })
    press('s', ignored)
    expect(platformCapture.fired).toBe(0)
    press('s', fires)
    expect(platformCapture.fired).toBe(1)
  })

  it('lets a hotkey platform win over the provider', () => {
    vi.stubGlobal('navigator', MAC)
    mount(PlatformFixture, { platform: 'mac', hotkey: 'windows' })
    press('s', { ctrlKey: true })
    expect(platformCapture.fired).toBe(1)
  })

  it.each([
    ['mac', { metaKey: true }],
    ['windows', { ctrlKey: true }],
  ] as const)('records Mod on %s', (platform, init) => {
    vi.stubGlobal('navigator', OTHER[platform])
    mount(PlatformFixture, { platform })
    flushSync(() => platformCapture.recorder!.startRecording())
    flush()
    press('s', { code: 'KeyS', ...init })
    expect(platformCapture.records).toEqual(['Mod+S'])
  })
})
