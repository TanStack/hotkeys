---
id: HotkeySequenceCallbackContext
title: HotkeySequenceCallbackContext
---

Defined in: [hotkey.types.ts:242](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L242)

Context passed to a sequence's callback.

## Properties

### hotkey

```ts
hotkey: HotkeySequence;
```

Defined in: [hotkey.types.ts:245](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L245)

The registered sequence

***

### kind

```ts
kind: "sequence";
```

Defined in: [hotkey.types.ts:243](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L243)

***

### parsedSequence

```ts
parsedSequence: ParsedHotkeyChord[];
```

Defined in: [hotkey.types.ts:247](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L247)

Each step with `Mod` resolved for the registration's platform
