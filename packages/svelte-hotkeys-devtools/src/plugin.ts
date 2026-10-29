import { createSveltePlugin } from '@tanstack/devtools-utils/svelte'
import { HotkeysDevtoolsPanel } from './SvelteHotkeysDevtools.js'
import type { Component } from 'svelte'
import type { HotkeysDevtoolsSvelteInit } from './SvelteHotkeysDevtools.js'

/** A plugin for `TanStackDevtools` from `@tanstack/svelte-devtools`. */
export interface HotkeysDevtoolsSveltePlugin {
  name: string
  id?: string
  defaultOpen?: boolean
  component: Component<HotkeysDevtoolsSvelteInit>
  props: HotkeysDevtoolsSvelteInit | undefined
}

type HotkeysDevtoolsPluginFactory = (
  props?: HotkeysDevtoolsSvelteInit,
) => HotkeysDevtoolsSveltePlugin

const plugins = createSveltePlugin({
  name: 'TanStack Hotkeys',
  Component: HotkeysDevtoolsPanel,
})

export const hotkeysDevtoolsPlugin: HotkeysDevtoolsPluginFactory = plugins[0]
export const hotkeysDevtoolsNoOpPlugin: HotkeysDevtoolsPluginFactory =
  plugins[1]
