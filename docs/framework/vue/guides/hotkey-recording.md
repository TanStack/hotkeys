---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `useHotkeyRecorder` composable for building shortcut customization UIs in Vue.

## Basic Usage

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkeyRecorder } from '@tanstack/vue-hotkeys'

const recorder = useHotkeyRecorder({
  onRecord: (hotkey) => {
    console.log('Recorded:', hotkey)
  },
})
</script>

<template>
  <div>
    <button @click="recorder.isRecording ? recorder.stopRecording() : recorder.startRecording()">
      {{
        recorder.isRecording
          ? 'Press a key combination...'
          : recorder.recordedHotkey
            ? formatForDisplay(recorder.recordedHotkey)
            : 'Click to record'
      }}
    </button>
    <button v-if="recorder.isRecording" @click="recorder.cancelRecording()">
      Cancel
    </button>
  </div>
</template>
```

## Return Value

- `isRecording`: reactive ref-like value indicating whether recording is active
- `recordedHotkey`: reactive ref-like value with the most recently recorded hotkey
- `startRecording()`: start listening for key presses
- `stopRecording()`: stop listening and keep the current recording
- `cancelRecording()`: stop listening and discard the in-progress recording

## Options

```ts
useHotkeyRecorder({
  onRecord: (hotkey) => {},
  onCancel: () => {},
  onClear: () => {},
})
```

## Global Default Options via Provider

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkeyRecorder: {
        onCancel: () => console.log('Recording cancelled'),
      },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

## Recording Behavior

- Modifier-only presses do not complete a recording.
- Modifier plus key combinations record the full shortcut.
- Escape cancels recording.
- Backspace and Delete clear the shortcut.
- Recorded values are normalized to portable `Mod` format.
