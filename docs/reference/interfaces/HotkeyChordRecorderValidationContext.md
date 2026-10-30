---
id: HotkeyChordRecorderValidationContext
title: HotkeyChordRecorderValidationContext
---

Defined in: [hotkey-recorder.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L46)

Validation context for a recorded chord.

## Properties

### event

```ts
event: KeyboardEvent;
```

Defined in: [hotkey-recorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L49)

The event that recorded the chord.

***

### kind

```ts
kind: "chord";
```

Defined in: [hotkey-recorder.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L47)

***

### parsedChord

```ts
parsedChord: ParsedHotkeyChord;
```

Defined in: [hotkey-recorder.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L51)

The chord with `Mod` resolved for the recorder's platform.
