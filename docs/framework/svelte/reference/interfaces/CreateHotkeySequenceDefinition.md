---
id: CreateHotkeySequenceDefinition
title: CreateHotkeySequenceDefinition
---

# Interface: CreateHotkeySequenceDefinition

Defined in: [packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts#L18)

A single sequence definition for use with `createHotkeySequences`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts#L22)

The function to call when the sequence is completed

***

### options?

```ts
optional options: MaybeGetter<CreateHotkeySequenceOptions>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts#L24)

Per-sequence options (merged on top of commonOptions)

***

### sequence

```ts
sequence: MaybeGetter<HotkeySequence>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts#L20)

Array of hotkey strings that form the sequence
