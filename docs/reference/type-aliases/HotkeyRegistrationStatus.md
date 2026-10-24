---
id: HotkeyRegistrationStatus
title: HotkeyRegistrationStatus
---

```ts
type HotkeyRegistrationStatus = "active" | "suspended" | "disabled";
```

Defined in: [hotkey-manager.ts:188](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L188)

Whether a registration can fire now:
- `'active'`: enabled, and its scope is active
- `'suspended'`: enabled, but its scope is inactive or suspended by an exclusive scope
- `'disabled'`: registered with `enabled: false`
