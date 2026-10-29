import { defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue'
import { HotkeysDevtoolsCore } from '@tanstack/hotkeys-devtools'
import type { DefineComponent, PropType } from 'vue'
import type {
  HotkeysDevtoolsCoreClass,
  HotkeysDevtoolsPanelProps,
  HotkeysDevtoolsTheme,
} from '@tanstack/hotkeys-devtools'

export interface HotkeysDevtoolsVueInit extends Partial<HotkeysDevtoolsPanelProps> {}

// `TanStackDevtools` from `@tanstack/vue-devtools` passes the dock's whole
// `{ theme, devtoolsOpen }` object as the `theme` prop.
type ThemeProp = HotkeysDevtoolsTheme | Partial<HotkeysDevtoolsPanelProps>

/** Props of `HotkeysDevtoolsPanel`. */
export interface HotkeysDevtoolsVuePanelProps {
  theme?: ThemeProp
  devtoolsOpen?: boolean
}

function resolveProps(
  props: HotkeysDevtoolsVuePanelProps,
): HotkeysDevtoolsPanelProps {
  const dock = typeof props.theme === 'object' ? props.theme : undefined
  const theme = dock ? dock.theme : (props.theme as HotkeysDevtoolsTheme)
  return {
    theme: theme ?? 'dark',
    devtoolsOpen: dock?.devtoolsOpen ?? props.devtoolsOpen ?? true,
  }
}

function createPanel(
  Core: HotkeysDevtoolsCoreClass | null,
): DefineComponent<HotkeysDevtoolsVuePanelProps> {
  return defineComponent({
    name: 'HotkeysDevtoolsPanel',
    inheritAttrs: false,
    props: {
      theme: {
        type: [String, Object] as PropType<ThemeProp>,
        default: undefined,
      },
      devtoolsOpen: { type: Boolean, default: undefined },
    },
    setup(props) {
      if (!Core) return () => null
      const el = ref<HTMLElement | null>(null)
      let devtools: InstanceType<HotkeysDevtoolsCoreClass> | null = null

      const mount = () => {
        if (!el.value) return
        devtools = new Core()
        void devtools.mount(el.value, resolveProps(props))
      }
      const unmount = () => {
        devtools?.unmount()
        devtools = null
      }

      onMounted(mount)
      // The core panel reads its props once, so remount when they change.
      watch(
        () => {
          const { theme, devtoolsOpen } = resolveProps(props)
          return `${theme}:${devtoolsOpen}`
        },
        () => {
          unmount()
          mount()
        },
      )
      onUnmounted(unmount)

      return () => h('div', { ref: el, style: { height: '100%' } })
    },
  })
}

export const HotkeysDevtoolsPanel = createPanel(HotkeysDevtoolsCore)
export const HotkeysDevtoolsPanelNoOp = createPanel(null)
