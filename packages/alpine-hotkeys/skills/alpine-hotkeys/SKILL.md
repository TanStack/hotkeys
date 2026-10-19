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

Each owner from `createHotkeysScope(defaults?)` or `$hotkeys` has `createHotkey`, `createHotkeys`, `createHotkeyRecorder`, `createAppHotkeys`, `createAppHotkeyList`, `createCustomHotkeys`, held-key helpers, and `destroy`. Their state is read through `.value`.

## Pitfalls

- **Destroy each owner.** Owners aren't tied to Alpine's lifecycle, so without `this.hotkeys.destroy()` in `destroy()`, a removed component's hotkeys keep firing. Create one owner per component instance, inside the `Alpine.data` factory.
- **`createHotkeysScope` isn't a hotkey scope.** It only owns registrations and sets defaults. For a dialog, activate a real scope in `init()` with `release = getHotkeyManager().activateScope(name, { exclusive: true })`, pass `{ scope: name }` to the dialog's hotkeys, and call `release()` in `destroy()`. Give each open dialog its own name.
- **Pass options as a getter.** `{ enabled: this.dirty }` is read once. Use `() => ({ enabled: this.dirty })`.
- **Use either `$hotkeys` or your own owner for a hotkey, not both.** Otherwise it registers twice.
- With server rendering, load the adapter only in the browser.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Alpine](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/alpine-hotkeys/dist/types.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/alpine/guides/<page>.md`, such as `hotkeys` or `app-hotkeys`.
