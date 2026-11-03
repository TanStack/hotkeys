---
name: app-hotkeys
description: >-
  Use when an app built with TanStack Hotkeys needs a keyboard shortcut cheat
  sheet or help dialog, a command palette whose commands may have shortcuts, a
  settings screen where users rebind, unbind, or reset shortcuts, recording the
  shortcut a user presses, conflict checks between shortcuts, or saving custom
  shortcuts to storage.
metadata:
  purpose: >-
    Declare every shortcut once with defineAppHotkeys, then build cheat sheets,
    rebinding, conflict checks, and persistence from those declarations instead
    of a parallel shortcut registry.
  type: core
  library: '@tanstack/hotkeys'
  library_version: '0.16.0'
sources:
  - src/app-hotkeys.ts
  - src/hotkey-recorder.ts
  - src/conflicts.ts
  - TanStack/hotkeys:docs/framework/react/guides/app-hotkeys.md
  - TanStack/hotkeys:docs/framework/react/guides/cheat-sheet-ui-helpers.md
  - TanStack/hotkeys:docs/framework/react/guides/custom-hotkey-recording.md
  - 'TanStack/hotkeys:packages/react-hotkeys/tests/skills/shortcut-settings/**'
requires:
  - hotkeys-core
---

# App hotkeys

This skill builds on `hotkeys-core`. The adapter skill's app hotkeys reference shows the wiring in your framework.

App hotkeys are the library's shortcut catalog. Use them instead of a separate shortcut config, context, or hand-written cheat sheet. One module declares every shortcut. The root provider holds the user's custom hotkeys. Components register the declared app hotkeys with their callbacks. Plain hotkeys with `meta` are enough when a list only needs what is mounted right now.

```ts
import { defineAppHotkeys } from '@tanstack/hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' }, scope: 'document' },
  'comment.post': {
    hotkey: 'Mod+S',
    meta: { name: 'Post comment' },
    scope: 'comments',
  },
  'theme.toggle': { hotkey: null, meta: { name: 'Toggle theme' } },
})
```

Augment `Register` in the adapter module you import from, such as `declare module '@tanstack/react-hotkeys' { interface Register { appHotkeys: typeof appHotkeys } }`, to type ids. Lit, Alpine, and Ember have no provider: call `provideAppHotkeys(appHotkeys, options)` once at startup. Pass saved data that loads later to `store.setOptions({ customHotkeys })` on the returned store; providers apply a changed `customHotkeys` prop themselves. `undefined` leaves custom hotkeys unchanged while data loads; `null` clears them, such as on sign-out.

## Pitfalls

- **Register the app hotkey, not its value.** Pass `appHotkeys['doc.save']`. Passing `.hotkey` registers the declared default, so the user's rebinding never applies, and the list reports the shortcut as `'inactive'`.
- **Save what `onCustomHotkeysChange` receives.** It holds only the shortcuts the user changed, so users still get new defaults. Saving every effective hotkey freezes today's defaults into their data.
- **Ids are a storage contract.** Saved data is keyed by id, and unknown ids are dropped with a warning, so renaming an id discards users' customizations.
- **`setCustomHotkey` returns conflicts and changes nothing when there are any.** Check the result before reporting success, or reject the key press earlier by calling `findConflicts` in the recorder's `validate`.
- **Declare scopes on app hotkeys that share keys.** An app hotkey without a scope, or in `'global'`, conflicts with every other app hotkey on the same keys, so rebinding is rejected.
- **Conflict checks treat physical and logical bindings as different.** A recorded `Mod+[KeyP]` doesn't conflict with a declared `Mod+P`, although Command+P runs both. Declaring rebindable defaults in the recorder's form, such as `Mod+[KeyP]`, makes them comparable.
- **A cheat sheet dialog usually gets an exclusive scope.** Register the hotkey that opened it inside the dialog too, so the same keys close it.

When building the "press a new shortcut" control, read [recording](references/recording.md).
