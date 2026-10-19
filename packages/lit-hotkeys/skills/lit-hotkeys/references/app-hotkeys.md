# App hotkeys in Lit

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Lit wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/lit-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/lit-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```ts
// main.ts, before any element renders
import { provideAppHotkeys } from '@tanstack/lit-hotkeys'
import { appHotkeys } from './app-hotkeys'

provideAppHotkeys(appHotkeys, {
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
```

`AppHotkeysController` throws until `provideAppHotkeys` has run. When saved shortcuts come from a server, await them first. Register with `@hotkey(appHotkeys['doc.save'])` or `HotkeyController`; both follow the user's custom hotkey. `AppHotkeysController` has `list` for a cheat sheet, plus `setCustomHotkey`, `findConflicts`, and `resetCustomHotkey`.

A settings row records with `HotkeyRecorderController`:

```ts no-check
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import {
  AppHotkeysController,
  HotkeyRecorderController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { AppHotkeyId } from '@tanstack/lit-hotkeys'

export class ShortcutRow extends LitElement {
  @property() hotkeyId!: AppHotkeyId
  private app = new AppHotkeysController(this)
  private recorder = new HotkeyRecorderController(this, () => ({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = this.app.findConflicts(this.hotkeyId, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => this.app.setCustomHotkey(this.hotkeyId, hotkey),
    onClear: () => this.app.setCustomHotkey(this.hotkeyId, null),
  }))

  render() {
    const { meta, hotkey } = this.app.appHotkeys[this.hotkeyId]
    return html`
      ${meta?.name}: ${hotkey ? formatForDisplay(hotkey) : 'Unassigned'}
      <button @click=${() => this.recorder.startRecording()}>Change</button>
      <button @click=${() => this.app.resetCustomHotkey(this.hotkeyId)}>
        Reset
      </button>
    `
  }
}
```
