---
title: App Hotkeys Guide
id: app-hotkeys
---

`scope.createHotkey` and `scope.createHotkeys` register a hotkey while its component is mounted. A cheat sheet built from live registrations therefore misses hotkeys on routes that have not rendered yet, and a settings screen has nowhere to change them. App hotkeys solve both: you declare every hotkey in one place, publish them with `provideAppHotkeys`, and attach callbacks where the work happens. Users can then customize any of them, and your app decides how to save their choices.

A declaration holds a hotkey's id, default hotkey, metadata, and options. It never holds a callback; `scope.createHotkey` and `scope.createHotkeys` still attach the callbacks.

## Declare app hotkeys

Use `defineAppHotkeys` in a module that contains only declarations. Keep it free of components and handlers, because it loads with your app shell:

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/alpine-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save', group: 'Document' } },
  'doc.find': {
    hotkey: 'Mod+F',
    meta: { name: 'Find', group: 'Document' },
    context: 'editor',
  },
  'nav.home': {
    hotkey: ['G', 'H'],
    meta: { name: 'Go home', group: 'Navigation' },
    options: { timeout: 800 },
  },
  'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
})

declare module '@tanstack/alpine-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

- The object key is the app hotkey's id. Treat ids as a stable contract, because saved custom hotkeys use them as keys.
- `hotkey` is the default: a chord, a sequence, or `null` for an action without a default. An unbound app hotkey registers nothing until the user assigns one.
- `options` describe the hotkey itself: `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for a chord default or `timeout` for a sequence default. Options that don't match the default's kind are type errors. Pass `target` and `enabled` where you register the hotkey.
- `context` labels where a hotkey applies, such as `'editor'`. App hotkeys with different contexts may share a hotkey. It is used only for conflict checks and does not affect matching.

The `Register` augmentation types the app hotkeys you read back, the ids accepted when changing custom hotkeys, and the `CustomHotkeys` type.

## Provide app hotkeys

```ts
// main.ts, before Alpine.start()
import { provideAppHotkeys } from '@tanstack/alpine-hotkeys'
import { appHotkeys } from './app-hotkeys'

provideAppHotkeys(appHotkeys)
```

Alpine has no provider component. `provideAppHotkeys` creates the shared `AppHotkeysStore` and publishes it for every scope and devtools. Call it once at startup; it returns `{ store, dispose }`.

## Register app hotkeys

Pass an app hotkey wherever you pass a hotkey:

```ts
class Editor {
  scope = createHotkeysScope()
  dirty = false

  init() {
    const hotkeys = this.scope.createAppHotkeys()
    this.scope.createHotkey(() => hotkeys.value['doc.save'], () => this.save(), () => ({
      enabled: this.dirty,
    }))
    this.scope.createHotkeys(() => [
      { hotkey: hotkeys.value['nav.home'], callback: () => this.goHome() },
      { hotkey: 'Escape', callback: () => this.close() },
    ])
  }

  destroy() {
    this.scope.destroy()
  }
}
```

`createAppHotkeys()` returns an object with a reactive `.value`. You can also import an app hotkey directly, such as `scope.createHotkey(appHotkeys['doc.save'], save)`. Without provided app hotkeys, the declared default is used.

The registration takes `meta` and `options` from the declaration. Options merge in this order: default options, then declared options, then call-site options. `meta` comes only from the declaration, so the cheat sheet and the registration cannot disagree. Call-site options are typed by the declared default's kind, so `timeout` is accepted for `nav.home` but not for `doc.save`.

When the user changes a hotkey, registered app hotkeys move to the new hotkey immediately, even if it changes from a chord to a sequence.

## Build a cheat sheet

`scope.createAppHotkeyList` returns every app hotkey in declaration order, with its live status:

| Status | Meaning |
| --- | --- |
| `'active'` | At least one enabled registration |
| `'disabled'` | Registered, but every registration has `enabled: false` |
| `'inactive'` | Has a hotkey, but nothing has registered it |
| `'unbound'` | No hotkey assigned |

```ts
class CheatSheet {
  scope = createHotkeysScope()
  formatForDisplay = formatForDisplay
  items!: AlpineHotkeyState<Array<AppHotkeyListItem>>

