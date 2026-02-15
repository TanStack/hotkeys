---
id: createHotkey
title: createHotkey
---

# Function: createHotkey()

```ts
function createHotkey(
   hotkey, 
   callback, 
   options): void;
```

Defined in: [createHotkey.ts:83](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkey.ts#L83)

SolidJS primitive for registering a keyboard hotkey.

Uses the singleton HotkeyManager for efficient event handling.
The callback receives both the keyboard event and a context object
containing the hotkey string and parsed hotkey.

This primitive automatically tracks reactive dependencies and updates
the registration when options or the callback change.

## Parameters

### hotkey

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object (supports `mod` for cross-platform)

`RegisterableHotkey` | () => `RegisterableHotkey`

### callback

`HotkeyCallback`

The function to call when the hotkey is pressed

### options

Options for the hotkey behavior

[`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md) | () => [`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md)

## Returns

`void`

## Examples

```tsx
function SaveButton() {
  const [count, setCount] = createSignal(0)

  // Callback always has access to latest count value
  createHotkey('Mod+S', (event, { hotkey }) => {
    console.log(`Save triggered, count is ${count()}`)
    handleSave()
  })

  return <button onClick={() => setCount(c => c + 1)}>Count: {count()}</button>
}
```

```tsx
function Modal(props) {
  // enabled option is reactive
  createHotkey('Escape', () => {
    props.onClose()
  }, () => ({ enabled: props.isOpen }))

  return <Show when={props.isOpen}>
    <div class="modal">...</div>
  </Show>
}
```

```tsx
function Editor() {
  const [editorRef, setEditorRef] = createSignal<HTMLDivElement | null>(null)

  // Scoped to a specific element - use accessor so hotkey waits for ref
  createHotkey('Mod+S', save, () => ({ target: editorRef() }))

  return <div ref={setEditorRef}>...</div>
}
```
