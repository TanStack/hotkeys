---
name: alpine-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in an Alpine.js app with
  @tanstack/alpine-hotkeys: createHotkeysScope owners, the $hotkeys magic and
  hotkeysPlugin, getter options, element targets with $refs, scopes activated
  from the hotkey manager, app hotkeys, recorders, and held keys, or replacing
  @keydown.window handlers.
metadata:
  purpose: >-
    Alpine bindings for TanStack Hotkeys: per-component owners, the $hotkeys
    magic, getter options, manager-activated scopes, and the Alpine-specific
    mistakes to avoid.
  type: framework
  framework: alpine
  library: '@tanstack/alpine-hotkeys'
  library_version: '0.4.0'
sources:
  - src/createHotkeysScope.ts
  - src/hotkeysPlugin.ts
  - src/scope.ts
  - src/createHotkey.ts
  - src/createAppHotkeys.ts
  - TanStack/hotkeys:docs/framework/alpine/quick-start.md
  - TanStack/hotkeys:docs/framework/alpine/guides/app-hotkeys.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Alpine

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```ts no-check
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('panel', () => ({
  dirty: false,
  hotkeys: createHotkeysScope(),
  init() {
    this.hotkeys.createHotkey(
      'Mod+S',
      () => save(),
      () => ({ enabled: this.dirty }),
    )
    this.hotkeys.createHotkey(
      'Escape',
      () => closePanel(),
      () => ({ target: this.$refs.panel }),
    )
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

For markup-only components, install `Alpine.plugin(hotkeysPlugin)` before `Alpine.start()` and use the `$hotkeys` magic, which is destroyed with its element: `x-init="$hotkeys.createHotkey('Mod+S', () => save())"`.

## API

| API                                                 | What it's for                                                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Alpine.plugin(hotkeysPlugin)`                      | Install the `$hotkeys` magic, an owner that's destroyed with its element.                                 |
| `createHotkeysScope(defaults?)`                     | Create an owner for one `Alpine.data` component, with optional default options.                           |
| `provideAppHotkeys(appHotkeys, options?)`           | Declare app hotkeys and load the user's custom hotkeys once at startup, since Alpine has no provider.     |
| `getHotkeyManager().activateScope(scope, options?)` | Turn on a scope, such as an exclusive one for a dialog; it returns the function that turns the scope off. |

Each owner has these methods. Read their state through `.value`, or `.hotkeys` for registrations.

| Method                                       | What it's for                                                                                      |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `createHotkey(hotkey, callback, options?)`   | Register one chord, sequence, or app hotkey until the owner is destroyed; options can be a getter. |
| `createHotkeys(definitions, commonOptions?)` | Register several hotkeys, or a getter of a list built from data, in one call.                      |
| `createHotkeyRecorder(options)`              | Record a chord or sequence the user presses, for a settings screen.                                |
| `createAppHotkeys()`                         | Get the declared app hotkeys with the user's custom hotkeys applied.                               |
| `createAppHotkeyList()`                      | List every app hotkey with its status, for a cheat sheet or settings screen.                       |
| `createCustomHotkeys()`                      | Read, change, and reset the user's custom hotkeys, and check a new one for conflicts.              |
| `createHotkeyRegistrations()`                | List every registered hotkey with its options and `meta`.                                          |
| `createHotkeyHint(hotkey, options?)`         | Get whether held modifiers should reveal a shortcut's hint.                                        |
| `createKeyHold(key)`                         | Get whether one key is held.                                                                       |
| `createHeldKeys()`                           | Get every key that's held right now.                                                               |
| `createHeldKeyCodes()`                       | Map each held key to its physical `event.code`.                                                    |
| `destroy()`                                  | Release every hotkey, subscription, and recorder the owner created.                                |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

## Pitfalls

- **Destroy each owner.** Owners aren't tied to Alpine's lifecycle, so without `this.hotkeys.destroy()` in `destroy()`, a removed component's hotkeys keep firing. Create one owner per component instance, inside the `Alpine.data` factory.
- **`createHotkeysScope` isn't a hotkey scope.** It only owns registrations and sets defaults. For a dialog, activate a real scope in `init()` with `release = getHotkeyManager().activateScope(name, { exclusive: true })`, pass `{ scope: name }` to the dialog's hotkeys, and call `release()` in `destroy()`. Give each open dialog its own name.
- **Pass options as a getter.** `{ enabled: this.dirty }` is read once. Use `() => ({ enabled: this.dirty })`.
- **Use either `$hotkeys` or your own owner for a hotkey, not both.** Otherwise it registers twice.
- With server rendering, load the adapter only in the browser.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Alpine](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/alpine-hotkeys/dist/types.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/alpine/guides/<page>.md`, such as `hotkeys` or `app-hotkeys`.
