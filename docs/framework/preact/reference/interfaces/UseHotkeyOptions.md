---
id: UseHotkeyOptions
title: UseHotkeyOptions
---

# Interface: UseHotkeyOptions

Defined in: [useHotkey.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkey.ts#L17)

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

Defined in: [useHotkey.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkey.ts#L23)

The DOM element to attach the event listener to.
Can be a Preact ref, direct DOM element, or null.
Defaults to document.
