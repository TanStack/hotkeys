---
id: UseHotkeyOptions
title: UseHotkeyOptions
---

# Interface: UseHotkeyOptions

Defined in: [useHotkey.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkey.ts#L19)

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

Defined in: [useHotkey.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkey.ts#L25)

The DOM element to attach the event listener to.
Can be a Preact ref, direct DOM element, or null.
Defaults to document.