  init() {
    this.items = this.scope.createAppHotkeyList()
  }

  destroy() {
    this.scope.destroy()
  }
}
```

```html
<ul x-data="cheatSheet">
  <template x-for="item in items.value" :key="item.appHotkey.id">
    <li :data-status="item.status">
      <span x-text="item.appHotkey.meta?.name"></span>:
      <span x-text="item.appHotkey.hotkey ? formatForDisplay(item.appHotkey.hotkey) : 'Unassigned'"></span>
      <span x-show="item.isCustom">(custom)</span>
    </li>
  </template>
</ul>
```

An app hotkey registered by many components, such as one per list row, appears once. Its `registrations` array holds each live registration. Devtools also list declared app hotkeys that are not registered.

## Customize and persist hotkeys

TanStack Hotkeys does not store anything. Pass the user's saved custom hotkeys in and save them when they change:

```ts
import { provideAppHotkeys } from '@tanstack/alpine-hotkeys'

provideAppHotkeys(appHotkeys, {
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
```

- `customHotkeys` holds only the hotkeys that differ from the declared defaults, keyed by id. `null` means the user unbound that hotkey. Saving differences means users who never changed a hotkey get new defaults when you change them.
- `customHotkeys` is read once; afterwards the shared store owns the state. Saved data can outlive the code that wrote it, so unknown ids and invalid hotkeys are ignored with a warning.
- `onCustomHotkeysChange` receives the complete custom hotkeys after every change, ready to save. Storage can be anything: local storage, a server, or a user profile.

Recorded hotkeys use `Mod` rather than platform-specific modifiers, so a hotkey saved on one platform works on others.

### Change hotkeys

`scope.createCustomHotkeys` reads and changes the user's custom hotkeys:

```ts
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import type {
  AlpineCustomHotkeys,
  AlpineHotkeyRecorder,
  AlpineHotkeyState,
  AppHotkeyId,
  RegisteredAppHotkeys,
} from '@tanstack/alpine-hotkeys'

class ShortcutRow {
  scope = createHotkeysScope()
  formatForDisplay = formatForDisplay
  hotkeys!: AlpineHotkeyState<RegisteredAppHotkeys>
  custom!: AlpineCustomHotkeys
  recorder!: AlpineHotkeyRecorder

  constructor(public id: AppHotkeyId) {}

  init() {
    this.hotkeys = this.scope.createAppHotkeys()
    this.custom = this.scope.createCustomHotkeys()
    this.recorder = this.scope.createHotkeyRecorder({
      maxSteps: 3,
      validate: (hotkey) => {
        const conflicts = this.custom.findConflicts(this.id, hotkey)
        return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
      },
      onRecord: (hotkey) => this.custom.setCustomHotkey(this.id, hotkey),
      onClear: () => this.custom.setCustomHotkey(this.id, null),
    })
  }

  get appHotkey() {
    return this.hotkeys.value[this.id]
  }

  destroy() {
    this.scope.destroy()
  }
}

Alpine.data('shortcutRow', (id: AppHotkeyId) => new ShortcutRow(id))
```

| Member | Description |
| --- | --- |
| `value` | The hotkeys that differ from the defaults |
| `setCustomHotkey(id, hotkey)` | Sets a hotkey, or unbinds with `null`. Returns conflicting app hotkeys; when there are any, nothing changes. |
| `findConflicts(id, hotkey)` | App hotkeys that would collide if `id` used `hotkey` |
| `resetCustomHotkey(id)` | Restores one default |
| `resetCustomHotkeys()` | Restores every default |

Two app hotkeys conflict when their contexts match or either has no `context`, and their hotkeys collide: equal chords, or one sequence starts with the other, including a sequence whose first step equals a chord. Conflicts are checked across every declaration, whether or not it is registered.

Each app hotkey's `defaultHotkey` holds its declared default, and each cheat sheet item's `isCustom` reports whether the effective hotkey differs from it.
