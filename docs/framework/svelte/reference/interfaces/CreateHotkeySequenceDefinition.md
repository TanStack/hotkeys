---
id: CreateHotkeySequenceDefinition
title: CreateHotkeySequenceDefinition
---

# Interface: CreateHotkeySequenceDefinition

Defined in: packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:18

A single sequence definition for use with `createHotkeySequences`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:22

The function to call when the sequence is completed

***

### options?

```ts
optional options: MaybeGetter<CreateHotkeySequenceOptions>;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:24

Per-sequence options (merged on top of commonOptions)

***

### sequence

```ts
sequence: MaybeGetter<HotkeySequence>;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:20

Array of hotkey strings that form the sequence
