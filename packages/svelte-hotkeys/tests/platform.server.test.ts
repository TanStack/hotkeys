// @vitest-environment node
import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'
import PlatformServer from './PlatformServer.svelte'

describe('getFormatForDisplay on the server', () => {
  it('runs without a document', () => {
    expect(typeof document).toBe('undefined')
  })

  it("renders labels for the provider's platform", () => {
    expect(
      render(PlatformServer, { props: { platform: 'mac' } }).body,
    ).toContain('<kbd>⌘ S</kbd>')
    expect(
      render(PlatformServer, { props: { platform: 'windows' } }).body,
    ).toContain('<kbd>Ctrl+S</kbd>')
  })
})
