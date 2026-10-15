---
id: HotkeyRecorderValidationContext
title: HotkeyRecorderValidationContext
---

Defined in: [recorder-options.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L27)

Validation context for a recorded chord or sequence.

## Properties

### event

```ts
event: KeyboardEvent;
```

Defined in: [recorder-options.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L29)

The event that recorded the last chord.

***

### events

```ts
events: readonly KeyboardEvent[];
```

Defined in: [recorder-options.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L33)

The event that recorded each step.

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [recorder-options.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L31)

The last chord, parsed.

***

### parsedSequence

```ts
parsedSequence: readonly ParsedHotkey[];
```

Defined in: [recorder-options.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L35)

Every step, parsed.
