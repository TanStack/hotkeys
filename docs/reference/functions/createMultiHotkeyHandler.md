---
id: createMultiHotkeyHandler
title: createMultiHotkeyHandler
---

```ts
function createMultiHotkeyHandler(handlers, options): (event) => void;
```

Defined in: [match.ts:138](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L138)

Creates a handler that matches multiple hotkeys.

## Parameters

### handlers

[`MultiHotkeyHandler`](../type-aliases/MultiHotkeyHandler.md)

A map of hotkey strings to their handlers

### options

[`CreateHotkeyHandlerOptions`](../interfaces/CreateHotkeyHandlerOptions.md) = `{}`

Options for matching and handling

## Returns

A function that can be used as an event handler

```ts
(event): void;
```

### Parameters

#### event

`KeyboardEvent`

### Returns

`void`

## Example

```ts
const handler = createMultiHotkeyHandler({
  'Mod+S': (event, { hotkey }) => handleSave(),
  'Mod+Z': (event, { hotkey }) => handleUndo(),
  'Mod+Shift+Z': (event, { hotkey }) => handleRedo(),
})

document.addEventListener('keydown', handler)
```
