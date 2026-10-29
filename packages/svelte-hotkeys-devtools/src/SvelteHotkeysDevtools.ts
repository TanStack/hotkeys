import { createSveltePanel } from '@tanstack/devtools-utils/svelte'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools/production'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools/production'
import type { Component } from 'svelte'

export interface HotkeysDevtoolsSvelteInit extends Partial<HotkeysDevtoolsPanelProps> {}

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

// Annotated so the emitted types keep Svelte's default `Component` bindings.
export const HotkeysDevtoolsPanel: Component<HotkeysDevtoolsSvelteInit> =
  withDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp: Component<HotkeysDevtoolsSvelteInit> =
  withDefaults(panels[1])
