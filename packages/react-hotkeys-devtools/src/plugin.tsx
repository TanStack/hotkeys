import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { HotkeysDevtoolsPanel } from './ReactHotkeysDevtools'
import type { ReactElement } from 'react'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools'

/** A plugin for `TanStackDevtools` from `@tanstack/react-devtools`. */
export interface HotkeysDevtoolsReactPlugin {
  name: string
  id?: string
  defaultOpen?: boolean
  render: (el: HTMLElement, props: HotkeysDevtoolsPanelProps) => ReactElement
}

type HotkeysDevtoolsPluginFactory = () => HotkeysDevtoolsReactPlugin

const plugins = createReactPlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
