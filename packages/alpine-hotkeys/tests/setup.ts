import Alpine from 'alpinejs'
import { hotkeysPlugin } from '../src'

// Apps install the plugin before Alpine.start(), which gives every hotkeys
// scope the page's Alpine instance.
Alpine.plugin(hotkeysPlugin)
