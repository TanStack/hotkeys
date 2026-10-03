import { mount, tick, unmount } from 'svelte'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  HotkeysDevtoolsPanel,
  HotkeysDevtoolsPanelNoOp,
} from '../src/SvelteHotkeysDevtools'
import { hotkeysDevtoolsNoOpPlugin, hotkeysDevtoolsPlugin } from '../src/plugin'
import { createPanelProps } from './panel-state.svelte'

const core = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }))
vi.mock('@tanstack/hotkeys-devtools/production', () => ({
  HotkeysDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))

let host: HTMLDivElement
let panel: ReturnType<typeof mount> | undefined
beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(async () => {
  if (panel) await unmount(panel)
  panel = undefined
  host.remove()
  vi.unstubAllEnvs()
})

it('mounts a standalone panel with defaults and disposes it', async () => {
  panel = mount(HotkeysDevtoolsPanel, { target: host })
  await tick()
  expect(core.mount).toHaveBeenCalledOnce()
  expect(core.mount.mock.calls[0]![0]).toBe(host.querySelector('div'))
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'dark',
    devtoolsOpen: true,
  })
  await unmount(panel)
  panel = undefined
  expect(core.unmount).toHaveBeenCalledOnce()
})

it('preserves props supplied by the dock', async () => {
  const plugin = hotkeysDevtoolsPlugin()
  expect(plugin.name).toBe('TanStack Hotkeys')
  panel = mount(plugin.component, {
    target: host,
    props: { theme: 'light', devtoolsOpen: false },
  })
  await tick()
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'light',
    devtoolsOpen: false,
  })
})

it('keeps live props readable by the mounted core without remounting', async () => {
  const props = createPanelProps()
  panel = mount(HotkeysDevtoolsPanel, { target: host, props })
  await tick()
  const mountedProps = core.mount.mock.calls[0]![1]
  props.theme = 'light'
  props.devtoolsOpen = false
  await tick()
  expect(mountedProps).toMatchObject({ theme: 'light', devtoolsOpen: false })
  expect(core.mount).toHaveBeenCalledOnce()
})

it('keeps no-op panels and plugins inert', async () => {
  panel = mount(HotkeysDevtoolsPanelNoOp, { target: host })
  await tick()
  await unmount(panel)
  panel = mount(hotkeysDevtoolsNoOpPlugin().component, { target: host })
  await tick()
  expect(core.mount).not.toHaveBeenCalled()
  expect(core.unmount).not.toHaveBeenCalled()
  expect(host.textContent).toBe('')
})

it.each(['development', 'production'])(
  'selects the correct root exports in %s',
  async (mode) => {
    vi.stubEnv('NODE_ENV', mode)
    vi.resetModules()
    const entry = await import('../src/index')
    const devtools = await import('../src/SvelteHotkeysDevtools')
    const plugins = await import('../src/plugin')
    expect(entry.HotkeysDevtoolsPanel).toBe(
      mode === 'development'
        ? devtools.HotkeysDevtoolsPanel
        : devtools.HotkeysDevtoolsPanelNoOp,
    )
    expect(entry.hotkeysDevtoolsPlugin).toBe(
      mode === 'development'
        ? plugins.hotkeysDevtoolsPlugin
        : plugins.hotkeysDevtoolsNoOpPlugin,
    )
  },
)

it('keeps the explicit production entry functional in production', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  // resetModules reloads Svelte too; mount with the same runtime as this entry.
  const runtime = await import('svelte')
  const entry = await import('../src/production')
  const productionPanel = runtime.mount(
    entry.hotkeysDevtoolsPlugin().component,
    {
      target: host,
    },
  )
  await runtime.tick()
  expect(core.mount).toHaveBeenCalledOnce()
  await runtime.unmount(productionPanel)
  expect(core.unmount).toHaveBeenCalledOnce()
})
