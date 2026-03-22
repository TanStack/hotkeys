---
id: UseHotkeyOptions
title: UseHotkeyOptions
---

# Interface: UseHotkeyOptions

Defined in: [useHotkey.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L18)

## Extends

- `Omit`\<`HotkeyOptions`, `"target"`\>

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

Defined in: [useHotkey.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L24)

The DOM element to attach the event listener to.
Can be a React ref, direct DOM element, or null.
Defaults to document.
