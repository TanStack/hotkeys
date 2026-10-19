# App hotkeys in Angular

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Angular wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/angular-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/angular-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```ts
import { provideHotkeys } from '@tanstack/angular-hotkeys'
import type { CustomHotkeys } from '@tanstack/angular-hotkeys'
import { appHotkeys } from './app-hotkeys'

const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')

export const appConfig = {
  providers: [
    provideHotkeys({
      appHotkeys,
      customHotkeys: saved,
      onCustomHotkeysChange: (custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom)),
    }),
  ],
}
```

When saved shortcuts come from a server, load them before `bootstrapApplication`. `injectAppHotkeys()` returns a signal, so register inside a function: `injectHotkey(() => this.appHotkeys()['doc.save'], () => this.save())`. Build a cheat sheet from `injectAppHotkeyList()`.

A settings row records with `injectHotkeyRecorder` and saves through `injectCustomHotkeys`:

```ts
import { Component, computed, input } from '@angular/core'
import {
  formatForDisplay,
  injectAppHotkeys,
  injectCustomHotkeys,
  injectHotkeyRecorder,
} from '@tanstack/angular-hotkeys'
import type { AppHotkeyId } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-row',
  template: `
    {{ appHotkey().meta?.name }}:
    {{ appHotkey().hotkey ? format(appHotkey().hotkey!) : 'Unassigned' }}
    <button (click)="recorder.startRecording()">Change</button>
    <button (click)="custom.resetCustomHotkey(id())">Reset</button>
  `,
})
export class ShortcutRowComponent {
  readonly id = input.required<AppHotkeyId>()
  readonly appHotkeys = injectAppHotkeys()
  readonly appHotkey = computed(() => this.appHotkeys()[this.id()])
  readonly custom = injectCustomHotkeys()
  readonly format = formatForDisplay

  readonly recorder = injectHotkeyRecorder(() => ({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = this.custom.findConflicts(this.id(), hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => this.custom.setCustomHotkey(this.id(), hotkey),
    onClear: () => this.custom.setCustomHotkey(this.id(), null),
  }))
}
```
