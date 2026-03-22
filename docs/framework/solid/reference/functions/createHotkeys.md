---
id: createHotkeys
title: createHotkeys
---

# Function: createHotkeys()

```ts
function createHotkeys(hotkeys, commonOptions): void;
```

Defined in: [createHotkeys.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L67)

SolidJS primitive for registering multiple keyboard hotkeys at once.

Uses the singleton HotkeyManager for efficient event handling.
Accepts a dynamic array of hotkey definitions, making it safe to use
with variable-length lists.

Options are merged in this order:
HotkeysProvider defaults < commonOptions < per-definition options

## Parameters

### hotkeys

Array of hotkey definitions, or accessor returning them

[`CreateHotkeyDefinition`](../interfaces/CreateHotkeyDefinition.md)[] | () => [`CreateHotkeyDefinition`](../interfaces/CreateHotkeyDefinition.md)[]

### commonOptions

Shared options applied to all hotkeys, or accessor

[`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md) | () => [`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md)

## Returns

`void`

## Examples

```tsx
function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

```tsx
function MenuShortcuts(props) {
  createHotkeys(
    () => props.items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
    { preventDefault: true },
  )
}
```
