import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  HotkeysDevtoolsPanel,
  HotkeysDevtoolsPanelNoOp,
} from '../src/PreactHotkeysDevtools'
import { hotkeysDevtoolsPlugin } from '../src/plugin'

const core = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }))
vi.mock('@tanstack/hotkeys-devtools', () => ({
  HotkeysDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))

const emptyProps: NonNullable<Parameters<typeof HotkeysDevtoolsPanel>[0]> = {}
let host: HTMLDivElement
beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(() => {
  act(() => render(null, host))
  host.remove()
})

it('mounts a standalone panel with default props', () => {
  act(() => render(h(HotkeysDevtoolsPanel, emptyProps), host))
  expect(core.mount).toHaveBeenCalledOnce()
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'dark',
    devtoolsOpen: true,
  })
  act(() => render(null, host))
  expect(core.unmount).toHaveBeenCalledOnce()
})

it('preserves props supplied by the devtools dock', () => {
  const plugin = hotkeysDevtoolsPlugin()
  act(() =>
    render(plugin.render(host, { theme: 'light', devtoolsOpen: false }), host),
  )
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'light',
    devtoolsOpen: false,
  })
})

it('keeps the no-op panel inert with empty props', () => {
  act(() => render(h(HotkeysDevtoolsPanelNoOp, emptyProps), host))
  expect(core.mount).not.toHaveBeenCalled()
})

it('accepts omitted props for real and no-op panels during render', () => {
  const Standalone = () => HotkeysDevtoolsPanel()
  const NoOp = () => HotkeysDevtoolsPanelNoOp()
  act(() => render(h(Standalone, {}), host))
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'dark',
    devtoolsOpen: true,
  })
  act(() => render(h(NoOp, {}), host))
  expect(core.mount).toHaveBeenCalledOnce()
})
