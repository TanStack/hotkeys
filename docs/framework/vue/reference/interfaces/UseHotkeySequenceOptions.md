---
id: UseHotkeySequenceOptions
title: UseHotkeySequenceOptions
---

# Interface: UseHotkeySequenceOptions

Defined in: [packages/vue-hotkeys/src/useHotkeySequence.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequence.ts#L12)

## Extends

- `Omit`\<`SequenceOptions`, `"enabled"` \| `"target"`\>

## Properties

### enabled?

```ts
optional enabled: MaybeRefOrGetter<boolean>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequence.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequence.ts#L21)

Whether the sequence is active.
Can be a Ref, a getter function, or a boolean value.
Defaults to true.

***

### target?

```ts
optional target: MaybeRefOrGetter<HTMLElement | Document | Window | null>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequence.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequence.ts#L27)

The DOM element to attach the event listener to.
Can be a Ref, a getter function, direct DOM element, or null.
Defaults to document.
