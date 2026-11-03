import { hydrate } from 'preact'
import { detectPlatform } from '@tanstack/preact-hotkeys'
import { App } from './App'

// In the browser, detectPlatform() returns the platform the server used
hydrate(<App platform={detectPlatform()} />, document.getElementById('app')!)
