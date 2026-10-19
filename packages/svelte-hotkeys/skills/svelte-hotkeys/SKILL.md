---
name: svelte-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in a Svelte 5 app with
  @tanstack/svelte-hotkeys: createHotkey and createHotkeys, getter options,
  createHotkeyAttachment for element hotkeys, HotkeysProvider and
  setHotkeysContext scopes, app hotkey getters, recorders, held-key and hint
  getters, or replacing svelte:window keydown handlers.
metadata:
  purpose: >-
    Svelte 5 bindings for TanStack Hotkeys: getters, attachments, providers,
    and the Svelte-specific reactivity mistakes to avoid.
  type: framework
  framework: svelte
  library: '@tanstack/svelte-hotkeys'
  library_version: '0.15.0'
sources:
  - src/createHotkey.svelte.ts
  - src/createHotkeys.svelte.ts
  - src/HotkeysCtx.ts
  - src/HotkeysProvider.svelte
  - src/getAppHotkeys.svelte.ts
  - src/createHotkeyRecorder.svelte.ts
  - TanStack/hotkeys:docs/framework/svelte/quick-start.md
  - TanStack/hotkeys:docs/framework/svelte/guides/hotkeys-provider-and-scopes.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Svelte

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```svelte
<script lang="ts">
  import {
    createHotkey,
    createHotkeyAttachment,
  } from '@tanstack/svelte-hotkeys'

  let isDirty = $state(false)

  createHotkey(
    'Mod+S',
    () => save(),
    () => ({ enabled: isDirty }),
  )
  const closeOnEscape = createHotkeyAttachment('Escape', () => closePanel())
</script>

<div tabindex="0" {@attach closeOnEscape} oninput={() => (isDirty = true)}>
  Panel
</div>
```

| Task                          | API                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Register                      | `createHotkey(hotkey, callback, options?)`; `createHotkeys(definitions, commonOptions?)` for several hotkeys or a list from data            |
| Hotkeys on one element        | `createHotkeyAttachment`, `createHotkeysAttachment`, used with `{@attach}`                                                                  |
| Defaults, scopes, app hotkeys | `<HotkeysProvider defaultOptions scope exclusive enabled appHotkeys customHotkeys onCustomHotkeysChange>`, or `setHotkeysContext(options)`  |
| App hotkeys                   | `getAppHotkeys().current`, `getAppHotkeyList().current`, `getCustomHotkeys()`                                                               |
| Record, list, held keys       | `createHotkeyRecorder`, `getHotkeyRegistrations().hotkeys`, `getIsKeyHeld(key).held`, `getHeldKeys().keys`, `getHotkeyHint(hotkey).visible` |

No provider is required. Call these at the top level of a component's `<script>`.

## Pitfalls

- **Pass options as a getter.** `{ enabled: isDirty }` is read once, during initialization, so the hotkey never follows the state. Use `() => ({ enabled: isDirty })`. The hotkey and `createHotkeys`' definitions also accept getters.
- **Don't destructure the returned objects.** `const { held } = getIsKeyHeld('Shift')` copies the value once. Keep the object and read `shift.held`, `recorder.isRecording`, or `appHotkeys.current` where you use it.
- **Use attachments for element hotkeys.** The `target` option takes only `document` or `window`.
- **Call `setHotkeysContext` before creating the component's hotkeys.** It applies to the component itself, so a hotkey created first lands in the outer scope, which an exclusive context then suspends. It reads its options once; for `enabled` or `exclusive` that change, wrap the component in `<HotkeysProvider>`. Give each open dialog its own scope name.
- **The callback isn't tracked.** Read state and props inside it.
- **Call the functions directly.** A `createShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, getter options, and app hotkeys.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Svelte](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/svelte-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/svelte/guides/<page>.md`, such as `hotkeys`, `hotkeys-provider-and-scopes`, or `app-hotkeys`. Devtools: `hotkeysDevtoolsPlugin()` from `@tanstack/svelte-hotkeys-devtools` in `@tanstack/svelte-devtools`.
