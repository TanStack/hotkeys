# App hotkeys in Alpine

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Alpine wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/alpine-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/alpine-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```ts
// main.ts, before Alpine.start()
import { provideAppHotkeys } from '@tanstack/alpine-hotkeys'
import { appHotkeys } from './app-hotkeys'

provideAppHotkeys(appHotkeys, {
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
```

The app hotkey methods throw until `provideAppHotkeys` has run. When saved shortcuts come from a server, await them first. Register inside a getter so registrations follow rebinding: `this.hotkeys.createHotkey(() => appHotkeys.value['doc.save'], save)`, with `const appHotkeys = this.hotkeys.createAppHotkeys()`. Build a cheat sheet from `createAppHotkeyList().value`.

A settings row records with the owner's `createHotkeyRecorder`:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import type { AppHotkeyId } from '@tanstack/alpine-hotkeys'

Alpine.data('shortcutRow', (id: AppHotkeyId) => {
  const hotkeys = createHotkeysScope()
  const appHotkeys = hotkeys.createAppHotkeys()
  const custom = hotkeys.createCustomHotkeys()
  const recorder = hotkeys.createHotkeyRecorder({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = custom.findConflicts(id, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => custom.setCustomHotkey(id, hotkey),
    onClear: () => custom.setCustomHotkey(id, null),
  })

  return {
    recorder,
    get label() {
      const { meta, hotkey } = appHotkeys.value[id]
      return `${meta?.name}: ${hotkey ? formatForDisplay(hotkey) : 'Unassigned'}`
    },
    reset: () => custom.resetCustomHotkey(id),
    destroy: () => hotkeys.destroy(),
  }
})
```

```html
<div x-data="shortcutRow('doc.save')">
  <span x-text="label"></span>
  <button @click="recorder.startRecording()">Change</button>
  <button @click="reset()">Reset</button>
</div>
```
