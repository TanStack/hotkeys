---
id: UseHotkeySequenceDefinition
title: UseHotkeySequenceDefinition
---

# Interface: UseHotkeySequenceDefinition

Defined in: [useHotkeySequences.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeySequences.ts#L15)

A single sequence definition for use with `useHotkeySequences`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [useHotkeySequences.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeySequences.ts#L19)

The function to call when the sequence is completed

***

### options?

```ts
optional options: UseHotkeySequenceOptions;
```

Defined in: [useHotkeySequences.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeySequences.ts#L21)

Per-sequence options (merged on top of commonOptions)

***

### sequence

```ts
sequence: HotkeySequence;
```

Defined in: [useHotkeySequences.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeySequences.ts#L17)

Array of hotkey strings that form the sequence
