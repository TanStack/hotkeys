---
id: createHotkeyChordHandler
title: createHotkeyChordHandler
---

```ts
function createHotkeyChordHandler(
   chord, 
   callback, 
   options?): (event) => void;
```

Defined in: [match.ts:91](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L91)

Creates a keyboard event handler that calls the callback when the chord
matches. For sequences, use `createSequenceMatcher`.

## Parameters

### chord

  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)

The chord string or parsed chord to match

### callback

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)\<[`HotkeyChordCallbackContext`](../interfaces/HotkeyChordCallbackContext.md)\>

The function to call when the hotkey matches

### options?

[`CreateHotkeyChordHandlerOptions`](../interfaces/CreateHotkeyChordHandlerOptions.md) = `{}`

Options for matching and handling

## Returns

A function that can be used as an event handler

(`event`) => `void`

## Example

```ts
const handler = createHotkeyChordHandler('Mod+S', (event, { hotkey, parsedChord }) => {
  console.log(`${hotkey} was pressed`)
  handleSave()
})

document.addEventListener('keydown', handler)
```
