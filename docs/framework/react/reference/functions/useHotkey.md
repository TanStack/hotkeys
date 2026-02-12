---
id: useHotkey
title: useHotkey
---

# Function: useHotkey()

```ts
function useHotkey(
   hotkey, 
   callback, 
   options): void;
```

Defined in: [useHotkey.ts:89](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L89)

React hook for registering a keyboard hotkey.

Uses the singleton HotkeyManager for efficient event handling.
The callback receives both the keyboard event and a context object
containing the hotkey string and parsed hotkey.

This hook syncs the callback and options on every render to avoid
stale closures, similar to TanStack Pacer's pattern. This means
callbacks that reference React state will always have access to
the latest values.

## Parameters

### hotkey

`RegisterableHotkey`

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object (supports `mod` for cross-platform)

### callback

`HotkeyCallback`

The function to call when the hotkey is pressed

### options

[`UseHotkeyOptions`](../interfaces/UseHotkeyOptions.md) = `{}`

Options for the hotkey behavior

## Returns

`void`

## Examples

```tsx
function SaveButton() {
  const [count, setCount] = useState(0)

  // Callback always has access to latest count value
  useHotkey('Mod+S', (event, { hotkey }) => {
    console.log(`Save triggered, count is ${count}`)
    handleSave()
  })

  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
}
```

```tsx
function Modal({ isOpen, onClose }) {
  // enabled option is synced on every render
  useHotkey('Escape', () => {
    onClose()
  }, { enabled: isOpen })

  if (!isOpen) return null
  return <div className="modal">...</div>
}
```

```tsx
function Editor() {
  const editorRef = useRef<HTMLDivElement>(null)

  // Scoped to a specific element
  useHotkey('Mod+S', () => {
    save()
  }, { target: editorRef })

  return <div ref={editorRef}>...</div>
}
```
