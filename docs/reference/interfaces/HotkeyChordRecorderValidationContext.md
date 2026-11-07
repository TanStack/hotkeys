---
id: HotkeyChordRecorderValidationContext
title: HotkeyChordRecorderValidationContext
---

Defined in: [hotkey-recorder.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L60)

Validation context for a recorded chord.

## Properties

### event

```ts
event: KeyboardEvent;
```

Defined in: [hotkey-recorder.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L63)

The event that recorded the chord.

***

### kind

```ts
kind: "chord";
```

Defined in: [hotkey-recorder.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L61)

***

### parsedChord

```ts
parsedChord: ParsedHotkeyChord;
```

Defined in: [hotkey-recorder.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L65)

The chord with `Mod` resolved for the recorder's platform.
