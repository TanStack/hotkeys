import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Root } from 'react-dom/client'

// No module mocks: these tests check which core each entry really mounts.
// The no-op core overrides `mount`, so the spy only sees the real core.
async function load(
  env: 'production' | 'development',
  entry: 'production' | 'index',
) {
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
let root: Root
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

it('mounts the real core from the production entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'production',
  )
  await act(() => root.render(createElement(HotkeysDevtoolsPanel)))
  expect(mount).toHaveBeenCalledOnce()
  await act(() => root.render(null))
  await act(() =>
    root.render(
      hotkeysDevtoolsPlugin().render(host, {
        theme: 'dark',
        devtoolsOpen: true,
      }),
    ),
  )
  expect(mount).toHaveBeenCalledTimes(2)
})

it('mounts nothing from the default entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'index',
  )
  await act(() => root.render(createElement(HotkeysDevtoolsPanel)))
  await act(() =>
    root.render(
      hotkeysDevtoolsPlugin().render(host, {
        theme: 'dark',
        devtoolsOpen: true,
      }),
    ),
  )
  expect(mount).not.toHaveBeenCalled()
})

it('mounts the real core from the default entry in development', async () => {
  const { mount, HotkeysDevtoolsPanel } = await load('development', 'index')
  await act(() => root.render(createElement(HotkeysDevtoolsPanel)))
  expect(mount).toHaveBeenCalledOnce()
})
