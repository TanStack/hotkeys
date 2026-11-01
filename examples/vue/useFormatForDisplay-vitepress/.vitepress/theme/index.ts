import DefaultTheme from 'vitepress/theme'
import CheatSheetPage from './CheatSheetPage.vue'
import type { Theme } from 'vitepress'
import './styles.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CheatSheetPage', CheatSheetPage)
  },
} satisfies Theme
