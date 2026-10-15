---
id: UseHotkeyTarget
title: UseHotkeyTarget
---

```ts
type UseHotkeyTarget = MaybeRefOrGetter<Target | null>;
```

Defined in: [useHotkey.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L22)

The element to listen on: a ref, getter, element, or null. A target that
resolves to `null` skips registration until it is set. Defaults to document.
