import { HotkeysDevtoolsPanel } from './AngularHotkeysDevtools'
import type { HotkeysDevtoolsAngularInit } from './AngularHotkeysDevtools'

type HotkeysDevtoolsAngularInputs =
  HotkeysDevtoolsAngularInit | (() => HotkeysDevtoolsAngularInit)

/** A plugin for `provideTanStackDevtools` from `@tanstack/angular-devtools`. */
export interface HotkeysDevtoolsAngularPlugin {
  name: string
  render: typeof HotkeysDevtoolsPanel
  inputs?: HotkeysDevtoolsAngularInputs
}

/** The production plugin, which renders nothing. */
export interface HotkeysDevtoolsAngularNoOpPlugin {
  name: string
  render: null
}

const name = 'TanStack Hotkeys'

// Same shape as `createAngularPlugin` from `@tanstack/devtools-utils/angular`.
export function hotkeysDevtoolsPlugin(
  inputs?: HotkeysDevtoolsAngularInputs,
): HotkeysDevtoolsAngularPlugin {
  return { name, render: HotkeysDevtoolsPanel, inputs }
}

export function hotkeysDevtoolsNoOpPlugin(): HotkeysDevtoolsAngularNoOpPlugin {
  return { name, render: null }
}
