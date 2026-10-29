import { createSolidPlugin } from '@tanstack/devtools-utils/solid'
import { HotkeysDevtoolsPanel } from './SolidHotkeysDevtools'
import type { JSX } from 'solid-js'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools'

/** A plugin for `TanStackDevtools` from `@tanstack/solid-devtools`. */
export interface HotkeysDevtoolsSolidPlugin {
  name: string
  id?: string
  defaultOpen?: boolean
  render: (el: HTMLElement, props: HotkeysDevtoolsPanelProps) => JSX.Element
}

type HotkeysDevtoolsPluginFactory = () => HotkeysDevtoolsSolidPlugin

const plugins = createSolidPlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
