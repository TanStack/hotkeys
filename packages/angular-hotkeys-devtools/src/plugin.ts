import { createAngularPlugin } from '@tanstack/devtools-utils/angular'
import { HotkeysDevtoolsPanel } from './AngularHotkeysDevtools'

const [hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin] = createAngularPlugin({
  name: 'TanStack Hotkeys',
  render: HotkeysDevtoolsPanel,
})

export { hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin }
