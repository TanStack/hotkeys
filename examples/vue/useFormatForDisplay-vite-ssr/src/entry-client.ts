import { detectPlatform } from '@tanstack/vue-hotkeys'
import { createApp } from './main'
import './styles.css'

// The browser's own navigator, which matches the server's User-Agent
createApp(detectPlatform()).mount('#app')
