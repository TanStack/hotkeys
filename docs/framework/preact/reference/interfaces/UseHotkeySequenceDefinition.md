---
id: UseHotkeySequenceDefinition
title: UseHotkeySequenceDefinition
---

# Interface: UseHotkeySequenceDefinition

Defined in: useHotkeySequences.ts:15

A single sequence definition for use with `useHotkeySequences`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: useHotkeySequences.ts:19

The function to call when the sequence is completed

***

### options?

```ts
optional options: UseHotkeySequenceOptions;
```

Defined in: useHotkeySequences.ts:21

Per-sequence options (merged on top of commonOptions)

***

### sequence

```ts
sequence: HotkeySequence;
```

Defined in: useHotkeySequences.ts:17

Array of hotkey strings that form the sequence
