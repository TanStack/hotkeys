---
id: defineAppHotkeys
title: defineAppHotkeys
---

```ts
function defineAppHotkeys<T>(definitions): DefinedAppHotkeys<T>;
```

Defined in: [app-hotkeys.ts:181](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L181)

Declares every app hotkey up front, without registering any, so cheat
sheets and settings screens can list hotkeys whose components have not
mounted. Pass the result to `HotkeysProvider` as `appHotkeys`.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, [`AppHotkeyInput`](../interfaces/AppHotkeyInput.md)\>

## Parameters

### definitions

`T` & `ValidatedAppHotkeyInputs`\<`T`\>

## Returns

[`DefinedAppHotkeys`](../type-aliases/DefinedAppHotkeys.md)\<`T`\>

## Example

```ts
export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save', group: 'Document' } },
  'nav.home': { hotkey: ['G', 'H'], meta: { name: 'Go home' }, options: { timeout: 800 } },
  'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
})
```
