import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  HotkeysDevtoolsPanel,
  HotkeysDevtoolsPanelNoOp,
} from '../src/ReactHotkeysDevtools'
import { hotkeysDevtoolsPlugin } from '../src/plugin'
import type { Root } from 'react-dom/client'

const core = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }))
vi.mock('@tanstack/hotkeys-devtools', () => ({
  HotkeysDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))

const emptyProps = {} satisfies NonNullable<
  Parameters<typeof HotkeysDevtoolsPanel>[0]
>
let host: HTMLDivElement
let root: Root
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

it('mounts a standalone panel with default props', async () => {
  await act(() => root.render(createElement(HotkeysDevtoolsPanel, emptyProps)))
  expect(core.mount).toHaveBeenCalledOnce()
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'dark',
    devtoolsOpen: true,
  })
  await act(() => root.render(null))
})

it('preserves props supplied by the devtools dock', async () => {
  const plugin = hotkeysDevtoolsPlugin()
  await act(() =>
    root.render(plugin.render(host, { theme: 'light', devtoolsOpen: false })),
  )
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'light',
    devtoolsOpen: false,
  })
})

it('keeps the no-op panel inert with empty props', async () => {
  await act(() =>
    root.render(createElement(HotkeysDevtoolsPanelNoOp, emptyProps)),
  )
  expect(core.mount).not.toHaveBeenCalled()
})

it('accepts omitted props for real and no-op panels during render', async () => {
  const Standalone = () => HotkeysDevtoolsPanel()
  const NoOp = () => HotkeysDevtoolsPanelNoOp()
  await act(() => root.render(createElement(Standalone)))
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'dark',
    devtoolsOpen: true,
  })
  await act(() => root.render(createElement(NoOp)))
  expect(core.mount).toHaveBeenCalledOnce()
})
