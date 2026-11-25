import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import type { Component } from 'svelte'
import type { HotkeysDevtoolsSvelteInit } from './SvelteHotkeysDevtools.js'
import type { HotkeysDevtoolsSveltePlugin } from './plugin.js'

// The default entry exports these outside development. They are built without
// `createSveltePanel` and `createSveltePlugin`, so a production bundle does not
// keep the real panel, the devtools core or the Solid runtime it loads.

/** A Svelte component that renders nothing. */
export const HotkeysDevtoolsPanelNoOp: Component<
  HotkeysDevtoolsSvelteInit
> = () => ({})

export function hotkeysDevtoolsNoOpPlugin(
  props?: HotkeysDevtoolsSvelteInit,
): HotkeysDevtoolsSveltePlugin {
  return {
    name: HOTKEYS_DEVTOOLS_PLUGIN_NAME,
    component: HotkeysDevtoolsPanelNoOp,
    props,
  }
}
