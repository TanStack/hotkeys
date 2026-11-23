import { detectPlatform } from '@tanstack/preact-hotkeys'
import { hydrate } from 'preact'
import { App } from './App'

// In the browser, detectPlatform() returns the platform the server used
hydrate(<App platform={detectPlatform()} />, document.getElementById('app')!)
