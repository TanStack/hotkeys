---
id: useCustomHotkeys
title: useCustomHotkeys
---

```ts
function useCustomHotkeys(): UseCustomHotkeysResult;
```

Defined in: [useAppHotkeys.ts:110](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useAppHotkeys.ts#L110)

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are passed to the provider's
`onCustomHotkeysChange`, ready to save.

## Returns

[`UseCustomHotkeysResult`](../interfaces/UseCustomHotkeysResult.md)

## Example

```tsx
const { setCustomHotkey, findConflicts } = useCustomHotkeys()
const recorder = useHotkeyRecorder({
  maxSteps: Infinity,
  validate: (hotkey) =>
    findConflicts('doc.save', hotkey).length === 0 || 'Already in use',
  onRecord: (hotkey) => setCustomHotkey('doc.save', hotkey),
})
```
