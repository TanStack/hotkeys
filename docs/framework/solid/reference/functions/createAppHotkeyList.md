---
id: createAppHotkeyList
title: createAppHotkeyList
---

```ts
function createAppHotkeyList(): () => AppHotkeyListItem<AppHotkey<string, HotkeyChord | HotkeySequence | null>>[];
```

Defined in: appHotkeys.ts:49

Lists every app hotkey with its live status, in declaration order, for
cheat sheets and settings screens. App hotkeys whose components have not
mounted are `'inactive'`; those without a hotkey are `'unbound'`.

## Returns

() => `AppHotkeyListItem`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>[]
