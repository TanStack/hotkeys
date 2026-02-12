---
id: useHotkeySequence
title: useHotkeySequence
---

# Function: useHotkeySequence()

```ts
function useHotkeySequence(
   sequence, 
   callback, 
   options): void;
```

Defined in: [useHotkeySequence.ts:50](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkeySequence.ts#L50)

React hook for registering a keyboard shortcut sequence (Vim-style).

This hook allows you to register multi-key sequences like 'g g' or 'd d'
that trigger when the full sequence is pressed within a timeout.

## Parameters

### sequence

`HotkeySequence`

Array of hotkey strings that form the sequence

### callback

`HotkeyCallback`

Function to call when the sequence is completed

### options

[`UseHotkeySequenceOptions`](../interfaces/UseHotkeySequenceOptions.md) = `{}`

Options for the sequence behavior

## Returns

`void`

## Example

```tsx
function VimEditor() {
  // 'g g' to go to top
  useHotkeySequence(['G', 'G'], () => {
    scrollToTop()
  })

  // 'd d' to delete line
  useHotkeySequence(['D', 'D'], () => {
    deleteLine()
  })

  // 'd i w' to delete inner word
  useHotkeySequence(['D', 'I', 'W'], () => {
    deleteInnerWord()
  }, { timeout: 500 })

  return <div>...</div>
}
```
