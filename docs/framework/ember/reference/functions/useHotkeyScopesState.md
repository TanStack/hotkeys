---
id: useHotkeyScopesState
title: useHotkeyScopesState
---

```ts
function useHotkeyScopesState(owner): EmberHotkeyState<HotkeyScopesState>;
```

Defined in: packages/ember-hotkeys/src/useHotkeyScopesState.ts:11

Reads the hotkey manager's scope state: the active scopes, the exclusive
scope that owns the keyboard, and the scopes it allows or suspends. Pass the
containing component as owner to release the subscription on destruction.

## Parameters

### owner

`object`

## Returns

[`EmberHotkeyState`](../interfaces/EmberHotkeyState.md)\<`HotkeyScopesState`\>
