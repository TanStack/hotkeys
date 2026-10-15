import { createSveltePanel } from '@tanstack/devtools-utils/svelte'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools/production'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/svelte'
import type { Component } from 'svelte'

export interface HotkeysDevtoolsSvelteInit extends Partial<DevtoolsPanelProps> {}

const panels = createSveltePanel(HotkeysDevtoolsCore)

function withDefaults(
  Panel: (typeof panels)[number],
): Component<HotkeysDevtoolsSvelteInit> {
  return (internals, props) =>
    Panel(internals, {
      get theme() {
        return props.theme ?? 'dark'
      },
      get devtoolsOpen() {
        return props.devtoolsOpen ?? true
      },
    })
}

export const HotkeysDevtoolsPanel = withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withDefaults(panels[1])
