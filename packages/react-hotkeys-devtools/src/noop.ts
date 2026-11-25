import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import { Fragment, createElement } from 'react'
import type { ReactElement } from 'react'
import type { HotkeysDevtoolsReactInit } from './ReactHotkeysDevtools'
import type { HotkeysDevtoolsReactPlugin } from './plugin'

// The default entry exports these outside development. They are built without
// `createReactPanel` and `createReactPlugin`, so a production bundle does not
// keep the real panel, the devtools core or the Solid runtime it loads.

export function HotkeysDevtoolsPanelNoOp(
  _props?: HotkeysDevtoolsReactInit,
): ReactElement {
  return createElement(Fragment)
}

export function hotkeysDevtoolsNoOpPlugin(): HotkeysDevtoolsReactPlugin {
  return {
    name: HOTKEYS_DEVTOOLS_PLUGIN_NAME,
    render: () => createElement(Fragment),
  }
}
