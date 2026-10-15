import { createVuePlugin } from '@tanstack/devtools-utils/vue'
import { HotkeysDevtoolsPanel } from './VueHotkeysDevtools'

const [hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin] = createVuePlugin(
  'TanStack Hotkeys',
  HotkeysDevtoolsPanel,
)

export { hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin }
