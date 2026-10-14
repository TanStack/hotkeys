---
id: useHotkeyRegistrations
title: useHotkeyRegistrations
---

```ts
function useHotkeyRegistrations(): HotkeyRegistrationView[];
```

Defined in: [useHotkeyRegistrations.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRegistrations.ts#L31)

Preact hook that reactively reads every hotkey registration, chords and
sequences, from the singleton HotkeyManager. Narrow each view with `kind`.

This hook does NOT require the HotkeysProvider. It re-renders when
registrations change, including trigger counts and sequence progress.

## Returns

`HotkeyRegistrationView`[]

All registrations, without callbacks

## Example

```tsx
function ShortcutPalette() {
  const registrations = useHotkeyRegistrations()

  return (
    <ul>
      {registrations.map((reg) => (
        <li key={reg.id}>
          {reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}
        </li>
      ))}
    </ul>
  )
}
```
