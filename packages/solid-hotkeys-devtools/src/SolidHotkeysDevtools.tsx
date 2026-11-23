import { createSolidPanel } from '@tanstack/devtools-utils/solid'
import {
  HOTKEYS_DEVTOOLS_DEFAULT_PROPS,
  HotkeysDevtoolsCore,
} from '@tanstack/hotkeys-devtools/production'
import { createComponent } from 'solid-js'
import type { JSX } from '@solidjs/web'
import type { ClassType } from '@tanstack/devtools-utils/solid'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools/production'

export interface HotkeysDevtoolsSolidInit extends Partial<HotkeysDevtoolsPanelProps> {}

type HotkeysDevtoolsPanelComponent = (
  props?: HotkeysDevtoolsSolidInit,
) => JSX.Element

// `createSolidPanel` wants the exact class type from `constructCoreClass`.
const panels = createSolidPanel(HotkeysDevtoolsCore as unknown as ClassType)

function withPanelDefaults(
  Panel: (typeof panels)[number],
): HotkeysDevtoolsPanelComponent {
  // Getters keep the props reactive. Solid 2's `merge` would let an
  // `undefined` prop replace its default.
  return (props = {}) =>
    createComponent(Panel, {
      get theme() {
        return props.theme ?? HOTKEYS_DEVTOOLS_DEFAULT_PROPS.theme
      },
      get devtoolsOpen() {
        return props.devtoolsOpen ?? HOTKEYS_DEVTOOLS_DEFAULT_PROPS.devtoolsOpen
      },
    })
}

export const HotkeysDevtoolsPanel = withPanelDefaults(panels[0])
export const HotkeysDevtoolsPanelNoOp = withPanelDefaults(panels[1])
