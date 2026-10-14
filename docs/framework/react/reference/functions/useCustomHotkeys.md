---
id: useCustomHotkeys
title: useCustomHotkeys
---

```ts
function useCustomHotkeys(): UseCustomHotkeysResult;
```

Defined in: useAppHotkeys.ts:108

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are passed to the provider's
`onCustomHotkeysChange`, ready to save.

## Returns

[`UseCustomHotkeysResult`](../interfaces/UseCustomHotkeysResult.md)

## Example

```tsx
const { setCustomHotkey, findConflicts } = useCustomHotkeys()
const recorder = useHotkeyRecorder({
  maxSteps: 3,
  validate: (hotkey) =>
    findConflicts('doc.save', hotkey).length === 0 || 'Already in use',
  onRecord: (hotkey) => setCustomHotkey('doc.save', hotkey),
})
```
