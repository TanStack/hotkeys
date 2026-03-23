---
id: HotkeySequenceRecorderCommitKeys
title: HotkeySequenceRecorderCommitKeys
---

# Type Alias: HotkeySequenceRecorderCommitKeys

```ts
type HotkeySequenceRecorderCommitKeys = "enter" | "none";
```

Defined in: [hotkey-sequence-recorder.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L11)

How the user can commit a recorded sequence from the keyboard.
- `'enter'`: plain Enter (no modifiers) commits when at least one step exists.
- `'none'`: only [HotkeySequenceRecorder.commit](../classes/HotkeySequenceRecorder.md#commit) finishes recording (or idle timeout if set).
