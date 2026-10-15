---
id: CreateHotkeyTarget
title: CreateHotkeyTarget
---

```ts
type CreateHotkeyTarget = Target | null;
```

Defined in: [createHotkey.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkey.ts#L22)

The element to listen on. A `null` target skips registration, so pass an
accessor such as `() => ({ target: element() })` for elements that attach
after mount.
