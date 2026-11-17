import { mount } from 'svelte'
import App from './App.svelte'
import type { GermanKeys, UsKeys } from '@tanstack/svelte-hotkeys'
import './index.css'

// Hotkey strings accept the keys that US and German keyboards type. Without
// this, only US keys type-check, and `Mod+Ö` is an error. This changes types
// only: matching works the same with or without it.
declare module '@tanstack/svelte-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

mount(App, { target: document.getElementById('app')! })
