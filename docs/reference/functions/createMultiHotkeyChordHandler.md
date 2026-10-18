---
id: createMultiHotkeyChordHandler
title: createMultiHotkeyChordHandler
---

```ts
function createMultiHotkeyChordHandler(handlers, options?): (event) => void;
```

Defined in: [match.ts:145](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L145)

Creates a handler that matches several chords.

## Parameters

### handlers

[`MultiHotkeyChordHandler`](../type-aliases/MultiHotkeyChordHandler.md)

A map of chord strings to their handlers

### options?

[`CreateHotkeyChordHandlerOptions`](../interfaces/CreateHotkeyChordHandlerOptions.md) = `{}`

Options for matching and handling

## Returns

A function that can be used as an event handler

(`event`) => `void`

## Example

```ts
const handler = createMultiHotkeyChordHandler({
  'Mod+S': (event, { hotkey }) => handleSave(),
  'Mod+Z': (event, { hotkey }) => handleUndo(),
  'Mod+Shift+Z': (event, { hotkey }) => handleRedo(),
})

document.addEventListener('keydown', handler)
```
