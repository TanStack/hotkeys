---
id: CreateHotkeySequenceOptions
title: CreateHotkeySequenceOptions
---

# Interface: CreateHotkeySequenceOptions

Defined in: [packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts#L14)

## Extends

- `Omit`\<`SequenceOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: Target;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts#L23)

The DOM element to attach the event listener to.
Can be a Svelte ref, direct DOM element, or null.
Defaults to document.
