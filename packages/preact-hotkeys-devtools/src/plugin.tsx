import { createPreactPlugin } from '@tanstack/devtools-utils/preact'
import { HotkeysDevtoolsPanel } from './PreactHotkeysDevtools'

type HotkeysDevtoolsPluginFactory = ReturnType<typeof createPreactPlugin>[0]

const plugins = createPreactPlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
