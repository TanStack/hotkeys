---
id: InjectHotkeyTarget
title: InjectHotkeyTarget
---

```ts
type InjectHotkeyTarget = Target | null;
```

Defined in: [injectHotkey.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkey.ts#L22)

The element to listen on. A `null` target skips registration, so pass a
getter such as `() => ({ target: this.element() })` for elements that
attach after the view renders.
