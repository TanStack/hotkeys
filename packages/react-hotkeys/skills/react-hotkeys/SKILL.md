---
name: react-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in a React app with
  @tanstack/react-hotkeys: useHotkey and useHotkeys, refs as targets,
  HotkeysProvider defaults and dialog scopes, app hotkey hooks, recorders,
  held-key and hint hooks, or replacing useEffect keydown listeners and other
  React shortcut libraries.
metadata:
  purpose: >-
    React bindings for TanStack Hotkeys: hooks, providers, refs, and the
    React-specific mistakes to avoid.
  type: framework
  framework: react
  library: '@tanstack/react-hotkeys'
  library_version: '0.15.0'
sources:
  - src/useHotkey.ts
  - src/useHotkeys.ts
  - src/HotkeysProvider.tsx
  - src/useAppHotkeys.ts
  - src/utils.ts
  - TanStack/hotkeys:docs/framework/react/quick-start.md
  - TanStack/hotkeys:docs/framework/react/guides/hotkeys-provider-and-scopes.md
  - 'tests/skills/editor-shortcuts/**'
  - 'tests/skills/shortcut-settings/**'
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in React

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```tsx
import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'

export function SaveButton({ onSave }: { onSave: () => void }) {
  useHotkey('Mod+S', () => onSave(), { meta: { name: 'Save' } })

  return (
    <button onClick={onSave}>
      Save <kbd>{formatForDisplay('Mod+S')}</kbd>
    </button>
  )
}
```

## API

| API                                       | What it's for                                                                                                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useHotkey(hotkey, callback, options?)`   | Register one chord, sequence, or app hotkey while the component is mounted.                                                                                                                                                          |
| `useHotkeys(definitions, commonOptions?)` | Register several hotkeys, or a list built from data, in one call.                                                                                                                                                                    |
| `<HotkeysProvider>`                       | Set default options, a scope (`exclusive` for dialogs), `enabled`, and app hotkeys for the components inside it.                                                                                                                     |
| `useHotkeysContext()`                     | Read the nearest provider's merged defaults and enabled state, or `null` outside a provider.                                                                                                                                         |
| `useDefaultHotkeysOptions()`              | Read the default options merged from every provider above.                                                                                                                                                                           |
| `useAppHotkeys()`                         | Get the declared app hotkeys with the user's custom hotkeys applied, to pass to the register API.                                                                                                                                    |
| `useAppHotkeyList()`                      | List every app hotkey with its status, including ones whose components aren't mounted, for a cheat sheet or settings screen.                                                                                                         |
| `useCustomHotkeys()`                      | Read, change, and reset the user's custom hotkeys, and check a new one for conflicts.                                                                                                                                                |
| `useHotkeyRecorder(options)`              | Record a chord or sequence the user presses, for a settings screen.                                                                                                                                                                  |
| `useHotkeyRegistrations()`                | List every registered hotkey with its options, `meta`, and `status` (whether it's enabled and in an active scope), for a cheat sheet of what's mounted.                                                                              |
| `useHotkeyScopesState()`                  | Get the active scopes and the exclusive scope that owns the keyboard.                                                                                                                                                                |
| `useHotkeyHint(hotkey, options?)`         | Get whether held modifiers should reveal a shortcut's hint, such as labels that appear while Mod is held. False unless a registration of the hotkey can fire: enabled, in an active scope, and with focus inside its element target. |
| `useKeyHold(key)`                         | Get whether one key is held, such as Shift for a range-select mode.                                                                                                                                                                  |
| `useHeldKeys()`                           | Get every key that's held right now.                                                                                                                                                                                                 |
| `useHeldKeyCodes()`                       | Map each held key to its physical `event.code`.                                                                                                                                                                                      |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

No provider is required. In React Server Components frameworks, use the hooks and `HotkeysProvider` in client components.

## A dialog that owns the keyboard

```tsx
import { useId } from 'react'
import type { ReactNode } from 'react'
import { HotkeysProvider, useHotkey } from '@tanstack/react-hotkeys'

export function Dialog(props: { onClose: () => void; children: ReactNode }) {
  return (
    <HotkeysProvider scope={`dialog-${useId()}`} exclusive>
      <DialogBody {...props} />
    </HotkeysProvider>
  )
}

function DialogBody({
  onClose,
  children,
}: {
  onClose: () => void
  children: ReactNode
}) {
  useHotkey('Escape', onClose)
  return <div role="dialog">{children}</div>
}
```

A hook uses the nearest `HotkeysProvider` above its component. Registering `Escape` in `Dialog` itself would put it in the outer scope, which the exclusive scope suspends, so the dialog couldn't close. `useId` gives each open dialog its own scope.

## Pitfalls

- **Pass the ref, not `ref.current`.** `target: listRef.current` is `null` on the first render, and a `null` target means `document`, so the hotkey works page-wide. Pass `target: listRef`; a ref that is still empty waits for its element.
- **No dependency arrays or `useCallback`.** The hooks read the hotkey, callback, and options on every render, so inline callbacks always see current state.
- **Call the hooks directly.** A `useShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, options, app hotkeys, and the typed callback context.
- **`matchesKeyboardEvent` takes the DOM event.** In a widget's `onKeyDown`, pass `event.nativeEvent`.
- **In tests,** set `<HotkeysProvider defaultOptions={{ hotkey: { platform: 'mac' } }}>`.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in React](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/react-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/react/guides/<page>.md`, such as `hotkeys`, `hotkeys-provider-and-scopes`, or `app-hotkeys`. Devtools: `hotkeysDevtoolsPlugin()` from `@tanstack/react-hotkeys-devtools` in `@tanstack/react-devtools`.
