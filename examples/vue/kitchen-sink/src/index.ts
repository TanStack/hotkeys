import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import { createApp, h } from 'vue'
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
