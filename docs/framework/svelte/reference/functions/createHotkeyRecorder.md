---
id: createHotkeyRecorder
title: createHotkeyRecorder
---

# Function: createHotkeyRecorder()

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L57)

Svelte function for recording keyboard shortcuts.

This function provides a thin wrapper around the framework-agnostic `HotkeyRecorder`
class, managing all the complexity of capturing keyboard events, converting them
to hotkey strings, and handling edge cases like Escape to cancel or Backspace/Delete
to clear.

## Parameters

### options

`HotkeyRecorderOptions`

Configuration options for the recorder

## Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)

An object with recording state and control functions

## Example

```svelte
<script>
  import { createHotkeyRecorder } from '@tanstack/svelte-hotkeys'

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey) // e.g., "Mod+Shift S"
    },
    onCancel: () => {
      console.log('Recording cancelled')
    },
  })
</script>

<div>
  <button on:click={recorder.startRecording}>
    {recorder.isRecording ? 'Recording...' : 'Edit Shortcut'}
  </button>
  {recorder.recordedHotkey && (
    <div>Recording: {recorder.recordedHotkey}</div>
  )}
</div>
```
