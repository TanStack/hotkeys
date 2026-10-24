---
id: AppHotkeyStatus
title: AppHotkeyStatus
---

```ts
type AppHotkeyStatus = "active" | "suspended" | "disabled" | "inactive" | "unbound";
```

Defined in: [app-hotkeys.ts:307](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L307)

Status of an app hotkey in the running app.
- `'active'`: at least one enabled registration
- `'suspended'`: has an enabled registration, but none in an active scope
- `'disabled'`: registered, but every registration has `enabled: false`
- `'inactive'`: has a hotkey, but nothing has registered it
- `'unbound'`: no hotkey assigned
