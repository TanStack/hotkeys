---
id: UseHotkeyOptions
title: UseHotkeyOptions
---

# Interface: UseHotkeyOptions

Defined in: [useHotkey.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L16)

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

Defined in: [useHotkey.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L22)

The DOM element to attach the event listener to.
Can be a React ref, direct DOM element, or null.
Defaults to document.
