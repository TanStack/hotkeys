---
id: HotkeySequenceRecorderValidationContext
title: HotkeySequenceRecorderValidationContext
---

Defined in: [hotkey-recorder.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L55)

Validation context for a recorded sequence.

## Properties

### events

```ts
events: readonly KeyboardEvent[];
```

Defined in: [hotkey-recorder.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L58)

The event that recorded each step.

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-recorder.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L56)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey-recorder.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L60)

Each step with `Mod` resolved for the recorder's platform.
