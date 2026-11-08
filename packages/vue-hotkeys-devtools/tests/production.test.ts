import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import type { App, Component } from 'vue'

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
let app: App | undefined
beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(() => {
  app?.unmount()
  app = undefined
  host.remove()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

function render(component: Component) {
  app?.unmount()
  app = createApp({ render: () => h(component) })
  app.mount(host)
}

it('mounts the real core from the production entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'production',
  )
  render(HotkeysDevtoolsPanel)
  expect(mount).toHaveBeenCalledOnce()
  render(hotkeysDevtoolsPlugin().component)
  expect(mount).toHaveBeenCalledTimes(2)
})

it('mounts nothing from the default entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'index',
  )
  render(HotkeysDevtoolsPanel)
  render(hotkeysDevtoolsPlugin().component)
  expect(mount).not.toHaveBeenCalled()
})

it('mounts the real core from the default entry in development', async () => {
  const { mount, HotkeysDevtoolsPanel } = await load('development', 'index')
  render(HotkeysDevtoolsPanel)
  expect(mount).toHaveBeenCalledOnce()
})
