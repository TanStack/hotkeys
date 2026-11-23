import { createAngularPanel } from '@tanstack/devtools-utils/angular'
import {
  HOTKEYS_DEVTOOLS_DEFAULT_PROPS,
  HotkeysDevtoolsCore,
} from '@tanstack/hotkeys-devtools/production'
import type { HotkeysDevtoolsPanelProps } from '@tanstack/hotkeys-devtools/production'

export interface HotkeysDevtoolsAngularInit extends Partial<HotkeysDevtoolsPanelProps> {}

const [createPanel, HotkeysDevtoolsPanelNoOp] =
  createAngularPanel(HotkeysDevtoolsCore)

// Angular Devtools distinguishes render factories from components by prototype.
export const HotkeysDevtoolsPanel = () => {
  const render = createPanel()
  return (inputs: () => HotkeysDevtoolsAngularInit, host: HTMLElement) =>
    render(() => {
      const props = inputs()
      return {
        ...props,
        theme: props.theme ?? HOTKEYS_DEVTOOLS_DEFAULT_PROPS.theme,
        devtoolsOpen:
          props.devtoolsOpen ?? HOTKEYS_DEVTOOLS_DEFAULT_PROPS.devtoolsOpen,
      }
    }, host)
}

export { HotkeysDevtoolsPanelNoOp }
