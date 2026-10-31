---
id: resolveAppHotkey
title: resolveAppHotkey
---

```ts
function resolveAppHotkey(appHotkey, store): AppHotkey;
```

Defined in: [app-hotkeys.ts:634](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L634)

Returns the provider's version of an app hotkey, so custom hotkeys apply
even when a component imports the declaration directly. Falls back to the
given app hotkey when no store declares it.

## Parameters

### appHotkey

[`AppHotkey`](../interfaces/AppHotkey.md)

### store

  \| [`AppHotkeysStore`](../classes/AppHotkeysStore.md)\<`Readonly`\<`Record`\<`string`, [`AppHotkey`](../interfaces/AppHotkey.md)\<`string`, 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null`\>\>\>\>
  \| `null`
  \| `undefined`

## Returns

[`AppHotkey`](../interfaces/AppHotkey.md)
