---
id: HotkeyChordRecorderValidationContext
title: HotkeyChordRecorderValidationContext
---

Defined in: [hotkey-recorder.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L45)

Validation context for a recorded chord.

## Properties

### event

```ts
event: KeyboardEvent;
```

Defined in: [hotkey-recorder.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L48)

The event that recorded the chord.

***

### kind

```ts
kind: "chord";
```

Defined in: [hotkey-recorder.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L46)

***

### parsedChord

```ts
parsedChord: ParsedHotkeyChord;
```

Defined in: [hotkey-recorder.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L50)

The chord with `Mod` resolved for the recorder's platform.
