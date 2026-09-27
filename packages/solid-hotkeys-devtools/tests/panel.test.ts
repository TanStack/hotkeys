import { createComponent, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  HotkeysDevtoolsPanel,
  HotkeysDevtoolsPanelNoOp,
} from '../src/SolidHotkeysDevtools'
import { hotkeysDevtoolsPlugin } from '../src/plugin'

const core = vi.hoisted(() => ({ mount: vi.fn(), unmount: vi.fn() }))
vi.mock('@tanstack/hotkeys-devtools', () => ({
  HotkeysDevtoolsCore: class {
    mount = core.mount
    unmount = core.unmount
  },
}))

const emptyProps: Parameters<typeof HotkeysDevtoolsPanel>[0] = {}
let host: HTMLDivElement
let dispose: () => void
beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement('div')
  document.body.append(host)
  dispose = () => {}
})
afterEach(() => {
  dispose()
  host.remove()
})

it('mounts a standalone panel with default props', () => {
  dispose = render(
    () => createComponent(HotkeysDevtoolsPanel, emptyProps),
    host,
  )
  expect(core.mount).toHaveBeenCalledOnce()
  expect(core.mount.mock.calls[0]![1]).toMatchObject({
    theme: 'dark',
    devtoolsOpen: true,
  })
})

it('preserves reactive props supplied by the devtools dock', () => {
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light')
  const plugin = hotkeysDevtoolsPlugin()
  dispose = render(
    () =>
      plugin.render(host, {
        get theme() {
          return theme()
        },
        devtoolsOpen: false,
      }),
    host,
  )
  const props = core.mount.mock.calls[0]![1]
  expect(props).toMatchObject({ theme: 'light', devtoolsOpen: false })
  setTheme('dark')
  expect(props.theme).toBe('dark')
})

it('keeps the no-op panel inert with empty props', () => {
  dispose = render(
    () => createComponent(HotkeysDevtoolsPanelNoOp, emptyProps),
    host,
  )
  expect(core.mount).not.toHaveBeenCalled()
})
