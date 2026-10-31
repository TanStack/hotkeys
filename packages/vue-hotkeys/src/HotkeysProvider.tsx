import { defineComponent } from 'vue'
import { provideHotkeysContext } from './HotkeysProviderContext'
import type { PropType } from 'vue'
import type { AppHotkeys, CustomHotkeys } from '@tanstack/hotkeys'
import type { HotkeysProviderScopeProps } from '@tanstack/hotkeys/adapter'
import type { HotkeysProviderOptions } from './HotkeysProviderContext'

/**
 * Vue component that provides default options, app hotkeys, and the user's
 * custom hotkeys. A new `customHotkeys` value replaces the current custom
 * hotkeys, `undefined` leaves them unchanged, and `null` clears them. Listen
 * to `custom-hotkeys-change` to save changes.
 *
 * Nest providers to create hotkey scopes. A nested provider inherits app
 * hotkeys and merges default options. With `scope`, its hotkeys fire only
 * while it is mounted, enabled, and not hidden by `<KeepAlive>`; with
 * `exclusive`, only its hotkeys fire.
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
 *
 * @example
 * ```vue
 * <HotkeysProvider scope="edit-dialog" :exclusive="{ allow: ['global'] }">
 *   <DialogBody />
 * </HotkeysProvider>
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
    /** See `HotkeysProviderScopeProps['scope']`. */
    scope: { type: String, default: undefined },
    /** See `HotkeysProviderScopeProps['exclusive']`. */
    exclusive: {
      type: [Boolean, Object] as PropType<
        HotkeysProviderScopeProps['exclusive']
      >,
      default: false,
    },
    /** See `HotkeysProviderScopeProps['enabled']`. */
    enabled: { type: Boolean, default: true },
  },
  emits: {
    customHotkeysChange: (_customHotkeys: CustomHotkeys) => true,
  },
  setup(props, { slots, emit }) {
    provideHotkeysContext({
      defaultOptions: () => props.defaultOptions,
      appHotkeys: () => props.appHotkeys,
      customHotkeys: () => props.customHotkeys,
      scope: () => props.scope,
      exclusive: () => props.exclusive,
      enabled: () => props.enabled,
      onCustomHotkeysChange: (custom) => emit('customHotkeysChange', custom),
    })
    return () => slots.default?.()
  },
})
