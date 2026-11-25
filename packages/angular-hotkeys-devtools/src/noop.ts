import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'

// The default entry exports these outside development. They are built without
// `createAngularPanel`, so a production bundle does not keep the real panel,
// the devtools core or the Solid runtime it loads.

/** The production plugin, which renders nothing. */
export interface HotkeysDevtoolsAngularNoOpPlugin {
  name: string
  render: null
}

/** A render factory that renders nothing. */
export const HotkeysDevtoolsPanelNoOp = (): null => null

export function hotkeysDevtoolsNoOpPlugin(): HotkeysDevtoolsAngularNoOpPlugin {
  return { name: HOTKEYS_DEVTOOLS_PLUGIN_NAME, render: null }
}
