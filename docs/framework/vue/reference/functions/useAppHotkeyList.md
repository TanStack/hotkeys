---
id: useAppHotkeyList
title: useAppHotkeyList
---

```ts
function useAppHotkeyList(): ComputedRef<AppHotkeyListItem<AppHotkey<string, HotkeyChord | HotkeySequence | null>>[]>;
```

Defined in: useAppHotkeys.ts:48

Lists every app hotkey with its live status, in declaration order, for
cheat sheets and settings screens. App hotkeys whose components have not
mounted are `'inactive'`; those without a hotkey are `'unbound'`.

## Returns

`ComputedRef`\<`AppHotkeyListItem`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>[]\>
