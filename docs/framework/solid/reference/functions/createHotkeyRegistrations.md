---
id: createHotkeyRegistrations
title: createHotkeyRegistrations
---

# Function: createHotkeyRegistrations()

```ts
function createHotkeyRegistrations(): HotkeyRegistrationsResult;
```

Defined in: [createHotkeyRegistrations.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRegistrations.ts#L32)

Solid primitive that reactively reads all hotkey and sequence registrations
from the singleton managers.

This is a standalone primitive that does NOT require the HotkeysProvider.
It subscribes to both HotkeyManager and SequenceManager stores and
triggers reactivity when registrations change.

## Returns

[`HotkeyRegistrationsResult`](../interfaces/HotkeyRegistrationsResult.md)

Object with `hotkeys` and `sequences` signal accessors
