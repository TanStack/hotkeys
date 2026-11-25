import { HOTKEYS_DEVTOOLS_PLUGIN_NAME } from '@tanstack/hotkeys-devtools/production'
import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import type {
  HotkeysDevtoolsVueInit,
  HotkeysDevtoolsVuePanelProps,
} from './VueHotkeysDevtools'
import type { HotkeysDevtoolsVuePlugin } from './plugin'

// The default entry exports these outside development. They do not import
// `./VueHotkeysDevtools`, so a production bundle does not keep the real panel,
// the devtools core or the Solid runtime it loads.

export const HotkeysDevtoolsPanelNoOp: DefineComponent<HotkeysDevtoolsVuePanelProps> =
  defineComponent({
    name: 'HotkeysDevtoolsPanel',
    inheritAttrs: false,
    props: {
      theme: { type: [String, Object], default: undefined },
      devtoolsOpen: { type: Boolean, default: undefined },
    },
    setup: () => () => null,
  }) as DefineComponent<HotkeysDevtoolsVuePanelProps>

export function hotkeysDevtoolsNoOpPlugin(
  props?: HotkeysDevtoolsVueInit,
): HotkeysDevtoolsVuePlugin {
  return {
    name: HOTKEYS_DEVTOOLS_PLUGIN_NAME,
    component: HotkeysDevtoolsPanelNoOp,
    props,
  }
}
