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

## API

| API                                                    | What it's for                                                                                                                                                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createHotkey(hotkey, callback, options?)`             | Register one chord, sequence, or app hotkey on the document while the component is mounted; pass getters for values that change.                                                                    |
| `createHotkeys(definitions, commonOptions?)`           | Register several hotkeys on the document, or a getter of a list built from data.                                                                                                                    |
| `createHotkeyAttachment(hotkey, callback, options?)`   | Create an attachment for `{@attach}` that listens on one element.                                                                                                                                   |
| `createHotkeysAttachment(definitions, commonOptions?)` | Create an attachment that registers several hotkeys on one element.                                                                                                                                 |
| `<HotkeysProvider>`                                    | Set default options, a scope (`exclusive` for dialogs), `enabled`, and app hotkeys for the components inside it.                                                                                    |
| `setHotkeysContext(options)`                           | Set the same options from a component's script instead of rendering `HotkeysProvider`; they apply to that component too.                                                                            |
| `getHotkeysContext()`                                  | Read the nearest context's merged defaults and enabled state, or `null` outside one.                                                                                                                |
| `getDefaultHotkeysOptions()`                           | Read the default options merged from every context above.                                                                                                                                           |
| `getAppHotkeys()`                                      | Read `.current`, the declared app hotkeys with the user's custom hotkeys applied.                                                                                                                   |
| `getAppHotkeyList()`                                   | Read `.current`, every app hotkey with its status, for a cheat sheet or settings screen.                                                                                                            |
| `getCustomHotkeys()`                                   | Read the user's custom hotkeys from `.current`, change or reset them, and check a new one for conflicts.                                                                                            |
| `createHotkeyRecorder(options)`                        | Record a chord or sequence the user presses, for a settings screen.                                                                                                                                 |
| `getHotkeyRegistrations()`                             | Read `.hotkeys`, every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope).                                                                      |
| `getHotkeyScopesState()`                               | Read `.state`, the active scopes and the exclusive scope that owns the keyboard.                                                                                                                    |
| `getHotkeyHint(hotkey, options?)`                      | Read `.visible`, whether held modifiers should reveal a shortcut's hint. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target. |
| `getIsKeyHeld(key)`                                    | Read `.held`, whether one key is held.                                                                                                                                                              |
| `getHeldKeys()`                                        | Read `.keys`, every key that's held right now.                                                                                                                                                      |
| `getHeldKeyCodesMap()`                                 | Read `.codes`, which maps each held key to its physical `event.code`.                                                                                                                               |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

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
