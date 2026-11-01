import { afterEach, describe, expect, it, vi } from 'vitest'

const agents = {
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  windows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  linux:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  // iPadOS Safari reports a desktop Mac, and iPads use Command.
  ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  android:
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
  chromeos:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
}

/** Fresh modules, so the once-only warning starts unwarned. */
async function load() {
  vi.resetModules()
  return {
    ...(await import('../src/platform')),
    ...(await import('../src/format')),
    ...(await import('../src/adapter')),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('detectPlatform(userAgent)', () => {
  it.each([
    ['mac', 'mac'],
    ['windows', 'windows'],
    ['linux', 'linux'],
    ['ipad', 'mac'],
    ['android', 'linux'],
    ['chromeos', 'linux'],
  ] as const)('detects %s', async (agent, platform) => {
    const { detectPlatform } = await load()
    expect(detectPlatform(agents[agent])).toBe(platform)
  })

  it('ignores navigator when given a user agent', async () => {
    vi.stubGlobal('navigator', { platform: 'Win32', userAgent: agents.windows })
    const { detectPlatform } = await load()
    expect(detectPlatform(agents.mac)).toBe('mac')
  })
})

describe('on a server runtime', () => {
  it.each(['Node.js/26', 'Deno/2.5.0', 'Bun/1.3.0', 'Cloudflare-Workers'])(
    'returns linux instead of the server OS for %s',
    async (userAgent) => {
      // Node on a Mac host reports the host's platform.
      vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent })
      const { detectPlatform } = await load()
      expect(detectPlatform()).toBe('linux')
      expect(detectPlatform(agents.mac)).toBe('mac')
    },
  )

  it('warns once when a label detects its platform', async () => {
    vi.stubGlobal('navigator', {
      platform: 'MacIntel',
      userAgent: 'Node.js/26',
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { formatForDisplay } = await load()
    expect(formatForDisplay('Mod+S')).toBe('Ctrl+S')
    formatForDisplay('Mod+K')
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]![0]).toMatch(/defaultOptions\.platform/)
  })

  it('does not warn for a label with a platform', async () => {
    vi.stubGlobal('navigator', {
      platform: 'MacIntel',
      userAgent: 'Node.js/26',
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { formatForDisplay } = await load()
    expect(formatForDisplay('Mod+S', { platform: 'mac' })).toBe('⌘ S')
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubGlobal('navigator', {
      platform: 'MacIntel',
      userAgent: 'Node.js/26',
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { formatForDisplay } = await load()
    formatForDisplay('Mod+S')
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns from the server snapshot used during hydration', async () => {
    vi.stubGlobal('navigator', {
      platform: 'MacIntel',
      userAgent: 'Node.js/26',
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { getServerPlatformSnapshot } = await load()
    expect(getServerPlatformSnapshot()).toBe('linux')
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe('in a browser', () => {
  it('detects from navigator without warning', async () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: agents.mac })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { detectPlatform, formatForDisplay, getServerPlatformSnapshot } =
      await load()
    expect(detectPlatform()).toBe('mac')
    expect(formatForDisplay('Mod+S')).toBe('⌘ S')
    // Hydration renders the server's value without warning in the browser.
    expect(getServerPlatformSnapshot()).toBe('linux')
    expect(warn).not.toHaveBeenCalled()
  })
})

type Defaults = {
  platform?: 'mac' | 'windows' | 'linux'
  hotkey?: { platform?: 'mac' | 'windows' | 'linux'; scope?: string }
  hotkeyRecorder?: object
}

describe('mergeHotkeysProviderDefaults', () => {
  it('passes the provider platform to hotkeys and recorders', async () => {
    const { mergeHotkeysProviderDefaults } = await load()
    expect(
      mergeHotkeysProviderDefaults<Defaults>(
        undefined,
        { platform: 'mac' },
        undefined,
      ),
    ).toEqual({
      platform: 'mac',
      hotkey: { platform: 'mac' },
      hotkeyRecorder: { platform: 'mac' },
    })
  })

  it('inherits the parent platform, and lets the nearest setting win', async () => {
    const { mergeHotkeysProviderDefaults } = await load()
    const parent = mergeHotkeysProviderDefaults<Defaults>(
      undefined,
      { platform: 'windows', hotkey: { platform: 'linux' } },
      undefined,
    )
    expect(mergeHotkeysProviderDefaults<Defaults>(parent, {}, 'child')).toEqual(
      {
        platform: 'windows',
        hotkey: { platform: 'linux', scope: 'child' },
        hotkeyRecorder: { platform: 'windows' },
      },
    )
    // A child's platform wins over the parent's `hotkey.platform`.
    expect(
      mergeHotkeysProviderDefaults<Defaults>(
        parent,
        { platform: 'mac' },
        undefined,
      ),
    ).toEqual({
      platform: 'mac',
      hotkey: { platform: 'mac' },
      hotkeyRecorder: { platform: 'mac' },
    })
  })

  it('adds no platform when none is set', async () => {
    const { mergeHotkeysProviderDefaults } = await load()
    expect(
      mergeHotkeysProviderDefaults<Defaults>(undefined, {}, undefined),
    ).toEqual({
      hotkey: {},
      hotkeyRecorder: {},
    })
  })
})
