---
id: HotkeyRecorderValidationContext
title: HotkeyRecorderValidationContext
---

Defined in: [hotkey-recorder.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L45)

Validation context for a recorded chord or sequence.

## Properties

### event

```ts
event: KeyboardEvent;
```

Defined in: [hotkey-recorder.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L47)

The event that recorded the last chord.

***

### events

```ts
events: readonly KeyboardEvent[];
```

Defined in: [hotkey-recorder.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L51)

The event that recorded each step.

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey-recorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L49)

The last chord, parsed.

***

### parsedSequence

```ts
parsedSequence: readonly ParsedHotkey[];
```

Defined in: [hotkey-recorder.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L53)

Every step, parsed.
