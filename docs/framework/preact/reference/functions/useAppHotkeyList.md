---
id: useAppHotkeyList
title: useAppHotkeyList
---

```ts
function useAppHotkeyList(): AppHotkeyListItem<AppHotkey<string, HotkeyChord | HotkeySequence | null>>[];
```

Defined in: [useAppHotkeys.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useAppHotkeys.ts#L61)

Lists every app hotkey with its live status, in declaration order, for
cheat sheets and settings screens. App hotkeys whose components have not
mounted are `'inactive'`; those without a hotkey are `'unbound'`.

## Returns

`AppHotkeyListItem`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>[]

## Example

```tsx
function CheatSheet() {
  const items = useAppHotkeyList()
  return (
    <ul>
      {items.map(({ appHotkey, status }) => (
        <li key={appHotkey.id} data-status={status}>
          {appHotkey.meta?.name}:{' '}
          {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
        </li>
      ))}
    </ul>
  )
}
```
