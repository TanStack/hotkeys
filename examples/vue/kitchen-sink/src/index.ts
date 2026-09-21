import { createApp, h } from 'vue'
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import App from './App.vue'
import './styles.css'

createApp({
  render: () =>
    h(
      HotkeysProvider,
      { defaultOptions: { hotkey: { requireReset: true } } },
      () => h(App),
    ),
}).mount('#app')
