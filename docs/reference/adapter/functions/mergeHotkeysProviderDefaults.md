---
id: mergeHotkeysProviderDefaults
title: mergeHotkeysProviderDefaults
---

```ts
function mergeHotkeysProviderDefaults<T>(
   parent, 
   own, 
   scope): T;
```

Defined in: [adapter.ts:391](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L391)

Merges a provider's default options over its parent's. A provider with a
`scope` sets `hotkey.scope`, so hotkeys registered inside it use that scope.
A provider's `platform` is inherited, and is the default platform for its
hotkeys and recorders; `hotkey.platform` and `hotkeyRecorder.platform` win.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### parent

`T` \| `undefined`

### own

`T` \| `undefined`

### scope

`string` \| `undefined`

## Returns

`T`
