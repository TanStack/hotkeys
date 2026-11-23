import type { HotkeyPlatform } from '@tanstack/hotkeys'

/** A platform the test environment can pretend to be. */
export type TestPlatform = HotkeyPlatform

/** Browser user agents for each platform. Core `detectPlatform()` reads these. */
export const USER_AGENTS: Record<TestPlatform, string> = {
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  windows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  linux:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
}

/**
 * The platform tests run as: `HOTKEYS_TEST_PLATFORM` (`mac`, `windows` or
 * `linux`), or `linux` when it is unset.
 */
export function testPlatform(): TestPlatform {
  const value = process.env.HOTKEYS_TEST_PLATFORM
  if (value === undefined || value === '') return 'linux'
  if (value === 'mac' || value === 'windows' || value === 'linux') return value
  throw new Error(
    `HOTKEYS_TEST_PLATFORM must be mac, windows or linux, not '${value}'`,
  )
}

/**
 * Sets happy-dom's user agent, which also sets `navigator.platform`. Tests
 * that stub `navigator` with `vi.stubGlobal` still win over this.
 */
export function setTestPlatform(platform: TestPlatform): void {
  const happyDOM = (
    globalThis as {
      happyDOM?: { settings: { navigator: { userAgent: string } } }
    }
  ).happyDOM
  if (!happyDOM) {
    throw new Error('setTestPlatform needs the happy-dom test environment')
  }
  happyDOM.settings.navigator.userAgent = USER_AGENTS[platform]
}
