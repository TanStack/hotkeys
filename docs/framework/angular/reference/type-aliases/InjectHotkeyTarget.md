---
id: InjectHotkeyTarget
title: InjectHotkeyTarget
---

```ts
type InjectHotkeyTarget = 
  | Target
  | ElementRef<Target>
  | Signal<Target | ElementRef<Target> | null | undefined>
  | null;
```

Defined in: [injectHotkey.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkey.ts#L24)

The element to listen on: an element, an `ElementRef`, or a signal of
either, such as `viewChild<ElementRef>('panel')`. A `null` target, or a
signal of `undefined`, skips registration until the element exists.
