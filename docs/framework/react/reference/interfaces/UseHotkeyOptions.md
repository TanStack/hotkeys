---
id: UseHotkeyOptions
title: UseHotkeyOptions
---

# Interface: UseHotkeyOptions

Defined in: [useHotkey.ts:17](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L17)

## Extends

- `Omit`\<`HotkeyOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: 
  | HTMLElement
  | RefObject<HTMLElement | null>
  | Document
  | Window
  | null;
```

Defined in: [useHotkey.ts:23](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L23)

The DOM element to attach the event listener to.
Can be a React ref, direct DOM element, or null.
Defaults to document.
