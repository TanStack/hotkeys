import { createPreactPlugin } from '@tanstack/devtools-utils/preact'
import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import { HotkeysDevtoolsPanel } from './PreactHotkeysDevtools'
import type { HotkeysDevtoolsRenderPlugin } from '@tanstack/hotkeys-devtools/production'
import type { JSX } from 'preact'

/** A plugin for `TanStackDevtools` from `@tanstack/preact-devtools`. */
export interface HotkeysDevtoolsPreactPlugin extends HotkeysDevtoolsRenderPlugin<JSX.Element> {}

type HotkeysDevtoolsPluginFactory = () => HotkeysDevtoolsPreactPlugin

const plugins = createPreactPlugin({
  name: HOTKEYS_DEVTOOLS_PLUGIN_NAME,
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
