import { createSveltePlugin } from '@tanstack/devtools-utils/svelte'
import { HotkeysDevtoolsPanel } from './SvelteHotkeysDevtools'

const [hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin] = createSveltePlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export { hotkeysDevtoolsPlugin, hotkeysDevtoolsNoOpPlugin }
