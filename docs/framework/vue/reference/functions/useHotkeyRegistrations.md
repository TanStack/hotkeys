---
id: useHotkeyRegistrations
title: useHotkeyRegistrations
---

# Function: useHotkeyRegistrations()

```ts
function useHotkeyRegistrations(): HotkeyRegistrationsResult;
```

Defined in: [packages/vue-hotkeys/src/useHotkeyRegistrations.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRegistrations.ts#L33)

Vue composable that reactively reads all hotkey and sequence registrations
from the singleton managers.

This is a standalone composable that does NOT require the HotkeysProvider.
It subscribes to both HotkeyManager and SequenceManager stores and
triggers reactivity when registrations change.

## Returns

[`HotkeyRegistrationsResult`](../interfaces/HotkeyRegistrationsResult.md)

Object with `hotkeys` and `sequences` refs
