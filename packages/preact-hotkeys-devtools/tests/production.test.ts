import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

// No module mocks: these tests check which core each entry really mounts.
// The no-op core overrides `mount`, so the spy only sees the real core.
async function load(env: 'production' | 'development', entry: string) {
  vi.stubEnv('NODE_ENV', env)
  vi.resetModules()
  const { HotkeysDevtoolsCore } =
    await import('@tanstack/hotkeys-devtools/production')
  const mount = vi
    .spyOn(HotkeysDevtoolsCore.prototype, 'mount')
    .mockResolvedValue(undefined)
  vi.spyOn(HotkeysDevtoolsCore.prototype, 'unmount').mockReturnValue(undefined)
  const mod: typeof import('../src/production') =
    entry === 'production'
      ? await import('../src/production')
      : await import('../src/index')
  return { mount, ...mod }
}

let host: HTMLDivElement
beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(() => {
  act(() => render(null, host))
  host.remove()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

it('mounts the real core from the production entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'production',
  )
  act(() => render(h(HotkeysDevtoolsPanel, { theme: 'dark' }), host))
  expect(mount).toHaveBeenCalledOnce()
  act(() => render(null, host))
  act(() =>
    render(
      hotkeysDevtoolsPlugin().render(host, {
        theme: 'dark',
        devtoolsOpen: true,
      }),
      host,
    ),
  )
  expect(mount).toHaveBeenCalledTimes(2)
})

it('mounts nothing from the default entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'index',
  )
  act(() => render(h(HotkeysDevtoolsPanel, { theme: 'dark' }), host))
  act(() =>
    render(
      hotkeysDevtoolsPlugin().render(host, {
        theme: 'dark',
        devtoolsOpen: true,
      }),
      host,
    ),
  )
  expect(mount).not.toHaveBeenCalled()
})

it('mounts the real core from the default entry in development', async () => {
  const { mount, HotkeysDevtoolsPanel } = await load('development', 'index')
  act(() => render(h(HotkeysDevtoolsPanel, { theme: 'dark' }), host))
  expect(mount).toHaveBeenCalledOnce()
})
