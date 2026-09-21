---
id: createHotkeyHandler
title: createHotkeyHandler
---

```ts
function createHotkeyHandler(
   hotkey, 
   callback, 
   options): (event) => void;
```

Defined in: [match.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L87)

Creates a keyboard event handler that calls the callback when the hotkey matches.

## Parameters

### hotkey

The hotkey string or ParsedHotkey to match

[`Hotkey`](../type-aliases/Hotkey.md) | [`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

### callback

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

The function to call when the hotkey matches

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
const handler = createHotkeyHandler('Mod+S', (event, { hotkey, parsedHotkey }) => {
  console.log(`${hotkey} was pressed`)
  handleSave()
})

document.addEventListener('keydown', handler)
```
