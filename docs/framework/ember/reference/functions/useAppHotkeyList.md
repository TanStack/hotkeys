---
id: useAppHotkeyList
title: useAppHotkeyList
---

```ts
function useAppHotkeyList(owner): EmberAppHotkeyList;
```

Defined in: [packages/ember-hotkeys/src/useAppHotkeys.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useAppHotkeys.ts#L35)

Lists every app hotkey with its live status, for cheat sheets and settings
screens. App hotkeys whose components have not rendered are `'inactive'`;
those without a hotkey are `'unbound'`.

## Parameters

### owner

`object`

## Returns

[`EmberAppHotkeyList`](../type-aliases/EmberAppHotkeyList.md)
