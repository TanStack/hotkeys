---
id: HotkeySequenceRecorderValidationContext
title: HotkeySequenceRecorderValidationContext
---

Defined in: [hotkey-recorder.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L54)

Validation context for a recorded sequence.

## Properties

### events

```ts
events: readonly KeyboardEvent[];
```

Defined in: [hotkey-recorder.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L57)

The event that recorded each step.

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-recorder.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L55)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey-recorder.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L59)

Each step with `Mod` resolved for the recorder's platform.
