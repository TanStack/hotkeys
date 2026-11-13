import { createSolidPlugin } from '@tanstack/devtools-utils/solid'
import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import { HotkeysDevtoolsPanel } from './SolidHotkeysDevtools'
import type { HotkeysDevtoolsRenderPlugin } from '@tanstack/hotkeys-devtools/production'
import type { JSX } from 'solid-js'

/** A plugin for `TanStackDevtools` from `@tanstack/solid-devtools`. */
export interface HotkeysDevtoolsSolidPlugin extends HotkeysDevtoolsRenderPlugin<JSX.Element> {}

type HotkeysDevtoolsPluginFactory = () => HotkeysDevtoolsSolidPlugin

const plugins = createSolidPlugin({
  name: HOTKEYS_DEVTOOLS_PLUGIN_NAME,
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
