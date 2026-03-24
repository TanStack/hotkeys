---
id: CreateHotkeySequenceDefinition
title: CreateHotkeySequenceDefinition
---

# Interface: CreateHotkeySequenceDefinition

Defined in: createHotkeySequences.ts:14

A single sequence definition for use with `createHotkeySequences`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: createHotkeySequences.ts:18

The function to call when the sequence is completed

***

### options?

```ts
optional options: CreateHotkeySequenceOptions;
```

Defined in: createHotkeySequences.ts:20

Per-sequence options (merged on top of commonOptions)

***

### sequence

```ts
sequence: HotkeySequence;
```

Defined in: createHotkeySequences.ts:16

Array of hotkey strings that form the sequence
