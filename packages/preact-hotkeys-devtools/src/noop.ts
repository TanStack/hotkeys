import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import { Fragment, h } from 'preact'
import type { JSX } from 'preact'
import type { HotkeysDevtoolsPreactInit } from './PreactHotkeysDevtools'
import type { HotkeysDevtoolsPreactPlugin } from './plugin'

// The default entry exports these outside development. They are built without
// `createPreactPanel` and `createPreactPlugin`, so a production bundle does not
// keep the real panel, the devtools core or the Solid runtime it loads.

// Lower-case on purpose: the build runs `@preact/preset-vite`, whose Prefresh
// transform adds hot-reload code to modules that declare a capitalized
// function, and that code would ship in `dist`.
const renderNothing = (_props?: HotkeysDevtoolsPreactInit): JSX.Element =>
  h(Fragment, null)

export const HotkeysDevtoolsPanelNoOp: (
  props?: HotkeysDevtoolsPreactInit,
) => JSX.Element = renderNothing

export function hotkeysDevtoolsNoOpPlugin(): HotkeysDevtoolsPreactPlugin {
  return { name: HOTKEYS_DEVTOOLS_PLUGIN_NAME, render: () => renderNothing() }
}
