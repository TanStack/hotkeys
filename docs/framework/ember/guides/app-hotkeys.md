---
title: App Hotkeys and Custom Shortcuts in Ember
id: app-hotkeys
description: Declare every hotkey in your Ember app in one place, list them in cheat sheets, and let users change them and save their choices.
---

App hotkeys are optional. Plain `useHotkey` is enough until you need a cheat sheet for your whole app, or a screen where users change hotkeys. `useHotkey` registers a hotkey while its template renders it, so a cheat sheet built from live registrations misses hotkeys on routes that have not rendered yet, and a settings screen has nowhere to change them. App hotkeys solve both: you declare every hotkey in one place, publish them with `provideAppHotkeys`, and attach callbacks where the work happens. Users can then customize any of them, and your app decides how to save their choices.

A declaration holds a hotkey's id, default hotkey, metadata, and options. It never holds a callback. `useHotkey` and `useHotkeys` still attach the callbacks.

## Declare app hotkeys

Use `defineAppHotkeys` in a module that contains only declarations. Keep it free of components and handlers, because it loads with your app shell:

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/ember-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save', group: 'Document' } },
  'doc.find': {
    hotkey: 'Mod+F',
    meta: { name: 'Find', group: 'Document' },
    scope: 'editor',
  },
  'nav.home': {
    hotkey: ['G', 'H'],
    meta: { name: 'Go home', group: 'Navigation' },
    options: { timeout: 800 },
  },
  'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
})

declare module '@tanstack/ember-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

- The object key is the app hotkey's id. Treat ids as a stable contract, because saved custom hotkeys use them as keys.
- `hotkey` is the default: a chord, a sequence, or `null` for an action without a default. An unbound app hotkey registers nothing until the user assigns one.
- `options` describe the hotkey itself: `capture`, `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for a chord default or `timeout` for a sequence default. [Hotkey options](./hotkeys#hotkey-options) describes each one. Options that don't match the default's kind are type errors. Pass `target` and `enabled` where you register the hotkey.
- `scope` names the scope the hotkey fires in, such as `'editor'`. Hotkeys outside the default `'global'` scope fire only while their scope is active. Ember has no provider to activate scopes, so activate them on the hotkey manager. See [Activate a scope](./hotkey-manager#activate-a-scope). App hotkeys in different scopes may share a hotkey.

The `Register` augmentation types `useAppHotkeys()`, the ids accepted by `useCustomHotkeys()`, and the `CustomHotkeys` type.

## Provide app hotkeys

Publish the declarations with `provideAppHotkeys` before the application boots:

```ts
// app/app.ts, before the application boots
import { provideAppHotkeys } from '@tanstack/ember-hotkeys'
import { appHotkeys } from './app-hotkeys'

provideAppHotkeys(appHotkeys)
```

Ember has no provider component. `provideAppHotkeys` creates the shared `AppHotkeysStore` and publishes it for helpers, modifiers, utilities, and devtools. Call it once at startup; it returns `{ store, dispose }`.

## Register app hotkeys

Pass an app hotkey wherever you pass a hotkey. Read it from `useAppHotkeys(this)`, or import it directly:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { useAppHotkeys, useHotkey } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  @tracked dirty = false
  appHotkeys = useAppHotkeys(this)
  save = () => {}

  get saveHotkey() {
    return this.appHotkeys.value['doc.save']
  }

  <template>
    {{useHotkey this.saveHotkey this.save enabled=this.dirty}}
  </template>
}
```

Template paths can't index ids that contain dots, so read app hotkeys through getters. Both forms use the effective hotkey for that id, so a user's custom hotkey applies even to a direct import. Without `provideAppHotkeys`, the declared default is used.

The registration takes `meta` and `options` from the declaration. Options merge in this order: `createHotkeysScope` defaults, then declared options, then call-site options. `meta` comes only from the declaration, so the cheat sheet and the registration cannot disagree. Call-site options are typed by the declared default's kind, so `timeout` is accepted for `nav.home` but not for `doc.save`.

When a component registers several hotkeys, pass app hotkeys to `useHotkeys` in the same field, mixed with plain hotkeys if you like:

