---
id: useHotkeyRegistrations
title: useHotkeyRegistrations
---

# Function: useHotkeyRegistrations()

```ts
function useHotkeyRegistrations(): HotkeyRegistrationsResult;
```

Defined in: [useHotkeyRegistrations.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeyRegistrations.ts#L54)

React hook that reactively reads all hotkey and sequence registrations
from the singleton managers.

This is a standalone hook that does NOT require the HotkeysProvider.
It subscribes to both HotkeyManager and SequenceManager stores and
re-renders when registrations change.

## Returns

[`HotkeyRegistrationsResult`](../interfaces/HotkeyRegistrationsResult.md)

Object with `hotkeys` and `sequences` arrays

## Example

```tsx
function ShortcutPalette() {
  const { hotkeys, sequences } = useHotkeyRegistrations()

  return (
    <ul>
      {hotkeys.map((reg) => (
        <li key={reg.id}>
          {reg.options.meta?.name ?? reg.hotkey}
        </li>
      ))}
      {sequences.map((reg) => (
        <li key={reg.id}>
          {reg.options.meta?.name ?? reg.sequence.join(' ')}
        </li>
      ))}
    </ul>
  )
}
```
