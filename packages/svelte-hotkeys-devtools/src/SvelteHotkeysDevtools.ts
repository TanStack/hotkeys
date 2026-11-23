import { createSveltePanel } from '@tanstack/devtools-utils/svelte'
import {
  HOTKEYS_DEVTOOLS_DEFAULT_PROPS,
  HotkeysDevtoolsCore,
} from '@tanstack/hotkeys-devtools/production'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools/production'
import type { Component } from 'svelte'

export interface HotkeysDevtoolsSvelteInit extends Partial<HotkeysDevtoolsPanelProps> {}

const panels = createSveltePanel(HotkeysDevtoolsCore)

function withPanelDefaults(
  Panel: (typeof panels)[number],
): Component<HotkeysDevtoolsSvelteInit> {
  return (internals, props) =>
    Panel(internals, {
      get theme() {
        return props.theme ?? HOTKEYS_DEVTOOLS_DEFAULT_PROPS.theme
      },
      get devtoolsOpen() {
        return props.devtoolsOpen ?? HOTKEYS_DEVTOOLS_DEFAULT_PROPS.devtoolsOpen
      },
    })
}

// Annotated so the emitted types keep Svelte's default `Component` bindings.
export const HotkeysDevtoolsPanel: Component<HotkeysDevtoolsSvelteInit> =
  withPanelDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp: Component<HotkeysDevtoolsSvelteInit> =
  withPanelDefaults(panels[1])
