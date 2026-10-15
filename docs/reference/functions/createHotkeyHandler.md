---
id: createHotkeyHandler
title: createHotkeyHandler
---

```ts
function createHotkeyHandler(
   hotkey, 
   callback, 
   options?): (event) => void;
```

Defined in: [match.ts:95](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L95)

Creates a keyboard event handler that calls the callback when the hotkey matches.

## Parameters

### hotkey

  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

The hotkey string or ParsedHotkey to match

### callback

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

The function to call when the hotkey matches

### options?

[`CreateHotkeyHandlerOptions`](../interfaces/CreateHotkeyHandlerOptions.md) = `{}`

Options for matching and handling

## Returns

A function that can be used as an event handler

(`event`) => `void`

## Example

```ts
const handler = createHotkeyHandler('Mod+S', (event, { hotkey, parsedHotkey }) => {
  console.log(`${hotkey} was pressed`)
  handleSave()
})

document.addEventListener('keydown', handler)
```
