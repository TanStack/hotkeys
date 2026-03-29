---
id: injectHotkeyRegistrations
title: injectHotkeyRegistrations
---

# Function: injectHotkeyRegistrations()

```ts
function injectHotkeyRegistrations(): HotkeyRegistrationsResult;
```

Defined in: [injectHotkeyRegistrations.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRegistrations.ts#L35)

Angular injectable that reactively reads all hotkey and sequence registrations
from the singleton managers.

This is a standalone injectable that does NOT require the HotkeysProvider.
It subscribes to both HotkeyManager and SequenceManager stores and
triggers change detection when registrations change.

Must be called in an injection context (constructor, factory, or `inject()`).

## Returns

[`HotkeyRegistrationsResult`](../interfaces/HotkeyRegistrationsResult.md)

Object with `hotkeys` and `sequences` signals
