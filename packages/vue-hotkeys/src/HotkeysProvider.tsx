import { defineComponent } from 'vue'
import { provideHotkeysContext } from './HotkeysProviderContext'
import type { HotkeysProviderOptions } from './HotkeysProviderContext'

/**
 * Vue component that provides default options for hotkeys context.
 *
 * @example
 * ```vue
 * <template>
 *   <HotkeysProvider :defaultOptions="{ hotkey: { enabled: true } }">
 *     <App />
 *   </HotkeysProvider>
 * </template>
 * ```
 */
export const HotkeysProvider = defineComponent({
  name: 'HotkeysProvider',
  props: {
    defaultOptions: {
      type: Object as () => HotkeysProviderOptions,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    provideHotkeysContext(props.defaultOptions)
    return () => slots.default?.()
  },
})
