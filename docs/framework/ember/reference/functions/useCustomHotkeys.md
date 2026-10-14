---
id: useCustomHotkeys
title: useCustomHotkeys
---

```ts
function useCustomHotkeys(owner): EmberCustomHotkeys;
```

Defined in: packages/ember-hotkeys/src/useAppHotkeys.ts:50

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are passed to
`onCustomHotkeysChange`, ready to save.

## Parameters

### owner

`object`

## Returns

[`EmberCustomHotkeys`](../interfaces/EmberCustomHotkeys.md)