```ts
get shortcuts(): Array<EmberHotkeyDefinition> {
  return [
    { hotkey: this.appHotkeys.value['doc.save'], callback: this.save },
    { hotkey: this.appHotkeys.value['nav.home'], callback: this.goHome },
    { hotkey: 'Escape', callback: this.close },
  ]
}
```

When the user changes a hotkey, registered app hotkeys move to the new hotkey immediately, even if it changes from a chord to a sequence.

## List app hotkeys

`useAppHotkeyList` returns every app hotkey, with its current hotkey and whether anything has registered it. Use it to build a cheat sheet that includes pages that haven't rendered. See [List every app hotkey](./cheat-sheet-ui-helpers#list-every-app-hotkey).

## Customize and persist hotkeys

TanStack Hotkeys does not store anything. Pass the user's saved custom hotkeys to `provideAppHotkeys` and save them when they change:

```ts
import { provideAppHotkeys } from '@tanstack/ember-hotkeys'

provideAppHotkeys(appHotkeys, {
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
```

- `customHotkeys` holds only the hotkeys that differ from the declared defaults, keyed by id. `null` means the user unbound that hotkey. Saving differences means users who never changed a hotkey get new defaults when you change them.
- To apply saved data that loads later, such as from a server, call `store.setOptions({ customHotkeys })` on the store that `provideAppHotkeys` returns. It replaces the current custom hotkeys without calling `onCustomHotkeysChange`. `undefined` leaves them unchanged, and `null` clears them. Saved data can outlive the code that wrote it, so unknown ids and invalid hotkeys are ignored with a warning in development.
- `onCustomHotkeysChange` receives the complete custom hotkeys after every change, ready to save. Storage can be anything: local storage, a server, or a user profile.

The [hotkey recorder](./custom-hotkey-recording) records `Mod` rather than platform-specific modifiers, so a hotkey saved on one platform works on others.

### Change hotkeys

`useCustomHotkeys` reads and changes the user's custom hotkeys. Pair it with a [recorder](./custom-hotkey-recording), so users press the hotkey they want:

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import {
  formatForDisplay,
  useAppHotkeys,
  useCustomHotkeys,
  useHotkeyRecorder,
} from '@tanstack/ember-hotkeys'
import type { AppHotkeyId } from '@tanstack/ember-hotkeys'

export default class ShortcutRow extends Component<{ Args: { id: AppHotkeyId } }> {
  appHotkeys = useAppHotkeys(this)
  custom = useCustomHotkeys(this)
  recorder = useHotkeyRecorder(this, () => ({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const conflicts = this.custom.findConflicts(this.args.id, hotkey)
      return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
    },
    onRecord: (hotkey) => this.custom.setCustomHotkey(this.args.id, hotkey),
    onClear: () => this.custom.setCustomHotkey(this.args.id, null),
  }))

  get appHotkey() {
    return this.appHotkeys.value[this.args.id]
  }
  get label() {
    const { hotkey } = this.appHotkey
    return hotkey ? formatForDisplay(hotkey) : 'Unassigned'
  }
  reset = () => this.custom.resetCustomHotkey(this.args.id)

  <template>
    {{this.appHotkey.meta.name}}: {{this.label}}
    <button type='button' {{on 'click' this.recorder.startRecording}}>Change</button>
    <button type='button' {{on 'click' this.reset}}>Reset</button>
  </template>
}
```

| Member | Description |
| --- | --- |
| `value` | The hotkeys that differ from the defaults |
| `setCustomHotkey(id, hotkey)` | Sets a hotkey, or unbinds with `null`. Returns conflicting app hotkeys; when there are any, nothing changes. |
| `findConflicts(id, hotkey)` | App hotkeys that would collide if `id` used `hotkey` |
| `resetCustomHotkey(id)` | Restores one default |
| `resetCustomHotkeys()` | Restores every default |

Two app hotkeys conflict when their scopes match or either is in `'global'`, including app hotkeys with no declared scope, and their hotkeys collide: equal chords, or one sequence starts with the other, including a sequence whose first step equals a chord. Conflicts are checked across every declaration, whether or not it is registered.

Each app hotkey's `defaultHotkey` holds its declared default, and `isCustom` in `useAppHotkeyList` reports whether the effective hotkey differs from it.

`provideAppHotkeys` returns the `AppHotkeysStore` it creates. See the [`AppHotkeysStore` reference](../../../reference/classes/AppHotkeysStore.md) to use it directly.
