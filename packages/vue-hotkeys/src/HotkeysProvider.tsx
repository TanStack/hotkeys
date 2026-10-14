import { defineComponent } from 'vue'
import { provideHotkeysContext } from './HotkeysProviderContext'
import type { PropType } from 'vue'
import type { AppHotkeys, CustomHotkeys } from '@tanstack/hotkeys'
import type { HotkeysProviderOptions } from './HotkeysProviderContext'

/**
 * Vue component that provides default options, app hotkeys, and the user's
 * custom hotkeys. `customHotkeys` is read once; listen to
 * `custom-hotkeys-change` to save changes.
 *
 * @example
 * ```vue
 * <template>
 *   <HotkeysProvider
 *     :app-hotkeys="appHotkeys"
 *     :custom-hotkeys="saved"
 *     @custom-hotkeys-change="save"
 *   >
 *     <App />
 *   </HotkeysProvider>
 * </template>
 * ```
 */
export const HotkeysProvider = defineComponent({
  name: 'HotkeysProvider',
  props: {
    defaultOptions: {
      type: Object as PropType<HotkeysProviderOptions>,
      default: undefined,
    },
    appHotkeys: {
      type: Object as PropType<AppHotkeys>,
      default: undefined,
    },
    customHotkeys: {
      type: Object as PropType<CustomHotkeys | null>,
      default: undefined,
    },
  },
  emits: {
    customHotkeysChange: (_customHotkeys: CustomHotkeys) => true,
  },
  setup(props, { slots, emit }) {
    provideHotkeysContext({
      defaultOptions: () => props.defaultOptions,
      appHotkeys: () => props.appHotkeys,
      customHotkeys: props.customHotkeys,
      onCustomHotkeysChange: (custom) => emit('customHotkeysChange', custom),
    })
    return () => slots.default?.()
  },
})
