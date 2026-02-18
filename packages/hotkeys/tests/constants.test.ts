import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { detectPlatform } from '../src/constants'

describe('detectPlatform', () => {
  const originalNavigator = globalThis.navigator

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.stubGlobal('navigator', originalNavigator)
  })

  describe('when navigator is undefined (SSR)', () => {
    it('returns linux as default', () => {
      vi.stubGlobal('navigator', undefined)
      expect(detectPlatform()).toBe('linux')
    })
  })

  describe('when navigator.platform is undefined (partial implementation e.g. Deno, Cloudflare Workers)', () => {
    it('returns mac when userAgent contains mac', () => {
      vi.stubGlobal('navigator', {
        platform: undefined,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      })
      expect(detectPlatform()).toBe('mac')
    })

    it('returns windows when userAgent contains win', () => {
      vi.stubGlobal('navigator', {
        platform: undefined,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      })
      expect(detectPlatform()).toBe('windows')
    })

    it('returns linux when userAgent has no platform hints', () => {
      vi.stubGlobal('navigator', {
        platform: undefined,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      })
      expect(detectPlatform()).toBe('linux')
    })
  })

  describe('when navigator.userAgent is undefined', () => {
    it('returns mac when platform contains mac', () => {
      vi.stubGlobal('navigator', {
        platform: 'MacIntel',
        userAgent: undefined,
      })
      expect(detectPlatform()).toBe('mac')
    })

    it('returns windows when platform contains win', () => {
      vi.stubGlobal('navigator', {
        platform: 'Win32',
        userAgent: undefined,
      })
      expect(detectPlatform()).toBe('windows')
    })

    it('returns linux when platform has no platform hints', () => {
      vi.stubGlobal('navigator', {
        platform: 'Linux x86_64',
        userAgent: undefined,
      })
      expect(detectPlatform()).toBe('linux')
    })
  })

  describe('when both navigator.platform and navigator.userAgent are undefined', () => {
    it('returns linux as default', () => {
      vi.stubGlobal('navigator', {
        platform: undefined,
        userAgent: undefined,
      })
      expect(detectPlatform()).toBe('linux')
    })
  })
})
