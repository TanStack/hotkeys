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

This adapter needs Solid 2 (`solid-js` 2 with `@solidjs/web`), so write Solid 2 code: two-function `createEffect`, `onSettled` instead of `onMount`, `<Context value>`, and lowercase attributes such as `tabindex`. Solid 1 apps use `@tanstack/solid-hotkeys@0.25`, the last release for Solid 1.

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'
import { createSignal } from 'solid-js'

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

  return <div ref={setPanel} tabindex={0} onInput={() => setIsDirty(true)} />
}
```

## API

| API                                          | What it's for                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createHotkey(hotkey, callback, options?)`   | Register one chord, sequence, or app hotkey for the owning component's lifetime; the hotkey and options can be accessors.                                                                                                                                                                                                                                                                            |
| `createHotkeys(definitions, commonOptions?)` | Register several hotkeys, or an accessor of a list built from data, in one call.                                                                                                                                                                                                                                                                                                                     |
| `<HotkeysProvider>`                          | Set default options, a scope (`exclusive` for dialogs), `enabled`, `suspendCharacterKeys` (set from a user setting that turns off single-key shortcuts; it applies app-wide while the provider is mounted), and app hotkeys for the components inside it.                                                                                                                                            |
| `useHotkeysContext()`                        | Read the nearest provider's merged defaults and enabled state, or `null` outside a provider.                                                                                                                                                                                                                                                                                                         |
| `useDefaultHotkeysOptions()`                 | Read the default options merged from every provider above.                                                                                                                                                                                                                                                                                                                                           |
| `createFormatForDisplay()`                   | Get the function that formats a hotkey as a label, with the provider's `platform` and the user's keyboard layout filled in. Only Chromium browsers report a layout, so physical keys keep their US labels in Firefox and Safari. Use it for every label in a component: `const formatForDisplay = createFormatForDisplay()` in the component, then `formatForDisplay(hotkey)`.                       |
| `createFormatForAria()`                      | Get the function that formats a hotkey for `aria-keyshortcuts`, with the provider's `platform` and the user's keyboard layout filled in. Returns `undefined` for a multi-step sequence, no hotkey, or a hotkey that can't fire right now, such as a disabled or suspended one, so the attribute is omitted. Set `aria-keyshortcuts` on every control that has a shortcut, next to the visible label. |
| `useAppHotkeys()`                            | Get an accessor of the declared app hotkeys with the user's custom hotkeys applied.                                                                                                                                                                                                                                                                                                                  |
| `createAppHotkeyList()`                      | Get an accessor listing every app hotkey with its status, for a cheat sheet or settings screen.                                                                                                                                                                                                                                                                                                      |
| `useCustomHotkeys()`                         | Read, change, and reset the user's custom hotkeys, and check a new one for conflicts.                                                                                                                                                                                                                                                                                                                |
| `createHotkeyRecorder(options)`              | Record a chord or sequence the user presses; its state fields are accessors.                                                                                                                                                                                                                                                                                                                         |
| `createHotkeyRegistrations()`                | Get an accessor listing every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope).                                                                                                                                                                                                                                                                |
| `createHotkeyScopesState()`                  | Get an accessor of the active scopes and the exclusive scope that owns the keyboard.                                                                                                                                                                                                                                                                                                                 |
| `createHotkeyHint(hotkey, options?)`         | Get an accessor of whether held modifiers should reveal a shortcut's hint. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target.                                                                                                                                                                                                |
| `createKeyHold(key)`                         | Get an accessor of whether one key is held. Letters match in any case; other names, such as `Shift`, are case-sensitive.                                                                                                                                                                                                                                                                             |
| `createKeyLockState(key)`                    | Get an accessor of whether `'CapsLock'`, `'NumLock'`, or `'ScrollLock'` is on: `true`, `false`, or `null` until a key press, click, or mouse move reports it. Resets to `null` when the window loses focus. Num Lock and Scroll Lock are always `null` on macOS and iOS. Use it for lock state, not `createKeyHold`, which is true only while the key is down.                                       |
| `createHeldKeys()`                           | Get an accessor of every key that's held right now.                                                                                                                                                                                                                                                                                                                                                  |
| `createHeldKeyCodes()`                       | Get an accessor mapping each held key to its physical `event.code`.                                                                                                                                                                                                                                                                                                                                  |

The package also re-exports `@tanstack/hotkeys`, such as `matchesKeyboardEvent` and `defineAppHotkeys`. Its plain `formatForDisplay` export is deprecated: use `createFormatForDisplay()` in components. Outside a component, call the plain function and pass `platform`. The plain `formatForAria` export is deprecated the same way, in favor of `createFormatForAria()`.

The state these return is accessors, including the recorder's fields. No provider is required.

## Pitfalls

- **Pass options as an accessor.** `{ enabled: isDirty() }` is read once, during setup, so the hotkey never follows the signal. Use `() => ({ enabled: isDirty() })`. The hotkey and `createHotkeys`' definitions also accept accessors.
- **Keep element targets in a signal.** A `let el` variable is still `undefined` when the options are read, and nothing tracks it, so the hotkey waits and never registers. Use `ref={setEl}` and `() => ({ target: el() })`; a `null` or `undefined` target waits for the element.
- **Give removable elements their own component.** For an element inside `<Show>` or `<For>`, call `createHotkey` with a signal `target` in a component that renders the element, so the hotkey unregisters when Solid removes the component. Don't call `createHotkey` in a `ref` callback: Solid 2 runs it outside the component's owner, and it throws.
- **The callback isn't tracked.** Read props inside it, as `() => props.onClose()`, rather than passing `props.onClose` itself.
- **Register a dialog's hotkeys in a child of its provider.** A primitive uses the nearest `HotkeysProvider` above its component, so a dialog that renders `<HotkeysProvider scope={...} exclusive>` and creates `Escape` itself puts it in the suspended outer scope. Give each open dialog its own scope name, such as `` `dialog-${createUniqueId()}` ``.
- **Call the primitives directly.** A `createShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, accessor options, and app hotkeys.
- **Server-rendered labels need the user's platform.** The server can't see the user's OS, so without a platform it renders Linux labels, and Solid keeps them after hydration for Mac and Windows users. Set the provider's `defaultOptions.platform` to `detectPlatform(userAgent)` from the request's `User-Agent` header. `createFormatForDisplay()` reads it.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Solid](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/solid-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/solid/guides/<page>.md`, such as `hotkeys`, `hotkeys-provider-and-scopes`, or `app-hotkeys`. Devtools: `hotkeysDevtoolsPlugin()` from `@tanstack/solid-hotkeys-devtools` in `@tanstack/solid-devtools`.
