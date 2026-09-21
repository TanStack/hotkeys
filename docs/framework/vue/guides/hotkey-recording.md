---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `useHotkeyRecorder` composable for building shortcut customization UIs in Vue.

Recorders default to physical codes: recording a shortcut stores a string such as `Mod+[KeyS]`. Pass it directly to your hotkey registration and use `formatForDisplay` for the label. Set `recordBy: 'key'` when you intentionally want the produced character instead.

## Basic usage

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

## Return value

- `isRecording`: reactive ref-like value indicating whether recording is active
- `recordedHotkey`: reactive ref-like value with the most recently recorded hotkey
- `startRecording()`: start listening for key presses
- `stopRecording()`: stop listening and reset recorder state without calling `onRecord`
- `cancelRecording()`: stop listening and discard the in-progress recording

## Options

### `recordBy`

Recorders default to `recordBy: 'code'`. Option+S producing `ß` on macOS records `Alt+[KeyS]`; Option+2 producing `™` records `Alt+[Digit2]`. The stored brackets preserve physical identity through state, serialization, and registration; `formatForDisplay` produces a readable label. There is no code-to-letter conversion. Existing authored strings such as `Mod+S` remain logical bindings.

Set `recordBy: 'key'` to intentionally record the produced logical character. A code-mode event with no usable code is rejected rather than silently switching modes. IME composition is ignored. AltGraph character entry is rejected in code mode; key mode preserves the produced character without synthetic Control/Alt while retaining Shift. Recording events, repeats, and their releases do not trigger registered hotkeys or sequences.

```ts
useHotkeyRecorder({
  recordBy: 'code', // default; choose 'key' for logical characters
  onRecord: (hotkey) => {},
  onCancel: () => {},
  onClear: () => {},
})
```

## Global defaults via provider

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

### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder doesn't intercept normal typing in text inputs, textareas, selects, or contentEditable elements; keystrokes pass through to the input as usual. Pressing Escape still cancels recording even when an input has focus. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
useHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

## Recording behavior

- Modifier-only presses do not complete a recording.
- Modifier plus key combinations record the full shortcut.
- Escape cancels recording.
- Backspace and Delete clear the shortcut.
- Recorded values are normalized to portable `Mod` format.

## Validation and conflicts

Both recorder APIs accept `detectConflicts`, `validate`, and `onReject`. For a single-hotkey recorder, these options can be supplied alongside `onRecord`:

```ts
const options = {
  detectConflicts: {
    // Use registration IDs to exclude the binding being edited:
    excludeIds: [registrationId],
    target: document,
    eventType: 'keydown',
  },
  validate: (_hotkey, { parsedHotkey }) =>
    parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ reason, message, conflicts }) => {
    // Show feedback; recording stays active.
    console.log(reason, message, conflicts)
  },
}
```

`validate` returns true to accept, or false/a message to reject. `onReject` receives `reason` (`missing-code`, `alt-graph`, `invalid`, `validation`, or `conflict`), a message, the candidate when available, and conflicting registration views for conflict rejections. Validation runs before commit; rejection never falls back to another key identity.

`detectConflicts: true` checks enabled live registrations with the intended event type (default keydown) and overlapping targets (default document). Document/nested scopes can conflict; disjoint widgets can reuse a binding. The options object also supports `scope: 'all'`, `includeDisabled`, and an `exclude(registration)` predicate. Both single bindings and sequence prefixes are checked. Source events detect physical/logical overlap on the recorded layout. This is a conservative collision check, not a promise that two callbacks will execute: propagation, input filtering, match priority, external listeners, unmounted routes, and other layouts can affect actual dispatch.

For checks outside recording, use `findHotkeyConflicts(bindingOrSequence, options)`. Without source `events`, it compares binding identity and sequence prefixes; it does not guess equivalence between a logical character and a physical position.
