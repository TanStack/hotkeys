---
id: useHotkeys
title: useHotkeys
---

```ts
function useHotkeys(definitions, options?): void;
```

Defined in: [useHotkeys.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkeys.ts#L23)

Registers a changing list of hotkeys (chords, sequences, and app hotkeys)
after commit and releases it on unmount. Options merge in this order:
provider defaults, app hotkey declaration, common options, per-hotkey
options. Unbound app hotkeys and empty sequences register nothing.

## Parameters

### definitions

readonly [`UseHotkeyDefinition`](../type-aliases/UseHotkeyDefinition.md)[]

### options?

[`UseHotkeyCommonOptions`](../type-aliases/UseHotkeyCommonOptions.md)

## Returns

`void`
