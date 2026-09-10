---
id: useHotkeyRegistrations
title: useHotkeyRegistrations
---

# Function: useHotkeyRegistrations()

```ts
function useHotkeyRegistrations(): HotkeyRegistrationsResult;
```

Defined in: [useHotkeyRegistrations.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRegistrations.ts#L32)

Preact hook that reactively reads all hotkey and sequence registrations
from the singleton managers.

This is a standalone hook that does NOT require the HotkeysProvider.
It subscribes to both HotkeyManager and SequenceManager stores and
re-renders when registrations change.

## Returns

[`HotkeyRegistrationsResult`](../interfaces/HotkeyRegistrationsResult.md)

Object with `hotkeys` and `sequences` arrays
