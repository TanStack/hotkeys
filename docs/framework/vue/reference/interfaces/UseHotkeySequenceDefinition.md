---
id: UseHotkeySequenceDefinition
title: UseHotkeySequenceDefinition
---

# Interface: UseHotkeySequenceDefinition

Defined in: [packages/vue-hotkeys/src/useHotkeySequences.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequences.ts#L15)

A single sequence definition for use with `useHotkeySequences`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequences.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequences.ts#L19)

The function to call when the sequence is completed

***

### options?

```ts
optional options: MaybeRefOrGetter<UseHotkeySequenceOptions>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequences.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequences.ts#L21)

Per-sequence options (merged on top of commonOptions)

***

### sequence

```ts
sequence: MaybeRefOrGetter<HotkeySequence>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequences.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequences.ts#L17)

Array of hotkey strings that form the sequence
