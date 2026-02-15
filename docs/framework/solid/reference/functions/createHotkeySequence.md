---
id: createHotkeySequence
title: createHotkeySequence
---

# Function: createHotkeySequence()

```ts
function createHotkeySequence(
   sequence, 
   callback, 
   options): void;
```

Defined in: [createHotkeySequence.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequence.ts#L50)

SolidJS primitive for registering a keyboard shortcut sequence (Vim-style).

This primitive allows you to register multi-key sequences like 'g g' or 'd d'
that trigger when the full sequence is pressed within a timeout.

## Parameters

### sequence

Array of hotkey strings that form the sequence (or accessor function)

`HotkeySequence` | () => `HotkeySequence`

### callback

`HotkeyCallback`

Function to call when the sequence is completed

### options

Options for the sequence behavior (or accessor function)

[`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md) | () => [`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md)

## Returns

`void`

## Example

```tsx
function VimEditor() {
  // 'g g' to go to top
  createHotkeySequence(['G', 'G'], () => {
    scrollToTop()
  })

  // 'd d' to delete line
  createHotkeySequence(['D', 'D'], () => {
    deleteLine()
  })

  // 'd i w' to delete inner word
  createHotkeySequence(['D', 'I', 'W'], () => {
    deleteInnerWord()
  }, { timeout: 500 })

  return <div>...</div>
}
```
