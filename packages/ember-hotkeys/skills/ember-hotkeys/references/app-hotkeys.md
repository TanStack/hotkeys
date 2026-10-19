# App hotkeys in Ember

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Ember wiring.

```ts
// app/app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/ember-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/ember-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```ts
// app/app.ts, before the application boots
import { provideAppHotkeys } from '@tanstack/ember-hotkeys'
import { appHotkeys } from './app-hotkeys'

provideAppHotkeys(appHotkeys, {
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
```

The app hotkey utilities throw until `provideAppHotkeys` has run. When saved shortcuts come from a server, await them first. Register through a getter: `get saveHotkey() { return this.appHotkeys.value['doc.save'] }` with `appHotkeys = useAppHotkeys(this)`, then `{{useHotkey this.saveHotkey this.save}}`. Build a cheat sheet from `useAppHotkeyList(this).value`.

A settings row records with `useHotkeyRecorder` and saves through `useCustomHotkeys`:

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { formatForDisplay, useAppHotkeys, useCustomHotkeys, useHotkeyRecorder } from '@tanstack/ember-hotkeys'
import type { AppHotkeyId } from '@tanstack/ember-hotkeys'

export default class ShortcutRow extends Component<{ Args: { id: AppHotkeyId } }> {
  appHotkeys = useAppHotkeys(this)
  custom = useCustomHotkeys(this)
  recorder = useHotkeyRecorder(this, () => ({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = this.custom.findConflicts(this.args.id, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => this.custom.setCustomHotkey(this.args.id, hotkey),
    onClear: () => this.custom.setCustomHotkey(this.args.id, null),
  }))

  get label() {
    const { meta, hotkey } = this.appHotkeys.value[this.args.id]
    return `${meta?.name}: ${hotkey ? formatForDisplay(hotkey) : 'Unassigned'}`
  }
  reset = () => this.custom.resetCustomHotkey(this.args.id)

  <template>
    {{this.label}}
    <button type="button" {{on "click" this.recorder.startRecording}}>Change</button>
    <button type="button" {{on "click" this.reset}}>Reset</button>
  </template>
}
```
