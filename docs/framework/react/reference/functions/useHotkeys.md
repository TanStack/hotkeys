---
id: useHotkeys
title: useHotkeys
---

# Function: useHotkeys()

```ts
function useHotkeys(hotkeys, commonOptions): void;
```

Defined in: [useHotkeys.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeys.ts#L73)

React hook for registering multiple keyboard hotkeys at once.

Uses the singleton HotkeyManager for efficient event handling.
Accepts a dynamic array of hotkey definitions, making it safe to use
with variable-length lists without violating the rules of hooks.

Options are merged in this order:
HotkeysProvider defaults < commonOptions < per-definition options

Callbacks and options are synced on every render to avoid stale closures.

## Parameters

### hotkeys

[`UseHotkeyDefinition`](../interfaces/UseHotkeyDefinition.md)[]

Array of hotkey definitions to register

### commonOptions

[`UseHotkeyOptions`](../interfaces/UseHotkeyOptions.md) = `{}`

Shared options applied to all hotkeys (overridden by per-definition options).
  Per-row `enabled: false` still registers that hotkey: `HotkeyManager` suppresses execution only (the row
  stays in the store and appears in TanStack Hotkeys devtools). Toggling `enabled` updates the existing handle
  via `setOptions` (no unregister/re-register churn).

## Returns

`void`

## Examples

```tsx
function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

```tsx
function MenuShortcuts({ items }) {
  // Dynamic hotkeys from data -- safe because it's a single hook call
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
    { preventDefault: true },
  )
}
```
