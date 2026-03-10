---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `createHotkeyRecorder` function for building shortcut customization UIs in Svelte.

## Basic Usage

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey)
    },
  })
</script>

<div>
  <button onclick={recorder.startRecording}>
    {recorder.isRecording
      ? 'Press a key combination...'
      : recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'}
  </button>
  {#if recorder.isRecording}
    <button onclick={() => recorder.cancelRecording()}>Cancel</button>
  {/if}
</div>
```

## Return Value

- `isRecording`: whether recording is active
- `recordedHotkey`: the most recently recorded hotkey
- `startRecording()`: start listening for key presses
- `stopRecording()`: stop listening and keep the current recording
- `cancelRecording()`: stop listening and discard the in-progress recording

## Options

```ts
createHotkeyRecorder({
  onRecord: (hotkey) => {},
  onCancel: () => {},
  onClear: () => {},
})
```

Options can also be reactive:

```svelte
<script lang="ts">
  import { createHotkeyRecorder } from '@tanstack/svelte-hotkeys'

  let actionName = $state('Save')

  const recorder = createHotkeyRecorder(() => ({
    onRecord: (hotkey) => {
      console.log(`${actionName}:`, hotkey)
    },
  }))
</script>
```

## Recording Behavior

- Modifier-only presses do not complete a recording.
- Modifier plus key combinations record the full shortcut.
- Escape cancels recording.
- Backspace and Delete clear the shortcut.
- Recorded values are normalized to portable `Mod` format.
