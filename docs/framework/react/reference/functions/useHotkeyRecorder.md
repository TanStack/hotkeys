---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

# Function: useHotkeyRecorder()

```ts
function useHotkeyRecorder(options): ReactHotkeyRecorder;
```

Defined in: [useHotkeyRecorder.ts:57](https://github.com/TanStack/keys/blob/main/packages/react-keys/src/useHotkeyRecorder.ts#L57)

React hook for recording keyboard shortcuts.

This hook provides a thin wrapper around the framework-agnostic `HotkeyRecorder`
class, managing all the complexity of capturing keyboard events, converting them
to hotkey strings, and handling edge cases like Escape to cancel or Backspace/Delete
to clear.

## Parameters

### options

`HotkeyRecorderOptions`

Configuration options for the recorder

## Returns

[`ReactHotkeyRecorder`](../interfaces/ReactHotkeyRecorder.md)

An object with recording state and control functions

## Example

```tsx
function ShortcutSettings() {
  const [shortcut, setShortcut] = useState<Hotkey>('Mod+S')

  const recorder = useHotkeyRecorder({
    onRecord: (hotkey) => {
      setShortcut(hotkey)
    },
    onCancel: () => {
      console.log('Recording cancelled')
    },
  })

  return (
    <div>
      <button onClick={recorder.startRecording}>
        {recorder.isRecording ? 'Recording...' : 'Edit Shortcut'}
      </button>
      {recorder.recordedHotkey && (
        <div>Recording: {recorder.recordedHotkey}</div>
      )}
    </div>
  )
}
```
