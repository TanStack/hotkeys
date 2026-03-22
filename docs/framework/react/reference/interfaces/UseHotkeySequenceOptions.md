---
id: UseHotkeySequenceOptions
title: UseHotkeySequenceOptions
---

# Interface: UseHotkeySequenceOptions

Defined in: [useHotkeySequence.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequence.ts#L13)

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

Defined in: [useHotkeySequence.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequence.ts#L22)

The DOM element to attach the event listener to.
Can be a React ref, direct DOM element, or null.
Defaults to document.
