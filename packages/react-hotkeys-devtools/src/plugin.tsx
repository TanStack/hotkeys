import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import { HotkeysDevtoolsPanel } from './ReactHotkeysDevtools'
import type { HotkeysDevtoolsRenderPlugin } from '@tanstack/hotkeys-devtools/production'
import type { ReactElement } from 'react'

/** A plugin for `TanStackDevtools` from `@tanstack/react-devtools`. */
export interface HotkeysDevtoolsReactPlugin extends HotkeysDevtoolsRenderPlugin<ReactElement> {}

type HotkeysDevtoolsPluginFactory = () => HotkeysDevtoolsReactPlugin

const plugins = createReactPlugin({
  name: HOTKEYS_DEVTOOLS_PLUGIN_NAME,
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
