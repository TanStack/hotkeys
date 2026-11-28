import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import { createApp, h, ref, watch } from 'vue'
import App from './App.vue'
import './styles.css'

const CHARACTER_KEYS_KEY = 'tanstack-hotkeys-kitchen-sink-character-keys'

/**
 * The user's "Single-key shortcuts" setting. While it is off, the root
 * provider suspends character key shortcuts, such as the G G sequence.
 */
const characterKeys = ref(localStorage.getItem(CHARACTER_KEYS_KEY) !== 'off')
watch(characterKeys, (enabled) =>
  localStorage.setItem(CHARACTER_KEYS_KEY, enabled ? 'on' : 'off'),
)

createApp({
  render: () =>
    h(
      HotkeysProvider,
      {
        defaultOptions: { hotkey: { requireReset: true } },
        // The setting applies app-wide while this provider is mounted.
        suspendCharacterKeys: !characterKeys.value,
      },
      () => h(App),
    ),
})
  .provide('characterKeys', characterKeys)
  .mount('#app')
