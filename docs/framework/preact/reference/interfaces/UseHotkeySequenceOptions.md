---
id: UseHotkeySequenceOptions
title: UseHotkeySequenceOptions
---

# Interface: UseHotkeySequenceOptions

Defined in: [useHotkeySequence.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeySequence.ts#L14)

## Extends

- `Omit`\<`SequenceOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: 
  | HTMLElement
  | Document
  | Window
  | RefObject<HTMLElement | null>
  | null;
```

Defined in: [useHotkeySequence.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeySequence.ts#L23)

The DOM element to attach the event listener to.
Can be a Preact ref, direct DOM element, or null.
Defaults to document.
