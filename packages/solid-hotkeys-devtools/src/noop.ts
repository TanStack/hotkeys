import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import type { JSX } from '@solidjs/web'
import type { HotkeysDevtoolsSolidInit } from './SolidHotkeysDevtools'
import type { HotkeysDevtoolsSolidPlugin } from './plugin'

// The default entry exports these outside development. They are built without
// `createSolidPanel` and `createSolidPlugin`, so a production bundle does not
// keep the real panel or the devtools core.

export function HotkeysDevtoolsPanelNoOp(
  _props?: HotkeysDevtoolsSolidInit,
): JSX.Element {
  return []
}

export function hotkeysDevtoolsNoOpPlugin(): HotkeysDevtoolsSolidPlugin {
  return { name: HOTKEYS_DEVTOOLS_PLUGIN_NAME, render: () => [] }
}
