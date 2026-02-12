---
id: createHotkeyHandler
title: createHotkeyHandler
---

# Function: createHotkeyHandler()

```ts
function createHotkeyHandler(
   hotkey, 
   callback, 
   options): (event) => void;
```

Defined in: [match.ts:122](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/match.ts#L122)

Creates a keyboard event handler that calls the callback when the hotkey matches.

## Parameters

### hotkey

The hotkey string or ParsedHotkey to match

[`Hotkey`](../type-aliases/Hotkey.md) | [`ParsedHotkey`](../interfaces/ParsedHotkey.md)

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
