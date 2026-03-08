---
id: CreateHotkeySequenceOptions
title: CreateHotkeySequenceOptions
---

# Interface: CreateHotkeySequenceOptions

Defined in: [packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts#L12)

## Extends

- `Omit`\<`SequenceOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: Target;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts#L21)

The DOM element to attach the event listener to.
Can be a Svelte ref, direct DOM element, or null.
Defaults to document.
