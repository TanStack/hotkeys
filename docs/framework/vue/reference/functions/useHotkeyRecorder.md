---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

# Function: useHotkeyRecorder()

```ts
function useHotkeyRecorder(options): VueHotkeyRecorder;
```

Defined in: [packages/vue-hotkeys/src/useHotkeyRecorder.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L62)

Vue composable for recording keyboard shortcuts.

This composable provides a thin wrapper around the framework-agnostic `HotkeyRecorder`
class, managing all the complexity of capturing keyboard events, converting them
to hotkey strings, and handling edge cases like Escape to cancel or Backspace/Delete
to clear.

## Parameters

### options

`MaybeRefOrGetter`\<`HotkeyRecorderOptions`\>

Configuration options for the recorder

## Returns

[`VueHotkeyRecorder`](../interfaces/VueHotkeyRecorder.md)

An object with recording state and control functions

## Example

```vue
<script setup>
import { ref } from 'vue'
import { useHotkeyRecorder } from '@tanstack/vue-hotkeys'

const shortcut = ref<Hotkey>('Mod+S')

const recorder = useHotkeyRecorder({
  onRecord: (hotkey) => {
    shortcut.value = hotkey
  },
  onCancel: () => {
    console.log('Recording cancelled')
  },
})
</script>

<template>
  <div>
    <button @click="recorder.startRecording()">
      {{ recorder.isRecording ? 'Recording...' : 'Edit Shortcut' }}
    </button>
    <div v-if="recorder.recordedHotkey">
      Recording: {{ recorder.recordedHotkey }}
    </div>
  </div>
</template>
```
