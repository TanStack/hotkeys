---
name: solid-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in a SolidJS app with
  @tanstack/solid-hotkeys: createHotkey and createHotkeys, accessor options and
  signal targets, HotkeysProvider defaults and dialog scopes, app hotkey
  primitives, recorders, held-key and hint primitives, or replacing onMount
  keydown listeners.
metadata:
  purpose: >-
    Solid bindings for TanStack Hotkeys: primitives, accessors, providers, and
    the Solid-specific reactivity mistakes to avoid.
  type: framework
  framework: solid
  library: '@tanstack/solid-hotkeys'
  library_version: '0.15.0'
sources:
  - src/createHotkey.ts
  - src/createHotkeys.ts
  - src/HotkeysProvider.tsx
  - src/appHotkeys.ts
  - TanStack/hotkeys:docs/framework/solid/quick-start.md
  - TanStack/hotkeys:docs/framework/solid/guides/hotkeys-provider-and-scopes.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Solid

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```tsx
import { createSignal } from 'solid-js'
import { createHotkey } from '@tanstack/solid-hotkeys'

export function Editor() {
  const [isDirty, setIsDirty] = createSignal(false)
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  createHotkey(
    'Mod+S',
    () => save(),
    () => ({ enabled: isDirty() }),
  )
  createHotkey(
    'Escape',
    () => closePanel(),
    () => ({ target: panel() }),
  )

  return <div ref={setPanel} tabIndex={0} onInput={() => setIsDirty(true)} />
}
```

## API

| API                                          | What it's for                                                                                                                                                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createHotkey(hotkey, callback, options?)`   | Register one chord, sequence, or app hotkey for the owning component's lifetime; the hotkey and options can be accessors.                                                                             |
| `createHotkeys(definitions, commonOptions?)` | Register several hotkeys, or an accessor of a list built from data, in one call.                                                                                                                      |
| `<HotkeysProvider>`                          | Set default options, a scope (`exclusive` for dialogs), `enabled`, and app hotkeys for the components inside it.                                                                                      |
| `useHotkeysContext()`                        | Read the nearest provider's merged defaults and enabled state, or `null` outside a provider.                                                                                                          |
| `useDefaultHotkeysOptions()`                 | Read the default options merged from every provider above.                                                                                                                                            |
| `useAppHotkeys()`                            | Get an accessor of the declared app hotkeys with the user's custom hotkeys applied.                                                                                                                   |
| `createAppHotkeyList()`                      | Get an accessor listing every app hotkey with its status, for a cheat sheet or settings screen.                                                                                                       |
| `useCustomHotkeys()`                         | Read, change, and reset the user's custom hotkeys, and check a new one for conflicts.                                                                                                                 |
| `createHotkeyRecorder(options)`              | Record a chord or sequence the user presses; its state fields are accessors.                                                                                                                          |
| `createHotkeyRegistrations()`                | Get an accessor listing every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope).                                                                 |
| `createHotkeyScopesState()`                  | Get an accessor of the active scopes and the exclusive scope that owns the keyboard.                                                                                                                  |
| `createHotkeyHint(hotkey, options?)`         | Get an accessor of whether held modifiers should reveal a shortcut's hint. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target. |
| `createKeyHold(key)`                         | Get an accessor of whether one key is held.                                                                                                                                                           |
| `createHeldKeys()`                           | Get an accessor of every key that's held right now.                                                                                                                                                   |
| `createHeldKeyCodes()`                       | Get an accessor mapping each held key to its physical `event.code`.                                                                                                                                   |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

The state these return is accessors, including the recorder's fields. No provider is required.

## Pitfalls

- **Pass options as an accessor.** `{ enabled: isDirty() }` is read once, during setup, so the hotkey never follows the signal. Use `() => ({ enabled: isDirty() })`. The hotkey and `createHotkeys`' definitions also accept accessors.
- **Keep element targets in a signal.** A `let el` variable is still `undefined` when the options are read, and an undefined target means `document`. Use `ref={setEl}` and `() => ({ target: el() })`; a `null` target waits for the element.
- **The callback isn't tracked.** Read props inside it, as `() => props.onClose()`, rather than passing `props.onClose` itself.
- **Register a dialog's hotkeys in a child of its provider.** A primitive uses the nearest `HotkeysProvider` above its component, so a dialog that renders `<HotkeysProvider scope={...} exclusive>` and creates `Escape` itself puts it in the suspended outer scope. Give each open dialog its own scope name, such as `` `dialog-${createUniqueId()}` ``.
- **Call the primitives directly.** A `createShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, accessor options, and app hotkeys.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Solid](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/solid-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/solid/guides/<page>.md`, such as `hotkeys`, `hotkeys-provider-and-scopes`, or `app-hotkeys`. Devtools: `hotkeysDevtoolsPlugin()` from `@tanstack/solid-hotkeys-devtools` in `@tanstack/solid-devtools`.
