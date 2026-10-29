import { createApp, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  HotkeysDevtoolsPanel,
  HotkeysDevtoolsPanelNoOp,
} from '../src/VueHotkeysDevtools'
import { hotkeysDevtoolsPlugin } from '../src/plugin'
import type { App, Component } from 'vue'

const core = vi.hoisted(() => ({
  mount: vi.fn(async (_el: HTMLElement, _props: object) => {}),
  unmount: vi.fn(),
}))
vi.mock('@tanstack/hotkeys-devtools', () => ({
  HotkeysDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))

let host: HTMLDivElement
let app: App | undefined
beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(() => {
  app?.unmount()
  app = undefined
  host.remove()
})

function render(component: Component, props?: Record<string, unknown>) {
  app = createApp({ render: () => h(component, props) })
  app.mount(host)
}

it('mounts a bare panel with the default theme', () => {
  render(HotkeysDevtoolsPanel)
  expect(core.mount).toHaveBeenCalledOnce()
  expect(core.mount.mock.calls[0]).toEqual([
    host.firstElementChild,
    { theme: 'dark', devtoolsOpen: true },
  ])
})

it('passes a theme prop through', () => {
  render(HotkeysDevtoolsPanel, { theme: 'light', devtoolsOpen: false })
  expect(core.mount.mock.calls[0]![1]).toEqual({
    theme: 'light',
    devtoolsOpen: false,
  })
})

it('reads the props object the Vue devtools dock passes as `theme`', () => {
  const plugin = hotkeysDevtoolsPlugin()
  // `TanStackDevtools` renders `plugin.component` with `{ theme, ...plugin.props }`,
  // where `theme` is the dock's `{ theme, devtoolsOpen }`.
  render(plugin.component, {
    theme: { theme: 'light', devtoolsOpen: false },
    ...plugin.props,
  })
  expect(core.mount.mock.calls[0]![1]).toEqual({
    theme: 'light',
    devtoolsOpen: false,
  })
})

it('remounts when the theme changes, and unmounts on teardown', async () => {
  const theme = ref<'light' | 'dark'>('light')
  app = createApp({
    render: () => h(HotkeysDevtoolsPanel, { theme: theme.value }),
  })
  app.mount(host)
  theme.value = 'dark'
  await nextTick()
  expect(core.unmount).toHaveBeenCalledOnce()
  expect(core.mount).toHaveBeenCalledTimes(2)
  expect(core.mount.mock.calls[1]![1]).toEqual({
    theme: 'dark',
    devtoolsOpen: true,
  })
  app.unmount()
  app = undefined
  expect(core.unmount).toHaveBeenCalledTimes(2)
})

it('keeps the no-op panel inert', () => {
  render(HotkeysDevtoolsPanelNoOp)
  expect(core.mount).not.toHaveBeenCalled()
  expect(host.innerHTML).toBe('<!---->')
})
