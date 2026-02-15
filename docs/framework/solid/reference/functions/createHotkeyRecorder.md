---
id: createHotkeyRecorder
title: createHotkeyRecorder
---

# Function: createHotkeyRecorder()

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L57)

SolidJS primitive for recording keyboard shortcuts.

This primitive provides a thin wrapper around the framework-agnostic `HotkeyRecorder`
class, managing all the complexity of capturing keyboard events, converting them
to hotkey strings, and handling edge cases like Escape to cancel or Backspace/Delete
to clear.

## Parameters

### options

Configuration options for the recorder (or accessor function)

`HotkeyRecorderOptions` | () => `HotkeyRecorderOptions`

## Returns

[`SolidHotkeyRecorder`](../interfaces/SolidHotkeyRecorder.md)

An object with recording state signals and control functions

## Example

```tsx
function ShortcutSettings() {
  const [shortcut, setShortcut] = createSignal<Hotkey>('Mod+S')

  const recorder = createHotkeyRecorder({
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
        {recorder.isRecording() ? 'Recording...' : 'Edit Shortcut'}
      </button>
      <Show when={recorder.recordedHotkey()}>
        <div>Recording: {recorder.recordedHotkey()}</div>
      </Show>
    </div>
  )
}
```
