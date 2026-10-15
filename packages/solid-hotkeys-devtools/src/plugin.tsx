import { createSolidPlugin } from '@tanstack/devtools-utils/solid'
import { HotkeysDevtoolsPanel } from './SolidHotkeysDevtools'

type HotkeysDevtoolsPluginFactory = ReturnType<typeof createSolidPlugin>[0]

const plugins = createSolidPlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
