import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { HotkeysDevtoolsPanel } from './ReactHotkeysDevtools'

type HotkeysDevtoolsPluginFactory = ReturnType<typeof createReactPlugin>[0]

const plugins = createReactPlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
