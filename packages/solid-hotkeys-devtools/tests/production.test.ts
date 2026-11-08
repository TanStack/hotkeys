import { afterEach, expect, it, vi } from 'vitest'

// No module mocks: these tests check which core each entry really mounts.
// The no-op core overrides `mount`, so the spy only sees the real core.
// Solid loads after `resetModules`, so the test and panels share one runtime.
let solid: typeof import('solid-js')
let web: typeof import('solid-js/web')
async function load(
  env: 'production' | 'development',
  entry: 'production' | 'index',
) {
  vi.stubEnv('NODE_ENV', env)
  vi.resetModules()
  solid = await import('solid-js')
  web = await import('solid-js/web')
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

const disposers: Array<() => void> = []
function mountIn(component: () => unknown) {
  const host = document.createElement('div')
  document.body.append(host)
  const dispose = web.render(component as () => Element, host)
  disposers.push(() => {
    dispose()
    host.remove()
  })
  return host
}
afterEach(() => {
  disposers.splice(0).forEach((dispose) => dispose())
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

it('mounts the real core from the production entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'production',
  )
  mountIn(() => solid.createComponent(HotkeysDevtoolsPanel, {}))
  expect(mount).toHaveBeenCalledOnce()
  const host = mountIn(() => null)
  mountIn(() =>
    hotkeysDevtoolsPlugin().render(host, { theme: 'dark', devtoolsOpen: true }),
  )
  expect(mount).toHaveBeenCalledTimes(2)
})

it('mounts nothing from the default entry in production', async () => {
  const { mount, HotkeysDevtoolsPanel, hotkeysDevtoolsPlugin } = await load(
    'production',
    'index',
  )
  mountIn(() => solid.createComponent(HotkeysDevtoolsPanel, {}))
  const host = mountIn(() => null)
  mountIn(() =>
    hotkeysDevtoolsPlugin().render(host, { theme: 'dark', devtoolsOpen: true }),
  )
  expect(mount).not.toHaveBeenCalled()
})

it('mounts the real core from the default entry in development', async () => {
  const { mount, HotkeysDevtoolsPanel } = await load('development', 'index')
  mountIn(() => solid.createComponent(HotkeysDevtoolsPanel, {}))
  expect(mount).toHaveBeenCalledOnce()
})
