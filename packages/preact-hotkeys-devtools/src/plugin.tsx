import { createPreactPlugin } from '@tanstack/devtools-utils/preact'
import { HotkeysDevtoolsPanel } from './PreactHotkeysDevtools'
import type { JSX } from 'preact'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools'

/** A plugin for `TanStackDevtools` from `@tanstack/preact-devtools`. */
export interface HotkeysDevtoolsPreactPlugin {
  name: string
  id?: string
  defaultOpen?: boolean
  render: (el: HTMLElement, props: HotkeysDevtoolsPanelProps) => JSX.Element
}

type HotkeysDevtoolsPluginFactory = () => HotkeysDevtoolsPreactPlugin

const plugins = createPreactPlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
