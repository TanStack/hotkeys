---
id: RegisteredAppHotkeys
title: RegisteredAppHotkeys
---

```ts
type RegisteredAppHotkeys = Register extends object ? T : AppHotkeys;
```

Defined in: [app-hotkeys.ts:148](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L148)

The app hotkeys type from `Register`, or a generic map when none is registered.
