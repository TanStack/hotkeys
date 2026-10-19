---
name: octane-hotkeys
description: >-
  Use when adding or fixing keyboard shortcuts in an Octane app with
  @tanstack/octane-hotkeys: useHotkey and useHotkeys in .tsrx components,
  element state as targets, HotkeysProvider defaults and dialog scopes, app
  hotkey hooks, recorders, held-key and hint hooks, or replacing keydown
  listeners.
metadata:
  purpose: >-
    Octane bindings for TanStack Hotkeys: hooks in compiler-enabled .tsrx
    components, element targets, providers, and the Octane-specific mistakes to
    avoid.
  type: framework
  framework: octane
  library: '@tanstack/octane-hotkeys'
  library_version: '0.5.0'
sources:
  - src/useHotkey.ts
  - src/useHotkeys.ts
  - src/HotkeysProvider.ts
  - src/useAppHotkeys.ts
  - TanStack/hotkeys:docs/framework/octane/quick-start.md
  - TanStack/hotkeys:docs/framework/octane/guides/hotkeys-provider-and-scopes.md
requires:
  - '@tanstack/hotkeys#hotkeys-core'
---

# TanStack Hotkeys in Octane

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```tsrx
import { useState } from 'octane'
import { formatForDisplay, useHotkey } from '@tanstack/octane-hotkeys'

export function Panel({ onSave }: { onSave: () => void }) @{
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  useHotkey('Mod+S', () => onSave(), { meta: { name: 'Save' } })
  useHotkey('Escape', () => closePanel(), { target: panel })

  <div ref={setPanel} tabIndex={0}>
    Save <kbd>{formatForDisplay('Mod+S')}</kbd>
  </div>
}
```

| Task                          | API                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Register                      | `useHotkey(hotkey, callback, options?)`; `useHotkeys(definitions, commonOptions?)` for several hotkeys or a list from data |
| Defaults, scopes, app hotkeys | `<HotkeysProvider defaultOptions scope exclusive enabled appHotkeys customHotkeys onCustomHotkeysChange>`                  |
| App hotkeys                   | `useAppHotkeys()`, `useAppHotkeyList()`, `useCustomHotkeys()`                                                              |
| Record, list, held keys       | `useHotkeyRecorder`, `useHotkeyRegistrations`, `useKeyHold`, `useHeldKeys`, `useHotkeyHint`                                |

No provider is required. Use Octane 0.12 or newer, with hooks in compiler-enabled `.tsrx` components.

## Pitfalls

- **Targets are elements, not ref objects.** Keep the element in state with a callback ref, as above; a `null` target waits for the element.
- **Register a dialog's hotkeys in a child of its provider.** A hook uses the nearest `HotkeysProvider` above its component, so a dialog that renders `<HotkeysProvider scope={...} exclusive>` and registers `Escape` itself puts it in the suspended outer scope. Give each open dialog its own scope name, such as `` `dialog-${useId()}` ``.
- **Hooks are tracked by call site.** Use `useHotkeys(items.map(...))` for lists, not `useHotkey` in a loop.
- **Call the hooks directly.** A `useShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, options, and app hotkeys.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Octane](references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/octane-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/octane/guides/<page>.md`, such as `hotkeys`, `hotkeys-provider-and-scopes`, or `app-hotkeys`.
