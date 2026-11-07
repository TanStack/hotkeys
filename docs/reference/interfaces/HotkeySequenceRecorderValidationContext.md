---
id: HotkeySequenceRecorderValidationContext
title: HotkeySequenceRecorderValidationContext
---

Defined in: [hotkey-recorder.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L69)

Validation context for a recorded sequence.

## Properties

### events

```ts
events: readonly KeyboardEvent[];
```

Defined in: [hotkey-recorder.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L72)

The event that recorded each step.

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey-recorder.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L70)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey-recorder.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L74)

Each step with `Mod` resolved for the recorder's platform.
