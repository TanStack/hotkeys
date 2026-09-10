---
id: CreateHotkeySequenceOptions
title: CreateHotkeySequenceOptions
---

# Interface: CreateHotkeySequenceOptions

Defined in: [createHotkeySequence.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequence.ts#L11)

## Extends

- `Omit`\<`SequenceOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: HTMLElement | Document | Window | null;
```

Defined in: [createHotkeySequence.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequence.ts#L19)

The DOM element to attach the event listener to.
Can be a direct DOM element, an accessor, or null. Defaults to document.
