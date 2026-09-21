---
id: findHotkeyConflicts
title: findHotkeyConflicts
---

```ts
function findHotkeyConflicts(candidate, options): HotkeyConflict[];
```

Defined in: [conflicts.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L58)

Find equivalent bindings and sequence-prefix conflicts in the live registry.
With source events, also checks observed logical/physical overlap. Does not
discover unmounted handlers, external listeners, or other keyboard layouts.

## Parameters

### candidate

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md) | readonly [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)[]

### options

[`HotkeyConflictOptions`](../interfaces/HotkeyConflictOptions.md) = `{}`

## Returns

[`HotkeyConflict`](../type-aliases/HotkeyConflict.md)[]
