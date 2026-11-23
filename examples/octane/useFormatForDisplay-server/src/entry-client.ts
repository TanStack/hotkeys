import { detectPlatform } from '@tanstack/octane-hotkeys'
import { hydrateRoot } from 'octane'
import { App } from './App.tsrx'

// In the browser, detectPlatform() returns the platform the server used
hydrateRoot(document.getElementById('app')!, App, {
  platform: detectPlatform(),
})
