import { renderToString } from 'octane/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormatLabel, PlatformFixture } from '../fixture.tsrx'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useFormatForDisplay on the server', () => {
  it.each([
    ['mac', '⌘ S'],
    ['windows', 'Ctrl+S'],
  ] as const)('renders with the provider platform %s', (platform, label) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { html } = renderToString(PlatformFixture, { platform })
    expect(html).toContain(`<kbd>${label}</kbd>`)
    expect(warn).not.toHaveBeenCalled()
  })

  it('lets a platform passed to format win over the provider', () => {
    const { html } = renderToString(PlatformFixture, {
      platform: 'mac',
      label: 'windows',
    })
    expect(html).toContain('<kbd>Ctrl+S</kbd>')
  })

  it('uses linux and warns without a platform', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // The hydration test in useFormatForDisplay.test.ts starts from this HTML.
    expect(renderToString(FormatLabel, {}).html).toBe('<kbd>Ctrl+S</kbd>')
    expect(warn).toHaveBeenCalledOnce()
  })
})
