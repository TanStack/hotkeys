import { createPreactPlugin } from '@tanstack/devtools-utils/preact'
import { HotkeysDevtoolsPanel } from './PreactHotkeysDevtools'

const [hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin] = createPreactPlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export { hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin }
